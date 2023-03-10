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
 * Filename: index.ts
 * Description:
 *   Main entry point for the module.
 */

import {
  add_autoincrement_reference_for_project,
  get_autoincrement_references_for_project,
} from './datamodel/autoincrement';
import {HRID_STRING, split_full_project_id} from './datamodel/core';
import {
  get_fieldpersistentdata,
  set_fieldpersistentdata,
} from './datamodel/fieldpersistent';
import {isEqualFAIMS} from './datamodel/typesystem';
import {ProjectID, RecordMetadata} from './types';
import {
  generateFAIMSDataID,
  getFirstRecordHead,
  getFullRecordData,
  getHRIDforRecordID,
  getRecordMetadata,
  getRecordsByType,
  getRecordsWithRegex,
  listFAIMSRecordRevisions,
  setRecordAsDeleted,
  upsertFAIMSData,
} from './data_storage';
import {getAllRecordsWithRegex} from './data_storage/queries';
import {logError} from './logging';

export {
  HRID_STRING,
  add_autoincrement_reference_for_project,
  generateFAIMSDataID,
  getAllRecordsWithRegex,
  getFirstRecordHead,
  getFullRecordData,
  getHRIDforRecordID,
  getRecordMetadata,
  getRecordsByType,
  getRecordsWithRegex,
  get_autoincrement_references_for_project,
  get_fieldpersistentdata,
  isEqualFAIMS,
  listFAIMSRecordRevisions,
  setRecordAsDeleted,
  set_fieldpersistentdata,
  split_full_project_id,
  upsertFAIMSData,
};

export * from './types';

export type DBCallbackObject = {
  getDataDB: CallableFunction;
  getProjectDB: CallableFunction;
  shouldDisplayRecord: CallableFunction;
  getLocalStateDB: CallableFunction;
};

let moduleCallback: DBCallbackObject;

export const registerClient = (callbacks: DBCallbackObject) => {
  moduleCallback = callbacks;
};

export const getDataDB = (project_id: ProjectID) => {
  if (moduleCallback) {
    return moduleCallback.getDataDB(project_id);
  } else {
    logError('No callback registered to get data database');
    return undefined;
  }
};

export const getProjectDB = (project_id: ProjectID) => {
  if (moduleCallback) {
    return moduleCallback.getProjectDB(project_id);
  } else {
    logError('No callback registered to get project database');
    return undefined;
  }
};

export const shouldDisplayRecord = (
  project_id: ProjectID,
  record_metadata: RecordMetadata
) => {
  if (moduleCallback) {
    return moduleCallback.shouldDisplayRecord(project_id, record_metadata);
  } else {
    logError('No callback registered to check record permissions');
    return undefined;
  }
};

export const getLocalStateDB = () => {
  if (moduleCallback) {
    return moduleCallback.getLocalStateDB();
  } else {
    logError('No callback registered to get local state DB');
    return undefined;
  }
};
