const {JwtVerify} = require("../services/JwtService");
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;
const UNAUTH_MESSAGE = 'Missing Authorization Header';
const INVALID_TOKEN_MESSAGE = 'Invalid or expired token.';

async function validateJWT(req, res, next) {
  console.log(`AUTH :> JWT Check... (${req.ip})`)
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(UNAUTHORIZED).json({message: UNAUTH_MESSAGE});
    return;
  }

  const bearerToken = authHeader.split(' ')[1];
  const isTokenValid = await JwtVerify(bearerToken);

  if (isTokenValid !== false) {
    console.log(` -> USERID:${isTokenValid.sub} = Valid`)
    next();
  } else {
    console.log(`WARN :> Invalid JWT (${req.ip})`)
    res.status(FORBIDDEN).json({message: INVALID_TOKEN_MESSAGE});
  }
}

module.exports = validateJWT;