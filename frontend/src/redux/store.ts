import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { all, fork } from 'redux-saga/effects';

// Import module reducers and sagas
import { searchReducer, searchSaga, SearchState } from './modules/search';
import { historyReducer, historySaga, HistoryState } from './modules/history';

// Root saga
function* rootSaga() {
  yield all([
    fork(searchSaga),
    fork(historySaga),
  ]);
}

// Create saga middleware
const sagaMiddleware = createSagaMiddleware();

// Configure store
export const store = configureStore({
  reducer: {
    search: searchReducer,
    history: historyReducer,
  },
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      thunk: false, // We're using Redux Saga instead of thunk
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Run the root saga
sagaMiddleware.run(rootSaga);

// Types
export type RootState = {
  search: SearchState;
  history: HistoryState;
};
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
