/* eslint-disable no-case-declarations */
const _ = require('lodash');
const { parse } = require('@babel/parser');
const t = require('@babel/types');

const AUTO_GENERATE_PROPERTIES = {
  type: 'type',
  allowNull: 'allowNull',
  defaultValue: 'defaultValue',
  primaryKey: 'primaryKey',
  autoIncrement: 'autoIncrement',
  comment: 'comment',
  field: 'field',
  unique: 'unique',
  references: 'references',
};

const AUTO_GENERATE_OPTIONS_PROPERTIES = {
  modelName: 'modelName',
  sequelize: 'sequelize',
  indexes: 'indexes',
  freezeTableName: 'freezeTableName',
};


// https://github.com/babel/babel/issues/9804
// support chinese character
const generateOptions = {
  jsescOption: {
    minimal: true,
  },
  jsonCompatibleStrings: true,
};

function getDefaultValueExpression(defaultValue) {
  if (_.isString(defaultValue)) {
    if (defaultValue.toLowerCase().indexOf('sequelize') === 0) {
      return parse(defaultValue).program.body[0].expression;
    }
    return t.stringLiteral(defaultValue);
  }

  if (_.isNumber(defaultValue)) {
    return t.numericLiteral(defaultValue);
  }

  return t.nullLiteral();
}

function processFieldProperties(field) {
  const properties = [];
  _.forEach(field, (value, key) => {
    switch (key) {
      case AUTO_GENERATE_PROPERTIES.type:
        const typeAst = parse(value).program.body[0].expression;
        properties.push(t.objectProperty(t.identifier(key), typeAst));
        break;
      case AUTO_GENERATE_PROPERTIES.allowNull:
        properties.push(
          t.objectProperty(t.identifier(key), t.booleanLiteral(Boolean(value))),
        );
        break;
      case AUTO_GENERATE_PROPERTIES.defaultValue:
        properties.push(
          t.objectProperty(t.identifier(key), getDefaultValueExpression(value)),
        );
        break;
      case AUTO_GENERATE_PROPERTIES.primaryKey:
        properties.push(
          t.objectProperty(t.identifier(key), t.booleanLiteral(Boolean(value))),
        );
        break;
      case AUTO_GENERATE_PROPERTIES.autoIncrement:
        properties.push(
          t.objectProperty(t.identifier(key), t.booleanLiteral(Boolean(value))),
        );
        break;
      case AUTO_GENERATE_PROPERTIES.comment:
        properties.push(
          t.objectProperty(
            t.identifier(key),
            _.isString(value) ? t.stringLiteral(value) : t.stringLiteral(''),
          ),
        );
        break;
      case AUTO_GENERATE_PROPERTIES.field:
        properties.push(
          t.objectProperty(t.identifier(key), t.stringLiteral(value)),
        );
        break;
      case AUTO_GENERATE_PROPERTIES.unique:
        properties.push(
          t.objectProperty(
            t.identifier(key),
            _.isString(value)
              ? t.stringLiteral(value)
              : t.booleanLiteral(Boolean(value)),
          ),
        );
        break;
      case AUTO_GENERATE_PROPERTIES.references:
        if (_.isPlainObject(value) && !_.isEmpty(value)) {
          properties.push(
            t.objectProperty(
              t.identifier(key),
              t.objectExpression([
                t.objectProperty(
                  t.identifier('key'),
                  t.stringLiteral(value.key),
                ),
                t.objectProperty(
                  t.identifier('model'),
                  t.stringLiteral(value.model),
                ),
              ]),
            ),
          );
        }
        break;
      default:
        break;
    }
  });

  return properties;
}

function processAttributesProperties(attributes) {
  const properties = [];
  _.forEach(attributes, (field, fieldName) => {
    properties.push(
      t.objectProperty(
        t.identifier(fieldName),
        t.objectExpression(processFieldProperties(field)),
      ),
    );
  });
  return t.objectExpression(properties);
}


function processOptionsPropertiesByDefinition(definition) {
  const indexes = [];
  (definition.indexes || []).forEach((e) => {
    const o = t.objectExpression([
      t.objectProperty(
        t.identifier('name'),
        t.stringLiteral(e.name),
      ),
      t.objectProperty(
        t.identifier('unique'),
        t.booleanLiteral(e.unique),
      ),
      t.objectProperty(
        t.identifier('using'),
        t.stringLiteral(e.type),
      ),
      t.objectProperty(
        t.identifier('fields'),
        t.arrayExpression(e.fields.map((f) => t.stringLiteral(f))),
      ),
    ]);
    indexes.push(o);
  });
  return t.arrayExpression(indexes);
}

function processOptionsByDefinition(definition, options) {
  const { sequelizeInsName } = options;
  return t.objectExpression([
    t.objectProperty(
      t.identifier(AUTO_GENERATE_OPTIONS_PROPERTIES.modelName),
      t.stringLiteral(definition.tableName),
    ),
    t.objectProperty(
      t.identifier(AUTO_GENERATE_OPTIONS_PROPERTIES.sequelize),
      t.identifier(sequelizeInsName),
    ),
    t.objectProperty(
      t.identifier(AUTO_GENERATE_OPTIONS_PROPERTIES.indexes),
      processOptionsPropertiesByDefinition(definition),
    ),
    t.objectProperty(
      t.identifier(AUTO_GENERATE_OPTIONS_PROPERTIES.freezeTableName),
      t.booleanLiteral(options.freezeTableName),
    ),
  ]);
}

function processOptionsProperties(nodes, definition) {
  return nodes.map((item) => {
    const node = item;
    switch (node.key.name) {
      case 'tableName':
        node.value = t.stringLiteral(definition.tableName);
        break;
      case 'comment':
        node.value = t.stringLiteral(definition.tableComment || '');
        break;
      case 'indexes':
        node.value = t.arrayExpression(
          _.map(definition.indexes, (value) => {
            const properties = [
              t.objectProperty(
                t.identifier('name'),
                t.stringLiteral(value.name),
              ),
              t.objectProperty(
                t.identifier('unique'),
                t.booleanLiteral(Boolean(value.unique)),
              ),
              value.type && t.objectProperty(
                t.identifier('type'),
                t.stringLiteral(value.type),
              ),
              t.objectProperty(
                t.identifier('fields'),
                t.arrayExpression(
                  _.map(value.fields, (field) => t.stringLiteral(field)),
                ),
              ),
            ];
            const index = t.objectExpression(properties.filter((o) => o));
            return index;
          }),
        );
        break;
      default:
        break;
    }
    return node;
  });
}

function getTypeKeyword(type) {
  if (type.indexOf('DataTypes.BOOLEAN') > -1) {
    return t.tsBooleanKeyword();
  }
  if (type.indexOf('DataTypes.INTEGER') > -1) {
    return t.tsNumberKeyword();
  }
  if (type.indexOf('DataTypes.BIGINT') > -1) {
    return t.tsNumberKeyword();
  }
  if (type.indexOf('DataTypes.STRING') > -1) {
    return t.tsStringKeyword();
  }
  if (type.indexOf('DataTypes.CHAR') > -1) {
    return t.tsStringKeyword();
  }
  if (type.indexOf('DataTypes.REAL') > -1) {
    return t.tsNumberKeyword();
  }
  if (type.indexOf('DataTypes.TEXT') > -1) {
    return t.tsStringKeyword();
  }
  if (type.indexOf('DataTypes.DATE') > -1) {
    // return t.genericTypeAnnotation(t.identifier('Date'));
    return t.tsStringKeyword();
  }
  if (type.indexOf('DataTypes.FLOAT') > -1) {
    return t.tsNumberKeyword();
  }
  if (type.indexOf('DataTypes.DECIMAL') > -1) {
    return t.tsNumberKeyword();
  }
  if (type.indexOf('DataTypes.DOUBLE') > -1) {
    return t.tsNumberKeyword();
  }
  if (type.indexOf('DataTypes.UUIDV4') > -1) {
    return t.tsStringKeyword();
  }
  return t.tsAnyKeyword();
}

/**
 * get object type annotation
 * @param {string} type field type
 */
function getObjectTypeAnnotation(type) {
  if (type.indexOf('DataTypes.BOOLEAN') > -1) {
    return t.booleanTypeAnnotation();
  }
  if (type.indexOf('DataTypes.INTEGER') > -1) {
    return t.numberTypeAnnotation();
  }
  if (type.indexOf('DataTypes.BIGINT') > -1) {
    return t.numberTypeAnnotation();
  }
  if (type.indexOf('DataTypes.STRING') > -1) {
    return t.stringTypeAnnotation();
  }
  if (type.indexOf('DataTypes.CHAR') > -1) {
    return t.stringTypeAnnotation();
  }
  if (type.indexOf('DataTypes.REAL') > -1) {
    return t.numberTypeAnnotation();
  }
  if (type.indexOf('DataTypes.TEXT') > -1) {
    return t.stringTypeAnnotation();
  }
  if (type.indexOf('DataTypes.DATE') > -1) {
    return t.genericTypeAnnotation(t.identifier('Date'));
  }
  if (type.indexOf('DataTypes.FLOAT') > -1) {
    return t.numberTypeAnnotation();
  }
  if (type.indexOf('DataTypes.DECIMAL') > -1) {
    return t.numberTypeAnnotation();
  }
  if (type.indexOf('DataTypes.DOUBLE') > -1) {
    return t.numberTypeAnnotation();
  }
  if (type.indexOf('DataTypes.UUIDV4') > -1) {
    return t.stringTypeAnnotation();
  }
  return t.anyTypeAnnotation();
}


module.exports = {
  generateOptions,
  getDefaultValueExpression,
  processFieldProperties,
  processAttributesProperties,
  processOptionsProperties,
  processOptionsPropertiesByDefinition,
  processOptionsByDefinition,
  getObjectTypeAnnotation,
  getTypeKeyword,
  AUTO_GENERATE_PROPERTIES,
  AUTO_GENERATE_OPTIONS_PROPERTIES,
};
