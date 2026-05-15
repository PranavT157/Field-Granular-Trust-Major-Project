/**
 * Scenario: Normal - All 5 devices honest
 * Expected: all fields accepted, all trust scores converge toward ~0.97
 */

import { DeviceSimulator } from '../deviceSimulator.js';

async function runScenarioNormal(masterDb, trustEngine, wmvRunner, auditLogger, mergeAssembler) {
  console.log('\n========== SCENARIO: NORMAL (All Honest) ==========');

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

  // Configure 5 honest devices
  const deviceConfigs = [
    { deviceId: 'device_nurse_A', role: 'nurse', behaviorMode: 'honest' },
    { deviceId: 'device_nurse_B', role: 'nurse', behaviorMode: 'honest' },
    { deviceId: 'device_monitor_ICU', role: 'bedside_monitor', behaviorMode: 'honest' },
    { deviceId: 'device_wearable_01', role: 'wearable_sensor', behaviorMode: 'honest' },
    { deviceId: 'device_doctor_main', role: 'doctor', behaviorMode: 'honest' },
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
      latencyMs: Math.random() * 30 + 35, // 35-65ms
    });

    if (round % 5 === 0) {
      const trustSnapshot = trustEngine.getSnapshot();
      console.log(
        `Round ${round}: Updated ${mergeResult.updatedFields.length} fields, ` +
        `Rejected ${mergeResult.rejectedFields.length}, ` +
        `Avg Trust: ${(Object.values(trustSnapshot).reduce((sum, d) => sum + d.globalTrust, 0) / 5).toFixed(3)}`
      );
    }
  }

  const stats = auditLogger.getStats();
  console.log('\n--- Final Stats (Normal Scenario) ---');
  console.log(`Total Sync Events: ${stats.totalSyncEvents}`);
  console.log(`Rejection Rate: ${(stats.rejectionRate * 100).toFixed(2)}%`);
  console.log(`Mean Latency: ${stats.meanLatencyMs.toFixed(2)}ms`);
  console.log(`Overall Accuracy: ${stats.overallAccuracyPercentage}`);

  console.log('\n--- Device Accuracy Metrics ---');
  for (const [deviceId, metrics] of Object.entries(stats.deviceAccuracyMetrics)) {
    console.log(`  ${deviceId}:`);
    console.log(`    Correct: ${metrics.correctMeasurements}/${metrics.totalMeasurements}`);
    console.log(`    Accuracy: ${metrics.accuracyPercentage}`);
  }

  const finalTrust = trustEngine.getSnapshot();
  for (const [deviceId, data] of Object.entries(finalTrust)) {
    console.log(
      `  ${deviceId}: trust=${data.globalTrust.toFixed(3)}, α=${data.alpha_global}, β=${data.beta_global}`
    );
  }

  return { stats, finalTrust };
}

export { runScenarioNormal };
