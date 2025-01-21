// const { router } = require("../app");
const express = require("express");
const router = express.Router();
const uploadFiles = require("../middleware/upload");
const { requireLogin } = require("../middleware/authMiddleware");
const appointmentController = require("../controllers/appointmentController");

// Route to handle booking appointment
router
    .route("/bookAppointment")
    .all(requireLogin(["Admin", "SuperAdmin", "patient"]))
    .get(appointmentController.getBookAppointment)
    .post(
        uploadFiles("medical_images", 5),
        appointmentController.postBookAppointment
    );

router.get(
    "/showPatientAppointment",
    requireLogin(["Admin", "Super Admin", "patient", "doctor"]),
    appointmentController.showPatientAppointment
);

router.get(
    "/showDoctorAppointment",
    requireLogin(["Admin", "Super Admin", "patient", "doctor"]),
    appointmentController.showDoctorAppointment
);

router.get(
    "/showAllAppointment",
    requireLogin(["Admin", "Super Admin"]),
    appointmentController.showAllAppointment
);

router
    .route("/editAppointment/:id")
    .all(requireLogin(["Admin", "Super Admin", "patient", "doctor"]))
    .get(appointmentController.getEditAppointment)
    .post(
        uploadFiles("medical_images", 5),
        appointmentController.postEditAppointment
    );

router.post("/deleteImage", appointmentController.deleteImage);

// Deleting an appointment
router.delete(
    "/deleteAppointment/:id",
    requireLogin(["Admin", "Super Admin", "patient"]),
    appointmentController.deleteAppointmentById
);

module.exports = router;
