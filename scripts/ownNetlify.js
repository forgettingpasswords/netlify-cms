const { readdirSync, readFile, writeFile } = require('fs');
const [initiator, scriptPath, owner] = process.argv;

if (!owner) {
  throw new Error('owner argument not provided');
}

const ROOT = '../';
const NETLIFY_PACKAGES = `${ROOT}/packages`;
const NEW_OWNER = owner;

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

const netlifySubPackages = [...getDirectories(NETLIFY_PACKAGES)];

const packagejsonpaths = [
  `${ROOT}/package.json`,
  ...netlifySubPackages.map(name => `${NETLIFY_PACKAGES}/${name}/package.json`)
];

const netlifyPackages = ['netlify-cms', ...netlifySubPackages];

const ownershipString = (owner, name) => {
  const splitByScope = name.split('/');
  const packageName = splitByScope.length > 1 ? splitByScope[splitByScope.length - 1] : name;
  return `@${owner}/${packageName}`;
};

const createResolveAliasJson = packages => {
  const obj = packages.reduce((acc, el) => {
    return {
      ...acc,
      [el]: ownershipString(NEW_OWNER, el)
    };
  }, {});

  return obj;
};

const aliases = createResolveAliasJson(netlifyPackages);

const replaceDependencies = (deps, aliases) => {
  if (deps === undefined) {
    return undefined;
  }

  const aliasedKeys = Object.keys(aliases);
  const depKeys = Object.keys(deps);
  return depKeys
    .map(key => {
      const keyInAliases = aliasedKeys.includes(key);
      return keyInAliases ? [aliases[key], deps[key]] : [key, deps[key]];
    })
    .reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: value
      };
    }, {});
};

const replaceOwner = path => {
  readFile(path, 'utf8', (err, data) => {
    const jsoned = JSON.parse(data);
    const { name, dependencies, peerDependencies, devDependencies } = jsoned;
    const ownedDeps = replaceDependencies(dependencies, aliases);
    // const ownedPeers = replaceDependencies(peerDependencies, aliases);
    const ownedDevDeps = replaceDependencies(devDependencies, aliases);

    const newName = name ? ownershipString(NEW_OWNER, name) : undefined;
    const updated = {
      ...jsoned,
      ...(newName ? { name: newName } : {}),
      _moduleAliases: aliases,
      ...(ownedDeps ? { dependencies: ownedDeps } : {}),
      // ...(ownedPeers ? { peerDependencies: ownedPeers } : {}),
      ...(ownedDevDeps ? { devDependencies: ownedDevDeps } : {}),
      publishConfig: {
        access: 'public'
      }
    };

    const stringed = JSON.stringify(updated, null, 2);

    writeFile(path, stringed, () => {});
  });
};

packagejsonpaths.forEach(replaceOwner);
console.log('done');
