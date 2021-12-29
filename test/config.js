module.exports = {
  "dbOptions": {
    "database": "db_test",
    "username": "guess",
    "password": "guess",
    "dialect": "mysql",
    "host": "localhost",
    "port": 3306,
    "logging": false,
    "define": {
      "underscored": true,
      "freezeTableName": true,
    }
  },
  "options": {
    "type": "ts",
    "dir": "./test/demo/model",
    "camelCase": true,
    "emptyDir": true,
    "moduleType": "commonjs",
    "sequelizeName": 'Sequelize',
    "sequelizeModulePath": 'Sequelize',
    "sequelizeInsName": 'sequelizeClient',
    "sequelizeInsModulePath": '../lib/sequelize.js',
  }
}