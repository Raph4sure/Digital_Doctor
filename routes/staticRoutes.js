// const { router } = require("../app");
const express = require("express");
const router = express.Router();
const db = require("./../database");

const fs = require("fs");
const path = require("path");

const uploadFiles = require("../middleware/upload");

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
    if (!req.session.isLoggedIn || !req.session.patientId) {
        return res.redirect("/login"); // Redirect to login page if not logged in
    }

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

        if (appointments.length === 0) {
            return res.status(404).json({ message: "No appointments found" });
        }

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

        console.log(appointments.medical_images);

        res.render("editAppointment", { appointment: appointments[0] });
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

        res.redirect("/showAppointment");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting appointment");
    }
});



module.exports = router;
