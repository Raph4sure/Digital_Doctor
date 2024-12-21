// requiring bcrypt
const bcrypt = require("bcrypt");
// requiring database
const db = require("./../database");

const multer = require("multer");

const upload = require("../middleware/upload");

const { sendEmail } = require("./../middleware/email");

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
            `Dr. ${doctor.first_name} ${doctor.last_name} - ${doctor.specialization}`,
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







/* exports.bookAppointment = async (req, res) => {
    // console.log(req.body, req.files); // Log the request body and files for debugging
    // console.log("Session Data: ", req.session); // Log session data to verify if patientId is present

    // Destructure the necessary fields from the form submission
    let {
        patient_id, // patient_id from the form submission (it could be missing)
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
        preferred_doctor,
        existing_medical_record,
    } = req.body;

    // console.log("Received doctor_id:", doctor_id); // Log the received doctor_id

    // Handle the uploaded medical images, if any
    const medicalImages = req.files ? req.files.map((file) => file.path) : [];

    // Ensure that medical images are uploaded
    // if (medicalImages.length === 0) {
    //     return res.status(400).json({ error: "No medical images uploaded" });
    // }

    // Check if patient_id exists; if not, retrieve it from the session (logged-in user's data)
    if (!patient_id) {
        patient_id = req.session.patientId; // Assuming the patient ID is stored in session during login
    }

    // Log the patient_id to see if it was correctly assigned
    // console.log("Final Patient ID: ", patient_id);

    try {
        // Fetch doctors from the database
        const doctorsQuery =
            "SELECT id, first_name, last_name, specialization FROM Doctors";

        const [doctors] = await db.query(doctorsQuery);

        // console.log("Doctors retrieved from the database:", doctors); // Log doctors retrieved

        // Find the doctor by doctor_id
        const selectedDoctor = doctors.find(
            (doc) => doc.id === parseInt(doctor_id)
        );

        // Ensure the selected doctor exists
        if (!selectedDoctor) {
            return res.status(400).json({ error: "Invalid doctor selection" });
        }

        // Get the preferred doctor's name
        const preferred_doctor = `Dr ${selectedDoctor.first_name} ${selectedDoctor.last_name} - ${selectedDoctor.specialization}`;

        // SQL query to insert the appointment data into the Appointments table
        const query = `
            INSERT INTO Appointments(
                patient_id, doctor_id, appointment_date, appointment_time, status, 
                first_name, last_name, email, phone, gender, appointment_reasons, 
                preferred_doctor, existing_medical_record, medical_images
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Execute the query with the values provided in the form and session (if applicable)
        await db.query(query, [
            patient_id, // Use the patient_id from the form or session
            doctor_id,
            appointment_date,
            appointment_time,
            status || "scheduled", // Default status if not provided
            first_name,
            last_name,
            email,
            phone,
            gender,
            appointment_reasons,
            preferred_doctor,
            existing_medical_record,
            JSON.stringify(medicalImages), // Convert medical images array to a JSON string
        ]);

        // Respond with a success message if the query is successful
        res.status(201).json({ message: "Appointment created successfully" });
    } catch (error) {
        // Catch any errors that occur during the query execution
        console.error("Error creating appointment:", error.message);
        res.status(500).json({ error: "Failed to create appointment" });
    }

    // ... existing code ...

      try {
          // Fetch selected doctor details
          const doctorQuery = "SELECT * FROM Doctors WHERE id = ?";
          const [doctorDetails] = await db.query(doctorQuery, [doctor_id]);
          if (doctorDetails.length === 0) {
              return res.status(404).json({ error: "Doctor not found" });
          }
          const doctor = doctorDetails[0];

          // Insert appointment into the database
          const query = `
            INSERT INTO Appointments(
                patient_id, doctor_id, appointment_date, appointment_time, status,
                first_name, last_name, email, phone, gender, appointment_reasons,
                preferred_doctor, existing_medical_record, medical_images
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
          await db.query(query, [
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
              `Dr. ${doctor.first_name} ${doctor.last_name} - ${doctor.specialization}`,
              existing_medical_record,
              JSON.stringify(medicalImages),
          ]);

          // Send response before asynchronous email operations
          res.status(201).json({ message: "Appointment created successfully" });

          // Send emails asynchronously and log errors without disrupting the response
          try {
              await sendEmail(
                  email,
                  "Appointment Confirmation",
                  "appointmentConfirmation.ejs",
                  {
                      name: `${first_name} ${last_name}`,
                      doctorName: `Dr. ${doctor.first_name} ${doctor.last_name}`,
                      date: appointment_date,
                      time: appointment_time,
                  }
              );

              await sendEmail(
                  doctor.email,
                  "New Appointment Booking",
                  "appointmentConfirmation.ejs",
                  {
                      name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
                      doctorName: `${first_name} ${last_name}`,
                      date: appointment_date,
                      time: appointment_time,
                  }
              );

              console.log("Emails sent successfully");
          } catch (emailError) {
              console.error("Error sending emails:", emailError.message);
          }
      } catch (error) {
          console.error("Error creating appointment:", error.message);

          // Only send an error response if it hasn't already been sent
          if (!res.headersSent) {
              res.status(500).json({ error: "Failed to create appointment" });
          }
  };

}; */

/* exports.bookAppointment = async (req, res) => {
    console.log(req.body, req.files); // Log the request body and files for debugging
    console.log("Session Data: ", req.session); // Log session data to verify if patientId is present

    // Destructure the necessary fields from the form submission
    let {
        patient_id, // patient_id from the form submission (it could be missing)
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
        preferred_doctor,
        existing_medical_record,
    } = req.body;

    // console.log("Received doctor_id:", doctor_id); // Log the received doctor_id

    // Handle the uploaded medical images, if any
    const medicalImages = req.files ? req.files.map((file) => file.path) : [];

    // Ensure that medical images are uploaded
    // if (medicalImages.length === 0) {
    //     return res.status(400).json({ error: "No medical images uploaded" });
    // }

    // Check if patient_id exists; if not, retrieve it from the session (logged-in user's data)
    if (!patient_id) {
        patient_id = req.session.patientId; // Assuming the patient ID is stored in session during login
    }

    // Log the patient_id to see if it was correctly assigned
    // console.log("Final Patient ID: ", patient_id);

    try {
        // Fetch doctors from the database
        const doctorsQuery =
            "SELECT id, first_name, last_name, specialization FROM Doctors";
        
        const [doctors] = await db.query(doctorsQuery);

        // console.log("Doctors retrieved from the database:", doctors); // Log doctors retrieved

        // Find the doctor by doctor_id
        const selectedDoctor = doctors.find(
            (doc) => doc.id === parseInt(doctor_id)
        );

        // Ensure the selected doctor exists
        if (!selectedDoctor) {
            return res.status(400).json({ error: "Invalid doctor selection" });
        }

        // Get the preferred doctor's name
        const preferred_doctor = `Dr ${selectedDoctor.first_name} ${selectedDoctor.last_name} - ${selectedDoctor.specialization}`;

        // SQL query to insert the appointment data into the Appointments table
        const query = `
            INSERT INTO Appointments(
                patient_id, doctor_id, appointment_date, appointment_time, status, 
                first_name, last_name, email, phone, gender, appointment_reasons, 
                preferred_doctor, existing_medical_record, medical_images
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Execute the query with the values provided in the form and session (if applicable)
        await db.query(query, [
            patient_id, // Use the patient_id from the form or session
            doctor_id,
            appointment_date,
            appointment_time,
            status || "scheduled", // Default status if not provided
            first_name,
            last_name,
            email,
            phone,
            gender,
            appointment_reasons,
            preferred_doctor,
            existing_medical_record,
            JSON.stringify(medicalImages), // Convert medical images array to a JSON string
        ]);

        // Respond with a success message if the query is successful
        res.status(201).json({ message: "Appointment created successfully" });
    } catch (error) {
        // Catch any errors that occur during the query execution
        console.error("Error creating appointment:", error.message);
        res.status(500).json({ error: "Failed to create appointment" });
    }
}; */

exports.showAppointment = async (req, res) => {
    try {
        const query = `
        SELECT a.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name
        FROM appointments a
        LEFT JOIN doctors d ON a.doctor_id = d.id
        WHERE a.patient_id = ?
      `;
        const [appointments] = await db.query(query, [req.user.id]);
        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching appointments" });
    }
};

// Update Appointment (Reschedule an appointment)
exports.updateAppointment = async (req, res) => {
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
};

// Cancel an Appointment
exports.deleteAppointment = async (req, res) => {
    try {
        const query =
            "DELETE FROM appointments WHERE id = ? AND patient_id = ?";
        const [result] = await db.query(query, [req.params.id, req.user.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting appointment" });
    }
};

// Get patient data
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
