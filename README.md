# sequelize-automate-gm
自动生成和更新著名 ORM 框架 [sequelizejs](https://github.com/sequelize/sequelize) 的 Model 代码。

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
    "define": {
      "underscored": true,
      "freezeTableName": true,
    }
  },
  "options": {                  // 生成文件的配置信息
    "type": "js",               // 生成代码类型，支持 ts、js
    "dir": "./test/demo/model", // 生成代码文件的输出位置
    "moduleType": "commonjs",   // 生成代码的模块化方式，支持 commonjs、es6
    "sequelizeName": 'Sequelize', // Sequelize 引入Sequelize模块的变量名，默认 Sequelize
    "sequelizeModulePath": 'sequelize', // Sequelize 引入Sequelize模块的模，默认 sequelize
    "sequelizeInsName": 'sequelizeClient', // Sequelize实例的变量名，默认 sequelizeClient
    "sequelizeInsModulePath": '../lib/sequelize.js', // Sequelize实例的模块路径，无默认值，必填。
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