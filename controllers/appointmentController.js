// requiring bcrypt
const bcrypt = require("bcrypt");
// requiring database
const db = require("./../database");

const multer = require("multer");

const upload = require("../middleware/upload");

const { sendEmail } = require("./../middleware/email");

const express = require("express");
const router = express.Router();
// const db = require("./../database");

exports.bookAppointment = async (req, res) => {
    // console.log(req.body, req.files); // Log the request body and files for debugging
    try {
        // Extract fields from the request body
        const {
            patient_id: providedPatientId,
            doctor_id,
            appointment_date,
            appointment_time,
            status,
            first_name,
            last_name,
            email,
            phone,
            gender,
            appointment_reasons,
            existing_medical_record,
        } = req.body;

        // Handle uploaded medical images
        const medicalImages = req.files
            ? req.files.map((file) => file.path)
            : [];

        // Get patient ID from form or session
        const patient_id = providedPatientId || req.session.patientId;
        if (!patient_id) {
            return res.status(400).json({ error: "Patient ID is required." });
        }

        // Validate doctor ID
        const doctorQuery = "SELECT * FROM Doctors WHERE id = ?";
        const [doctorDetails] = await db.query(doctorQuery, [doctor_id]);
        if (doctorDetails.length === 0) {
            return res.status(404).json({ error: "Doctor not found." });
        }
        const doctor = doctorDetails[0];

        const preffered_doctor = `Dr. ${doctor.first_name} ${doctor.last_name} - ${doctor.specialization}`;

        // Insert the appointment into the database
        const insertQuery = `
            INSERT INTO Appointments(
                patient_id, doctor_id, appointment_date, appointment_time, status,
                first_name, last_name, email, phone, gender, appointment_reasons,
                preferred_doctor, existing_medical_record, medical_images
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(insertQuery, [
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            status || "scheduled",
            first_name,
            last_name,
            email,
            phone,
            gender,
            appointment_reasons,
            preffered_doctor,
            existing_medical_record,
            JSON.stringify(medicalImages),
        ]);

        // Respond successfully
        res.status(201).json({ message: "Appointment created successfully." });

        // Send emails asynchronously
        sendEmail(
            email,
            "Appointment Confirmation",
            "appointmentConfirmation.ejs",
            {
                name: `${first_name} ${last_name}`,
                doctorName: `Dr. ${doctor.first_name} ${doctor.last_name}`,
                date: appointment_date,
                time: appointment_time,
            }
        ).catch((err) =>
            console.error("Error sending patient email:", err.message)
        );

        sendEmail(
            doctor.email,
            "New Appointment Booking",
            "appointmentConfirmation.ejs",
            {
                name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
                doctorName: `${first_name} ${last_name}`,
                date: appointment_date,
                time: appointment_time,
            }
        ).catch((err) =>
            console.error("Error sending doctor email:", err.message)
        );
    } catch (error) {
        console.error("Error booking appointment:", error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to create appointment." });
        }
    }
};

// router.get("/showAppointment.html", (req, res) => {
//     res.redirect("/showAppointment");
// });

// exports.showAppointment = async (req, res) => {
//     try {
//         const patientId = req.session.patientId;

//         const query = `SELECT * FROM Appointments WHERE patient_id = ?
//             ORDER BY appointment_date DESC, appointment_time DESC`;

//         const [appointments] = await db.query(query, [patientId]);

//         if (appointments.length === 0) {
//             return res.status(404).json({ message: "No appointments found" });
//         }

//         // res.render("showAppointments ", { appointments });

//            res.status(200).json({ appointments: appointments });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Error fetching appointments" });
//     }
// };

// Update Appointment (Reschedule an appointment)
/* exports.updateAppointment = async (req, res) => {
    try {
        const {
            doctor_id,
            appointment_date,
            appointment_time,
            status,
            appointment_reasons,
            preferred_doctor,
        } = req.body;

        // Check if appointment exists and belongs to user
        const checkQuery =
            "SELECT * FROM appointments WHERE id = ? AND patient_id = ?";
        const [appointment] = await db.query(checkQuery, [
            req.params.id,
            req.user.id,
        ]);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        const updateQuery = `
        UPDATE appointments 
        SET doctor_id = ?, appointment_date = ?, appointment_time = ?,
            status = ?, appointment_reasons = ?, preferred_doctor = ?
        WHERE id = ? AND patient_id = ?
      `;

        const values = [
            doctor_id,
            appointment_date,
            appointment_time,
            status,
            appointment_reasons,
            preferred_doctor,
            req.params.id,
            req.user.id,
        ];

        await db.query(updateQuery, values);

        res.json({ message: "Appointment updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating appointment" });
    }
}; */

// editing and posting appointment

/* exports.editAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;

        const {
            preffered_doctor,
            appointment_date,
            appointment_time,
            appointment_reasons,
            status,
        } = req.body;

        const query = `UPDATE Appointments SET preffered doctor =?, appointment_date = ?, appointment_time = ?, appointment_reasons = ?, status = ? WHERE id = ?`;

        await db.query(query, [
            preffered_doctor,
            appointment_date,
            appointment_time,
            appointment_reasons,
            status,
            appointmentId,
        ]);

        res.status(200).send("Appointment Upadated Successfuly");
    } catch (error) {
        res.status(500).send("Error Updating Appointment");
    }
}; */


// Route to show the edit form for a specific appointment
/* router.get("/editAppointment/:id", async (req, res) => {
    try {
        // Extract the appointment ID from the route parameter
        const appointmentId = req.params.id;

        // Query to fetch the appointment details from the database
        const query = "SELECT * FROM Appointments WHERE id = ?";

        // Execute the query with the appointment ID as the parameter
        const [appointments] = await db.query(query, [appointmentId]);

        // Check if the appointment exists
        if (appointments.length === 0) {
            // If no appointment is found, send a 404 response
            return res.status(404).send("Appointment not found");
        }

        // Render the "editAppointment" view and pass the appointment data to it
        res.render("editAppointment", { appointment: appointments[0] });
    } catch (error) {
        // Log any errors that occur during the process
        console.error(error);
        // Send a 500 response if an error occurs
        res.status(500).send("Error fetching appointment");
    }
}); */



// Cancel an Appointment
exports.deleteAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const query = "DELETE FROM Appointments WHERE id = ?";
        await db.query(query, [appointmentId]);

        res.redirect("/showAppointment");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting appointment");
    }
};



/* // Get patient data
exports.getPatientData = (req, res) => {
    const patient_id = req.session.patient_id; // Assuming patient_id is stored in the session after login

    const query = `
    SELECT first_name, last_name, email, phone, gender, date_of_birth
    FROM patients
    WHERE id = ?
  `;

    db.query(query, [patient_id], (err, results) => {
        if (err) {
            return res
                .status(500)
                .json({ message: "Error fetching patient data" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Patient not found" });
        }

        const patient = results[0]; // Assuming there's only one patient with this ID
        res.render("book-appointment", {
            first_name: patient.first_name,
            last_name: patient.last_name,
            email: patient.email,
            phone: patient.phone,
            gender: patient.gender,
            date_of_birth: patient.date_of_birth,
        });
    });
};
 */