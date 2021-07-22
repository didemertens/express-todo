const databaseService = require('./db-service')
const hash = require('pbkdf2-password')()

const createUser = async (username, password) => {
  const database = await databaseService.getDatabase()

  // when creating user, password is set
  hash({ password }, function (err, pass, salt, hash, name) {
    if (err) throw err;

    return database.none(`INSERT INTO users(username, hash, salt) VALUES('${username}', '${hash}', '${salt}')`);

  })
}

const getUser = async (username) => {
  const database = await databaseService.getDatabase()

  return database.one(`SELECT username, hash, salt from users WHERE username = '${username}'`);
}

module.exports = {createUser, getUser}
