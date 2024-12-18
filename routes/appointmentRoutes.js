const express = require("express");
// create a router instance
const router = express.Router();

const appointmentController = require("./../controllers/appointmentController");
const { requireLogin } = require("./../middleware/authMiddleware");




router.post("/book", requireLogin, appointmentController.bookAppointment);
router.get("/showAppointment/patient/:id", requireLogin, appointmentController.showAppointment);
router.put("/updateAppointment/patient/:id", requireLogin, appointmentController.updateAppointment);
router.delete("/deleteAppointment/patient/:id", requireLogin, appointmentController.deleteAppointment);

module.exports = router;
