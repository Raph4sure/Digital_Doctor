const express = require("express");
// create a router instance
const router = express.Router();

const appointmentController = require("./../controllers/appointmentController");
const { requireLogin } = require("./../middleware/authMiddleware");

const uploadFiles = require("../middleware/upload");


// const authJwt = require("./../middleware/authJwt");




router.use(requireLogin);

// Route to handle booking appointment
router.post("/bookAppointment", uploadFiles("medical_images", 5), appointmentController.bookAppointment);

// router.post("/editAppointment/:id", uploadFiles("medical_images", 5), appointmentController.editAppointment);

// router.get("/bookAppointment", appointmentController.bookAppointment);
// router.post("/bookAppointment", uploadFiles("medical_images", 5), appointmentController.bookAppointment);
// router.get("/showAppointment", appointmentController.showAppointment);


// router.put("/updateAppointment/patient/:id", uploadFiles("medical_images", 5), appointmentController.updateAppointment);

router.delete("/deleteAppointment/:id", appointmentController.deleteAppointment);

// Route to render the book appointment form with patient data
router.get("/book", appointmentController.getPatientData);

module.exports = router;
