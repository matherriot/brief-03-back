const {MongoClient} = require('mongodb')


/**
 * Establishes a connection to a MongoDB server using the MongoClient.
 *
 * @returns {MongoClient} A Promise that resolves with a MongoDB client object connected to the server.
 *                    The client object can be used to perform database operations.
 * @throws {Error} If an error occurs while attempting to connect to the MongoDB server.
 */
async function connect() {
  try {
    return await MongoClient.connect("mongodb://127.0.0.1:27017/")
  } catch (err) {
    throw err
  }
}

async function getDatabase(name) {
  const {connect} = require("./MongodbService")
  const client = await connect()
  //console.log(client)
  const db = client.db(name);
  //console.log(db)
  return db;

}

module.exports = {connect, getDatabase}