const express = require("express");
const router = express.Router();

const passwordResetController = require("./../controllers/passwordResetController");

router.post(
    "/requestPasswordReset",
    passwordResetController.requestPasswordReset
);
router.get("/resetPassword/:token", passwordResetController.verifyResetToken);
router.post("/resetPassword", passwordResetController.resetPassword);

module.exports = router;
