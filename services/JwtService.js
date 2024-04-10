const Jose = require("jose")

/**
 * Validates a JWT and returns the result.
 *
 * @param {string} jwt - The JWT to be validated.
 * @return {Promise<boolean|object>} A promise that resolves to the validation result. It returns `false` if the JWT is invalid, otherwise it returns the decoded payload as an object.
 */
async function JwtVerifyService(jwt) {
  try {
    const result = await Jose.jwtVerify(
      jwt,
      new TextEncoder()
        .encode(`${process.env.JWT_SECRET}`),
      {
      })
    return result.payload;
  } catch (error) {
    console.log(error)
    return false
  }
}

/**
 * Sign a JWT with the given payload, algorithm, expiration time, and audience.
 *
 * @param {object} payload - The payload of the JWT.
 * @param {string} alg - The algorithm to use for signing the JWT.
 * @param {string} expTime - The expiration time of the JWT in format "4h || 7d || 1w".
 * @param {string|string[]} audience - The audience(s) of the JWT.
 *
 * @returns {Promise<string>} - A promise that resolves to the signed JWT.
 */
async function JwtSignService(payload, alg, expTime, audience) {
  return await new Jose.SignJWT(payload)
    .setProtectedHeader({alg})
    .setIssuedAt(new Date())
    .setIssuer('Brief 03 - Mathis HERRIOT')
    .setAudience(audience)
    .setExpirationTime(expTime)
    .sign(new TextEncoder().encode(`${process.env.JWT_SECRET}`))
}

module.exports = {JwtVerify: JwtVerifyService, JwtSign: JwtSignService}