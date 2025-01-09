// requiring bcrypt
const bcrypt = require("bcrypt");
const db = require("./../database");

// Route to register patient
exports.registerPatient = async (req, res) => {
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
};

// Route for patient login
exports.loginPatient = async (req, res) => {
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
        req.session.user = {
            id: patient.id,
            role: ["patient"],
        };
       

        res.json({ message: "Login Successful", patientId: patient.id });
    } catch (error) {
        res.status(500).json({ error: "Login failed: " + error.message });
    }
};


// Patient Dashboard
exports.patientDashboard = async (req, res) => {
    try {
        const patientId = req.session.patientId; // Assuming session contains patientId
        if (!patientId) {
            return res.status(401).send("Unauthorized");
        }

        // Query to fetch admin details
        const query = `SELECT * FROM Patients WHERE id = ?`;
        const [patients] = await db.query(query, [patientId]);

        if (patients.length === 0) {
            return res.status(404).send("Patient not found");
        }

        // Pass admin data to the view
        res.render("patientDashboard", {
            patient: patients[0], // Pass the first result
            pageTitle: "Patient Dashboard",
            cssPath: "/css/patientDashboard.css",
            user: req.session.user,
        });
    } catch (error) {
        console.error("Error fetching patient data:", error.message);
        res.status(500).send("Internal Server Error");
    }
};

// Show All Patient
exports.showAllPatient = async (req, res) => {
    try {
        // Getting the page and limit from query parameters, setting defaults if not provided
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 5; // Default to 5 items per page
        const offset = (page - 1) * limit;

        // Query the total number of patients for pagination metadata
        const [countResult] = await db.query(
            "SELECT COUNT(*) as total FROM Patients"
        );
        const totalPatients = countResult[0].total;

        // Query the paginated data
        const [patients] = await db.query(
            "SELECT * FROM Patients ORDER BY first_name LIMIT ? OFFSET ?",
            [limit, offset]
        );

        // Calculate total pages
        const totalPages = Math.ceil(totalPatients / limit);

        // Check if patients are found
        if (patients.length === 0) {
            return res.status(404).json({ error: "No Patients Registered" });
        }

        // Send paginated results
        res.render("showAllPatient", {
            patients,
            currentPage: page,
            totalPages,
            totalPatients,
            limit,
            userRole: req.session.user.role,
            cssPath: "/css/showAllPatient.css",
            pageTitle: "Show All Patient",
            user: req.session.user,
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to retrieve patients: " + error.message,
        });
    }
};

// delete patient by id
exports.deletePatientById = async (req, res) => {
    const patientIdToDelete = req.params.id;

    try {
        const [result] = await db.query("DELETE FROM Patients WHERE id = ?", [
            patientIdToDelete,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Patient not found",
            });
        }

        // res.json({ message: "Patient deleted successfully" });
        res.redirect("/showAllPatient");
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "An error occured while deleting Patient " + error.message,
        });
    }
};

// router to get(edit) patient information
exports.getEditPatient = async (req, res) => {
    try {
        const patientId = req.params.id;

        const query = "SELECT *  FROM Patients WHERE id = ?";

        const [patients] = await db.query(query, [patientId]);

        if (patients.length === 0) {
            return res.status(404).send({ message: "Patient not found" });
        }

        res.render("editPatient", {
            patient: patients[0],
            pageTitle: "editPatient",
            cssPath: "/css/editPatient.css",
            message: "Welcome to the edit page",
            user: req.session.user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching patient " + error.message,
        });
    }
};

// posting edited patient profile
exports.getPostPatient = async (req, res) => {
    try {
        const patientId = req.params.id;

        const { first_name, last_name, phone, date_of_birth, gender, address } =
            req.body;


        const query = `UPDATE Patients SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, gender = ?, address = ? WHERE id = ?`;

        await db.query(query, [
            first_name,
            last_name,
            phone,
            date_of_birth,
            gender,
            address,
            patientId,
        ]);
     
        res.status(200).json({ message: "Update Successful" });

    } catch (error) {
        res.status(500).json("Error Updating Patient " + error.message);
    }
};
