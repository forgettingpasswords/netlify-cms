import { Map, List, fromJS } from 'immutable';
import {
  ENTRY_REQUEST,
  ENTRY_SUCCESS,
  ENTRY_FAILURE,
  ENTRIES_REQUEST,
  ENTRIES_SUCCESS,
  ENTRIES_FAILURE,
  ENTRY_PERSIST_SUCCESS,
  ENTRY_DELETE_SUCCESS
} from 'Actions/entries';
import { ADD_ENTRY_HISTORY } from 'Actions/entryHistory';

import { SEARCH_ENTRIES_SUCCESS } from 'Actions/search';

let collection;
let loadedEntries;
let append;
let page;
let slug;

const entries = (state = Map({ entities: Map(), pages: Map() }), action) => {
  switch (action.type) {
    case ENTRY_REQUEST:
      return state.setIn(['entities', `${action.payload.collection}.${action.payload.slug}`, 'isFetching'], true);

    case ENTRY_PERSIST_SUCCESS: {
      const { slug, newRef } = action.payload;
      return state.withMutations(map => {
        map.setIn(['entities', `${collection}.${slug}`, 'ref'], newRef);
        map.setIn(['entities', `${collection}.${slug}`, 'contentSame'], true);
      });
    }

    case ADD_ENTRY_HISTORY: {
      const { collection, slug, commits } = action.payload;
      const lastCommit = commits[commits.length - 1];
      const { ref } = lastCommit;

      const newState = state.withMutations(map => {
        map.setIn(['entities', `${collection}.${slug}`, 'ref'], ref);
        map.setIn(['entities', `${collection}.${slug}`, 'contentSame'], false);
      });

      return newState;
    }

    case ENTRY_SUCCESS: {
      collection = action.payload.collection;
      slug = action.payload.entry.slug;
      const newState = state.withMutations(map => {
        const existing = map.getIn(['entities', `${collection}.${slug}`]) || Map();
        const newValue = existing
          .merge(fromJS(action.payload.entry))
          .set('isFetching', false)
          .set('contentSame', false);

        map.setIn(['entities', `${collection}.${slug}`], newValue);
        const ids = map.getIn(['pages', collection, 'ids'], List());
        if (!ids.includes(slug)) {
          map.setIn(['pages', collection, 'ids'], ids.unshift(slug));
        }
      });

      return newState;
    }

    case ENTRIES_REQUEST:
      return state.setIn(['pages', action.payload.collection, 'isFetching'], true);

    case ENTRIES_SUCCESS:
      collection = action.payload.collection;
      loadedEntries = action.payload.entries;
      append = action.payload.append;
      page = action.payload.page;
      return state.withMutations(map => {
        loadedEntries.forEach(entry => {
          const existing = map.getIn(['entities', `${collection}.${entry.slug}`]);
          const newValue = fromJS(entry)
            .merge(existing)
            .set('isFetching', false);
          map.setIn(['entities', `${collection}.${entry.slug}`], newValue);
        });

        const ids = List(loadedEntries.map(entry => entry.slug));
        map.setIn(
          ['pages', collection],
          Map({
            page,
            ids: append ? map.getIn(['pages', collection, 'ids'], List()).concat(ids) : ids
          })
        );
      });

    case ENTRIES_FAILURE:
      return state.setIn(['pages', action.meta.collection, 'isFetching'], false);

    case ENTRY_FAILURE:
      return state.withMutations(map => {
        map.setIn(['entities', `${action.payload.collection}.${action.payload.slug}`, 'isFetching'], false);
        map.setIn(
          ['entities', `${action.payload.collection}.${action.payload.slug}`, 'error'],
          action.payload.error.message
        );
      });

    case SEARCH_ENTRIES_SUCCESS:
      loadedEntries = action.payload.entries;
      return state.withMutations(map => {
        loadedEntries.forEach(entry =>
          map.setIn(['entities', `${entry.collection}.${entry.slug}`], fromJS(entry).set('isFetching', false))
        );
      });

    case ENTRY_DELETE_SUCCESS:
      return state.withMutations(map => {
        map.deleteIn(['entities', `${action.payload.collectionName}.${action.payload.entrySlug}`]);
        map.updateIn(['pages', action.payload.collectionName, 'ids'], ids =>
          ids.filter(id => id !== action.payload.entrySlug)
        );
      });

    default:
      return state;
  }
};

export const selectEntry = (state, collection, slug) => state.getIn(['entities', `${collection}.${slug}`]);

export const selectPublishedSlugs = (state, collection) => state.getIn(['pages', collection, 'ids'], List());

export const selectEntries = (state, collection) => {
  const slugs = selectPublishedSlugs(state, collection);
  return slugs && slugs.map(slug => selectEntry(state, collection, slug));
};

export default entries;
