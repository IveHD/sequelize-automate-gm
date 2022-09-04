const _ = require('lodash');
const { parse } = require('@babel/parser');
const { default: generate } = require('@babel/generator');
const t = require('@babel/types');
const { default: traverse } = require('@babel/traverse');
const fs = require('fs');
const { getFilePath } = require('../util/path');
const buildAst = require('./common/buildAst');

const {
  processOptionsByDefinition,
  processFieldProperties,
  AUTO_GENERATE_PROPERTIES,
  AUTO_GENERATE_OPTIONS_PROPERTIES,
} = require('./common/index');

/**
 * Generate codes
 * @param {object} definition
 * @param {object} options
 */
function generateCode(definition, options) {
  const { type } = options;
  const { modelFileName } = definition;
  let ast;
  const filePath = getFilePath(options.dir, `${modelFileName}.${type}`);
  if (options.fileUpdateType === 'INCREMENT' && fs.existsSync(filePath)) { // 如果是增量更新且历史文件存在
    const preCode = fs.readFileSync(filePath, 'utf-8');
    const preAst = parse(preCode, {
      sourceType: 'module',
      plugins: ['typescript'],
    });
    traverse(preAst, {
      ClassBody: (path) => {
        const { node } = path;
        const newBody = node.body.filter((n) => !definition.attributes[n.key.name]);
        if (options.type === 'ts') {
          _.forInRight(definition.attributes, (field, key) => {
            const prop = buildAst.buildModelClassProperty(field, key);
            newBody.unshift(prop);
          });
        }
        node.body = newBody;
      },
      VariableDeclarator: (path) => {
        const { node } = path;
        if (t.isIdentifier(node.id, { name: 'attributes' })) {
          node.init.properties = node.init.properties.filter(
            (prop) => definition.attributes[prop.key.name],
          );
          node.init.properties.forEach((prop) => {
            const preValueDiffMethods = prop.value.properties.filter(
              (p) => !AUTO_GENERATE_PROPERTIES[p.key.name],
            );
            const fieldName = prop.key.name;
            const field = definition.attributes[fieldName];
            // eslint-disable-next-line no-param-reassign
            prop.value = t.objectExpression(processFieldProperties(field));
            prop.value.properties.push(...preValueDiffMethods);
          });
        }
        if (t.isIdentifier(node.id, { name: 'options' })) {
          const nodes = node.init.properties.filter(
            (n) => !AUTO_GENERATE_OPTIONS_PROPERTIES[n.key.name],
          );
          const newBody = processOptionsByDefinition(definition, options);
          newBody.properties.push(...nodes);
          node.init = newBody;
        }
      },
    });
    ast = preAst;
  } else {
    const importPart = buildAst.buildImports(options);
    const dataTypeAndModel = buildAst.buildDataTypeAndModel();
    const modelClass = buildAst.buildModelClass(definition, type);
    const attributes = buildAst.buildAttributes(definition);
    const initOptions = buildAst.buildOptions(definition, options);
    const initCall = buildAst.buildInit(definition);
    const exportsPart = buildAst.buildExports(definition, options);
    const body = [
      ...importPart, dataTypeAndModel, modelClass, attributes,
      initOptions, initCall, exportsPart];
    ast = t.program(body);
  }
  const { code } = generate(ast, {
    jsescOption: {
      minimal: true,
      quotes: 'single',
      compact: 'auto',
    },
  });
  return code;
}

function process(definitions, options) {
  let { type } = options;
  if (type === undefined) {
    type = 'ts';
  }
  if (!['ts', 'js'].includes(type)) {
    throw new Error(`Only ts or js language is supported, but got a/an ${type}`);
  }
  const modelCodes = definitions.map((definition) => {
    const { modelFileName } = definition;
    const fileType = 'model';
    const file = `${modelFileName}.${type}`;
    const code = generateCode(definition, options);
    return {
      file,
      code,
      fileType,
    };
  });

  const codes = _.concat([], modelCodes);
  return codes;
}
module.exports = process;
