const {JwtVerify} = require("../services/JwtService");
const {
 CreateThreadService,
 GetAllThreadService,
 GetThreadByIdService,
 UpdateThreadService,
 DeleteThreadService,
 GetUserThreadService
} = require("../services/ThreadService");
const req = require("express/lib/request");

/**
 * Retrieves the payload of a JWT token from the request headers.
 * @param {Object} req - The HTTP request object.
 * @return {Promise<Object|boolean>} - The payload of the JWT token if it exists, otherwise false.
 */
async function getJwtPayload(req) {
 const authHeader = req.headers.authorization;
 const bearerToken = authHeader.split(' ')[1];
 const jwtPayload = await JwtVerify(bearerToken);
 if (jwtPayload) {
  return jwtPayload;
 }
 console.log(`AUTH :> Invalid jwt (${req.ip})`)
 return false
}

/**
 * CreateThreadController - Controller function for creating a thread
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 *
 * @return {Promise} - A Promise that resolves to the response object with appropriate status and JSON payload
 */
async function CreateThreadController(req, res) {
 console.log(`CTRL :> Thread creation (${req.ip})`)
 const payload = await getJwtPayload(req)
 if (payload) {
  const body = req.body;
  if (!body) {
   return res
     .type('application/json')
     .status(400)
     .json({ error: 'Invalid input data' });
  }
  if (!body.title || !body.subTitle || !body.base64Banner || !body.desc || !body.price) {
   return res
     .type('application/json')
     .status(400)
     .json({ error: 'Field(s) missing' });
  }
  const userId = payload.sub
  const sanitizedData = {
   userId: `${userId}`,
   title: `${body.title}`,
   subTitle: `${body.subTitle}`,
   base64Banner: `${body.base64Banner}`,
   desc: `${body.desc}`,
   price: Number.parseFloat(body.price)
  }
  const CreateThreadServiceResult = await CreateThreadService(sanitizedData)

  if (!CreateThreadServiceResult) {
    return res
      .type('application/json')
      .status(500)
      .json({ error: 'Failed to create thread' });
  }
  return res
    .type('application/json')
    .status(200)
    .json({ success: 'Thread created successfully' });
 }
}

/**
 * Retrieves a thread by its ID.
 * @async
 * @function GetThreadByIdController
 * @param {Object} req - The request object containing the parameters and body.
 * @param {Object} res - The response object used to send the response.
 * @return {Promise<void>} - A promise that resolves once the thread is retrieved and the response is sent.
 */
async function GetThreadByIdController(req, res) {
 const payload = await getJwtPayload(req)
 const body = req.body;
 if (payload) {
  if (!req.params.id) {
   return res
     .type('application/json')
     .status(400)
     .json({ error: 'Field(s) missing' });
  }
  const threadId = req.params.id;
  const GetThreadByIdServiceResult = await GetThreadByIdService(threadId);
  if (GetThreadByIdServiceResult.error === 'ThreadNotFound') {
    return res
      .type('application/json')
      .status(404)
      .json({ message: `${GetThreadByIdServiceResult.message}` });
  }
  return res
    .type('application/json')
    .status(200)
    .json(GetThreadByIdServiceResult);
 }
}

/**
 * Retrieve all threads for a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.ip - The IP address of the requesting client.
 * @param {Object} res - The response object.
 * @returns {Promise} A promise that resolves with the JSON response containing all threads, or rejects with an error.
 */
async function GetAllThreadController(req, res) {
 console.log(`CTRL :> Query all threads (${req.ip})`)
 const payload = await getJwtPayload(req)
 if (payload) {
  const ServiceResult = await GetAllThreadService({userId: payload.sub})
  if (!ServiceResult) {
   return res
     .type('application/json')
     .status(200)
     .json({ error: 'No threads found' });
  }
  if (ServiceResult.error) {
   return res
     .type('application/json')
     .status(500)
     .json({ error: ServiceResult.message });
  }
  return res
    .type('application/json')
    .status(200)
    .json(ServiceResult);
 }
}

/**
 * Retrieves a user's thread from the server.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Object} The response object containing the retrieved user thread.
 * @throws {Error} If an error occurs while retrieving the user thread.
 */
async function GetUserThreadController(req, res) {
 const payload = await getJwtPayload(req)
 const GetUserThreadServiceResult = await GetUserThreadService(payload.sub);
 if (GetUserThreadServiceResult.error === 'ThreadNotFound') {
   return res
     .type('application/json')
     .status(200)
     .json({ error: 'No threads found' });
 }
 if (GetUserThreadServiceResult.error) {
   return res
     .type('application/json')
     .status(500)
     .json({ error: GetUserThreadServiceResult.message });
 }
 return res
   .type('application/json')
   .status(200)
   .json(GetUserThreadServiceResult);
}

/**
 * UpdateThreadController is an asynchronous function that handles the logic for updating a thread.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Object} - The response object.
 */
async function UpdateThreadController(req, res) {
 const payload = await getJwtPayload(req)
 if (payload) {
  const body = req.body;
  if (!body) {
   return res
     .type('application/json')
     .status(400)
     .json({ error: 'Invalid input data' });
  }
  if (!req.params.id) {
   return res
     .type('application/json')
     .status(400)
     .json({ error: 'Missing identifier' });
  }
  const threadId = req.params.id;
  if (!body) {
    return res
      .type('application/json')
      .status(400)
      .json({ error: 'Invalid input data' });
  }
  if (!body.title || !body.subTitle || !body.base64Banner || !body.desc || !body.price || !body.userId) {
    return res
      .type('application/json')
      .status(400)
      .json({ error: 'Field(s) missing' });
  }
  const sanitizedData = {
    title: `${body.title}`,
    subTitle: `${body.subTitle}`,
    base64Banner: `${body.base64Banner}`,
    desc: `${body.desc}`,
    price: Number.parseFloat(body.price)
  }
  const UpdateThreadServiceResult = await UpdateThreadService(threadId, sanitizedData);

  if (UpdateThreadServiceResult.error === 'ThreadNotFound') {
   return res
     .type('application/json')
     .status(404)
     .json({ message: `${UpdateThreadServiceResult.message}` });
  }
  return res
    .type('application/json')
    .status(200)
    .json({ message: 'Thread updated successfully' });
 }
}

/**
 * Deletes a thread.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} - A promise that resolves with the response.
 */
async function DeleteThreadController(req, res) {
 const payload = await getJwtPayload(req)
 if (payload) {
  const body = req.body;
  if (!body) {
   return res
     .type('application/json')
     .status(400)
     .json({ error: 'Invalid input data' });
  }
  if (!req.params.id) {
   return res
     .type('application/json')
     .status(400)
     .json({ error: 'Field(s) missing' });
  }

  const threadId = `${body.id}`;
  const DeleteThreadServiceResult = await DeleteThreadService(threadId);

  if (!DeleteThreadServiceResult) {
    return res
      .type('application/json')
      .status(500)
      .json({ error: 'Failed to delete thread' });
  }
  if (DeleteThreadServiceResult.error === 'ThreadNotFound') {
    return res
      .type('application/json')
      .status(404)
      .json({ message: `${DeleteThreadServiceResult.message}` });
  }
  return res
    .type('application/json')
    .status(200)
    .json({ message: 'Thread deleted successfully' });
 }
}

module.exports = {
 CreateThreadController,
 GetThreadByIdController,
 GetAllThreadController,
 GetUserThreadController,
 UpdateThreadController,
 DeleteThreadController
}