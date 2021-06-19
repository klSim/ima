const path = require('path');
const fs = require('fs');

function resolveEnvironment(rootDir) {
  const envSource = require(path.resolve(rootDir, './app/environment.js'));
  const envConfig = require(path.resolve(
    rootDir,
    './node_modules/@ima/server/lib/environment.js'
  ))(envSource);

  return envConfig;
}

function requireConfig({
  rootDir,
  fileNames,
  packageJson = null,
  packageJsonKey = '',
  defaultConfig = {}
}) {
  if (
    !rootDir ||
    !Array.isArray(fileNames) ||
    fileNames.length === 0 ||
    !fs.existsSync(rootDir)
  ) {
    return defaultConfig;
  }

  const { fullPath: configPath, fileName: configFileName } =
    fileNames
      .map(fileName => ({
        fileName,
        fullPath: path.resolve(rootDir, fileName)
      }))
      .find(({ fullPath }) => fs.existsSync(fullPath)) || {};

  if (
    !configPath &&
    !(packageJson && packageJsonKey && packageJson[packageJsonKey])
  ) {
    return defaultConfig;
  }

  try {
    if (configPath) {
      const extension = configFileName.split('.').pop();

      return ~['js', 'cjs', 'json'].indexOf(extension)
        ? require(configPath)
        : JSON.parse(fs.readFileSync(configPath));
    } else {
      return packageJson[packageJsonKey];
    }
  } catch (error) {
    console.error(`Error occurred while loading ${configPath} file.`);
    console.error(error);

    return defaultConfig;
  }
}

module.exports = {
  resolveEnvironment,
  requireConfig
};
