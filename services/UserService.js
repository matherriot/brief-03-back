const UserService = require("../models/User");
const Argon2id = require("@node-rs/argon2")
const Jose = require("jose")
const {getDatabase} = require("./MongodbService");
const {JwtSign} = require("./JwtService");
const User = require("../models/User");

let Db = null
getDatabase("brief03").then((value)=>{Db = value})

/**
 * Generates a hash from a given password using Argon2id algorithm.
 *
 * @param {string} password - The password to generate a hash for.
 * @return {Promise<string>} - The generated hash.
 */
async function getHashFromPassword(password) {
  return await Argon2id.hash(password,{
    secret: Buffer.from(`${process.env.HASH_SECRET}`),
    algorithm: 2
  })
}

/**
 * Retrieves a user from the database based on the provided username.
 *
 * @param {string} username - The username of the user to retrieve.
 *
 * @return {Promise<object>} - A promise that resolves with the user object if found,
 *                             or null if not found.
 */
async function getUserFromUsername(username) {
  const dbUser = await Db.collection("users").findOne({username: `${username}`})
  if (dbUser === undefined) return null;
  return dbUser;
}

/**
 * Retrieves a user from the database based on the provided id.
 *
 * @param {string} id - The id of the user.
 * @returns {Promise<object|null>} - A Promise that resolves with the user object if found,
 *                                   or null if no user is found.
 */
async function getUserFromId(id) {
  return await Db.collection("users").findOne({id: id});
}

/**
 * Registers a new user by creating a UserService object, generating a JWT token, and inserting the user into the database.
 *
 * @param {Object} sanitizedData - The sanitized user data.
 * @param {string} sanitizedData.username - The username of the new user.
 * @param {string} sanitizedData.displayName - The display namcoe of the new user.
 * @param {string} sanitizedData.firstName
 * @param {string} sanitizedData.lastName
 * @param {string} sanitizedData.password - The password of the new user.
 * @param {boolean} sanitizedData.gdpr - Indicates whether the new user has accepted GDPR.
 *
 * @returns {Object} - An object containing the registered user's data and JWT token.
 * @returns {string} error - The error name, if any. "none" if registration was successful.
 * @returns {string|null} jwt - The JWT token for the registered user. Null if registration was not successful.
 * @returns {Object|null} user - The registered user's data. Null if registration was not successful.
 * @returns {string|null} user.id - The ID of the registered user. Null if registration was not successful.
 * @returns {string|null} user.username - The username of the registered user. Null if registration was not successful.
 * @returns {string|null} user.displayName - The display name of the registered user. Null if registration was not successful.
 */
async function RegisterService(sanitizedData) {
  if (sanitizedData.password.length < 6) {
    console.log(`RegisterService :> Invalid password (${sanitizedData.username})`);
    return { error: "invalidPassword" };
  }
  const passwordHash = await getHashFromPassword(sanitizedData.password)

  // Does the new user has accepted GDPR ?
  if (sanitizedData.gdpr !== true) {
    console.log(`RegisterService :> Gdpr not validated (${sanitizedData.username})`)
    return { error: "gdprNotApproved" }
  }

  // Check if exist and return

  const dbUserIfExist = await getUserFromUsername(sanitizedData.username)
  if (dbUserIfExist) {
    console.log(`RegisterService :> User exist (${dbUserIfExist.username})\n ID:${dbUserIfExist.id}`)
    return { error: "exist" }
  }

  const currentDate = new Date();

  // New UserService (class)

  const NewUser = new User(sanitizedData.username, sanitizedData.displayName, passwordHash, currentDate);
  NewUser.setFirstName(sanitizedData.firstName);
  NewUser.setLastName(sanitizedData.lastName);

  // JWT

  const alg = 'HS512'
  const token = await JwtSign({sub: NewUser.id}, alg, '1d', 'user')

  const userData = {
    error: "none",
    jwt: token,
    user: {
      id: NewUser.id,
      username: NewUser.username,
      displayName: NewUser.displayName,
      firstName: NewUser.firstName,
      lastName: NewUser.lastName
    }};
  console.log("USERDATA :>")
  console.log(userData)
  await Db.collection("users").insertOne(NewUser);
  console.log(`RegisterService :> Inserted new user (${NewUser.username})`)
  return userData
}

/**
 * Performs the login process by verifying the provided credentials.
 * @param {Object} sanitizedData - The sanitized user login data.
 * @param {string} sanitizedData.username - The username provided by the user.
 * @param {string} sanitizedData.password - The password provided by the user.
 * @returns {Object} - The login result object.
 * @returns {string} result.error - The error code if there is an error during the login process.
 * @returns {string} result.jwt - The JSON Web Token (JWT) generated upon successful login.
 * @returns {Object} result.user - The user information.
 * @returns {number} result.user.id - The ID of the user.
 * @returns {string} result.user.username - The username of the user.
 * @returns {string} result.user.displayName - The display name of the user.
 */
async function LoginService(sanitizedData) {
  //const passwordHash = await getHashFromPassword(sanitizedData.password);
  const dbUser = await getUserFromUsername(sanitizedData.username);
  if (!dbUser) {
    console.log(`LoginService :> User does not exist (${sanitizedData.username})`);
    return { error: "userNotFound" };
  }
  if (sanitizedData.password.length < 6) {
    console.log('X')
    console.log(`LoginService :> Invalid password (${sanitizedData.username})`);
    return { error: "invalidPassword" };
  }
  const isPasswordValid = await Argon2id.verify(
    Buffer.from(dbUser.passwordHash),
    Buffer.from(sanitizedData.password),
    {
      secret: Buffer.from(`${process.env.HASH_SECRET}`),
      algorithm: 2
    });
  if (!isPasswordValid) {
    console.log(isPasswordValid)
    console.log(`LoginService :> Invalid password (${sanitizedData.username})`);
    return { error: "invalidPassword" };
  }
  // biome-ignore lint/style/useConst: <explanation>
  let userData = {
    error: "none",
    jwt: null,
    user: {
      id: dbUser.id,
      username: dbUser.username,
      displayName: dbUser.displayName,
    }
  };

  const alg = 'HS512';
  userData.jwt = await JwtSign({sub: dbUser.id}, alg, '1d', 'user')


  console.log("USERDATA :>");
  console.log(userData);
  return userData;
}

module.exports = {RegisterService, LoginService, getUserFromId}