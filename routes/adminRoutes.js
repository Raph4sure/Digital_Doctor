const express = require("express");
const db = require("./../database");
const { requireLogin } = require("./../middleware/authMiddleware");
const adminController = require("../controllers/adminController");
// create a router instance
const router = express.Router();


router.post("/register", adminController.register);
router.post("/login", adminController.login);
router.post("/registerDoctor", requireLogin, adminController.registerDoctor);
router.get("/getAllDoctors", requireLogin, adminController.getAllDoctors);
router.put("/updateDoctor/:id", requireLogin, adminController.updateDoctor);
router.delete("/deleteDoctor/:id", requireLogin, adminController.deleteDoctor);

module.exports = router;
