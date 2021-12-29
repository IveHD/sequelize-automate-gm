const Sequelize = require('Sequelize');

const sequelizeClient = require('../lib/sequelize.js');

const {
  DataTypes,
  Model
} = Sequelize;

class TestTable extends Model {}

const attributes = {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: null,
    primaryKey: true,
    autoIncrement: true,
    comment: '',
    field: 'id'
  },
  name: {
    type: DataTypes.STRING(45),
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: '',
    field: 'name'
  }
};
const options = {
  modelName: 'test_table',
  sequelize: sequelizeClient,
  indexes: []
};
TestTable.init(attributes, options);
module.exports = TestTable;