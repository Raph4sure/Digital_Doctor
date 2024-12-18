// requiring bcrypt
const express = require("express");

const bcrypt = require("bcrypt");
// requiring database
const db = require("./../database");
// Multer is for file uploads and handling
const multer = require("multer");



// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Invalid file type. Only JPEG, JPG, PNG files are allowed"
                )
            );
        }
    },
});

// Doctors Registration route
exports.register = upload.single("profile_image"), async (req, res) => {
    console.log("Body", req.body);
    console.log("File:", req.file);
    const {
        first_name,
        last_name,
        email,
        password,
        confirm_password,
        specialization,
        gender,
        phone,
    } = req.body;

    // Check if password and confirm_password matches
    if (password !== confirm_password) {
        return res.status(400).json({ error: "Password do not match" });
    }

    try {
        // Check if email already exist
        const [existDoctor] = await db.query(
            "SELECT * FROM Doctors WHERE email = ?",
            [email]
        );
        if (existDoctor.length > 0) {
            return res.status(401).json({ error: "Email already exist" });
        }

        // Hash the password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Get the profile image filename
        const profileImage = req.file ? req.file.filename : null;

        // Insert the new patient into the database
        const query = `INSERT INTO Doctors ( first_name, last_name, email,password_hash, specialization, gender, phone, profile_image)  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        await db.query(query, [
            first_name,
            last_name,
            email,
            hashedPassword,
            specialization,
            gender,
            phone,
            profileImage,
        ]);

        res.status(201).json({ message: "Doctor Registered succesfully" });
    } catch (error) {
        res.status(500).json({
            error: "Registration failed: " + error.message,
        });
    }
};

// Doctor login route
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if doctors exist
        const [rows] = await db.query("SELECT * FROM Doctors WHERE email = ?", [
            email,
        ]);

        if (rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const doctor = rows[0];

        // comparing password entered with the hash password
        const passwordMatch = await bcrypt.compare(
            password,
            doctor.password_hash
        );

        if (!passwordMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // create a session if password matches.
        req.session.doctorId = doctor.id;
        req.session.isLoggedIn = true;

        res.json({ message: "Login Succesful", doctorId: doctor.id });
    } catch (error) {
        res.status(500).json({ error: "Login failed: " + error.message });
    }
};

// Doctor logout route
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to logout" });
        } else {
            res.json({ message: "Logout Succesful" });
        }
    });
};

// View doctor profile
exports.getProfile = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT first_name, last_name, email, specialization, phone, gender, profile_image FROM Doctors WHERE id = ?",
            [req.session.doctorId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Doctor not found" });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({
            error: "Failed to retrieve profile: " + error.message,
        });
    }
};

// Update doctor profile
exports.updateProfile = async (req, res) => {
    const { first_name, last_name, specialization, phone } = req.body;

    try {
        await db.query(
            "UPDATE Doctors SET first_name = ?, last_name = ?, specialization = ?, gender = ?, profile_image = ?, phone = ?, WHERE id = ?",
            [
                first_name,
                last_name,
                specialization,
                profile_image,
                gender,
                phone,
                req.session.doctorId,
            ]
        );

        res.json({ message: "Profile updated succesfuly" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to update profile: " + error.message,
        });
    }
};

// Delete doctor profile
exports.deleteProfile = async (req, res) => {
    try {
        await db.query("DELETE FROM Doctors WHERE id = ?", [
            req.session.doctorId,
        ]);

        // Destroy session after deleting account
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to log out" });
            } else {
                res.json({ message: "Account deleted successfully" });
            }
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to delete account: " + error.message,
        });
    }
};

