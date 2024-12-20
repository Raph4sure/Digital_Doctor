// config/multerConfig.js
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/medical-records");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error("Invalid file type. Only JPEG, PNG and GIF allowed."),
            false
        );
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

module.exports = upload;

// middleware/auth.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Authentication failed" });
    }
};

module.exports = authMiddleware;

// controllers/appointmentController.js
const db = require("../config/database");
const upload = require("../config/multerConfig");

const appointmentController = {
    // Create new appointment
    create: async (req, res) => {
        try {
            const {
                doctor_id,
                appointment_date,
                appointment_time,
                appointment_reasons,
                preferred_doctor,
            } = req.body;

            // Get patient details from logged-in user
            const patientQuery = "SELECT * FROM patients WHERE id = ?";
            const [patient] = await db.query(patientQuery, [req.user.id]);

            if (!patient) {
                return res.status(404).json({ message: "Patient not found" });
            }

            const insertQuery = `
        INSERT INTO appointments 
        (patient_id, doctor_id, appointment_date, appointment_time, status,
         first_name, last_name, email, phone, gender,
         appointment_reasons, preferred_doctor, existing_medical_record)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

            const medical_images = req.files
                ? req.files.map((file) => file.path).join(",")
                : null;

            const values = [
                req.user.id,
                doctor_id,
                appointment_date,
                appointment_time,
                "scheduled",
                patient.first_name,
                patient.last_name,
                patient.email,
                patient.phone,
                patient.gender,
                appointment_reasons,
                preferred_doctor,
                medical_images,
            ];

            const [result] = await db.query(insertQuery, values);

            res.status(201).json({
                message: "Appointment created successfully",
                appointmentId: result.insertId,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error creating appointment" });
        }
    },

    // Get all appointments for a patient
    getAll: async (req, res) => {
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
    },

    // Get single appointment
    getOne: async (req, res) => {
        try {
            const query = `
        SELECT a.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name
        FROM appointments a
        LEFT JOIN doctors d ON a.doctor_id = d.id
        WHERE a.id = ? AND a.patient_id = ?
      `;
            const [appointment] = await db.query(query, [
                req.params.id,
                req.user.id,
            ]);

            if (!appointment) {
                return res
                    .status(404)
                    .json({ message: "Appointment not found" });
            }

            res.json(appointment);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error fetching appointment" });
        }
    },

    // Update appointment
    update: async (req, res) => {
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
                return res
                    .status(404)
                    .json({ message: "Appointment not found" });
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
    },

    // Delete appointment
    delete: async (req, res) => {
        try {
            const query =
                "DELETE FROM appointments WHERE id = ? AND patient_id = ?";
            const [result] = await db.query(query, [
                req.params.id,
                req.user.id,
            ]);

            if (result.affectedRows === 0) {
                return res
                    .status(404)
                    .json({ message: "Appointment not found" });
            }

            res.json({ message: "Appointment deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error deleting appointment" });
        }
    },
};

module.exports = appointmentController;

// routes/appointmentRoutes.js
const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const authMiddleware = require("../middleware/auth");
const upload = require("../config/multerConfig");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Routes
router.post(
    "/",
    upload.array("medical_images", 5),
    appointmentController.create
);
router.get("/", appointmentController.getAll);
router.get("/:id", appointmentController.getOne);
router.put(
    "/:id",
    upload.array("medical_images", 5),
    appointmentController.update
);
router.delete("/:id", appointmentController.delete);

module.exports = router;

// app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const appointmentRoutes = require("./routes/appointmentRoutes");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/appointments", appointmentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});









<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book Appointment</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold mb-6">Book an Appointment</h1>
        
        <form id="appointmentForm" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <!-- Auto-filled Patient Information -->
            <div class="mb-6">
                <h2 class="text-xl font-semibold mb-4">Patient Information</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="firstName">
                            First Name
                        </label>
                        <input type="text" id="firstName" name="first_name" readonly
                            class="bg-gray-100 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="lastName">
                            Last Name
                        </label>
                        <input type="text" id="lastName" name="last_name" readonly
                            class="bg-gray-100 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
                            Email
                        </label>
                        <input type="email" id="email" name="email" readonly
                            class="bg-gray-100 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="phone">
                            Phone
                        </label>
                        <input type="tel" id="phone" name="phone" readonly
                            class="bg-gray-100 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="gender">
                            Gender
                        </label>
                        <input type="text" id="gender" name="gender" readonly
                            class="bg-gray-100 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">
                    </div>
                </div>
            </div>

            <!-- Appointment Details -->
            <div class="mb-6">
                <h2 class="text-xl font-semibold mb-4">Appointment Details</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="doctorSelect">
                            Select Doctor
                        </label>
                        <select id="doctorSelect" name="doctor_id" required
                            class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option value="">Select a doctor</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="appointmentDate">
                            Appointment Date
                        </label>
                        <input type="date" id="appointmentDate" name="appointment_date" required
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="appointmentTime">
                            Appointment Time
                        </label>
                        <input type="time" id="appointmentTime" name="appointment_time" required
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="preferredDoctor">
                            Preferred Doctor (Optional)
                        </label>
                        <input type="text" id="preferredDoctor" name="preferred_doctor"
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    </div>
                </div>
                <div class="mt-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="appointmentReasons">
                        Reason for Appointment
                    </label>
                    <textarea id="appointmentReasons" name="appointment_reasons" required
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        rows="4"></textarea>
                </div>
            </div>

            <!-- Medical Records Upload -->
            <div class="mb-6">
                <h2 class="text-xl font-semibold mb-4">Medical Records</h2>
                <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="medicalImages">
                        Upload Medical Images (Max 5)
                    </label>
                    <input type="file" id="medicalImages" name="medical_images" multiple accept="image/*"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    <p class="text-sm text-gray-600 mt-1">Accepted formats: JPEG, PNG, GIF (Max 5MB each)</p>
                </div>
            </div>

            <div class="flex items-center justify-end">
                <button type="submit"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Book Appointment
                </button>
            </div>
        </form>
    </div>

    <script>
        // Get token from localStorage (assuming you store it there after login)
        const token = localStorage.getItem('token');

        // Fetch patient information when page loads
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                // Fetch patient data
                const patientResponse = await fetch('/api/patients/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const patientData = await patientResponse.json();

                // Populate patient information
                document.getElementById('firstName').value = patientData.first_name;
                document.getElementById('lastName').value = patientData.last_name;
                document.getElementById('email').value = patientData.email;
                document.getElementById('phone').value = patientData.phone;
                document.getElementById('gender').value = patientData.gender;

                // Fetch doctors list
                const doctorsResponse = await fetch('/api/doctors', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const doctors = await doctorsResponse.json();

                // Populate doctors dropdown
                const doctorSelect = document.getElementById('doctorSelect');
                doctors.forEach(doctor => {
                    const option = document.createElement('option');
                    option.value = doctor.id;
                    option.textContent = `Dr. ${doctor.first_name} ${doctor.last_name} - ${doctor.specialization}`;
                    doctorSelect.appendChild(option);
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Error loading patient information. Please try again later.');
            }
        });

        // Handle form submission
        document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                const formData = new FormData(e.target);
                
                const response = await fetch('/api/appointments', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    alert('Appointment booked successfully!');
                    window.location.href = '/appointments'; // Redirect to appointments list
                } else {
                    const error = await response.json();
                    alert(error.message || 'Error booking appointment');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Error booking appointment. Please try again later.');
            }
        });

        // Add date validation to prevent past dates
        const appointmentDateInput = document.getElementById('appointmentDate');
        appointmentDateInput.min = new Date().toISOString().split('T')[0];

        // Add time validation for business hours (8 AM to 5 PM)
        const appointmentTimeInput = document.getElementById('appointmentTime');
        appointmentTimeInput.addEventListener('change', (e) => {
            const time = e.target.value;
            const hour = parseInt(time.split(':')[0]);
            
            if (hour < 8 || hour >= 17) {
                alert('Please select a time between 8:00 AM and 5:00 PM');
                e.target.value = '';
            }
        });

        // Validate file uploads
        document.getElementById('medicalImages').addEventListener('change', (e) => {
            const files = e.target.files;
            
            if (files.length > 5) {
                alert('You can only upload up to 5 images');
                e.target.value = '';
                return;
            }

            for (let file of files) {
                if (file.size > 5 * 1024 * 1024) {
                    alert('Each file must be less than 5MB');
                    e.target.value = '';
                    return;
                }

                if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
                    alert('Only JPEG, PNG, and GIF files are allowed');
                    e.target.value = '';
                    return;
                }
            }
        });
    </script>
</body>
</html>