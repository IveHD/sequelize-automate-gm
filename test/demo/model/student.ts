const Sequelize = require('Sequelize');

const sequelizeClient = require('../lib/sequelize.js');

const {
  DataTypes,
  Model
} = Sequelize;

class Student extends Model {
  id!: number;
  name?: string;
  age?: number;
  class?: string;
}

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
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: '',
    field: 'age'
  },
  class: {
    type: DataTypes.STRING(45),
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: '',
    field: 'class'
  }
};
const options = {
  modelName: 'student',
  sequelize: sequelizeClient,
  indexes: [],
  freezeTableName: true
};
Student.init(attributes, options);
module.exports = Student;