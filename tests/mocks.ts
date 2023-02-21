import PouchDB from 'pouchdb';
import {DBCallbackObject} from '../src';

import {ProjectID} from '../src/types';

PouchDB.plugin(require('pouchdb-adapter-memory')); // enable memory adapter for testing

const databaseList: any = {};

const getDatabase = async (databaseName: string) => {
  if (databaseList[databaseName] === undefined) {
    const db = new PouchDB(databaseName, {adapter: 'memory'});
    databaseList[databaseName] = db;
  }
  return databaseList[databaseName];
};

const mockGetDataDB = async (project_id: ProjectID) => {
  const databaseName = 'data-' + project_id;
  return getDatabase(databaseName);
};

const mockGetProjectDB = async (project_id: ProjectID) => {
  return getDatabase('project-' + project_id);
};

const mockGetLocalStateDB = async () => {
  return getDatabase('local-state');
};

const mockShouldDisplayRecord = () => {
  return true;
};

export const cleanDataDBS = async () => {
  let db: PouchDB.Database;
  for (const name in databaseList) {
    db = databaseList[name];
    delete databaseList[name];

    if (db !== undefined) {
      try {
        await db.destroy();
        //await db.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};
// register our mock database clients with the module
export const callbackObject: DBCallbackObject = {
  getDataDB: mockGetDataDB,
  getProjectDB: mockGetProjectDB,
  shouldDisplayRecord: mockShouldDisplayRecord,
  getLocalStateDB: mockGetLocalStateDB,
};
