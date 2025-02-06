<!-- # Project Description: Online medical consultation application

## Project Title: Digital Doctor: A Comprehensive Digital Doctor Platform

Overview: Digital Doctor is a robust online medical platform designed to connect patients with healthcare providers virtually. The platform aims to make healthcare more accessible by allowing users to register, book appointments with doctors, and consult with healthcare professionals online. Built using HTML, CSS, and JavaScript for the frontend, with a Node.js and MySQL backend, Digital Doctor offers a seamless user experience while ensuring secure and efficient management of medical services.

## Key Features:

### User Authentication and Role Management:

Registration and Login: Secure user registration and login system, with role-based access control for patients and doctors.
Profile Management: Users can manage their profiles, update personal information, and view their appointment history.


### Appointment Booking:

Doctor Availability: Patients can view doctors' availability and book appointments directly through the platform.
Appointment Management: Users can schedule, reschedule, or cancel appointments, and receive notifications about their bookings.

### Doctor Management:

Specialization and Availability: Doctors can manage their availability, specializations, and appointment slots, ensuring patients have up-to-date information when booking.
Consultation Services: The platform allows for virtual consultations through a secure communication channel.

### User-Friendly Interface:

Responsive Design: The application features a clean, responsive design that ensures a seamless experience across all devices.
Intuitive Navigation: Easy-to-use interface with clear navigation paths for all users, whether they are booking an appointment or managing their doctor profile.

### Security and Compliance:

Data Security: Implementation of HTTPS, bcrypt authentication, and data encryption to protect user information.
Compliance: Adherence to healthcare standards and regulations, ensuring that user data is handled with the utmost confidentiality.
 -->


# Digital Doctor Web Application

## **Project Overview**
The **Digital Doctor** web application simplifies healthcare access by providing an online platform where patients can connect with doctors, book appointments, and manage their healthcare needs. It offers role-specific functionalities for patients, doctors, and admins, ensuring a user-friendly and efficient experience.

---

## **Table of Contents**
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Setup and Installation](#setup-and-installation)
4. [Database Design](#database-design)
5. [Application Workflow](#application-workflow)
6. [Folder Structure](#folder-structure)
7. [Challenges and Solutions](#challenges-and-solutions)
8. [Future Enhancements](#future-enhancements)

---

## **Features**

### **User Authentication**
- Patients and doctors can securely register and log in.
- Admins have exclusive access to manage the platform.
- Sessions are managed using cookies for persistence.

### **Doctor Management**
- Displays a list of doctors with details such as name, specialization, and availability.
- Patients can book appointments with selected doctors.

### **Appointment Booking**
- A streamlined booking form pre-filled with patient and doctor details.
- Appointments are validated and stored in the database.

### **Dashboards**
- **Patient Dashboard**: View and update profile, check appointment history.
- **Doctor Dashboard**: View scheduled appointments and patient details.
- **Admin Panel**: Manage users, doctors, and appointments.

### **Dynamic Alerts**
- Alerts for actions like login, logout, and appointment booking.

### **Responsive Design**
- Optimized for both desktop and mobile devices.

---

## **Tech Stack**

### **Frontend**
- HTML, CSS, JavaScript
- SCSS for modular styling
- EJS (Embedded JavaScript) for dynamic templates

### **Backend**
- Node.js with Express framework
- MySQL for database management
- bcrypt for password hashing
- Express-Session for session management

### **Tools**
- Nodemon: Automatic server reloading during development
- VS Code: Development environment

---

## **Setup and Installation**

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/username/digital-doctor.git
   cd digital-doctor
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set Up the Database:**
   - Create a MySQL database (e.g., `digital_doctor`).
   - Import the provided `database.sql` file into the database.

4. **Environment Variables:**
   Create a `.env` file with the following:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=digital_doctor
   SESSION_SECRET=your_secret_key
   ```

5. **Run the Server:**
   ```bash
   npm start
   ```
   The application will run on `http://localhost:3000/`.

---

## **Database Design**

### **Tables**

#### 1. **Patients**
| Column          | Type         | Description                |
|-----------------|--------------|----------------------------|
| id              | INT (PK)     | Unique identifier          |
| first_name      | VARCHAR(100) | Patient's first name       |
| last_name       | VARCHAR(100) | Patient's last name        |
| email           | VARCHAR(150) | Patient's email address    |
| phone           | VARCHAR(15)  | Patient's phone number     |
| password        | VARCHAR(255) | Hashed password            |
| date_of_birth   | DATE         | Patient's birth date       |

#### 2. **Doctors**
| Column          | Type         | Description                |
|-----------------|--------------|----------------------------|
| id              | INT (PK)     | Unique identifier          |
| first_name      | VARCHAR(100) | Doctor's first name        |
| last_name       | VARCHAR(100) | Doctor's last name         |
| specialization  | VARCHAR(100) | Doctor's area of expertise |

#### 3. **Appointments**
| Column          | Type         | Description                |
|-----------------|--------------|----------------------------|
| id              | INT (PK)     | Unique identifier          |
| patient_id      | INT (FK)     | Linked to Patients table   |
| doctor_id       | INT (FK)     | Linked to Doctors table    |
| appointment_date| DATETIME     | Scheduled date and time    |

---

## **Application Workflow**

1. **Homepage**
   - Introduces the application with links to log in or register.

2. **Registration and Login**
   - Patients and doctors can sign up with their details.
   - Passwords are hashed using bcrypt for security.

3. **Doctor Listing**
   - Displays available doctors with their specializations.
   - "Book Appointment" button redirects to the booking form.

4. **Appointment Booking**
   - Booking form pre-fills patient and selected doctor information.
   - Appointment data is validated and saved.

5. **Dashboards**
   - Each role has tailored views for managing data and activities.

---

## **Folder Structure**
```
|-- controllers/
|   |-- authController.js
|   |-- appointmentController.js
|-- models/
|   |-- db.js
|-- public/
|   |-- css/
|   |-- js/
|-- views/
|   |-- bookAppointment.ejs
|   |-- dashboard.ejs
|-- routes/
|   |-- authRoutes.js
|   |-- appointmentRoutes.js
|-- app.js
|-- package.json
|-- .env
```

---

## **Challenges and Solutions**

### **1. Role-Based Access Control**
- **Challenge**: Differentiating functionalities for patients, doctors, and admins.
- **Solution**: Middleware to enforce role-specific access.

### **2. Session Management**
- **Challenge**: Maintaining sessions securely.
- **Solution**: Used `express-session` with a strong secret key.

### **3. Form Pre-Fill Functionality**
- **Challenge**: Dynamically pre-filling patient and doctor details in the booking form.
- **Solution**: Querying patient and doctor data from the database and passing it to the EJS template.

---

## **Future Enhancements**

1. **Video Consultation**:
   - Real-time video conferencing between patients and doctors.

2. **Payment Gateway**:
   - Integration of payment systems for appointment fees.

3. **Mobile App**:
   - Extend functionality to Android and iOS platforms using Flutter.

---

## **Conclusion**
The Digital Doctor project is a robust web application designed to bridge the gap between patients and doctors through efficient online appointment booking and management. Its modular design and scalable architecture make it adaptable for future enhancements, ensuring long-term usability.

