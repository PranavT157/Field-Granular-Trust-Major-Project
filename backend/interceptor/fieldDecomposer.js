/**
 * Field Decomposer - Splits document updates into field paths (dot-notation)
 * Groups updates by field for efficient WMV processing
 */

class FieldDecomposer {
  /**
   * decomposeUpdates(updates: [{ deviceId, fieldPath, value }]) → { field: [updates] }
   * Groups updates by field path
   */
  static groupByField(updates) {
    const grouped = {};
    for (const update of updates) {
      const { fieldPath, deviceId, value } = update;
      if (!grouped[fieldPath]) {
        grouped[fieldPath] = [];
      }
      grouped[fieldPath].push({ deviceId, value });
    }
    return grouped;
  }

  /**
   * flattenObject(obj, prefix = '') → [{ path, value }, ...]
   * Recursively flatten nested object to dot-notation paths
   */
  static flattenObject(obj, prefix = '') {
    const result = [];

    for (const [key, val] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        // Recurse for nested objects
        result.push(...FieldDecomposer.flattenObject(val, path));
      } else {
        result.push({ path, value: val });
      }
    }

    return result;
  }

  /**
   * setNestedValue(obj, path, value)
   * Set a value at a dot-notation path in obj
   */
  static setNestedValue(obj, path, value) {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }

  /**
   * getNestedValue(obj, path) → value or undefined
   * Get value at dot-notation path
   */
  static getNestedValue(obj, path) {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current == null) return undefined;
      current = current[part];
    }

    return current;
  }
}

module.exports = FieldDecomposer;
