/* eslint-disable max-len */
const assert = require('assert');
const _ = require('lodash');
const Sequelize = require('sequelize');
const debug = require('debug')('sequelize-automate');
const { getModelDefinitions } = require('./util/definition');
const generate = require('./generate');
const { write } = require('./util/write');

class Automate {
  constructor(dbOptions, options) {
    debug('sequelize-automate constructor');
    const defaultOptions = {
      type: 'ts', // Which code style want to generate, supported: js/ts/egg/midway. Default is `js`.
      camelCase: true, // Model name camel case. Default is true.
      fileNameCamelCase: false, // Model file name camel case. Default is false.
      dir: 'models', // What directory to place the models. Default is `models`.
      typesDir: null, // What directory to place the models' definitions (for typescript), default is the same with dir.
      emptyDir: false, // Remove all files in `dir` and `typesDir` directories before generate models.
      tables: null, // Use these tables, Example: ['user'], default is null.
      skipTables: null, // Skip these tables. Example: ['user'], default is null.
      tsNoCheck: false, // Whether add `@ts-nocheck` to model files, default is false.
      match: null, // Regex to match table name
      moduleType: 'es6',
      sequelizeName: 'Sequelize', // Sequelize 引入Sequelize模块的变量名
      sequelizeModulePath: 'sequelize', // Sequelize 引入Sequelize模块的模块路径
      sequelizeInsName: 'sequelizeClient', // Sequelize实例的变量名
      sequelizeInsModulePath: '', // Sequelize实例的模块路径
    };

    // https://sequelize.org/master/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor
    this.dbOptions = dbOptions || {};
    this.options = _.assign({}, defaultOptions, options);
    const { moduleType, type } = this.options;
    if (!['es6', 'commonjs'].includes(moduleType)) {
      throw new Error(`The optional value for moduleType is es6 or commonjs, but got a/an ${moduleType}`);
    }
    if (!['ts', 'js'].includes(type)) {
      throw new Error(`The optional value for type is ts or js, but got a/an ${type}`);
    }

    // default `options.typesDir` is the same with `options.dir`
    this.options.typesDir = this.options.typesDir || this.options.dir;

    const supportTypes = ['js', 'ts', 'egg', 'midway', '@ali/midway'];
    assert(supportTypes.includes(this.options.type), 'type not support');
    assert(_.isBoolean(this.options.camelCase), 'Invalid params camelCase');
    assert(_.isBoolean(this.options.fileNameCamelCase), 'Invalid params fileNameCamelCase');
    assert(_.isString(this.options.dir), 'Invalid params dir');
    assert(_.isString(this.options.typesDir), 'Invalid params typesDir');
    assert(_.isBoolean(this.options.emptyDir), 'Invalid params cleanDir');
    assert(_.isNull(this.options.tables) || _.isArray(this.options.tables), 'Invalid params table');
    assert(_.isNull(this.options.skipTables) || _.isArray(this.options.skipTables), 'invalid params table');
    assert(_.isBoolean(this.options.tsNoCheck), 'Invalid params tsNoCheck');

    this.sequelize = new Sequelize(this.dbOptions);
    this.queryInterface = this.sequelize.getQueryInterface();
  }

  async getTableNames({ tables, skipTables, match }) {
    // TODO: check all dialects https://github.com/sequelize/sequelize/issues/11451
    const allTableNames = await this.queryInterface.showAllTables();

    const tableNames = allTableNames;

    const allTables = _.map(tableNames, (tableName) => (
      _.isPlainObject(tableName) ? tableName.tableName : tableName
    ));

    if (_.isArray(tables)) {
      // Fix: https://github.com/nodejh/sequelize-automate/issues/19
      // tables.map((table) => assert(allTables.includes(table), `Table: ${table} not exist.`));
      return tables;
    }

    if (_.isArray(skipTables)) {
      skipTables.map((table) => assert(allTables.includes(table), `Table: ${table} not exist.`));
      return _.difference(allTables, skipTables);
    }

    if (match && (_.isRegExp(match) || _.isString(match))) {
      const regex = _.isRegExp(match) ? match : new RegExp(match);
      return allTables.filter((table) => regex.test(table));
    }

    return allTables;
  }


  /**
   * Get all tables
   */
  async getTables() {
    const { options } = this;
    const tableNames = await this.getTableNames({
      tables: options.tables,
      skipTables: options.skipTables,
      match: options.match,
    });

    debug('tableNames: ', tableNames);
    const tableStructures = await Promise.all(tableNames.map(
      (tableName) => this.queryInterface.describeTable(tableName),
    ));

    const tableIndexes = await Promise.all(tableNames.map(
      (tableName) => this.queryInterface.showIndex(tableName),
    ));

    const tableForeignKeys = await Promise.all(tableNames.map(
      (tableName) => this.queryInterface.getForeignKeyReferencesForTable(tableName),
    ));

    const tables = {};
    tableNames.forEach((tableName, i) => {
      tables[tableName] = {
        structures: tableStructures[i],
        indexes: tableIndexes[i],
        foreignKeys: tableForeignKeys[i],
      };
    });

    this.sequelize.close();
    debug('sequelize close');
    return tables;
  }

  async getDefinitions() {
    const {
      tables,
      skipTables,
      camelCase,
      fileNameCamelCase,
    } = this.options;
    const allTables = await this.getTables({
      tables,
      skipTables,
    });

    const definitions = getModelDefinitions(allTables, {
      camelCase,
      fileNameCamelCase,
      dialect: this.dbOptions.dialect,
    });
    debug('get model definitions');
    return definitions;
  }


  async run() {
    const {
      dir,
      typesDir,
      emptyDir,
    } = this.options;

    const definitions = await this.getDefinitions(this.options);

    const codes = generate(definitions, this.options);
    if (dir) {
      await write(codes, { dir, typesDir, emptyDir });
    }
    return codes;
  }
}

module.exports = Automate;
