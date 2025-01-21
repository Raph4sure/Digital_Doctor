const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/authMiddleware");
const patientController = require("../controllers/patientController");

// Patient routes
router.get(
    "/patientDashboard",
    requireLogin(["patient", "Admin", "SuperAdmin"]),
    patientController.patientDashboard
);

// Patient Registration routes
router
    .route("/registerPatient")
    .all(requireLogin(["Admin", "SuperAdmin", "patient"]))
    .get((req, res) => {
        res.render("registerPatient", {
            pageTitle: "registerPatient",
            cssPath: "/css/registerPatient.css",
            message: "Welcome to the Patient Reg page",
            user: req.session.user,
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
            user: req.session.user,
        });
    })
    .post(patientController.loginPatient);

// Show All Patient
router.get(
    "/showAllPatient",
    requireLogin(["Admin", "Super Admin"]),
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
    .patch(patientController.updatePatient);

module.exports = router;
