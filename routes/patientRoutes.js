/* const express = require("express");
const bcrypt = require("bcrypt");
const db = require("./../database");
// creating a router instance
const router = express.Router();
// requiring the function requireLogin
const requireLogin = require("../middleware/auth");

// Patient Registration route
router.post("/register", async (req, res) => {
    console.log("Request Body:", req.body); // Debugging
    const {
        first_name,
        last_name,
        email,
        password,
        confirm_password,
        phone,
        date_of_birth,
        gender,
        address,
    } = req.body;

    // Check if password and confirm_password matches
    if (password !== confirm_password) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        // Check if email already exist
        const [existPatient] = await db.query(
            "SELECT * FROM Patients WHERE email = ?",
            [email]
        );
        if (existPatient.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }
        // Hash the password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the new patient into the database
        const query = ` INSERT INTO Patients ( first_name, last_name, email, password_hash, phone, date_of_birth, gender, address )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(query, [
            first_name,
            last_name,
            email,
            hashedPassword,
            phone,
            date_of_birth,
            gender,
            address,
        ]);

        res.status(201).json({ message: "Patient registered successfully" });
    } catch (error) {
        res.status(500).json({
            error: "Registration failed: " + error.message,
        });
    }
});

// Login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        //  Check if the patient exists
        const [rows] = await db.query(
            "SELECT * FROM Patients WHERE email = ?",
            [email]
        );
        // Check if email field is empty
        if (rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const patient = rows[0];
        // comparing entered password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(
            password,
            patient.password_hash
        );
        if (!passwordMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        // If password matches, create a session
        req.session.patientId = patient.id;
        req.session.isLoggedIn = true;

        res.json({ message: "Login Successful", patientId: patient.id });
    } catch (error) {
        res.status(500).json({ error: "Login failed: " + error.message });
    }
});

// Profile Management
// route to get patient details
router.get("/profile", async (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.status(401).json({ error: "You're not logged in" });
    }

    try {
        const [rows] = await db.query(
            "SELECT first_name, last_name, phone, date_of_birth, gender, address FROM Patients WHERE id = ?",
            [req.session.patientId]
        );

        // checking if email field is empty
        if (rows.length === 0) {
            return res.status(404).json({ error: "Patient not found" });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({
            error: "Failed to retrieve profile: " + error.message,
        });
    }
});

// route to update patient profile
router.put("/profile", async (req, res) => {
    // check if user is logged in
    if (!req.session.isLoggedIn) {
        return res.status(401).json({ error: "You're not logged in" });
    }

    try {
        const { first_name, last_name, phone, date_of_birth, gender, address } =
            req.body;

        const query = `UPDATE Patients
            SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, gender = ?, address = ?
            WHERE id = ?`;

        await db.query(query, [
            first_name,
            last_name,
            phone,
            date_of_birth,
            gender,
            address,
            req.session.patientId,
        ]);
        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to update profile: " + error.message,
        });
    }
});

// protect route for booking an appointment
router.post("/booking-appointment", requireLogin, async (req, res) => {
    // Booking logic
    res.json({ message: "Appointment booked successfully" });
});

// protect route for viewing appointment history
router.get("/appointment-history", requireLogin, async (req, res) => {
    // logic to fetch appointment history for logged in patient
    res.json({ message: "Appointment history retieved successfully" });
});

// Logout route
router.post("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to logout" });
            } else {
                res.json({ message: "Logout successful" });
            }
        });
    } else {
        res.status(400).json({ error: "No active session to logout" });
    }
});

module.exports = router;
 */





const express = require("express");
// creating a router instance
const router = express.Router();
// importing patient controller
const patientController = require("../controllers/patientController");
// requiring the function requireLogin
const { requireLogin } = require("./../middleware/authMiddleware");


// Patient routes
router.post("/register", patientController.register);
router.post("/login", patientController.login);
router.get("/getProfile", requireLogin, patientController.getProfile);
router.put("/updateProfile", requireLogin, patientController.updateProfile);
router.post("/bookAppointment", requireLogin, patientController.bookAppointment);
router.get("/appointmentHistory", requireLogin, patientController.getAppointmentHistory);
router.post("/logout", patientController.logout);

module.exports = router;