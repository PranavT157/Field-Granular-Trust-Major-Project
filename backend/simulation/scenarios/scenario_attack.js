/**
 * Scenario: Attack - 1 malicious device attacks medication_dosage
 * Expected: medication_dosage rejected, attacker trust collapses rapidly
 * The 4 honest devices' correct value wins WMV
 */

import { DeviceSimulator } from '../deviceSimulator.js';

async function runScenarioAttack(masterDb, trustEngine, wmvRunner, auditLogger, mergeAssembler) {
  console.log('\n========== SCENARIO: DIRECT ATTACK ==========');

  // Reset state
  trustEngine.reset();
  auditLogger.reset();
  await masterDb.reset();

  const patientId = 'patient_001';
  const patientRecord = {
    medication_dosage: 50,
    blood_pressure: '120/80',
    heart_rate: 72,
    surgical_history: 'Appendectomy 2015',
    attending_physician: 'Dr. Smith',
    room_number: '302',
    patient_display_name: 'John Doe',
    ui_theme_preference: 'light',
  };

  // Initialize master DB with patient record
  await masterDb.upsertRecord(patientId, patientRecord);

  // Configure: 4 honest + 1 malicious device
  const deviceConfigs = [
    { deviceId: 'device_nurse_A', role: 'nurse', behaviorMode: 'honest' },
    { deviceId: 'device_nurse_B', role: 'nurse', behaviorMode: 'honest' },
    { deviceId: 'device_monitor_ICU', role: 'bedside_monitor', behaviorMode: 'honest' },
    { deviceId: 'device_wearable_01', role: 'wearable_sensor', behaviorMode: 'honest' },
    { deviceId: 'device_attacker', role: 'doctor', behaviorMode: 'malicious' },
  ];

  const simulator = new DeviceSimulator(patientRecord);
  simulator.initialize(deviceConfigs);

  // Run 20 rounds
  for (let round = 1; round <= 100; round++) {
    const { updates } = simulator.runRound(round);

    // Group updates by field
    const fieldUpdatesMap = {};
    for (const update of updates) {
      if (!fieldUpdatesMap[update.fieldPath]) {
        fieldUpdatesMap[update.fieldPath] = [];
      }
      fieldUpdatesMap[update.fieldPath].push({
        deviceId: update.deviceId,
        value: update.value,
      });
    }

    // Run WMV for each field
    const fieldDecisions = wmvRunner.runMultiFieldWMV(fieldUpdatesMap);

    // Assemble partial commit
    const currentGolden = await masterDb.getRecord(patientId);
    const mergeResult = mergeAssembler.assemblePartialCommit(currentGolden, fieldDecisions);

    // Commit to master DB
    await masterDb.upsertRecord(patientId, mergeResult.updatedRecord);

    // Update trust counters
    auditLogger.updateCountersFromDecisions(trustEngine, fieldDecisions);

    // Log event
    auditLogger.logSyncEvent({
      timestamp: new Date().toISOString(),
      round,
      patientId,
      fieldDecisions,
      mergeResult,
      trustSnapshot: trustEngine.getSnapshot(),
      latencyMs: Math.random() * 30 + 45, // 45-75ms
    });

    if (round % 5 === 0 || round === 1) {
      const trustSnapshot = trustEngine.getSnapshot();
      const attackerTrust = trustSnapshot['device_attacker'];
      const dosageDecision = fieldDecisions.find((d) => d.fieldPath === 'medication_dosage');

      console.log(
        `Round ${round}: Attacker trust=${attackerTrust.globalTrust.toFixed(3)}, ` +
        `Dosage decision=${dosageDecision?.accepted ? 'ACCEPTED' : 'REJECTED'}, ` +
        `Weight=${dosageDecision?.totalWeight.toFixed(2)}, τ=${dosageDecision?.tau.toFixed(2)}`
      );
    }
  }

  const stats = auditLogger.getStats();
  console.log('\n--- Final Stats (Attack Scenario) ---');
  console.log(`Total Sync Events: ${stats.totalSyncEvents}`);
  console.log(`Rejection Rate: ${(stats.rejectionRate * 100).toFixed(2)}%`);
  console.log(`Overall Accuracy: ${stats.overallAccuracyPercentage}`);
  
  console.log('\n--- Device Accuracy Metrics ---');
  for (const [deviceId, metrics] of Object.entries(stats.deviceAccuracyMetrics)) {
    console.log(`  ${deviceId}:`);
    console.log(`    Correct: ${metrics.correctMeasurements}/${metrics.totalMeasurements}`);
    console.log(`    Accuracy: ${metrics.accuracyPercentage}`);
  }
  
  console.log('\n--- Field Accuracy Metrics ---');
  for (const [fieldPath, metrics] of Object.entries(stats.fieldAccuracyMetrics)) {
    console.log(`  ${fieldPath}:`);
    console.log(`    Correct: ${metrics.correctMeasurements}/${metrics.totalMeasurements}`);
    console.log(`    Accuracy: ${metrics.accuracyPercentage}`);
  }
  console.log(`Mean Latency: ${stats.meanLatencyMs.toFixed(2)}ms`);

  const finalTrust = trustEngine.getSnapshot();
  console.log('\n--- Device Trust Evolution ---');
  for (const [deviceId, data] of Object.entries(finalTrust)) {
    const role = deviceId === 'device_attacker' ? '[MALICIOUS]' : '[HONEST]';
    console.log(
      `  ${deviceId} ${role}: trust=${data.globalTrust.toFixed(3)}, α=${data.alpha_global}, β=${data.beta_global}`
    );
  }

  return { stats, finalTrust };
}

export { runScenarioAttack };
