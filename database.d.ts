declare module '@ruslankonev/yaml-db' {
  // import { Readable } from 'stream';
  
  interface RecordMetaFile {
    id: string;
    filename: string;
    created_at: number;
  }
  
  interface RecordMeta {
    created_at: number;
    files: RecordMetaFile[];
  }
  
  interface Record {
    _id: string;
    _type: string;
    _created_at: number;
    _files: RecordMetaFile[];
    _updated_at: number;
  }

  interface DatabaseOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }

  class Database {
    constructor(dataPath: string);
    async init(): Promise<void>;
    async loadRecords(): Promise<void>;
    async listRecords(filter?: string | ((item: Record) => boolean)): Promise<Record[]>;
    async paginateAndSortRecords(records: Record[], options: DatabaseOptions): Promise<Record[]>;
    async find(query: Record): Promise<Record[]>;
    async get(id: string, recordType?: string): Promise<Record | undefined>;
    async add(record: Record): Promise<string>;
    async uploadFile(recordId: string, fileBuffer: Buffer, filename: string, recordType?: string): Promise<void>;
    async getRecordData(id: string, recordType?: string): Promise<Record | undefined>;
  }

  export = Database;
}
