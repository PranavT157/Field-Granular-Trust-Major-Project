/**
 * Audit Logger - Structured audit records and counter updates
 */

export default class AuditLogger {
  constructor() {
    this.auditLog = [];
    this.syncEventCounter = 0;
    this.rejectedUpdatesCount = 0;
    this.falsePositivesCount = 0;
    this.syncLatencies = [];
    
    // Accuracy tracking
    this.deviceAccuracy = {}; // { deviceId: { correctCount, totalCount, accuracy } }
    this.fieldAccuracy = {}; // { fieldPath: { correctCount, totalCount, accuracy } }
  }

  /**
   * logSyncEvent(event)
   * Records a complete sync event with all metadata
   */
  logSyncEvent(event) {
    const {
      timestamp,
      round,
      patientId,
      fieldDecisions,
      mergeResult,
      trustSnapshot,
      latencyMs,
    } = event;

    const auditRecord = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: timestamp || new Date().toISOString(),
      round,
      patientId,
      fieldDecisions,
      mergeResult,
      trustSnapshot,
      latencyMs: latencyMs || 0,
    };

    this.auditLog.push(auditRecord);
    this.syncEventCounter += 1;
    this.syncLatencies.push(latencyMs || 0);

    return auditRecord;
  }

  /**
   * updateCountersFromDecisions(trustEngine, fieldDecisions)
   * For each device, check if their claimed value won (isHonest = true)
   * Also tracks accuracy metrics
   */
  updateCountersFromDecisions(trustEngine, fieldDecisions) {
    for (const decision of fieldDecisions) {
      const { fieldPath, supportingDevices, rejectingDevices } = decision;

      // Get lambda for this field from schema (passed separately or in decision)
      const lambda_f = decision.lambda || 0.5;

      // Supporting devices were honest (their claim won) - ACCURATE
      for (const deviceId of supportingDevices) {
        trustEngine.updateCounters(deviceId, fieldPath, true, lambda_f);
        this.trackDeviceAccuracy(deviceId, true);
        this.trackFieldAccuracy(fieldPath, true);
      }

      // Rejecting devices were dishonest (their claim lost) - INACCURATE
      for (const deviceId of rejectingDevices) {
        trustEngine.updateCounters(deviceId, fieldPath, false, lambda_f);
        this.trackDeviceAccuracy(deviceId, false);
        this.trackFieldAccuracy(fieldPath, false);
      }
    }
  }

  /**
   * Track accuracy for each device
   */
  trackDeviceAccuracy(deviceId, isCorrect) {
    if (!this.deviceAccuracy[deviceId]) {
      this.deviceAccuracy[deviceId] = {
        correctCount: 0,
        totalCount: 0,
        accuracy: 0,
      };
    }

    this.deviceAccuracy[deviceId].totalCount += 1;
    if (isCorrect) {
      this.deviceAccuracy[deviceId].correctCount += 1;
    }
    this.deviceAccuracy[deviceId].accuracy =
      this.deviceAccuracy[deviceId].correctCount /
      this.deviceAccuracy[deviceId].totalCount;
  }

  /**
   * Track accuracy for each field
   */
  trackFieldAccuracy(fieldPath, isCorrect) {
    if (!this.fieldAccuracy[fieldPath]) {
      this.fieldAccuracy[fieldPath] = {
        correctCount: 0,
        totalCount: 0,
        accuracy: 0,
      };
    }

    this.fieldAccuracy[fieldPath].totalCount += 1;
    if (isCorrect) {
      this.fieldAccuracy[fieldPath].correctCount += 1;
    }
    this.fieldAccuracy[fieldPath].accuracy =
      this.fieldAccuracy[fieldPath].correctCount /
      this.fieldAccuracy[fieldPath].totalCount;
  }

  /**
   * Get accuracy metrics for all devices
   */
  getDeviceAccuracyMetrics() {
    const deviceMetrics = {};
    for (const deviceId in this.deviceAccuracy) {
      deviceMetrics[deviceId] = {
        correctMeasurements: this.deviceAccuracy[deviceId].correctCount,
        totalMeasurements: this.deviceAccuracy[deviceId].totalCount,
        accuracyPercentage: (this.deviceAccuracy[deviceId].accuracy * 100).toFixed(2) + '%',
      };
    }
    return deviceMetrics;
  }

  /**
   * Get accuracy metrics for all fields
   */
  getFieldAccuracyMetrics() {
    const fieldMetrics = {};
    for (const fieldPath in this.fieldAccuracy) {
      fieldMetrics[fieldPath] = {
        correctMeasurements: this.fieldAccuracy[fieldPath].correctCount,
        totalMeasurements: this.fieldAccuracy[fieldPath].totalCount,
        accuracyPercentage: (this.fieldAccuracy[fieldPath].accuracy * 100).toFixed(2) + '%',
      };
    }
    return fieldMetrics;
  }

  /**
   * Get overall accuracy across all measurements
   */
  getOverallAccuracy() {
    let totalCorrect = 0;
    let totalMeasurements = 0;

    for (const deviceId in this.deviceAccuracy) {
      totalCorrect += this.deviceAccuracy[deviceId].correctCount;
      totalMeasurements += this.deviceAccuracy[deviceId].totalCount;
    }

    if (totalMeasurements === 0) return 0;
    return ((totalCorrect / totalMeasurements) * 100).toFixed(2);
  }

  /**
   * Get last N audit entries
   */
  getLastEntries(limit = 50) {
    return this.auditLog.slice(-limit);
  }

  /**
   * Get aggregate statistics
   */
  getStats() {
    const totalEvents = this.syncEventCounter;
    const meanLatency =
      this.syncLatencies.length > 0
        ? this.syncLatencies.reduce((a, b) => a + b, 0) /
          this.syncLatencies.length
        : 0;

    let totalRejectedUpdates = 0;
    let totalUpdates = 0;

    for (const record of this.auditLog) {
      for (const decision of record.fieldDecisions || []) {
        totalUpdates += 1;
        if (!decision.accepted) {
          totalRejectedUpdates += 1;
        }
      }
    }

    return {
      totalSyncEvents: totalEvents,
      totalUpdates,
      totalRejectedUpdates,
      rejectionRate: totalUpdates > 0 ? totalRejectedUpdates / totalUpdates : 0,
      meanLatencyMs: meanLatency,
      overallAccuracyPercentage: this.getOverallAccuracy() + '%',
      deviceAccuracyMetrics: this.getDeviceAccuracyMetrics(),
      fieldAccuracyMetrics: this.getFieldAccuracyMetrics(),
    };
  }

  /**
   * Reset audit log
   */
  reset() {
    this.auditLog = [];
    this.syncEventCounter = 0;
    this.rejectedUpdatesCount = 0;
    this.falsePositivesCount = 0;
    this.syncLatencies = [];
    this.deviceAccuracy = {};
    this.fieldAccuracy = {};
  }
}
