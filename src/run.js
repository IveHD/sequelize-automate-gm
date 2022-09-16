const _ = require('lodash');
const inquerer = require('inquirer');
const Sequelize = require('sequelize');
const Automate = require('./automate');

async function run(dbOptions = {}, option = {}) {
  const options = _.cloneDeep(option);
  if (!options.tables) {
    const answer = await inquerer.prompt([{
      name: 'allTable', type: 'list', message: '选择要生成的表', choices: ['部分表', '所有表'],
    }]);
    if (answer.allTable === '部分表') {
      const sequelize = new Sequelize(dbOptions);
      const queryInterface = sequelize.getQueryInterface();
      const allTableNames = await queryInterface.showAllTables();
      const allTables = _.map(allTableNames, (tableName) => (
        _.isPlainObject(tableName) ? tableName.tableName : tableName
      ));
      const selectedTables = await inquerer.prompt([{
        name: 'selectedTables', type: 'checkbox', message: '选择要生成的表', choices: allTables, loop: false,
      }]);
      if (!selectedTables || selectedTables.selectedTables.length === 0) {
        console.log('未选择任何表，流程结束');
        process.exit(0);
      }
      options.tables = selectedTables.selectedTables;
      options.emptyDir = false; // 选择了部分表，不应该清空整个文件夹
    }
  }

  const fileUpdateTypes = ['增量更新(读取源文件)', '完全替换'];
  const [increment] = fileUpdateTypes;
  const type = await inquerer.prompt([{
    name: 'type', type: 'list', message: '文件更新类型', choices: fileUpdateTypes,
  }]);
  if (type.type === increment) {
    options.fileUpdateType = 'INCREMENT';
    options.emptyDir = false; // 选择了增量更新，不应该清空整个文件夹
  }
  const automate = new Automate(dbOptions, options);
  automate.run().then(() => {
    console.log('Done!');
    process.exit(0);
  }).catch((e) => {
    console.log(e);
  });
}

module.exports = run;
