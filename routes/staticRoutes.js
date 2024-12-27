// const { router } = require("../app");
const express = require("express");
const router = express.Router();
const db = require("./../database");

const fs = require("fs");
const path = require("path");

const uploadFiles = require("../middleware/upload");

const { requireLogin } = require("./../middleware/authMiddleware");

// Home page
router.get("/", (req, res) => {
    res.render("homepage", {
        pageTitle: "Homepage",
        cssPath: "/css/homepage.css",
        message: "Welcome to the homepage",
    });
});

// Home page
router.get("/homepage.html", (req, res) => {
    res.redirect("/homepage");
});

// About page
router.get("/homepage", (req, res) => {
    res.render("homepage", {
        pageTitle: "Homepage",
        cssPath: "/css/homepage.css",
        message: "Welcome to the homepage",
    });
});

router.get("/About.html", (req, res) => {
    res.redirect("/about");
});

// About page
router.get("/about", (req, res) => {
    res.render("About", {
        pageTitle: "About",
        cssPath: "/css/About.css",
        message: "Welcome to the About Us page",
    });
});

// Contact page
router.get("/Contact.html", (req, res) => {
    res.redirect("/contact");
});

router.get("/contact", (req, res) => {
    res.render("Contact", {
        pageTitle: "Contact",
        cssPath: "/css/contact.css",
        message: "Welcome to the Contact Us page",
    });
});
// Dashboard page
router.get("/Dashboard.html", (req, res) => {
    res.redirect("/dashboard");
});

router.get("/dashboard", (req, res) => {
    res.render("Dashboard", {
        pageTitle: "Dashboard",
        cssPath: "/css/dashboard.css",
        message: "Welcome to the Dashboard page",
    });
});

// Admin Dashboard page
/* router.get("/adminDashboard.html", (req, res) => {
    res.redirect("admindashboard");
});

router.get("/adminDashboard", (req, res) => {
    res.render("adminDashboard", {
        pageTitle: "Dashboard",
        cssPath: "/css/adminDashboard.css",
        message: "Welcome to the Admin Dashboard page",
    });
}); */

// Consultation page
router.get("/Consultation.html", (req, res) => {
    res.redirect("/consultation");
});

router.get("/consultation", (req, res) => {
    res.render("Consultation", {
        pageTitle: "Consultation",
        cssPath: "/css/Consultation.css",
        message: "Welcome to the consultation page",
    });
});
// Contact page
router.get("/Contact.html", (req, res) => {
    res.redirect("/contact");
});

router.get("/contact", (req, res) => {
    res.render("Contact", {
        pageTitle: "Contact",
        cssPath: "/css/Contact.css",
        message: "Welcome to the Contact Us page",
    });
});

// Doctors registration
router.get("/doctors_registration.html", (req, res) => {
    res.redirect("/doctors_registration");
});

router.get("/doctors_registration", (req, res) => {
    res.render("doctors_registration", {
        pageTitle: "doctors_registration",
        cssPath: "/css/doctors_registration.css",
        message: "Welcome to the Doctors Reg page",
    });
});
// Patient registration
router.get("/registration.html", (req, res) => {
    res.redirect("/registration");
});

router.get("/registration", (req, res) => {
    res.render("registration", {
        pageTitle: "registration",
        cssPath: "/css/registration.css",
        message: "Welcome to the Patient Reg page",
    });
});

// Patient login
router.get("/login.html", (req, res) => {
    res.redirect("/login");
});

router.get("/login", (req, res) => {
    res.render("login", {
        pageTitle: "login",
        cssPath: "/css/login.css",
        message: "Welcome to the Patient login page",
    });
});

// Patient login
router.get("/adminLogin.html", (req, res) => {
    res.redirect("/adminLogin");
});

router.get("/adminLogin", (req, res) => {
    res.render("adminLogin", {
        pageTitle: "adminLogin",
        cssPath: "/css/adminLogin.css",
        message: "Welcome to the Admin login page",
    });
});

// // Booking Appointment page
router.get("/bookAppointment.html", (req, res) => {
    res.redirect("/bookAppointment");
});

// router.get("/bookAppointment", (req, res) => {
//     res.render("bookAppointment", {
//         pageTitle: "bookAppointment",
//         cssPath: "/css/bookAppointment.css",
//         message: "Welcome to the Patient login page",
//     });
// });

router.get("/bookAppointment", async (req, res) => {
    // Check if the patient is logged in
    // if (!req.session.isLoggedIn || !req.session.patientId) {
    //     return res.redirect("/login"); // Redirect to login page if not logged in
    // }

    try {
        // Fetch patient details from the database
        const [rows] = await db.query(
            "SELECT first_name, last_name, phone, email, gender, date_of_birth FROM Patients WHERE id = ?",
            [req.session.patientId]
        );

        if (rows.length === 0) {
            return res.status(404).send("Patient not found");
        }

        const patientData = rows[0]; // Get the patient details

        // console.log("Gender from Patient Data:", patientData.date_of_birth);

        // Fetch the list of doctors from the Doctors table
        const [doctorRows] = await db.query(
            "SELECT id, first_name, last_name, specialization FROM Doctors"
        );

        if (doctorRows.length === 0) {
            return res.status(404).send("No doctors available");
        }

        // Render the page and pass patientData
        res.render("bookAppointment", {
            pageTitle: "Book Appointment",
            cssPath: "/css/bookAppointment.css",
            message: "Welcome to the Patient login page",
            patientData, // Pass patientData to the view
            patientId: patientData.id, // Pass patientId to the view
            doctors: doctorRows, // Pass the list of doctors to the view
        });
    } catch (error) {
        console.error("Error fetching patient data:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/showAppointment.html", (req, res) => {
    res.redirect("/showAppointment");
});

router.get("/showAppointment", async (req, res) => {
    try {
        const patientId = req.session.patientId;

        const query = `SELECT * FROM Appointments WHERE patient_id = ?
            ORDER BY appointment_date DESC, appointment_time DESC`;

        const [appointments] = await db.query(query, [patientId]);

        // if (appointments.length === 0) {
        //     return res.status(404).json({ message: "No appointments found" });
        // }

        // Parse the medical_images field if it's a stringified JSON array
        appointments.forEach((appointment) => {
            if (
                appointment.medical_images &&
                typeof appointment.medical_images === "string"
            ) {
                try {
                    appointment.medical_images = JSON.parse(
                        appointment.medical_images
                    ); // Parse the string to array
                } catch (err) {
                    console.error("Error parsing medical_images:", err);
                    appointment.medical_images = []; // Fallback to empty array if parsing fails
                }
            }
        });

        console.log(appointments.medical_images);

        res.render("showAppointment", { appointments });

        //    res.status(200).json({ appointments: appointments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching appointments" });
    }
});

// Editing appointment
router.get("/editAppointment/:id", async (req, res) => {
    // console.log(req.body);
    // console.log(req.params);
    // console.log(req.files);

    try {
        const appointmentId = req.params.id;

        const query = "SELECT * FROM Appointments WHERE id = ?";

        const [appointments] = await db.query(query, [appointmentId]);

        if (appointments.length === 0) {
            return res.status(404).send({ message: "Appointment not found" });
        }

        appointments.forEach((appointment) => {
            if (
                appointment.medical_images &&
                typeof appointment.medical_images === "string"
            ) {
                try {
                    appointment.medical_images = JSON.parse(
                        appointment.medical_images
                    ); // Parse the string to array
                } catch (err) {
                    console.error("Error parsing medical_images:", err);
                    appointment.medical_images = []; // Fallback to empty array if parsing fails
                }
            }
        });

        // console.log(appointments.medical_images);

        res.render("editAppointment", {
            appointment: appointments[0],
            pageTitle: "editAppointment",
            cssPath: "/css/editAppointment.css",
            message: "Welcome to the Edit page",
        });
    } catch (error) {
        console.error(error);
        // res.status(500).send({ message: "Error fetching appointment" });
        res.status(500).json({
            message: "Error fetching appointment " + error.message,
        });
    }
});

router.post(
    "/editAppointment/:id",
    uploadFiles("medical_images", 5),
    async (req, res) => {
        // console.log(req.body);
        // console.log(req.params);
        // console.log(req.files);
        // console.log(appointment.medical_images);
        try {
            const appointmentId = req.params.id;

            const {
                preferred_doctor,
                appointment_date,
                appointment_time,
                appointment_reasons,
                status,
                medical_images,
            } = req.body;

            let medicalImages = [];
            if (req.files && req.files.length > 0) {
                medicalImages = req.files.map((file) => file.path); // Get paths of uploaded files
            }

            if (medicalImages.length === 0) {
                const [appointments] = await db.query(
                    "SELECT medical_images FROM Appointments WHERE id = ?",
                    [appointmentId]
                );
                if (appointments.length > 0 && appointments[0].medical_images) {
                    medicalImages = JSON.parse(appointments[0].medical_images); // Parse existing images
                }
            }

            // Convert medicalImages array to a JSON string for storage
            const medicalImagesString = JSON.stringify(medicalImages);

            const query = `UPDATE Appointments SET preferred_doctor =?, appointment_date = ?, appointment_time = ?, appointment_reasons = ?, status = ?, medical_images = ? WHERE id = ?`;

            await db.query(query, [
                preferred_doctor,
                appointment_date,
                appointment_time,
                appointment_reasons,
                status,
                medicalImagesString,
                appointmentId,
            ]);

            res.redirect("/showAppointment");

            // res.status(200).send("Appointment Upadated Successfuly");
        } catch (error) {
            // res.status(500).send("Error Updating Appointment");
            res.status(500).json("Error Updating Appointment" + error.message);
        }
    }
);

// Route for deleting an Image

router.post("/deleteImage", async (req, res) => {
    try {
        const { imagePath } = req.body;

        // Delete the file from the filesystem
        const absolutePath = path.join(__dirname, "../", imagePath); // Adjust path as needed
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath); // Delete the file
        }

        // Remove the image from the database
        const query = `
            UPDATE Appointments 
            SET medical_images = JSON_REMOVE(medical_images, JSON_UNQUOTE(JSON_SEARCH(medical_images, 'one', ?)))
            WHERE JSON_CONTAINS(medical_images, JSON_QUOTE(?))
        `;

        await db.query(query, [imagePath, imagePath]);

        res.json({ success: true, message: "Image deleted successfully" });
    } catch (error) {
        console.error("Error deleting image:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Deleting an appointment

router.delete("/deleteAppointment/:id", async (req, res) => {
    console.log(req.method);
    try {
        const appointmentId = req.params.id;
        const query = "DELETE FROM Appointments WHERE id = ?";
        await db.query(query, [appointmentId]);

        // res.redirect("/showAppointment");
        res.status(200).json({ message: "Appointment deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting appointment");
    }
});

// Patient Logout route
router.post("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to logout" });
            } else {
                return res.redirect("/homepage");

                // res.json({ message: "Logout successful" });
            }
        });
    } else {
        res.status(400).json({ error: "No active session to logout" });
    }
});

// Router to show all doctors
router.get("/showAllDoctors", async (req, res) => {
    try {
        const query = `SELECT * FROM Doctors ORDER BY first_name, last_name ASC`;

        const [doctors] = await db.query(query);

        if (doctors.length === 0) {
            return res.status(404).json({ message: "No doctors found" });
        }

        // Handling showing of images
        /*   doctors.forEach((doctor) => {
            if (doctor.profile_image === "string") {
                try {
                    doctor.profile_image = JSON.parse(doctor.profile_image);
                } catch (error) {
                    console.error("Error parsing profile image:", error);
                    doctor.profile_image = [];
                }
            }
        }); */

        // res.render("showAllDoctors", { doctors });
        res.render("showAllDoctors", {
            doctors,
            pageTitle: "showAllDoctors",
            cssPath: "/css/showAllDoctor.css",
            message: "showAllDoctors page",
        });
    } catch (error) {
        console.error("Error fetching Data:", error);
        res.status(500).json({
            message: "Fetching Data failed: " + error.message,
        });
    }
});

// Admin Dashboard
/* router.get(
    "/adminDashboard/:id",
    requireLogin(["Admin", "Super Admin"]),
    async (req, res) => {
        // const adminId = req.session.user.id;
        const adminId = req.session.user ? req.session.user.id : null;

        console.log("Fetching admin with ID:", adminId); //

        try {
            const query = "SELECT * FROM Admins WHERE id = ?";

            const [admins] = await db.query(query, [adminId]);

            console.log("Query Result:", admins); // Log the result of the query

            if (admins.length === 0) {
                return res.status(404).send({ message: "No Admin found" });
            }

            res.render("adminDashboard", {
                admin: admins[0],
                pageTitle: "Manage Admin",
                cssPath: "/css/adminDashboard.css",
            });
            console.log(admins[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error fetching Admin " + error.message,
            });
        }
    }
); */

/* router.get(
    "/adminDashboard/:id",
    requireLogin(["Admin", "Super Admin"]),
    async (req, res) => {
        // const adminId = req.session.user.id;
        const adminId = req.params.id;
        // const adminId = req.session.user ? req.session.user.id : null;

        console.log("Fetching admin with ID:", adminId); //

        try {
            const query = `SELECT * FROM Admins WHERE id = ?`;

            const [admins] = await db.query(query, [adminId]);

            console.log("Query Result:", admins); // Log the result of the query

            if (admins.length === 0) {
                return res.status(404).send({ message: "No Admin found" });
            }

            res.render("adminDashboard", {
                admin: admins[0],
                pageTitle: "Manage Admin",
                cssPath: "/css/adminDashboard.css",
            });
            console.log(admins[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error fetching Admin " + error.message,
            });
        }
    }
); */

router.get("/adminDashboard.html", (req, res) => {
    res.redirect("/adminDashboard");
});

/* router.get(
    "/adminDashboard",
    // requireLogin(["Admin", "Super Admin"]),
    async (req, res) => {
        try {
            console.log("Session user:", req.session.user);
            console.log("Session ID:", req.session.user.id);

            const query = "SELECT * FROM Admins WHERE id = 4";
            const [admins] = await db.query(query);
            console.log("Query result:", admins);

            if (!admins.length) {
                return res.status(404).send("Admin not found");
            }

            return res.render("adminDashboard", {
                admin: admins[0],
                pageTitle: "Manage Admin",
                cssPath: "/css/adminDashboard.css",
            });
        } catch (error) {
            console.error("Error in adminDashboard route:", error);
            return res.status(500).send("Error fetching admin data");
        }
    }
); */

router.get(
    "/adminDashboard",
    requireLogin(["Admin", "Super Admin"]),
    async (req, res) => {
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
            });
        } catch (error) {
            console.error("Error fetching admin data:", error.message);
            res.status(500).send("Internal Server Error");
        }
    }
);

// Managing Admin
router.get("/manageAdmin", async (req, res) => {
    try {
        const query = "SELECT * FROM Admins";
        const [admins] = await db.query(query);
        if (admins.length === 0) {
            return res.status(404).send({ message: "No Admin found" });
        }
        res.render("manageAdmin", {
            admin: admins[0],
            pageTitle: "Manage Admin",
            cssPath: "/css/manageAdmin.css",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching Admin " + error.message,
        });
    }
});

// Deleting Admin
router.delete("/deleteAdmin", async (req, res) => {
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
});

// To show all Patient
/* router.get("/showAllPatient", async (req, res) => {
    try {
        const [patients] = await db.query("SELECT * FROM Patients");

        if (patients.length === 0) {
            return res.status(404).json({ error: "No Patients Registered" });
        }

        // res.json(patients[0]);
        res.render("showAllPatient", { patients });
    } catch (error) {
        res.status(500).json({
            error: "Failed to retrieve patients: " + error.message,
        });
    }
}); */

// Patient Dashboard
router.get("/patientDashboard", requireLogin(["patient"]), async (req, res) => {
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
        });
    } catch (error) {
        console.error("Error fetching patient data:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Show All Patient
router.get("/showAllPatient", async (req, res) => {
    try {
        // Get the page and limit from query parameters, set defaults if not provided
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
        const offset = (page - 1) * limit;

        // Query the total number of patients for pagination metadata
        const [countResult] = await db.query(
            "SELECT COUNT(*) as total FROM Patients"
        );
        const totalPatients = countResult[0].total;

        // Query the paginated data
        const [patients] = await db.query(
            "SELECT * FROM Patients LIMIT ? OFFSET ?",
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
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to retrieve patients: " + error.message,
        });
    }
});

// delete patient by id
router.delete("/deletePatient/:id", async (req, res) => {
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

        res.json({ message: "Patient deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "An error occured while deleting Patient " + error.message,
        });
    }
});

// Editing Patient Profile
/* router.get("/editPatient/:id", async (req, res) => {
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
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching patient " + error.message,
        });
    }
});

// posting edited patient profile
router.post("/editPatient/:id", async (req, res) => {
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
        ]);

        res.redirect("/Dashboard");
    } catch (error) {
        res.status(500).json("Error Updating Patient" + error.message);
    }
}); */

// Delete Doctor by id

router.delete("/deleteDoctor/:id", async (req, res) => {
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

        res.json({ message: "Doctor deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "An error occured while deleting Doctor " + error.message,
        });
    }
});

// Editing Doctor Profile
router.get("/editDoctor/:id", async (req, res) => {
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
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching Doctor " + error.message,
        });
    }
});

// posting edited Doctor profile
router.post("/editDoctor/:id", async (req, res) => {
    try {
        const doctorId = req.params.id;

        const { first_name, last_name, phone, date_of_birth, gender, address } =
            req.body;

        const query = `UPDATE Doctors SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, gender = ?, address = ? WHERE id = ?`;

        await db.query(query, [
            first_name,
            last_name,
            phone,
            date_of_birth,
            gender,
            address,
        ]);

        res.redirect("/Dashboard");
    } catch (error) {
        res.status(500).json("Error Updating Doctor" + error.message);
    }
});


router.get("/editPatient/:id", async (req, res) => {
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
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching patient " + error.message,
        });
    }
});

// posting edited patient profile
router.post("/editPatient/:id", async (req, res) => {
    try {
        const patientId = req.params.id;
        // console.log(req.body);

        const { first_name, last_name, phone, date_of_birth, gender, address } =
            req.body;

        // console.log(req.body);

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
        // alert("Upadate Successful")
        // console.log("Successful");
        // console.log(req.body);
        res.status(200).json({ message: "Update Successful" });

        // res.redirect("/patientDashboard");
    } catch (error) {
        res.status(500).json("Error Updating Patient " + error.message);
    }
});

module.exports = router;
