import oracledb from 'oracledb';

export function createOracleDatabase(config, logger) {
  let pool;

  return {
    get enabled() {
      return config.DB_ENABLED;
    },

    async connect() {
      if (!config.DB_ENABLED || pool) return;
      pool = await oracledb.createPool({
        user: config.ORACLE_USER,
        password: config.ORACLE_PASSWORD,
        connectString: config.ORACLE_CONNECT_STRING,
        poolMin: config.ORACLE_POOL_MIN,
        poolMax: config.ORACLE_POOL_MAX,
        poolIncrement: config.ORACLE_POOL_INCREMENT
      });
      logger.info('Oracle connection pool initialized');
    },

    async ping() {
      if (!config.DB_ENABLED) return { configured: false, connected: false };
      if (!pool) throw new Error('Oracle connection pool is not initialized');

      let connection;
      try {
        connection = await pool.getConnection();
        await connection.execute('SELECT 1 FROM DUAL');
        return { configured: true, connected: true };
      } finally {
        if (connection) await connection.close();
      }
    },

    async close() {
      if (pool) {
        await pool.close(10);
        pool = undefined;
        logger.info('Oracle connection pool closed');
      }
    },

    get pool() {
      if (!pool) throw new Error('Oracle connection pool is not initialized');
      return pool;
    }
  };
}
