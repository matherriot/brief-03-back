const {getDatabase} = require("./MongodbService");
const Thread = require("../models/Thread");
let Db = null
getDatabase("brief03").then((value)=>{Db = value})

async function getThreadFromId(id) {
  return await Db.collection("threads").findOne({id: id});
}

/**
 * Asynchronously creates a thread service.
 *
 * @param {Object} sanitizedData - The sanitized data object containing necessary information for creating the thread service.
 * @param {string} sanitizedData.userId
 * @param {string} sanitizedData.title
 * @param {string} sanitizedData.subTitle
 * @param {string} sanitizedData.base64Banner
 * @param {string} sanitizedData.desc
 * @param {number} sanitizedData.price
 *
 * @return {Promise} A Promise that resolves to the created thread service.
 */
async function CreateThreadService(sanitizedData) {
  console.log(`SERV :> Create thread (${sanitizedData.title})`)
  const NewThread = new Thread(sanitizedData.title, sanitizedData.subTitle, sanitizedData.base64Banner, sanitizedData.desc, sanitizedData.price, sanitizedData.userId)
  const dbResult = await Db.collection("threads").insertOne(NewThread);
  if (!dbResult.acknowledged) {
    console.log(" -> FAIL")
    return null
  }
  console.log(` -> ${NewThread.id} = Success`)
  return NewThread.id;
}

/**
 * Retrieve a thread by its ID.
 *
 * @param {string} threadId - The ID of the thread to retrieve.
 * @return {Promise<Object>} The thread object if found, otherwise an error object.
 *   The error object has the following properties:
 *     - error: "ThreadNotFound"
 *     - message: "Thread not found"
 */
async function GetThreadByIdService(threadId) {
  console.log(`SERV :> Get thread (${threadId})`)
  const targetThread = await getThreadFromId(threadId);
  if (!targetThread) {
      console.log(` -> Thread not found (${threadId})`)
      return {
          error: "ThreadNotFound",
          message: "Thread not found"
      }
  }
  console.log(` -> Thread found (${threadId})`)
  return {
    id: targetThread.id,
    title: targetThread.title,
    subTitle: targetThread.subTitle,
    base64Banner: targetThread.base64Banner,
    desc: targetThread.desc,
    price: targetThread.price,
    userId: targetThread.userId
  };
}

/**
 * Retrieves all threads for a given user.
 *
 * @param {object} sanitizedData - The sanitized data object containing user ID.
 *
 * @return {object} - An object containing the updated timestamp, an array of sanitized threads, and the length of the array.
 *                   If the user is not found, an error object with the corresponding error code and message is returned.
 */
async function GetAllThreadService(sanitizedData) {
  console.log(`SERV :> Query all threads (${sanitizedData.userId})`)
  const sourceUser = Db.collection('users').findOne({id: sanitizedData.userId})
  if (!sourceUser) {
    console.log(` -> User not found (${sanitizedData.userId})`)
    return {
      error: "UserNotFound",
      message: "User not found"
    }
  }
  let threadsArray = []
  threadsArray = await Db.collection("threads").find().toArray();
  const sanitizedThreads = threadsArray.map((thread)=>{
    return {
      id: thread.id,
      title: thread.title,
      subTitle: thread.subTitle,
      base64Banner: thread.base64Banner,
      desc: thread.desc,
      price: thread.price,
      userId: thread.userId
    }
  })
  console.log(` -> Returned ${sanitizedThreads.length} thread(s)`)
  return {
    updatedAt: Date.now(),
    threads: sanitizedThreads,
    length: sanitizedThreads.length
  }
}

/**
 * Retrieves the user thread(s) for the given userId.
 *
 * @param {string} userId - The ID of the user.
 * @return {Promise<Object>} - A promise that resolves to an object containing the user threads, or an error object if no threads are found.
 */
async function GetUserThreadService(userId) {
  console.log(`SERV :> Get user thread(s) (${userId})`)
  const userThreads = await Db.collection("threads").find({ userId: userId }).toArray();
  if (!userThreads) {
    console.log(` -> Thread not found (${userId})`)
    return {
      error: "ThreadNotFound",
      message: "Thread not found"
    }
  }
  console.log(` -> ${userThreads.length} thread(s) found.`)
  const cleanUserThreads = userThreads.map((thread) => {
    return {
      id: thread.id,
      title: thread.title,
      subTitle: thread.subTitle,
      base64Banner: thread.base64Banner,
      desc: thread.desc,
      price: thread.price,
      userId: thread.userId
    };
  });
  console.log(cleanUserThreads)
  return {
    iat: Date.now(),
    threads : cleanUserThreads,
    length: cleanUserThreads.length
  };
}

/**
 * Updates a thread in the database with the given threadId and sanitized data.
 *
 * @param {string} threadId - The unique identifier of the thread to update.
 * @param {object} sanitizedData - The sanitized data to update the thread with.
 * @return {object} - An object indicating the result of the update operation.
 *                   If the thread is not found, an error object with the error type and message is returned.
 *                   If the thread is found and successfully updated, an object with an "error" property set to "none" is returned.
 */
async function UpdateThreadService(threadId, sanitizedData) {
  const updatedThread = await Db.collection("threads").findOneAndUpdate({ id: threadId }, { $set: sanitizedData }, { returnOriginal: false });
  console.log(updatedThread)
  if (!updatedThread) {
      console.log(` -> Thread not found (${threadId})`);
      return {
          error: "ThreadNotFound",
          message: "Thread not found"
      };
  }
  console.log(` -> Thread updated (${threadId})`);
  return {
    error: "none"
  };
}

/**
 * Deletes a thread with the given thread ID from the database.
 *
 * @param {string} threadId - The ID of the thread to delete.
 * @return {Promise<{ error: string } | { error: string, message: string }>} - A promise that resolves to an object with either an "error" property set to "none" if the thread was deleted successfully, or an "error" property set to "ThreadNotFound" with a "message" property set to "Thread not found" if the thread was not found.
 */
async function DeleteThreadService(threadId) {
  console.log(`SERV :> Delete thread (${threadId})`);
  const deletedThread = await Db.collection("threads").findOneAndDelete({ id: threadId });
  if (!deletedThread) {
      console.log(` -> Thread not found (${threadId})`);
      return {
          error: "ThreadNotFound",
          message: "Thread not found"
      };
  }
  console.log(` -> Thread deleted (${threadId})`);
  return {
    error: "none"
  }
}

module.exports = {
  CreateThreadService,
  GetThreadByIdService,
  GetAllThreadService,
  GetUserThreadService,
  UpdateThreadService,
  DeleteThreadService
}