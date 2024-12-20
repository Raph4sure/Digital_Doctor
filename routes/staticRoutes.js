// const { router } = require("../app");
const express = require("express");
const router = express.Router();
const db = require("./../database");

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



module.exports = router;
