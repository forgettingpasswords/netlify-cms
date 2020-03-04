import { Map } from 'immutable';
import { ADD_ENTRY_HISTORY } from 'Actions/entryHistory';

const defaultHandler = state => state;

const newHistoryForEntry = (state, { payload }) => {
  const { key, commits } = payload;
  return state.set(key, commits);
};

const actionHandlers = {
  [ADD_ENTRY_HISTORY]: newHistoryForEntry
};

const entryHistory = (state = Map(), action) => {
  const { type } = action;
  const handler = actionHandlers[type] || defaultHandler;
  const newState = handler(state, action);
  return newState;
};

export const selectEntryHistory = (state, collectionName, slug) => state.get(`${collectionName}.${slug}`) || [];

export default entryHistory;
