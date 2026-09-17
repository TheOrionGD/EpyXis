// Centralized High-Entropy JWT Secret Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'epyxis_jwt_sec_8f94a73b2e61c50d9e814a72bc389f41d06e25ab64719c308e2f1d9a046c825b';

module.exports = {
  JWT_SECRET
};
