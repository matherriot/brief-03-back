const express = require("express");
const router = express.Router()

const {login, register, getSelf} = require("../../AuthController");
const ValidateJWT = require("../../../middlewares/AuthorizationMiddleware");

router.route("/login").post(login)
router.route("/register").post(register)
router.route("/me").get(ValidateJWT ,getSelf)

module.exports = router
