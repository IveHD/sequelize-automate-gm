const t = require('@babel/types');
const _ = require('lodash');
const { bigCamelCase } = require('../../util/wordCase');
const { processAttributesProperties, processOptionsByDefinition, getTypeKeyword } = require('./index');

const buildModelClassProperty = (field, key) => {
  const type = getTypeKeyword(field.type);
  return Object.assign(
    t.classProperty(t.identifier(key), null, t.tsTypeAnnotation(type)),
    field.allowNull ? {
      optional: true,
    } : {
      definite: true,
    },
  );
};

const buildImports = (options) => {
  const {
    sequelizeName,
    sequelizeModulePath,
    sequelizeInsName,
    sequelizeInsModulePath,
    sequelizeNameIsDefaultModel,
  } = options;
  const { moduleType } = options;
  if (moduleType === 'es6') {
    return [
      t.importDeclaration(
        sequelizeNameIsDefaultModel
          ? [t.importDefaultSpecifier(t.identifier(sequelizeName))]
          : [t.importSpecifier(t.identifier(sequelizeName), t.identifier(sequelizeName))],
        t.stringLiteral(sequelizeModulePath),
      ),
      t.importDeclaration(
        [t.importDefaultSpecifier(t.identifier(sequelizeInsName))],
        t.stringLiteral(sequelizeInsModulePath),
      )];
  }
  return [
    t.variableDeclaration('const', [
      t.variableDeclarator(t.identifier(sequelizeName), t.callExpression(t.identifier('require'), [t.stringLiteral(sequelizeModulePath)])),
    ]),
    t.variableDeclaration('const', [
      t.variableDeclarator(t.identifier(sequelizeInsName), t.callExpression(t.identifier('require'), [t.stringLiteral(sequelizeInsModulePath)])),
    ]),
  ];
};

const buildDataTypeAndModel = () => t.variableDeclaration('const', [
  t.variableDeclarator(
    t.objectPattern(
      [
        t.objectProperty(t.identifier('DataTypes'), t.identifier('DataTypes'), false, true),
        t.objectProperty(t.identifier('Model'), t.identifier('Model'), false, true),
      ],
    ),
    t.identifier('Sequelize'),
  ),
]);

const buildModelClass = (definition, type) => {
  let classBody = [];
  if (type === 'ts') {
    classBody = _.map(definition.attributes, (field, key) => buildModelClassProperty(field, key));
  }
  return t.classDeclaration(
    t.identifier(bigCamelCase(definition.tableName)),
    t.identifier('Model'),
    t.classBody(classBody),
  );
};

const buildAttributes = (definition) => t.variableDeclaration('const', [
  t.variableDeclarator(t.identifier('attributes'), processAttributesProperties(definition.attributes)),
]);

const buildOptions = (definition, options) => t.variableDeclaration('const', [
  t.variableDeclarator(t.identifier('options'), processOptionsByDefinition(definition, options)),
]);

const buildInit = (definition) => t.expressionStatement(
  t.callExpression(
    t.memberExpression(
      t.identifier(bigCamelCase(definition.tableName)),
      t.identifier('init'),
    ),
    [
      t.identifier('attributes'), t.identifier('options'),
    ],
  ),
);

const buildExports = (definition, options) => {
  const { moduleType } = options;
  if (moduleType === 'es6') {
    return t.exportDefaultDeclaration(
      t.identifier(bigCamelCase(definition.tableName)),
    );
  }
  return t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.memberExpression(
        t.identifier('module'),
        t.identifier('exports'),
      ),
      t.identifier(bigCamelCase(definition.tableName)),
    ),
  );
};

module.exports = {
  buildModelClassProperty,
  buildImports,
  buildDataTypeAndModel,
  buildModelClass,
  buildAttributes,
  buildOptions,
  buildInit,
  buildExports,
};
