const crypto = require("crypto");

/**
 * Immutable Audit Logging Stub
 * Future: Write to blockchain or external ledger
 */

exports.logAuditEvent = async (event) => {
  if (!event) {
    return false;
  }

  const auditRecord = {
    auditId: crypto.randomUUID(),
    event,
    timestamp: new Date().toISOString(),
  };

  // Future:
  // - Push to blockchain
  // - Store hash in ledger
  // - Send to transparency service

  return auditRecord;
};