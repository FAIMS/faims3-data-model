/*
 * Copyright 2021, 2022 Macquarie University
 *
 * Licensed under the Apache License Version 2.0 (the, "License");
 * you may not use, this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND either express or implied.
 * See, the License, for the specific language governing permissions and
 * limitations under the License.
 *
 * Filename: internals.test.ts
 * Description:
 *   tests for the internals module
 *
 */

import PouchDB from 'pouchdb';
import {registerClient} from '..';

import {ProjectID, HRID_STRING} from '../datamodel/core';
import {Record} from '../datamodel/ui';
import {generateFAIMSDataID, upsertFAIMSData} from './index';

import {getHRID, getRecord, getRevision} from './internals';

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

// register our mock database clients with the module
registerClient({
  getDataDB: mockGetDataDB,
  getProjectDB: mockGetProjectDB,
  shouldDisplayRecord: mockShouldDisplayRecord,
  getLocalStateDB: mockGetLocalStateDB,
});

async function cleanDataDBS() {
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
}

beforeEach(async () => {
  return await cleanDataDBS();
});

afterAll(async () => {
  return await cleanDataDBS();
});

describe('test internals', () => {
  test('test getHRID', async () => {
    const project_id = 'test';
    const fulltype = 'test::test';
    const time = new Date();
    const user_id = 'user';

    const record_id = generateFAIMSDataID();

    // record with an hrid field - one starting with HRID_STRING
    const doc: Record = {
      project_id: project_id,
      record_id: record_id,
      revision_id: null,
      type: fulltype,
      data: {avp1: 1},
      created_by: user_id,
      updated_by: user_id,
      created: time,
      updated: time,
      annotations: {
        avp1: 1,
      },
      field_types: {field_name: fulltype},
    };

    const hridField = HRID_STRING + 'FieldName';
    const hridValue = 'test HRID value';
    doc.data[hridField] = hridValue;
    doc.annotations[hridField] = 'annotation for HRID';

    return upsertFAIMSData(project_id, doc).then(revisionId => {
      return getRevision(project_id, revisionId)
        .then(revision => {
          return getHRID(project_id, revision);
        })
        .then(hrid => {
          expect(hrid).toBe(hridValue);
        });
    });
  });
  test('test getRecord - undefined', () => {
    expect(() => getRecord('test', 'unknownId')).rejects.toThrow(
      /no such record/
    );
  });
});
