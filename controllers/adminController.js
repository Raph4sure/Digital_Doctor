const express = require("express");
const db = require("./../database");
// creating a router instance
const router = express.Router();

/* // Admin registration route
router.post("/register", async (req, res) => {
    const { username, password, confirm_password } = req.body;

    // Check if password and confirm_password matches
    if (password !== confirm_password) {
        return res.status(400).json({ error: "Password do not match" });
    }

    try {
        const [existAdmin] = await db.query(
            "SELECT * FROM Admin WHERE username = ?",
            [username]
        );
        if (existAdmin.length > 0) {
            return res.status(400).json({ error: "username already exist" });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new admin into the database
        const query = `INSERT INTO Admin (username, password_hash, role) VALUES (?, ?, 'admin')`;

        await db.query(query, [username, hashedPassword]);

        res.status(201).json({ message: "Admin registered succesfuly" });
    } catch (error) {
        res.status(500).json({
            error: "Registration failed: " + error.message,
        });
    }
});

// Admin login route

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // check if admin exist
        const [rows] = await db.query(
            "SELECT * FROM Admin WHERE username = ?",
            [username]
        );
        const admin = rows[0];

        if (!admin) {
            return res
                .status(400)
                .json({ error: "Invalid username or pasword" });
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(
            password,
            admin.password_hash
        );
        if (!passwordMatch) {
            return res
                .status(400)
                .json({ error: "Invalid username or pasword" });
        }

        // If password matches, create a session
        req.session.adminId = admin.id;
        req.session.isLoggedIn = true;

        res.json({ message: "Login Successful", adminId: admin.id });
    } catch (error) {
        res.status(500).json({ error: "Login failed: " + error.message });
    }
});

// Admin adding a doctor
router.post("/doctors", requireLogin, async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        password,
        confirm_password,
        specialization,
        phone,
        schedule,
    } = req.body;

    // Check if password input matches confirm_password
    if (password !== confirm_password) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        // check if email exist
        const [emailExist] = await db.query(
            "SELECT * FROM Doctors WHERE email = ?",
            [email]
        );

        if (emailExist.length > 0) {
            return res
                .status(400)
                .json({ error: "Doctor with this email already exist" });
        }

        // Hashing password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new doctor into the database
        const query = `INSERT INTO Doctors ( first_name, last_name, email,password_hash, specialization, phone, schedule)  VALUES (?, ?, ?, ?, ?, ?, ?)`;

        await db.query(query, [
            first_name,
            last_name,
            email,
            hashedPassword,
            specialization,
            phone,
            schedule,
        ]);

        res.status(201).json({ message: "Doctor registration successful" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to add new doctor: " + error.message,
        });
    }
});

// Admin to view all Doctors
router.get("/doctors", requireLogin, async (req, res) => {
    try {
        const [doctors] = await db.query("SELECT * FROM Doctors");

        res.json(doctors);
    } catch (error) {
        res.status(500).json({
            error: "Failed to retrieve doctors: " + error.message,
        });
    }
});

// Admin to update doctor by Id

router.put("/doctors/:id", requireLogin, async (req, res) => {
    const { first_name, last_name, specialization, phone, schedule } = req.body;
    // req.params.id should hold the doctor ID from the URL
    console.log("Doctor ID:", req.params.id);
    try {
        const [result] = await db.query(
            "UPDATE Doctors SET first_name = ?, last_name = ?, specialization = ?, phone = ?, schedule = ? WHERE id = ?",
            [
                first_name,
                last_name,
                specialization,
                phone,
                schedule,
                req.params.id,
            ]
        );

        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json({ error: "Doctor not found or no changes made" });
        }

        res.json({ message: "Doctor updated successfully" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to update doctor: " + error.message,
        });
    }
});

router.delete("/doctors/:id", requireLogin, async (req, res) => {
    try {
        await db.query("DELETE FROM Doctors WHERE id = ?", [req.params.id]);
        res.json({ message: "Doctor deleted successfully" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to delete doctor: " + error.message,
        });
    }
});

module.exports = router; */




// Admin registration route
exports.register = async (req, res) => {
    const { username, password, confirm_password } = req.body;

    // Check if password and confirm_password matches
    if (password !== confirm_password) {
        return res.status(400).json({ error: "Password do not match" });
    }

    try {
        const [existAdmin] = await db.query(
            "SELECT * FROM Admin WHERE username = ?",
            [username]
        );
        if (existAdmin.length > 0) {
            return res.status(400).json({ error: "username already exist" });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new admin into the database
        const query = `INSERT INTO Admin (username, password_hash, role) VALUES (?, ?, 'admin')`;

        await db.query(query, [username, hashedPassword]);

        res.status(201).json({ message: "Admin registered succesfuly" });
    } catch (error) {
        res.status(500).json({
            error: "Registration failed: " + error.message,
        });
    }
};

// Admin login route
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // check if admin exist
        const [rows] = await db.query(
            "SELECT * FROM Admin WHERE username = ?",
            [username]
        );
        const admin = rows[0];

        if (!admin) {
            return res
                .status(400)
                .json({ error: "Invalid username or pasword" });
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(
            password,
            admin.password_hash
        );
        if (!passwordMatch) {
            return res
                .status(400)
                .json({ error: "Invalid username or pasword" });
        }

        // If password matches, create a session
        req.session.adminId = admin.id;
        req.session.isLoggedIn = true;

        res.json({ message: "Login Successful", adminId: admin.id });
    } catch (error) {
        res.status(500).json({ error: "Login failed: " + error.message });
    }
};

// Admin adding a doctor
exports.registerDoctor = async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        password,
        confirm_password,
        specialization,
        phone,
        schedule,
    } = req.body;

    // Check if password input matches confirm_password
    if (password !== confirm_password) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        // check if email exist
        const [emailExist] = await db.query(
            "SELECT * FROM Doctors WHERE email = ?",
            [email]
        );

        if (emailExist.length > 0) {
            return res
                .status(400)
                .json({ error: "Doctor with this email already exist" });
        }

        // Hashing password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new doctor into the database
        const query = `INSERT INTO Doctors ( first_name, last_name, email,password_hash, specialization, phone, schedule)  VALUES (?, ?, ?, ?, ?, ?, ?)`;

        await db.query(query, [
            first_name,
            last_name,
            email,
            hashedPassword,
            specialization,
            phone,
            schedule,
        ]);

        res.status(201).json({ message: "Doctor registration successful" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to add new doctor: " + error.message,
        });
    }
};

// Admin to view all Doctors
exports.getAllDoctors = async (req, res) => {
    try {
        const [doctors] = await db.query("SELECT * FROM Doctors");

        res.json(doctors);
    } catch (error) {
        res.status(500).json({
            error: "Failed to retrieve doctors: " + error.message,
        });
    }
};

// Admin to update doctor by Id
exports.updateDoctor = async (req, res) => {
    const { first_name, last_name, specialization, phone, schedule } = req.body;
    // req.params.id should hold the doctor ID from the URL
    console.log("Doctor ID:", req.params.id);
    try {
        const [result] = await db.query(
            "UPDATE Doctors SET first_name = ?, last_name = ?, specialization = ?, phone = ?, schedule = ? WHERE id = ?",
            [
                first_name,
                last_name,
                specialization,
                phone,
                schedule,
                req.params.id,
            ]
        );

        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json({ error: "Doctor not found or no changes made" });
        }

        res.json({ message: "Doctor updated successfully" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to update doctor: " + error.message,
        });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        await db.query("DELETE FROM Doctors WHERE id = ?", [req.params.id]);
        res.json({ message: "Doctor deleted successfully" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to delete doctor: " + error.message,
        });
    }
};

