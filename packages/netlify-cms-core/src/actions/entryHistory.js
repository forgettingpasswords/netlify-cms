import { currentBackend } from 'coreSrc/backend';

export const ADD_ENTRY_HISTORY = 'ADD_ENTRY_HISTORY';
export const SELECT_ENTRY_HISTORY_ITEM = 'SELECT_ENTRY_HISTORY_ITEM';
export const DRAFT_CREATE_FROM_ENTRY_HISTORY = 'DRAFT_CREATE_FROM_ENTRY_HISTORY';

export const addEntryHistory = (key, commits) => ({
  type: ADD_ENTRY_HISTORY,
  payload: {
    key,
    commits
  }
});

export const loadEntryHistory = (collection, slug) => async (dispatch, getState) => {
  const state = getState();
  const backend = currentBackend(state.config);
  const commits = await backend.getFileVersions(collection, slug);
  const key = `${collection.get('name')}.${slug}`;
  dispatch(addEntryHistory(key, commits));
};

export const selectEntryHistoryItem = ref => ({
  type: SELECT_ENTRY_HISTORY_ITEM,
  payload: ref
});
