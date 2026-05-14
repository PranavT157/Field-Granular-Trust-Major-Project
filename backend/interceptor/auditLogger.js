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
   */
  updateCountersFromDecisions(trustEngine, fieldDecisions) {
    for (const decision of fieldDecisions) {
      const { fieldPath, supportingDevices, rejectingDevices } = decision;

      // Get lambda for this field from schema (passed separately or in decision)
      const lambda_f = decision.lambda || 0.5;

      // Supporting devices were honest (their claim won)
      for (const deviceId of supportingDevices) {
        trustEngine.updateCounters(deviceId, fieldPath, true, lambda_f);
      }

      // Rejecting devices were dishonest (their claim lost)
      for (const deviceId of rejectingDevices) {
        trustEngine.updateCounters(deviceId, fieldPath, false, lambda_f);
      }
    }
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
  }
}
