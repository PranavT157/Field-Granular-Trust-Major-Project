/**
 * Trust DB - In-memory trust counter storage
 * Separate from master DB to ensure persistence of reputation
 */

export default class TrustDb {
  constructor() {
    // In-memory store: { deviceId: { alpha_global, beta_global, fields: {} } }
    this.store = new Map();
  }

  /**
   * getDevice(deviceId) → device trust state or null
   */
  async getDevice(deviceId) {
    return this.store.get(deviceId) || null;
  }

  /**
   * updateDevice(deviceId, updates)
   */
  async updateDevice(deviceId, updates) {
    let device = this.store.get(deviceId);

    if (!device) {
      device = {
        deviceId,
        alpha_global: 0,
        beta_global: 0,
        fields: {},
      };
    }

    Object.assign(device, updates);
    this.store.set(deviceId, device);
    return device;
  }

  /**
   * Get all devices trust state
   */
  async getAllDevices() {
    return Array.from(this.store.values());
  }

  /**
   * Reset database
   */
  async reset() {
    this.store.clear();
  }
}
