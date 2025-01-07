const crypto = require("crypto");
const bcrypt = require("bcrypt");
const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();
const db = require("../database");
const User = db.User;
const { sendEmail } = require("../middleware/sendGrid");

exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).send("User not found.");
        }

        const token = crypto.randomBytes(32).toString("hex");
        const hashedToken = await bcrypt.hash(token, 10);
        const expirationTime = new Date(Date.now() + 3600000); // 1 hour

        await user.update({
            reset_password_token: hashedToken,
            reset_password_expires: expirationTime,
        });

        const resetLink = `${req.protocol}://${req.get(
            "host"
        )}/resetPassword/${token}`;

        const templatePath = "passwordReset.ejs";
        await sendEmail(user.email, "Password Reset Request", templatePath, {
            name: user.first_name,
            resetLink,
        });

        res.send("Password reset email sent.");
    } catch (error) {
        console.error("Error in password reset request:", error);
        res.status(500).send("Error processing password reset.");
    }
};

exports.verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            where: {
                reset_password_expires: { [Op.gt]: new Date() },
            },
        });

        if (
            !user ||
            !(await bcrypt.compare(token, user.reset_password_token))
        ) {
            return res.status(400).send("Invalid or expired reset token.");
        }

        res.render("resetPasswordForm", { email: user.email });
    } catch (error) {
        console.error("Error verifying reset token:", error);
        res.status(500).send("Error verifying reset token.");
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).send("User not found.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await user.update({
            password_hash: hashedPassword,
            reset_password_token: null,
            reset_password_expires: null,
        });

        res.send("Password successfully updated. You can now log in.");
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).send("Error resetting password.");
    }
};
