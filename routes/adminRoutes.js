const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

// Route to register a new admin
router.post(
    "/registerAdmin",
    requireLogin(["Super Admin"]),
    adminController.registerAdmin
);

// Route to render the admin login page
router
    .route("/loginAdmin")
    .get((req, res) => {
        res.render("loginAdmin", {
            pageTitle: "Login Admin",
            cssPath: "/css/loginAdmin.css",
            message: "Welcome to the Admin Login Page",
            user: req.session.use,
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
    "/manageAdmin",
    requireLogin(["Super Admin"]),
    adminController.manageAdmin
);

// Route to delete an admin
router.delete(
    "/deleteAdmin",
    requireLogin(["Super Admin"]),
    adminController.deleteAdmin
);

module.exports = router;
