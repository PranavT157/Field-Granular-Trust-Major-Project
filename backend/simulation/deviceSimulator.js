/**
 * Device Simulator - Spawns N virtual IoT devices
 * Each device acts as a PouchDB node with local modifications and sync behavior
 */

class Device {
  constructor(deviceId, role, behaviorMode) {
    this.deviceId = deviceId;
    this.role = role;
    this.behaviorMode = behaviorMode; // 'honest', 'malicious', 'laundering'
    this.localCopy = {};
    this.syncCount = 0;
    this.launderingPhase = 0; // For laundering devices: track when to switch modes
  }

  /**
   * Initialize with a copy of the patient record
   */
  initialize(recordCopy) {
    this.localCopy = JSON.parse(JSON.stringify(recordCopy));
  }

  /**
   * Generate an update payload based on behavior mode
   * Returns array of { fieldPath, value }
   */
  generateUpdate(round, patientRecord) {
    const updates = [];
    const allFields = Object.keys(patientRecord).filter((k) => !k.startsWith('_'));

    // Randomly select 1-3 fields to update
    const numFields = Math.floor(Math.random() * 3) + 1;
    const selectedFields = allFields.sort(() => 0.5 - Math.random()).slice(0, numFields);

    for (const field of selectedFields) {
      let value;

      if (this.behaviorMode === 'honest') {
        // Send honest value (ground truth)
        value = patientRecord[field];
      } else if (this.behaviorMode === 'malicious') {
        // Always attack medication_dosage
        if (field === 'medication_dosage') {
          value = 9999; // Tampered value
        } else {
          value = patientRecord[field];
        }
      } else if (this.behaviorMode === 'laundering') {
        // Honest for first 10 rounds on low-risk fields, then attack
        if (round < 10) {
          // Only update low-risk administrative fields
          if (
            field === 'room_number' ||
            field === 'patient_display_name' ||
            field === 'ui_theme_preference'
          ) {
            value = patientRecord[field];
          } else {
            continue; // Skip this field
          }
        } else {
          // Switch to attack mode: tamper medication_dosage
          if (field === 'medication_dosage') {
            value = 8888; // Different tampered value to show deliberate attack
          } else {
            value = patientRecord[field];
          }
        }
      }

      updates.push({
        fieldPath: field,
        value,
        deviceId: this.deviceId,
      });
    }

    this.syncCount += 1;
    return updates;
  }
}

class DeviceSimulator {
  constructor(patientRecord) {
    this.patientRecord = patientRecord;
    this.devices = [];
  }

  /**
   * Initialize simulator with device configuration
   */
  initialize(deviceConfigs) {
    this.devices = [];
    for (const config of deviceConfigs) {
      const device = new Device(config.deviceId, config.role, config.behaviorMode);
      device.initialize(this.patientRecord);
      this.devices.push(device);
    }
  }

  /**
   * Get all devices
   */
  getDevices() {
    return this.devices;
  }

  /**
   * Run one round: all devices generate updates
   * Returns { round, updates: [{ deviceId, fieldPath, value }] }
   */
  runRound(round) {
    const updates = [];

    for (const device of this.devices) {
      const deviceUpdates = device.generateUpdate(round, this.patientRecord);
      updates.push(...deviceUpdates);
    }

    return { round, updates };
  }

  /**
   * Reset all devices for a new scenario
   */
  reset() {
    for (const device of this.devices) {
      device.initialize(this.patientRecord);
      device.syncCount = 0;
    }
  }
}

export { Device, DeviceSimulator };
