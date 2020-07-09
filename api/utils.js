const crypto = require('crypto');
const AGL = 'sha256';

const createHash = (value, encord = 'hex') => {
  const shasum = crypto.createHash(AGL);
  shasum.update(value);
  return shasum.digest(encord);
};

module.exports.createHash = createHash;
