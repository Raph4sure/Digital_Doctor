const express = require("express");
const db = require("./../database");
const requireLogin = require("./../middleware/auth");

// create a router instance
const router = express.Router();

// Creating an appointment(Patient booking an appointment)
router.post("/", requireLogin, async (req, res) => {
    const { patient_id, doctor_id, appointment_date, appointment_time } =
        req.body;

    try {
        const query = `INSERT INTO Appointments(patient_id, doctor_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, 'scheduled')`;

        await db.query(query, [
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
        ]);

        res.status(201).json({ message: "Appointment booked succesfully" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to book appointment: " + error.message,
        });
    }
});

// Read Appointments (View upcoming appointments for patients)
router.get("/patient/:id", requireLogin, async (req, res) => {
    try {
        const [appointments] = await db.query(
            `SELECT
                Appointments.id,
                Appointments.appointment_date,
                Appointments.appointment_time,
                Appointments.status,
                Doctors.first_name AS doctor_first_name,
                Doctors.last_name AS doctor_last_name,
                Doctors.specialization AS doctor_specialization,
                Doctors.schedule AS doctor_schedule
            FROM Appointments
            JOIN Doctors ON Appointments.doctor_id = Doctors.id
            WHERE Appointments.patient_id = ?
            AND Appointments.appointment_date > NOW()`,
            [req.params.id]
        );
        res.json(appointments);
    } catch (error) {
        res.status(500).json({
            error: "Failed to retrieve upcoming appointments: " + error.message,
        });
    }
});

// Update Appointment (Reschedule an appointment)
router.put("/:id", requireLogin, async (req, res) => {
    const { appointment_date, appointment_time } = req.body;

    try {
        const [result] = await db.query(
            "UPDATE Appointments SET appointment_date = ?, appointment_time = ? WHERE id = ? AND patient_id = ?",
            [
                appointment_date,
                appointment_time,
                req.params.id,
                req.session.patientId,
            ]
        );
        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json({ error: "Appointment not found or no changes made" });
        }

        res.json({ message: "Appointment rescheduled successfully" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to reschedule appointment: " + error.message,
        });
    }
});

// Cancel an Appointment
router.delete("/:id", requireLogin, async (req, res) => {
    try {
        console.log("Patient ID:", req.session.patientId);
        console.log("Appointment ID:", req.params.id);
        const [result] = await db.query(
            "UPDATE Appointments SET status = 'canceled' WHERE id = ? and patient_id = ?",
            [req.params.id, req.session.patientId]
        );

        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json({ error: "Appointment not found or already cancelled" });
        }

        res.json({ message: "Appointment succesfully canceled" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to cancel appointment: " + error.message,
        });
    }
});

module.exports = router;
