/**
 * WMV Runner - Per-field Weighted Majority Voting with log-odds weighting
 * Each field runs independent WMV; winning value accepted only if weight > tau
 */

export default class WMVRunner {
  constructor(trustEngine, schema) {
    this.trustEngine = trustEngine;
    this.schema = schema;
  }

  /**
   * getSchemaField(fieldPath) → field object with x-trust-tau, x-trust-lambda
   */
  getSchemaField(fieldPath) {
    const props = this.schema?.properties || {};
    return props[fieldPath] || {};
  }

  /**
   * computeLogOdds(p_hat) → log(p_hat / (1 - p_hat))
   * Clip p_hat to [0.001, 0.999] to avoid Infinity
   */
  computeLogOdds(p_hat) {
    const clipped = Math.max(0.001, Math.min(0.999, p_hat));
    return Math.log(clipped / (1 - clipped));
  }

  /**
   * runFieldWMV(fieldPath, updates: [{ deviceId, value }]) → FieldDecision
   * 
   * updates: array of { deviceId, value }
   * returns: {
   *   fieldPath,
   *   winningValue,
   *   accepted,
   *   totalWeight,
   *   tau,
   *   supportingDevices,
   *   rejectingDevices
   * }
   */
  runFieldWMV(fieldPath, updates) {
    const schemaField = this.getSchemaField(fieldPath);
    const tau = schemaField['x-trust-tau'] || 0.5;
    const lambda_f = schemaField['x-trust-lambda'] || 0.5;

    // Build voting groups: { claimedValue: { totalWeight, deviceIds } }
    const votingGroups = {};

    for (const update of updates) {
      const { deviceId, value } = update;
      const p_hat_u_f = this.trustEngine.getFieldTrust(
        deviceId,
        fieldPath,
        lambda_f
      );
      const weight = this.computeLogOdds(p_hat_u_f);

      const valueStr = JSON.stringify(value);
      if (!votingGroups[valueStr]) {
        votingGroups[valueStr] = {
          value,
          totalWeight: 0,
          deviceIds: [],
        };
      }
      votingGroups[valueStr].totalWeight += weight;
      votingGroups[valueStr].deviceIds.push(deviceId);
    }

    // Find winning claim
    let winningGroup = null;
    for (const valueStr of Object.keys(votingGroups)) {
      const group = votingGroups[valueStr];
      if (!winningGroup || group.totalWeight > winningGroup.totalWeight) {
        winningGroup = group;
      }
    }

    if (!winningGroup) {
      return {
        fieldPath,
        winningValue: null,
        accepted: false,
        totalWeight: 0,
        tau,
        supportingDevices: [],
        rejectingDevices: updates.map((u) => u.deviceId),
        reason: 'NO_UPDATES',
      };
    }

    // Decide: accept only if weight > tau
    const accepted = winningGroup.totalWeight > tau;

    // Compute rejecting devices
    const rejectingDevices = [];
    for (const valueStr of Object.keys(votingGroups)) {
      if (valueStr !== JSON.stringify(winningGroup.value)) {
        rejectingDevices.push(...votingGroups[valueStr].deviceIds);
      }
    }

    return {
      fieldPath,
      winningValue: winningGroup.value,
      accepted,
      totalWeight: winningGroup.totalWeight,
      tau,
      supportingDevices: winningGroup.deviceIds,
      rejectingDevices,
      lambda: lambda_f,
      reason: accepted ? 'ACCEPTED' : 'THRESHOLD_NOT_MET',
    };
  }

  /**
   * runMultiFieldWMV(fieldUpdatesMap: { field: [updates] }) → FieldDecision[]
   * Run WMV independently for each field
   */
  runMultiFieldWMV(fieldUpdatesMap) {
    const decisions = [];
    for (const [fieldPath, updates] of Object.entries(fieldUpdatesMap)) {
      const decision = this.runFieldWMV(fieldPath, updates);
      decisions.push(decision);
    }
    return decisions;
  }
}
