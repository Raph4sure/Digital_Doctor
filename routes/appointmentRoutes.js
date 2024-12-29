// const { router } = require("../app");
const express = require("express");
const router = express.Router();
const db = require("../database");

const fs = require("fs");
const path = require("path");

const uploadFiles = require("../middleware/upload");

const { requireLogin } = require("../middleware/authMiddleware");

const appointmentController = require("../controllers/appointmentController");

// const authJwt = require("./../middleware/authJwt");

router.get("/consultation", (req, res) => {
    res.render("Consultation", {
        pageTitle: "Consultation",
        cssPath: "/css/Consultation.css",
        message: "Welcome to the consultation page",
    });
});

// router.use(requireLogin);

// Route to handle booking appointment
router
    .route("/bookAppointment")
    .all(requireLogin(["Admin", "SuperAdmin", "patient"]))
    .get(appointmentController.bookAppointment)
    .post(
        uploadFiles("medical_images", 5),
        appointmentController.bookAppointment
    );

router.get(
    "/showAppointment",
    requireLogin(["Admin", "Super Admin", "patient", "doctor"]),
    appointmentController.showAppointment
);

router
    .route("/editAppointment/:id")
    .all(requireLogin(["Admin", "Super Admin", "patient"]))
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
