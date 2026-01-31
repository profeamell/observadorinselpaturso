
import { Database } from '@sqlitecloud/drivers';

const SQLITE_CLOUD_URI = 'sqlitecloud://cixgblghdk.g4.sqlite.cloud:8860/observador-inselpa?apikey=M52c3FbRLcFtgqGiswalg8v6sCuBAhgMmxatjXGX1xc';

let dbInstance: any = null;

export const getDb = () => {
  if (!dbInstance) {
    dbInstance = new Database(SQLITE_CLOUD_URI);
  }
  return dbInstance;
};
