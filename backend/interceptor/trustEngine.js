/**
 * Trust Engine - Hierarchical Bayesian Trust Computation
 * Maintains per-device and per-field alpha/beta counters
 * Implements getGlobalTrust, getFieldTrust, and updateCounters
 */

class TrustEngine {
  constructor() {
    // In-memory trust database: { deviceId: { alpha_global, beta_global, fields: {...} } }
    this.trustDb = new Map();
  }

  /**
   * Get or initialize trust state for a device
   */
  _ensureDevice(deviceId) {
    if (!this.trustDb.has(deviceId)) {
      this.trustDb.set(deviceId, {
        alpha_global: 0,
        beta_global: 0,
        fields: {},
      });
    }
    return this.trustDb.get(deviceId);
  }

  /**
   * getGlobalTrust(deviceId) → p_hat_u
   * Formula: (alpha_u + 1) / (alpha_u + beta_u + 2)
   * Returns float in [0, 1]. New devices start at 0.5.
   */
  getGlobalTrust(deviceId) {
    const device = this._ensureDevice(deviceId);
    const numerator = device.alpha_global + 1;
    const denominator = device.alpha_global + device.beta_global + 2;
    return numerator / denominator;
  }

  /**
   * getFieldTrust(deviceId, fieldPath, lambda_f) → p_hat_u_f
   * Formula:
   *   numerator   = lambda_f * alpha_u + alpha_u_f + 1
   *   denominator = lambda_f * (alpha_u + beta_u) + alpha_u_f + beta_u_f + 2
   *   p_hat_u_f   = numerator / denominator
   * Where lambda_f is the field's prior strength from schema
   */
  getFieldTrust(deviceId, fieldPath, lambda_f = 0.5) {
    const device = this._ensureDevice(deviceId);
    
    // Get field-specific counters
    if (!device.fields[fieldPath]) {
      device.fields[fieldPath] = { alpha_f: 0, beta_f: 0 };
    }
    const field = device.fields[fieldPath];

    const numerator =
      lambda_f * device.alpha_global + field.alpha_f + 1;
    const denominator =
      lambda_f * (device.alpha_global + device.beta_global) +
      field.alpha_f +
      field.beta_f +
      2;

    return numerator / denominator;
  }

  /**
   * updateCounters(deviceId, fieldPath, isHonest, lambda_f)
   * Increment alpha if isHonest, beta otherwise
   */
  updateCounters(deviceId, fieldPath, isHonest, lambda_f = 0.5) {
    const device = this._ensureDevice(deviceId);

    if (!device.fields[fieldPath]) {
      device.fields[fieldPath] = { alpha_f: 0, beta_f: 0 };
    }

    if (isHonest) {
      device.alpha_global += 1;
      device.fields[fieldPath].alpha_f += 1;
    } else {
      device.beta_global += 1;
      device.fields[fieldPath].beta_f += 1;
    }
  }

  /**
   * Get all trust counters (for dashboard display)
   */
  getAllTrust() {
    const result = {};
    for (const [deviceId, device] of this.trustDb) {
      result[deviceId] = {
        globalTrust: this.getGlobalTrust(deviceId),
        alpha_global: device.alpha_global,
        beta_global: device.beta_global,
        fieldTrusts: {},
      };

      for (const fieldPath of Object.keys(device.fields)) {
        result[deviceId].fieldTrusts[fieldPath] = device.fields[fieldPath];
      }
    }
    return result;
  }

  /**
   * Get state snapshot for audit logging
   */
  getSnapshot() {
    const snapshot = {};
    for (const [deviceId, device] of this.trustDb) {
      snapshot[deviceId] = {
        globalTrust: this.getGlobalTrust(deviceId),
        alpha_global: device.alpha_global,
        beta_global: device.beta_global,
        fieldTrusts: { ...device.fields },
      };
    }
    return snapshot;
  }

  /**
   * Reset all counters (for new simulation)
   */
  reset() {
    this.trustDb.clear();
  }
}

module.exports = TrustEngine;
