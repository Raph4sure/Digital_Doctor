const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/authMiddleware");
const uploadFiles = require("../middleware/upload");
const doctorController = require("../controllers/doctorController");

router.get(
    "/showAllDoctors",
    requireLogin(["Admin", "Super Admin", "doctor", "patient"]),
    doctorController.showAllDoctors
);

router.get(
    "/doctorDashboard",
    requireLogin(["doctor", "Admin", "SuperAdmin"]),
    doctorController.doctorDashboard
);

// Doctors login
router
    .route("/loginDoctor")
    .get((req, res) => {
        res.render("loginDoctor", {
            pageTitle: "loginDoctor",
            cssPath: "/css/loginDoctor.css",
            message: "Welcome to the Doctors Login page",
            user: req.session.user,
        });
    })
    .post(doctorController.login);

// Doctors registration
router
    .route("/doctorRegister")
    .all(requireLogin(["Admin", "Super Admin"]))
    .get((req, res) => {
        res.render("doctorRegister", {
            pageTitle: "doctorRegister",
            cssPath: "/css/doctors_registration.css",
            message: "Welcome to the Doctors Reg page",
            user: req.session.user,
        });
    })
    .post(uploadFiles("profile_image", 1), doctorController.register);

// Edit Doctor
router
    .route("/editDoctor/:id")
    .all(requireLogin(["Admin", "Super Admin"]))
    .get(doctorController.getEditDoctor)
    .post(uploadFiles("medical_images", 1), doctorController.postEditDoctor);

router.delete(
    "/deleteDoctor/:id",
    requireLogin(["Admin", "SuperAdmin"]),
    doctorController.deleteDoctor
);

router.post(
    "/deleteDoctorImage",
    requireLogin(["Admin", "SuperAdmin"]),
    doctorController.deleteDoctorImage
);

router.post("/doctorLogout", doctorController.logout);

module.exports = router;
