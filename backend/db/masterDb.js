/**
 * Master DB - CouchDB adapter for patient golden records
 * In this simplified version, we use in-memory storage
 */

export default class MasterDb {
  constructor() {
    // In-memory store: { patientId: { ...record, _id, _rev } }
    this.store = new Map();
    this.revisionCounter = 0;
  }

  /**
   * getRecord(patientId) → record or null
   */
  async getRecord(patientId) {
    return this.store.get(patientId) || null;
  }

  /**
   * upsertRecord(patientId, updates)
   * Merge updates into existing record, increment _rev
   */
  async upsertRecord(patientId, updates) {
    let record = this.store.get(patientId);

    if (!record) {
      record = {
        _id: patientId,
        _rev: '1-' + this._generateHash(),
      };
    } else {
      // Increment revision
      const [major, hash] = record._rev.split('-');
      record._rev = (parseInt(major) + 1) + '-' + this._generateHash();
    }

    // Merge updates
    Object.assign(record, updates);
    this.store.set(patientId, record);
    return record;
  }

  /**
   * Initialize with seed data
   */
  async initializeSeedData(seedRecords) {
    for (const [patientId, data] of Object.entries(seedRecords)) {
      const record = {
        _id: patientId,
        _rev: '1-' + this._generateHash(),
        ...data,
      };
      this.store.set(patientId, record);
    }
  }

  /**
   * Get all records
   */
  async getAllRecords() {
    return Array.from(this.store.values());
  }

  /**
   * Reset database
   */
  async reset() {
    this.store.clear();
  }

  _generateHash() {
    return Math.random().toString(36).substr(2, 9);
  }
}
