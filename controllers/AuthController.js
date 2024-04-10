const {RegisterService, LoginService, getUserFromId} = require("../services/UserService");
const {JwtVerify, JwtSign} = require("../services/JwtService");


/**
 * Registers a user.
 *
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Object} The response object containing the result of the registration.
 *                  If successful, it will contain the registered user's data.
 *                  If there is an error, it will contain an error name and message.
 */
async function register(req, res) {
  const body = req.body;
  if (!body) {
    return res
      .type('application/json')
      .status(400)
      .json({ error: 'Invalid input data' });
  }
  if (!body.password || !body.username || !body.firstName || !body.lastName || !body.displayName) {
    return res
      .type('application/json')
      .status(400)
      .json({ error: 'Field(s) missing' });
  }
  // sanitize data
  let gdpr = false
  if (body.gdpr === true) {gdpr = true}
  const sanitizeData= {
    username:     `${body.username}`,
    displayName:  `${body.displayName}`,
    gdpr:         gdpr,
    password:     `${body.password}`,
    firstName:    `${body.firstName}`,
    lastName:     `${body.lastName}`,
  };

  /**
   * Represents the result of the registration service.
   *
   * @typedef {Object} RegisterServiceResult
   * @property {Promise} promise - The promise that resolves when the service registration is complete.
   */
  const RegisterServiceResult = await RegisterService(sanitizeData)

  if (RegisterServiceResult.error === "gdprNotApproved") {
    return res
      .status(400)
      .json({
        error:    RegisterServiceResult.error,
        message:  "GDPR not accepted."
      });
  }
  if (RegisterServiceResult.error === "exist") {
    return res
      .type('application/json')
      .status(400)
      .json({
        error:    RegisterServiceResult.error,
        message:  "The user already exists."
      });
  }

  // SUCCESS
  return res
    .type('application/json')
    .status(201)
    .json(RegisterServiceResult);
}

/**
 * L
 *
 * @param {object} req - The incoming request object.
 * @param {object} res - The outgoing response object.
 */
async function login(req, res) {

  const body = req.body;
  if (!body) {
    return res
      .type('application/json')
      .status(400)
      .json({ error: 'Invalid input data' });
  }
  if (!body.password || !body.username) {
    return res
      .type('application/json')
      .status(400)
      .json({ error: 'Field(s) missing' });
  }

  const loginData = {
    username: `${body.username}`,
    password: `${body.password}`
  };
  console.log(body)
  const LoginServiceResult = await LoginService(loginData);
  console.log(LoginServiceResult)

  if (LoginServiceResult.error === "userNotFound") {
    console.log('POOL')
    return res
      .type('application/json')
      .status(404)
      .json({
        error:    LoginServiceResult.error,
        message:  "User not found."
      });
  }
  if (LoginServiceResult.error === "invalidPassword") {
    return res
      .type('application/json')
      .status(401)
      .json({
        error:    LoginServiceResult.error,
        message:  "Invalid password."
      });
  }
  return res
    .type('application/json')
    .status(200)
    .json(LoginServiceResult);
}

/**
 * R
 *
 * @param {object} req - The incoming request object.
 * @param {object} res - The outgoing response object.
 */
async function getAllUsers(req, res) {
  // conform input data
  // sanitize data
  // call service
}

/**
 * R
 *
 * @param {object} req - The incoming request object.
 * @param {object} res - The outgoing response object.
 */
function getUser(req, res) {
  // conform input data
  // sanitize data
  // call service
}

/**
 * Retrieves the user's information.
 *
 * @param {object} req - The incoming request object.
 * @param {object} res - The outgoing response object.
 */
async function getSelf(req, res) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader.split(' ')[1];
  const payload = await JwtVerify(bearerToken);
  console.log(payload)
  const dbUser = await getUserFromId(payload.sub)
  if (!dbUser) {
    return res
      .type('application/json')
      .status(404)
      .json({ error: 'User not found' });
  }
  return res
    .type('application/json')
    .status(200)
    .json({
      username: dbUser.username,
      displayName: dbUser.displayName,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName
    });
}

module.exports = {register, login, getAllUsers, getUser, getSelf}