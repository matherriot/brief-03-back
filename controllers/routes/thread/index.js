const express = require("express");
const {
  CreateThreadController,
  GetThreadByIdController,
  GetAllThreadController,
  UpdateThreadController,
  DeleteThreadController,
  GetUserThreadController
} = require("../../ThreadController");
const ValidateJWT = require("../../../middlewares/AuthorizationMiddleware");

const router = express.Router()

// CREATE
router.route("/new").post(ValidateJWT, CreateThreadController)

// READ
router.route("/all").get(ValidateJWT, GetAllThreadController)
router.route("/user").get(ValidateJWT, GetUserThreadController)
router.route("/:id").get(ValidateJWT, GetThreadByIdController)

// UPDATE
router.route("/:id").patch(ValidateJWT, UpdateThreadController)

// DELETE
router.route("/:id").delete(ValidateJWT, DeleteThreadController)

module.exports = router