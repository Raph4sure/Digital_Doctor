const express = require("express");
// create a router instance
const router = express.Router();

const appointmentController = require("./../controllers/appointmentController");
const { requireLogin } = require("./../middleware/authMiddleware");

const uploadFiles = require("../middleware/upload");


// const authJwt = require("./../middleware/authJwt");




router.use(requireLogin);

router.post("/book", uploadFiles("medical_images", 5), appointmentController.bookAppointment);
router.get("/showAppointment/patient/:id", appointmentController.showAppointment);
router.put("/updateAppointment/patient/:id", uploadFiles("medical_images", 5), appointmentController.updateAppointment);
router.delete("/deleteAppointment/patient/:id", appointmentController.deleteAppointment);

// Route to render the book appointment form with patient data
router.get("/book", appointmentController.getPatientData);

module.exports = router;
