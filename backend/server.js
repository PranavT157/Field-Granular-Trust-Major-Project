/**
 * Express Server - Main entry point
 * Implements all REST endpoints for sync, trust, audit, schema, simulate
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const TrustEngine = require('./interceptor/trustEngine');
const WMVRunner = require('./interceptor/wmvRunner');
const FieldDecomposer = require('./interceptor/fieldDecomposer');
const MergeAssembler = require('./interceptor/mergeAssembler');
const AuditLogger = require('./interceptor/auditLogger');

const MasterDb = require('./db/masterDb');
const TrustDb = require('./db/trustDb');

const { runScenarioNormal } = require('./simulation/scenarios/scenario_normal');
const { runScenarioAttack } = require('./simulation/scenarios/scenario_attack');
const { runScenarioLaundering } = require('./simulation/scenarios/scenario_laundering');

const seedData = require('./simulation/seedData');

// Load schema
const schemaPath = path.join(__dirname, 'schema', 'patientRecord.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

// Initialize core components
const masterDb = new MasterDb();
const trustDb = new TrustDb();
const trustEngine = new TrustEngine();
const wmvRunner = new WMVRunner(trustEngine, schema);
const auditLogger = new AuditLogger();

// Comparison results storage
let comparisonResults = null;

// Track ongoing simulation
let simulationInProgress = false;
let lastSimulationScenario = null;

const app = express();
app.use(cors());
app.use(express.json());

/**
 * POST /sync
 * Main sync endpoint - processes device updates through trust engine
 */
app.post('/sync', async (req, res) => {
  try {
    const startTime = Date.now();
    const { patientId, round, updates } = req.body;

    if (!patientId || !updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: 'Invalid sync payload' });
    }

    // Get current golden record
    let currentGolden = await masterDb.getRecord(patientId);
    if (!currentGolden) {
      return res.status(404).json({ error: 'Patient record not found' });
    }

    // Group updates by field
    const fieldUpdatesMap = {};
    for (const update of updates) {
      const { fieldPath, deviceId, value } = update;
      if (!fieldUpdatesMap[fieldPath]) {
        fieldUpdatesMap[fieldPath] = [];
      }
      fieldUpdatesMap[fieldPath].push({ deviceId, value });
    }

    // Run WMV for each field
    const fieldDecisions = wmvRunner.runMultiFieldWMV(fieldUpdatesMap);

    // Assemble partial commit
    const mergeResult = MergeAssembler.assemblePartialCommit(currentGolden, fieldDecisions);

    // Commit to master DB
    const updatedRecord = await masterDb.upsertRecord(patientId, mergeResult.updatedRecord);

    // Update trust counters
    auditLogger.updateCountersFromDecisions(trustEngine, fieldDecisions);

    // Log sync event
    const latencyMs = Date.now() - startTime;
    auditLogger.logSyncEvent({
      timestamp: new Date().toISOString(),
      round,
      patientId,
      fieldDecisions,
      mergeResult,
      trustSnapshot: trustEngine.getSnapshot(),
      latencyMs,
    });

    return res.json({
      success: true,
      mergeResult,
      fieldDecisions,
      trustSnapshot: trustEngine.getSnapshot(),
      latencyMs,
    });
  } catch (err) {
    console.error('Sync error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /trust
 * Returns current trust counters for all devices
 */
app.get('/trust', async (req, res) => {
  try {
    const trustSnapshot = trustEngine.getSnapshot();
    return res.json(trustSnapshot);
  } catch (err) {
    console.error('Trust endpoint error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /audit
 * Returns last N audit log entries
 */
app.get('/audit', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const entries = auditLogger.getLastEntries(limit);
    return res.json({ entries, total: auditLogger.syncEventCounter });
  } catch (err) {
    console.error('Audit endpoint error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /schema
 * Returns the patient record schema
 */
app.get('/schema', async (req, res) => {
  try {
    return res.json(schema);
  } catch (err) {
    console.error('Schema endpoint error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /record/:patientId
 * Returns the current golden record
 */
app.get('/record/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const record = await masterDb.getRecord(patientId);
    if (!record) {
      return res.status(404).json({ error: 'Patient record not found' });
    }
    return res.json(record);
  } catch (err) {
    console.error('Record endpoint error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /stats
 * Returns current audit statistics
 */
app.get('/stats', async (req, res) => {
  try {
    const stats = auditLogger.getStats();
    return res.json(stats);
  } catch (err) {
    console.error('Stats endpoint error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /simulate/:scenario
 * Runs a complete simulation scenario
 */
app.post('/simulate/:scenario', async (req, res) => {
  try {
    const { scenario } = req.params;

    if (simulationInProgress) {
      return res.status(409).json({ error: 'Simulation already in progress' });
    }

    simulationInProgress = true;
    lastSimulationScenario = scenario;

    console.log(`\nStarting simulation: ${scenario}`);

    let result;

    try {
      if (scenario === 'normal') {
        result = await runScenarioNormal(masterDb, trustEngine, wmvRunner, auditLogger, MergeAssembler);
      } else if (scenario === 'attack') {
        result = await runScenarioAttack(masterDb, trustEngine, wmvRunner, auditLogger, MergeAssembler);
      } else if (scenario === 'laundering') {
        result = await runScenarioLaundering(masterDb, trustEngine, wmvRunner, auditLogger, MergeAssembler);
      } else {
        return res.status(400).json({ error: 'Unknown scenario' });
      }

      simulationInProgress = false;
      return res.json({
        success: true,
        scenario,
        stats: result.stats,
        finalTrust: result.finalTrust,
        auditLog: auditLogger.getLastEntries(100),
      });
    } catch (simulationErr) {
      simulationInProgress = false;
      throw simulationErr;
    }
  } catch (err) {
    console.error('Simulate endpoint error:', err);
    simulationInProgress = false;
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /simulate/compare
 * Runs all 3 scenarios sequentially and returns aggregate statistics
 */
app.post('/simulate/compare', async (req, res) => {
  try {
    if (simulationInProgress) {
      return res.status(409).json({ error: 'Simulation already in progress' });
    }

    simulationInProgress = true;

    console.log('\n========== RUNNING COMPARISON ACROSS ALL SCENARIOS ==========');

    const results = {};

    // Run normal
    trustEngine.reset();
    auditLogger.reset();
    await masterDb.reset();
    const normalResult = await runScenarioNormal(masterDb, trustEngine, wmvRunner, auditLogger, MergeAssembler);
    results.normal = normalResult;

    // Run attack
    trustEngine.reset();
    auditLogger.reset();
    await masterDb.reset();
    const attackResult = await runScenarioAttack(masterDb, trustEngine, wmvRunner, auditLogger, MergeAssembler);
    results.attack = attackResult;

    // Run laundering
    trustEngine.reset();
    auditLogger.reset();
    await masterDb.reset();
    const launderingResult = await runScenarioLaundering(masterDb, trustEngine, wmvRunner, auditLogger, MergeAssembler);
    results.laundering = launderingResult;

    comparisonResults = results;
    simulationInProgress = false;

    console.log('\n========== COMPARISON COMPLETE ==========');

    return res.json({
      success: true,
      comparison: {
        normal: results.normal.stats,
        attack: results.attack.stats,
        laundering: results.laundering.stats,
      },
      comparison_table: {
        architecture: 'Field-Granular WMV',
        malicious_rejection_rate: (results.attack.stats.rejectionRate * 100).toFixed(1) + '%',
        legitimate_acceptance_rate: ((1 - results.normal.stats.rejectionRate) * 100).toFixed(1) + '%',
        mean_latency_ms: results.attack.stats.meanLatencyMs.toFixed(1),
      },
    });
  } catch (err) {
    console.error('Comparison error:', err);
    simulationInProgress = false;
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /reset
 * Reset all state for a fresh start
 */
app.post('/reset', async (req, res) => {
  try {
    trustEngine.reset();
    auditLogger.reset();
    await masterDb.reset();
    await masterDb.initializeSeedData(seedData);

    return res.json({ success: true, message: 'All state reset' });
  } catch (err) {
    console.error('Reset error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /comparison
 * Get last comparison results
 */
app.get('/comparison', async (req, res) => {
  try {
    if (!comparisonResults) {
      return res.status(404).json({ error: 'No comparison results yet. Run /simulate/compare first.' });
    }
    return res.json(comparisonResults);
  } catch (err) {
    console.error('Comparison endpoint error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Initialize database with seed data
 */
async function initialize() {
  try {
    await masterDb.initializeSeedData(seedData);
    console.log('Database initialized with seed data');
  } catch (err) {
    console.error('Initialization error:', err);
  }
}

// Start server
const PORT = process.env.PORT || 3001;

async function start() {
  await initialize();
  app.listen(PORT, () => {
    console.log(`\n🏥 MediSync Shield Backend running on port ${PORT}`);
    console.log(`📊 Trust Engine initialized`);
    console.log(`📋 Schema loaded from ${schemaPath}`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  POST /sync - Process device updates through trust engine`);
    console.log(`  GET /trust - Get current trust counters`);
    console.log(`  GET /audit?limit=50 - Get audit log entries`);
    console.log(`  GET /schema - Get patient record schema`);
    console.log(`  GET /record/:patientId - Get golden record`);
    console.log(`  GET /stats - Get audit statistics`);
    console.log(`  POST /simulate/:scenario - Run simulation (normal/attack/laundering)`);
    console.log(`  POST /simulate/compare - Run all scenarios for comparison`);
    console.log(`  POST /reset - Reset all state`);
    console.log(`\n🚀 Ready for sync events!\n`);
  });
}

start().catch(console.error);

module.exports = app;
