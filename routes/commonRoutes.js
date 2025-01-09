const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/authMiddleware");

// Home page
router.get("/", (req, res) => {
    res.render("homepage", {
        pageTitle: "Homepage",
        cssPath: "/css/homepage.css",
        message: "Welcome to the homepage",
        user: req.session.user,
    });
});

// About page
router.get("/about", (req, res) => {
    res.render("About", {
        pageTitle: "About",
        cssPath: "/css/About.css",
        message: "Welcome to the About Us page",
        user: req.session.user,
    });
});

// Contact page
router.get("/contact", (req, res) => {
    res.render("Contact", {
        pageTitle: "Contact",
        cssPath: "/css/contact.css",
        message: "Welcome to the Contact Us page",
        user: req.session.user,
    });
});

// Patient Logout route
router.post("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to logout" });
            } else {
                return res.redirect("/");

                // res.json({ message: "Logout successful" });
            }
        });
    } else {
        res.status(400).json({ error: "No active session to logout" });
    }
});

module.exports = router;
