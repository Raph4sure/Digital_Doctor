const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/authMiddleware");
const patientController = require("../controllers/patientController");

// Patient routes
router.get(
    "/patientDashboard",
    requireLogin(["patient", "Admin", "SuperAdmin"]),
    (req, res) => {
        res.render("patientDashboard", {
            pageTitle: "patientDashboard",
            cssPath: "/css/patientDashboard.css",
            message: "Welcome to the Dashboard page",
        });
    }
);

// Patient Registration routes
router
    .route("/registerPatient")
    .all(requireLogin(["Admin", "SuperAdmin"]))
    .get((req, res) => {
        res.render("registerPatient", {
            pageTitle: "registerPatient",
            cssPath: "/css/registerPatient.css",
            message: "Welcome to the Patient Reg page",
        });
    })
    .post(patientController.registerPatient);

// Patient Login route
router
    .route("/loginPatient")
    .get((req, res) => {
        res.render("loginPatient", {
            pageTitle: "loginPatient",
            cssPath: "/css/loginPatient.css",
            message: "Welcome to the Patient login page",
        });
    })
    .post(patientController.loginPatient);

// Show All Patient
router.get(
    "/showAllPatient",
    requireLogin(["Admin", "SuperAdmin"]),
    patientController.showAllPatient
);

// Delete patient by id
router.delete(
    "/deletePatient/:id",
    requireLogin(["Admin", "SuperAdmin"]),
    patientController.deletePatientById
);

// Router to get(edit) patient information
router
    .route("/editPatient/:id")
    .all(requireLogin(["Admin", "SuperAdmin", "patient"]))
    .get(patientController.getEditPatient)
    .post(patientController.getPostPatient);

// Logout route
router.post("/logout", patientController.logout);

module.exports = router;
