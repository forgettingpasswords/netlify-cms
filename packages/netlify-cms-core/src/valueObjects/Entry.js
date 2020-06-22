import { isBoolean } from 'lodash';

const umlautReplacements = {
  Ü: 'UE',
  Ä: 'AE',
  Ö: 'OE',
  ü: 'ue',
  ä: 'ae',
  ö: 'oe',
  ß: 'ss'
};

const umlauts = Object.keys(umlautReplacements);
const umlautUnion = umlauts.slice(1).reduce((acc, umlaut) => `${acc}|${umlaut}`, umlauts[0]);
const replaceUmlautsRegex = new RegExp(umlautUnion, 'g');

export const toUrlSafeUmlauts = value =>
  value.replace(replaceUmlautsRegex, umlautMatch => umlautReplacements[umlautMatch]);

export function createEntry(collection, slug = '', path = '', options = {}) {
  const returnObj = {};
  returnObj.collection = collection;
  returnObj.slug = toUrlSafeUmlauts(slug);
  returnObj.path = path;
  returnObj.partial = options.partial || false;
  returnObj.raw = options.raw || '';
  returnObj.data = options.data || {};
  returnObj.label = options.label || null;
  returnObj.metaData = options.metaData || null;
  returnObj.isModification = isBoolean(options.isModification) ? options.isModification : null;
  if (options.ref) {
    returnObj.ref = options.ref;
  }

  return returnObj;
}
