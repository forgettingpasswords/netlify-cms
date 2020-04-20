const { mkdirSync, readdirSync } = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// NOTE Assuming that this script stays in the <root>/scripts folder
const rootPath = path.join(__dirname, '../');
const distPath = path.join(rootPath, 'dist');
const packagesPath = path.join(rootPath, 'packages');

const packageNames = readdirSync(packagesPath, { withFileTypes: true }).map(({ name }) => name);
const packageDirectives = packageNames.map(name => [name, path.join(packagesPath, name)]);

mkdirSync(distPath);

packageDirectives.forEach(([name, packagePath]) => {
  const packageNameOut = path.join(distPath, name);
  // const distOut = path.join(packageNameOut, 'package');
  const packageDist = path.join(packagePath, 'dist');
  const packageJson = path.join(packagePath, 'package.json');
  mkdirSync(packageNameOut);
  execSync(`cp -r ${packageDist} ${packageNameOut}/`);
  execSync(`cp -r ${packageJson} ${packageNameOut}/`);

  execSync(`tar -C ${distPath} -cvzf ${distPath}/${name}.tar.gz ${name}`);
});
