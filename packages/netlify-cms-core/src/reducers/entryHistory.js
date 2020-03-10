import { Map } from 'immutable';
import { ADD_ENTRY_HISTORY } from 'Actions/entryHistory';
import { ENTRY_PERSIST_SUCCESS } from 'Actions/entries';

const defaultHandler = state => state;

const newHistoryForEntry = (state, { payload }) => {
  const { key, commits } = payload;
  return state.set(key, commits);
};

const entryPersistSuccess = (state, { payload }) => {
  const { collectionName, slug, ref, author, commitDate } = payload;
  const key = `${collectionName}.${slug}`;

  const newHistoryObject = {
    ref,
    date: commitDate,
    author,
    file: {
      // TODO REVISIT THIS - THIS MIGHT BE VERY WRONG. (Even if it isn't really being used I think -> in that case remove);
      path: `_${collectionName}/${slug}.md`
    }
  };

  return state.withMutations(mutatingState => {
    mutatingState.updateIn([key], history => (history ? history.concat([newHistoryObject]) : [newHistoryObject]));
  });
};

const actionHandlers = {
  [ADD_ENTRY_HISTORY]: newHistoryForEntry,
  [ENTRY_PERSIST_SUCCESS]: entryPersistSuccess
};

const entryHistory = (state = Map(), action) => {
  const { type } = action;
  const handler = actionHandlers[type] || defaultHandler;
  const newState = handler(state, action);
  return newState;
};

export const selectEntryHistory = (state, collectionName, slug) => state.get(`${collectionName}.${slug}`) || [];

export default entryHistory;
