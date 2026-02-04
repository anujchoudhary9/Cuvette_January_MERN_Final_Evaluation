const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  updateProfile,
  updatePassword,
} = require("../controllers/userController");

router.put("/profile", auth, updateProfile);
router.put("/password", auth, updatePassword);

module.exports = router;
