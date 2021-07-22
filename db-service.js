const pgPromise = require('pg-promise')({})

const usersDb = pgPromise('postgres://guest:password@localhost:5432/postgres')
// postgres://username:password@host:port/database

const DatabaseService = (function () {
  let instance;

  async function createInstance() {
      const connection = await usersDb.connect()
      
      // const username = 'Sam'
      // const password = 'Sammy'
      // usersDb.none(`INSERT INTO users(username, password) VALUES('${username}', '${password}')`);
      return connection;
  }

  return {
    getDatabase: async function () {
          if (!instance) {
              instance = await createInstance();
          }
          return usersDb;
      }
  };
})();

module.exports = DatabaseService
