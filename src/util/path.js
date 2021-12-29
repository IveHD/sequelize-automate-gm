const path = require('path');

function getFilePath(dir, fileName) {
  const dirPath = dir.charAt(0) === '/' ? dir : path.join(process.cwd(), dir);
  const filePath = path.join(dirPath, fileName);
  return filePath;
}

module.exports = {
  getFilePath,
};
