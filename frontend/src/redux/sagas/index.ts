import { all, fork } from 'redux-saga/effects';
import imagesSaga from './imagesSaga';
import historySaga from './historySaga';

// Root saga that combines all sagas
export default function* rootSaga() {
  yield all([
    fork(imagesSaga),
    fork(historySaga),
  ]);
}
