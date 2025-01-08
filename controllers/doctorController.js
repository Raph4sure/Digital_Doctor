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

// const express = require("express");
// const router = express.Router();
// const db = require("./../database");

// Doctors Registration route
exports.register = async (req, res) => {
    /*     console.log("Body", req.body);
    console.log("File:", req.files);
    console.log("Doctor ID:", req.session.doctorId);
 */
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
        const profileImage = req.files ? req.files[0].filename : null;

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

// Doctor login Route
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
        req.session.user = {
            id: doctor.id,
            role: ["doctor"],
        };

        console.log("Login User", req.session.user.role);

        res.json({ message: "Login Succesful", doctorId: doctor.id });
    } catch (error) {
        res.status(500).json({ error: "Login failed: " + error.message });
    }
};

// Doctor Dashboard
exports.doctorDashboard = async (req, res) => {
    try {
        const doctorId = req.session.doctorId; // Assuming session contains patientId
        if (!doctorId) {
            return res.status(401).send("Unauthorized");
        }

        // Query to fetch admin details
        const query = `SELECT * FROM Doctors WHERE id = ?`;
        const [doctors] = await db.query(query, [doctorId]);

        if (doctors.length === 0) {
            return res.status(404).send("doctor not found");
        }

        // Pass admin data to the view
        res.render("doctorDashboard", {
            doctor: doctors[0], // Pass the first result
            pageTitle: "doctor Dashboard",
            cssPath: "/css/doctorDashboard.css",
            user: req.session.user,
        });
    } catch (error) {
        console.error("Error fetching doctor data:", error.message);
        res.status(500).send("Internal Server Error");
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

// Router to show all doctors
exports.showAllDoctors = async (req, res) => {
    // const role = req.session.user.role;
    try {
        // Pagination
        // Getting the page and limit from the query parameters, and setting the default to 1 and 10
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // calculating the offset
        const offset = (page - 1) * limit;

        // Importing Admin data to have access to role
        const queryAdmin = `SELECT role from Admins`;

        const [admins] = await db.query(queryAdmin);

        const query = `SELECT * FROM Doctors ORDER BY first_name, last_name ASC LIMIT ? OFFSET ?`;

        const [doctors] = await db.query(query, [limit, offset]);

        // pagination
        // Query total number of doctors for pagination controls

        const queryCount = `SELECT COUNT(*) AS total FROM Doctors`;
        const [[{ total }]] = await db.query(queryCount);

        if (doctors.length === 0) {
            return res.status(404).json({ message: "No doctorsfound" });
        }

        // pagination
        (totalPages = Math.ceil(total / limit)),
            console.log("Admin Data:", admins[0]);
        // console.log("Admins Data:", admins);
        // console.log("login user:", req.session.user.role);

        res.render("showAllDoctors", {
            doctors,
            admins: admins[0],
            userRole: req.session.user.role,
            // pagination
            currentPage: page,
            totalPages,
            limit,
            pageTitle: "showAllDoctors",
            cssPath: "/css/showAllDoctor.css",
            message: "showAllDoctors page",
            user: req.session.user,
            userRole:req.session.user.role,
        });
    } catch (error) {
        console.error("Error fetching Data:", error);
        res.status(500).json({
            message: "Fetching Data failed: " + error.message,
        });
    }
};

// Editing Doctor Profile
exports.getEditDoctor = async (req, res) => {
    try {
        const doctorId = req.params.id;

        const query = "SELECT *  FROM Doctors WHERE id = ?";

        const [doctors] = await db.query(query, [doctorId]);

        if (doctors.length === 0) {
            return res.status(404).send({ message: "Doctor not found" });
        }

        res.render("editDoctor", {
            doctor: doctors[0],
            pageTitle: "editDoctor",
            cssPath: "/css/editDoctor.css",
            message: "Welcome to the edit page",
            user: req.session.user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching Doctor " + error.message,
        });
    }
};

// posting edited Doctor profile
exports.postEditDoctor = async (req, res) => {
    try {
        const doctorId = req.params.id;

        console.log("body:", req.body);
        console.log("file:", req.files);

        const { first_name, last_name, phone, specialization, gender } =
            req.body;

        // Get the profile image filename
        const profileImage = req.files ? req.files[0].filename : null;

        const query = `UPDATE Doctors SET first_name = ?, last_name = ?, phone = ?, specialization = ?, gender = ?, profile_image = ? WHERE id = ?`;

        await db.query(query, [
            first_name,
            last_name,
            phone,
            specialization,
            gender,
            profileImage,
            doctorId,
        ]);

        res.redirect("/showAllDoctors");
    } catch (error) {
        res.status(500).json("Error Updating Doctor" + error.message);
    }
};

// Deleting Doctor
exports.deleteDoctor = async (req, res) => {
    const doctorIdToDelete = req.params.id;

    try {
        const [result] = await db.query("DELETE FROM Doctors WHERE id = ?", [
            doctorIdToDelete,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Doctor not found",
            });
        }

        // res.json({ message: "Doctor deleted successfully" });
        res.redirect("/showAllDoctors");
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "An error occured while deleting Doctor " + error.message,
        });
    }
};

// Route for deleting an Image in Doctors table
exports.deleteDoctorImage = async (req, res) => {
    try {
        const { imagePath } = req.body;

        if (!imagePath) {
            return res.status(400).json({
                success: false,
                message: "Image path is required",
            });
        }

        // File path on the server
        const filePath = path.join(__dirname, "../public/uploads", imagePath);

        // Delete the file from the filesystem
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Update the database (set profile_image to NULL or an empty string)
        await db.query(
            "UPDATE Doctors SET profile_image = NULL WHERE profile_image = ?",
            [imagePath]
        );

        res.json({ success: true, message: "Image deleted successfully" });
    } catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
