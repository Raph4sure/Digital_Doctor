const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

// Route to register a new admin
router.post(
    "/registerAdmin",
    requireLogin(["Super Admin", "Admin"]),
    adminController.registerAdmin
);

router.get("/registerAdmin", async (req, res) => {
    res.render("registerAdmin", {
        pageTitle: "Register Admin",
        cssPath: "/css/registerAdmin.css",
        message: "Welcome to the Admin Registration Page",
        user: req.session.user,
        apiBaseUrl: process.env.API_BASE_URL,
    });
});

// Route to render the admin login page
router
    .route("/loginAdmin")
    .get((req, res) => {
        res.render("loginAdmin", {
            pageTitle: "Login Admin",
            cssPath: "/css/loginAdmin.css",
            message: "Welcome to the Admin Login Page",
            user: req.session.user,
            apiBaseUrl: process.env.API_BASE_URL,
        });
    })
    .post(adminController.loginAdmin);

// Route to access the admin dashboard, requires login
router.get(
    "/adminDashboard",
    requireLogin(["Admin", "Super Admin"]),
    adminController.adminDashboard
);

// Route to manage admins
router.get(
    "/showAllAdmin",
    // requireLogin(["Super Admin"]),
    adminController.showAllAdmin
);

// Route to delete an admin
router.delete(
    "/deleteAdmin/:id",
    requireLogin(["Super Admin"]),
    adminController.deleteAdmin
);

module.exports = router;
