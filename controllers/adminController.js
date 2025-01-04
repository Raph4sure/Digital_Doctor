// requiring bcrypt
const bcrypt = require("bcrypt");
// requiring database

const express = require("express");
const router = express.Router();
const db = require("../database");

const multer = require("multer");

// const upload = require("../middleware/upload");
const fs = require("fs");
const path = require("path");

const { sendEmail } = require("../middleware/email");

const { requireLogin } = require("../middleware/authMiddleware");

const uploadFiles = require("../middleware/upload");

//  Admin registration route
exports.registerAdmin = async (req, res) => {
    const { name, email, password, confirm_password, role } = req.body;

    // Check if password and confirm_password matches
    if (password !== confirm_password) {
        return res.status(400).json({ error: "Password do not match" });
    }

    try {
        // To check if user already exist
        const [existAdmin] = await db.query(
            "SELECT * FROM Admins WHERE email = ?",
            [email]
        );
        if (existAdmin.length > 0) {
            return res.status(400).json({ error: "email already exist" });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new admin into the database
        const query = `INSERT INTO Admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)`;

        await db.query(query, [name, email, hashedPassword, role]);

        res.status(201).json({ message: "Admin registered succesfuly" });
    } catch (error) {
        res.status(500).json({
            error: "Registration failed: " + error.message,
        });
    }
};

// Admin login route
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // check if admin exist
        const [admins] = await db.query(
            "SELECT * FROM Admins WHERE email = ?",
            [email]
        );

        if (admins.length === 0) {
            return res
                .status(400)
                .json({ error: "Invalid username or password" });
        }

        const admin = admins[0];

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(
            password,
            admin.password_hash
        );
        if (!passwordMatch) {
            return res
                .status(400)
                .json({ error: "Invalid username or password" });
        }

        // If password matches, create a session
        req.session.adminId = admin.id;
        req.session.isLoggedIn = true;
        req.session.user = {
            id: admin.id,
            role: ["Admin", "Super Admin"],
        };

        console.log("login User:", req.session.user.role);
      

        // console.log("Session set:", req.session); // Log session to check

        res.json({ message: "Login Successful", adminId: admin.id });
    } catch (error) {
        res.status(500).json({ error: "Login failed: " + error.message });
    }
};

// Admin Dashboard
// router.get("/adminDashboard.html", (req, res) => {
//     res.redirect("/adminDashboard");
// });

exports.adminDashboard = async (req, res) => {
    try {
        const adminId = req.session.adminId; // Assuming session contains adminId
        if (!adminId) {
            return res.status(401).send("Unauthorized");
        }

        // Query to fetch admin details
        const query = `SELECT * FROM Admins WHERE id = ?`;
        const [admins] = await db.query(query, [adminId]);

        if (admins.length === 0) {
            return res.status(404).send("Admin not found");
        }

        // Pass admin data to the view
        res.render("adminDashboard", {
            admin: admins[0], // Pass the first result
            pageTitle: "Admin Dashboard",
            cssPath: "/css/adminDashboard.css",
            user: req.session.user,
        });
    } catch (error) {
        console.error("Error fetching admin data:", error.message);
        res.status(500).send("Internal Server Error");
    }
};

// Managing Admin
exports.showAllAdmin = async (req, res) => {
    try {
        const query = "SELECT * FROM Admins";
        const [admins] = await db.query(query);
        if (admins.length === 0) {
            return res.status(404).send({ message: "No Admin found" });
        }
        res.render("showAllAdmin", {
            admin: admins[0],
            pageTitle: "Manage Admin",
            cssPath: "/css/showAllAdmin.css",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching Admin " + error.message,
        });
    }
}

// Deleting Admin
exports.deleteAdmin = async (req, res) => {
    const adminIdToDelete = req.params.id;
    // check to stop Admin from Deleting itself
    if (req.session.user.id === adminIdToDelete) {
        req.status(400).json({ error: "You cannot delete your account" });
    }

    try {
        const [result] = await db.query("DELETE FROM Admins WHERE id = ?", [
            adminIdToDelete,
        ]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Admin not found" });
        }

        res.json({ message: "Admin deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "An error occured while deleting the admin.",
        });
    }
};
