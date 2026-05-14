/**
 * Merge Assembler - Partial commit strategy
 * Accepts winning fields, rejects/holds others, assembles partial commit
 */

import FieldDecomposer from './fieldDecomposer.js';

export default class MergeAssembler {
  /**
   * assemblePartialCommit(currentRecord, fieldDecisions, currentGoldenRecord)
   * 
   * currentRecord: the incoming update document
   * fieldDecisions: [{ fieldPath, accepted, winningValue, ... }]
   * currentGoldenRecord: the current master record from CouchDB
   * 
   * Returns: {
   *   updatedRecord,
   *   updatedFields: [],
   *   rejectedFields: [],
   *   pendingFields: []
   * }
   */
  static assemblePartialCommit(currentGoldenRecord, fieldDecisions) {
    // Deep copy the golden record
    const updatedRecord = JSON.parse(JSON.stringify(currentGoldenRecord));

    const result = {
      updatedRecord,
      updatedFields: [],
      rejectedFields: [],
      pendingFields: [],
    };

    for (const decision of fieldDecisions) {
      const { fieldPath, accepted, winningValue, reason } = decision;

      if (accepted && winningValue !== undefined && winningValue !== null) {
        // Set the winning value
        FieldDecomposer.setNestedValue(updatedRecord, fieldPath, winningValue);
        result.updatedFields.push(fieldPath);
      } else if (reason === 'THRESHOLD_NOT_MET') {
        result.pendingFields.push(fieldPath);
      } else {
        result.rejectedFields.push(fieldPath);
      }
    }

    return result;
  }
}
