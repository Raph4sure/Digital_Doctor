// requiring bcrypt
const db = require("./../database");
const fs = require("fs");
const path = require("path");
const { sendEmail } = require("./../middleware/email");

// Booking An Appointment

exports.getBookAppointment = async (req, res) => {
    try {
        // Fetch patient details from the database
        const [rows] = await db.query(
            "SELECT first_name, last_name, phone, email, gender, date_of_birth FROM Patients WHERE id = ?",
            [req.session.patientId]
        );

        if (rows.length === 0) {
            return res.status(404).send("Patient not found");
        }

        const patientData = rows[0]; // Get the patient details

        // Fetching the selected doctor's details from the Doctors table
        const doctorId = req.query.doctorId;
        let selectedDoctor = null;

        if (doctorId) {
            const [doctorRows] = await db.query(
                "SELECT id, first_name, last_name, specialization FROM Doctors WHERE id = ?", [doctorId]
            );
            if (doctorRows.length > 0) {
                selectedDoctor = doctorRows[0];
            }
        }
        
        
        // Fetch the list of doctors from the Doctors table
        const [allDocotors] = await db.query(
            "SELECT id, first_name, last_name, specialization FROM Doctors"
        );

        if (allDocotors.length === 0) {
            return res.status(404).send("No doctors available");
        }

        // Render the page and pass patientData
        res.render("bookAppointment", {
            pageTitle: "Book Appointment",
            cssPath: "/css/bookAppointment.css",
            message: "Welcome to the Patient login page",
            patientData, // Pass patientData to the view
            patientId: patientData.id, // Pass patientId to the view
            selectedDoctor,
            doctors: allDocotors, // Pass the list of doctors to the view
            user: req.session.user,
        });
    } catch (error) {
        console.error("Error fetching patient data:", error);
        res.status(500).send("Internal Server Error");
    }
};


// route to post an Appointment
exports.postBookAppointment = async (req, res) => {
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
                doctor: preffered_doctor,
                phone: doctor.phone,
            }
        ).catch((err) => {
            // Logging the full error details
            console.error("Error sending patient email:", {
                errors: err.response?.body?.errors,
                message: err.message,
                fullError: err,
            });
        });
        sendEmail(
            doctor.email,
            "New Appointment Booking",
            "appointmentConfirmation.ejs",
            {
                name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
                doctorName: `${first_name} ${last_name}`,
                date: appointment_date,
                time: appointment_time,
                doctor: preffered_doctor,
                phone: phone,
            }
        ).catch((err) =>
            console.error(
                "Error sending doctor email:",
                err.response?.body?.errors || err.message
            )
        );
    } catch (error) {
        console.error("Error booking appointment:", error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to create appointment." });
        }
    }
};

// route to show patient Appointment
exports.showPatientAppointment = async (req, res) => {
    try {
        const patientId = req.session.patientId;

        const query = `SELECT * FROM Appointments WHERE patient_id = ?
            ORDER BY appointment_date DESC, appointment_time DESC`;

        const [appointments] = await db.query(query, [patientId]);

        // if (appointments.length === 0) {
        //     return res.status(404).json({ message: "No appointments found" });
        // }

        // Parse the medical_images field if it's a stringified JSON array
        appointments.forEach((appointment) => {
            if (
                appointment.medical_images &&
                typeof appointment.medical_images === "string"
            ) {
                try {
                    appointment.medical_images = JSON.parse(
                        appointment.medical_images
                    ); // Parse the string to array
                } catch (err) {
                    console.error("Error parsing medical_images:", err);
                    appointment.medical_images = []; // Fallback to empty array if parsing fails
                }
            }
        });

        res.render("showPatientAppointment", {
            appointments,
            patient: patientId,
            pageTitle: "Patient Appointment",
            cssPath: "/css/showAppointment.css",
            message: "Welcome to the Appointment page",
            user: req.session.user,
        });

        //    res.status(200).json({ appointments: appointments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching appointments" });
    }
};

// route to show patient Appointment
exports.showDoctorAppointment = async (req, res) => {
    try {
        doctorId = req.session.user.id;

        const query = `SELECT * FROM Appointments WHERE doctor_id = ? ORDER BY appointment_date DESC, appointment_time DESC`;

        const [appointments] = await db.query(query, [doctorId]);

        appointments.forEach((appointment) => {
            if (
                appointment.medical_images &&
                typeof appointment.medical_images === "string"
            ) {
                try {
                    appointment.medical_images = JSON.parse(
                        appointment.medical_images
                    ); // Parse the string to array
                } catch (err) {
                    console.error("Error parsing medical_images:", err);
                    appointment.medical_images = []; // Fallback to empty array if parsing fails
                }
            }
        });

        res.render("showDoctorAppointment", {
            appointments,
            pageTitle: "Show All Doctors",
            cssPath: "/css/showDocotorAppointment.css",
            user: req.session.user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching appointments" });
    }
};

// route to Show All Appointment
exports.showAllAppointment = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 5; // Default to 5 items per page
        const offset = (page - 1) * limit;

        // Query the total number of patients for pagination metadata
        const [countResult] = await db.query(
            "SELECT COUNT(*) as total FROM Appointments"
        );
        const totalAppointments = countResult[0].total;

        query = `SELECT * FROM Appointments ORDER BY appointment_date DESC, appointment_time DESC LIMIT ? OFFSET ?`;

        const [appointments] = await db.query(query, [limit, offset]);

        appointments.forEach((appointment) => {
            if (
                appointment.medical_images &&
                typeof appointment.medical_images === "string"
            ) {
                try {
                    appointment.medical_images = JSON.parse(
                        appointment.medical_images
                    ); // Parse the string to array
                } catch (err) {
                    console.error("Error parsing medical_images:", err);
                    appointment.medical_images = []; // Fallback to empty array if parsing fails
                }
            }
        });

        // Calculate total pages
        const totalPages = Math.ceil(totalAppointments / limit);

        res.render("showAllAppointment", {
            appointments,
            currentPage: page,
            totalPages,
            totalAppointments,
            limit,
            userRole: req.session.user.role,
            user: req.session.user,
            cssPath: "/css/showAllAppointment.css",
            pageTitle: "Show All Appointment",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching appointments: " + error,
        });
    }
};

// Editing appointment
exports.getEditAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;

        const query = "SELECT * FROM Appointments WHERE id = ?";

        const [appointments] = await db.query(query, [appointmentId]);

        if (appointments.length === 0) {
            return res.status(404).send({ message: "Appointment not found" });
        }

        appointments.forEach((appointment) => {
            if (
                appointment.medical_images &&
                typeof appointment.medical_images === "string"
            ) {
                try {
                    appointment.medical_images = JSON.parse(
                        appointment.medical_images
                    ); // Parse the string to array
                } catch (err) {
                    console.error("Error parsing medical_images:", err);
                    appointment.medical_images = []; // Fallback to empty array if parsing fails
                }
            }
        });


        res.render("editAppointment", {
            appointment: appointments[0],
            pageTitle: "editAppointment",
            cssPath: "/css/editAppointment.css",
            message: "Welcome to the Edit page",
            user: req.session.user,
        });
    } catch (error) {
        console.error(error);
        // res.status(500).send({ message: "Error fetching appointment" });
        res.status(500).json({
            message: "Error fetching appointment " + error.message,
        });
    }
};

// Route to edit Appointment
exports.postEditAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { role } = req.session.user;

        const {
            preferred_doctor,
            appointment_date,
            appointment_time,
            appointment_reasons,
            existing_medical_record,
            status,
            medical_images,
        } = req.body;

        let medicalImages = [];
        if (req.files && req.files.length > 0) {
            medicalImages = req.files.map((file) => file.path); // Get paths of uploaded files
        }

        if (medicalImages.length === 0) {
            const [appointments] = await db.query(
                "SELECT medical_images FROM Appointments WHERE id = ?",
                [appointmentId]
            );
            if (appointments.length > 0 && appointments[0].medical_images) {
                medicalImages = JSON.parse(appointments[0].medical_images); // Parse existing images
            }
        }

        // Convert medicalImages array to a JSON string for storage
        const medicalImagesString = JSON.stringify(medicalImages);

        const query = `UPDATE Appointments SET preferred_doctor =?, appointment_date = ?, appointment_time = ?, appointment_reasons = ?, status = ?, existing_medical_record=?, medical_images = ? WHERE id = ?`;

        await db.query(query, [
            preferred_doctor,
            appointment_date,
            appointment_time,
            appointment_reasons,
            status,
            existing_medical_record,
            medicalImagesString,
            appointmentId,
        ]);

        // alert("Appointment updated successfully");
        let redirectPath = "/showAllAppointment";

        if (role) {
            if (role.includes("doctor")) {
                redirectPath = "/showDoctorAppointment";
            } else if (role.includes("patient")) {
                redirectPath = "/showPatientAppointment";
            }
        }

        return res.redirect(redirectPath);

        // res.status(200).send("Appointment Upadated Successfuly");
    } catch (error) {
        // res.status(500).send("Error Updating Appointment");
        res.status(500).json("Error Updating Appointment" + error.message);
    }
};

// Route for deleting an Image in Appointment table
exports.deleteImage = async (req, res) => {
    try {
        const { imagePath } = req.body;

        // Delete the file from the filesystem
        const absolutePath = path.join(__dirname, "../", imagePath); // Adjust path as needed
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath); // Delete the file
        }

        // Remove the image from the database
        const query = `
            UPDATE Appointments 
            SET medical_images = JSON_REMOVE(medical_images, JSON_UNQUOTE(JSON_SEARCH(medical_images, 'one', ?)))
            WHERE JSON_CONTAINS(medical_images, JSON_QUOTE(?))
        `;

        await db.query(query, [imagePath, imagePath]);

        res.json({ success: true, message: "Image deleted successfully" });
    } catch (error) {
        console.error("Error deleting image:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Deleting an appointment
exports.deleteAppointmentById = async (req, res) => {
    const role  = req.session.user.role;

    console.log("role for Deleting: ", role);

    // console.log(req.method);

    try {
        const appointmentId = req.params.id;
        const query = "DELETE FROM Appointments WHERE id = ?";
        await db.query(query, [appointmentId]);

        let redirectPath = "/showAllAppointment";

        if (role) {
            if (role.includes("doctor")) {
                redirectPath = "/showDoctorAppointment";
            } else if (role.includes("patient")) {
                redirectPath = "/showPatientAppointment";
            }
        }

        return res.redirect(redirectPath);

        // res.status(200).json({ message: "Appointment deletedsuccessfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting appointment");
    }
};
