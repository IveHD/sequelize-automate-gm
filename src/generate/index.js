const processJS = require('./javascript');
const buildCode = require('./buildCode');
const processMidway = require('./midway');


/**
 * Generate model code
 * @param {object} definition definition
 * @param {object} options
 */
function generate(definition, options) {
  const { type, tsNoCheck } = options;
  switch (type) {
    case 'js':
      return buildCode(definition, { isEgg: false, ...options });
    case 'ts':
      return buildCode(definition, { tsNoCheck, ...options });
    case 'egg':
      return processJS(definition, { isEgg: true });
    case 'midway':
      return processMidway(definition, { tsNoCheck });
    case '@ali/midway':
      // special for @ali/midway
      return processMidway(definition, { tsNoCheck, isAliMidway: true });
    default:
      break;
  }
  return null;
}

module.exports = generate;
