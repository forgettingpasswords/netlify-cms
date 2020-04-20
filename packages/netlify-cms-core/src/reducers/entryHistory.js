import { Map } from 'immutable';
import { BLOCK_ENTRY_HISTORY, ADD_ENTRY_HISTORY } from 'Actions/entryHistory';
import { ENTRY_PERSIST_SUCCESS, ENTRY_DELETE_SUCCESS } from 'Actions/entries';

const defaultState = Map([
  ['history', Map()],
  ['blockHistory', false]
]);

const defaultHandler = state => state;

const newHistoryForEntry = (state, { payload }) => {
  const { key, commits } = payload;
  return state.setIn(['history', key], commits);
};

const entryPersistSuccess = (state, { payload }) => {
  const { collectionName, slug, newRef, author, commitDate, oldRef, revert } = payload;
  const key = `${collectionName}.${slug}`;

  const newHistoryObject = {
    ref: newRef,
    date: commitDate,
    author,
    file: {
      // TODO REVISIT THIS - THIS MIGHT BE VERY WRONG. (Even if it isn't really being used I think -> in that case remove);
      path: `_${collectionName}/${slug}.md`
    }
  };

  return state.withMutations(mutatingState => {
    return mutatingState.updateIn(['history', key], history => {
      const newHistory = history ? history.concat([newHistoryObject]) : [newHistoryObject];
      return revert ? newHistory.filter(({ ref }) => ref !== oldRef) : newHistory;
    });
  });
};

const entryDeleteSuccess = (state, { payload }) => {
  const { collectionName, entrySlug } = payload;
  const key = `${collectionName}.${entrySlug}`;
  return state.withMutations(mutatingState => {
    mutatingState.deleteIn(['history', key]);
  });
};

const blockEntryHistory = state => {
  return state.set('blockHistory', true);
};

const actionHandlers = {
  [ADD_ENTRY_HISTORY]: newHistoryForEntry,
  [ENTRY_PERSIST_SUCCESS]: entryPersistSuccess,
  [ENTRY_DELETE_SUCCESS]: entryDeleteSuccess,
  [BLOCK_ENTRY_HISTORY]: blockEntryHistory
};

const entryHistory = (state = defaultState, action) => {
  if (state.get('blockHistory')) {
    return state;
  }

  const { type } = action;
  const handler = actionHandlers[type] || defaultHandler;
  const newState = handler(state, action);
  return newState;
};

export const selectEntryHistory = (state, collectionName, slug) =>
  state.getIn(['history', `${collectionName}.${slug}`]) || [];

export const selectIsRefLatestCommit = (state, collection, slug, ref) => {
  const history = selectEntryHistory(state, collection, slug);
  const lastItem = history[history.length - 1];
  if (!lastItem) {
    return true;
  }

  return lastItem && lastItem.ref === ref;
};

export default entryHistory;
