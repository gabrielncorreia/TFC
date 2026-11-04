import { Sequelize } from 'sequelize';
// import = require keeps the exact config object (esModuleInterop would wrap a namespace import).
import config = require('../config/database');

export default new Sequelize(config);
