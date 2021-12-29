const Sequelize = require('sequelize');

module.exports = new Sequelize('db_test', 'guess', 'guess', {
  host: 'localhost',
  port: '3306',
  dialect: 'mysql',
  define: {
    freezeTableName: true,
    timestamps: false,
  },
});