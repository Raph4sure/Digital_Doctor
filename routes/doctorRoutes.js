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

// Doctors login
router
    .route("/loginDoctor")
    .get((req, res) => {
        res.render("loginDoctor", {
            pageTitle: "loginDoctor",
            cssPath: "/css/loginDoctor.css",
            message: "Welcome to the Doctors Login page",
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
        });
    })
    .post(uploadFiles("profile_image", 1), doctorController.register);

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

router.post("/deleteDoctorImage", doctorController.deleteDoctorImage);

router.post("/doctorLogout", doctorController.logout);

module.exports = router;
