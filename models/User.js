const { v4: uuid, parse } = require('uuid');

/**
 * Represents a User object.
 *
 * @class User
 */
class User {
  firstName;
  lastName;
  /**
   * Creates a new user object.
   *
   * @constructor
   * @param {string} username - The username of the user.
   * @param {string} displayName - The display name of the user.
   * @param {string} passwordHash - The password hash of the user.
   * @param {string} [id] - The optional unique identifier of the user. If not provided or not a valid UUID, a new UUID will be generated.
   * @return {void}
   */
  constructor(username, displayName, passwordHash, gdpr, id) {
    if (!id || parse(id)) {
    this.id = uuid(undefined, undefined, undefined);
  } else {
    this.id = id;
  }
    console.log(this.id)
  this.username = username;
  this.displayName = displayName;
  this.gdpr = gdpr;
  this.passwordHash = passwordHash;
  this.isAdmin = false;
  }

  setFirstName(firstName) {
    this.firstName = firstName
  }

  setLastName(lastName) {
    this.lastName = lastName
  }
}
module.exports = User;