# sequelize-automate-gm
自动生成和更新著名 ORM 框架 [sequelizejs](https://github.com/sequelize/sequelize) 的 Model 代码。本项目脱胎于 [sequelize-automate](https://github.com/nodejh/sequelize-automate)，新增及优化内容如下：
* 新增了 shell 交互，使用变得更简单。
* 自动增量更新，使库表修改直接映射到 Model 对应的代码上，而你自己在 Model 内的修改不会受到影响。
* ts Model 的生成直接将结构定义写在 Model 类内部，不再生成 *.d.ts 定义文件。
* 修复了部分 ts 的 eslint 错误。
* 支持 es6、commonjs 两种模块化代码。

`重要提示：自动生成的 Model 仍需要经过 review 检查，避免由于工具的未知问题，对你的代码产生负面影响。`

# 安装
### 全局安装
```
npm install -g sequelize-automate-gm
```
### 项目内安装
```
npm install sequelize-automate-gm
```

# 使用方式
### 第一步：配置文件
```javascript
module.exports = {
  "dbOptions": {             // sequelize 数据库配置，该配置用于读取库配置信息
    "database": "db_test",  // 数据库名称
    "username": "guess",    // 用户
    "password": "guess",    // 密码
    "dialect": "mysql",     // 数据库方言
    "host": "localhost",    // 数据库服务地址
    "port": 3306,           // 数据库服务端口号
  },
  "options": {                  // 生成文件的配置信息
    "type": "js",               // 生成代码类型，支持 ts、js
    "dir": "./test/demo/model", // 生成代码文件的输出位置
    "moduleType": "commonjs",   // 生成代码的模块化方式，支持 commonjs、es6
    "sequelizeName": 'Sequelize', // Sequelize 引入Sequelize模块的变量名，默认 Sequelize
    "sequelizeModulePath": 'sequelize', // Sequelize 引入Sequelize模块的模，默认 sequelize
    "sequelizeInsName": 'sequelizeClient', // Sequelize实例的变量名，默认 sequelizeClient
    "sequelizeInsModulePath": '../lib/sequelize.js', // Sequelize实例的模块路径，无默认值，必填。

    "freezeTableName": true, // 强制表名称等于模型名称，默认true
  }
}
```
上述配置文件中 `sequelizeName`、`sequelizeModulePath`、`sequelizeInsName`、`sequelizeInsModulePath` 四个配置是为了满足有些项目对 sequelize 做了自己的封装，生成 Model 时需要按照自己的需求命名变量和指定模块路径。其中`sequelizeInsModulePath`为必填，是因为我已经假设你的项目一定会对 Sequelize 的实例化做了封装。

### 第二步：执行命令
```
sagm -c /path/to/config
```
> sagm = Sequelize Automate Generate Model

# 运行效果

### 交互页面
#### 选择生成部分表的Model还是全部表的Model
```
? 选择要生成的表 (Use arrow keys)
❯ 部分表
  所有表
```
#### 选择要生成的表，空格check
```
 ◯ goods
❯◉ student
 ◯ test_table
 ```

#### 选择增量更新（读取已有文件，做增量更新）还是完全替换（用新生成的代码完全替换已有的）
```
❯ 增量更新(读取源文件)
  完全替换
```

### 生成代码
```javascript
// javascript
const Sequelize = require('Sequelize');

const sequelizeClient = require('../lib/sequelize.js');

const {
  DataTypes,
  Model
} = Sequelize;

class Student extends Model {}

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
  indexes: []
};
Student.init(attributes, options);
module.exports = Student;
```

```typescript
// typescript
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
  indexes: []
};
Student.init(attributes, options);
module.exports = Student;
```