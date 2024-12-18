// Requiring and importing config.env file
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
// Importing others
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
// Importing the router
const patientRouter = require("./routes/patientRoutes");
const doctorRouter = require("./routes/doctorRoutes");
const appointmentRouter = require("./routes/appointmentRoutes");
const adminRouter = require("./routes/adminRoutes");
const cors = require("cors");

// const css = require("./public/css/homepage.css");

// const bodyParser = require("body-parser");

// Importing database.js
const db = require("./database");

const app = express();
app.use(cors()); // Use CORS to allow requests from any origin

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    })
);

// Home page
app.get("/", (req, res) => {
    res.render("homepage", {
        pageTitle: "Homepage",
        cssPath: "/css/homepage.css",
        message: "Welcome to the homepage",
    });
});

// Home page
app.get("/homepage.html", (req, res) => {
    res.redirect("/homepage");
});

// About page
app.get("/homepage", (req, res) => {
    res.render("homepage", {
        pageTitle: "Homepage",
        cssPath: "/css/homepage.css",
        message: "Welcome to the homepage",
    });
});

app.get("/About.html", (req, res) => {
    res.redirect("/about");
});

// About page
app.get("/about", (req, res) => {
    res.render("About", {
        pageTitle: "About",
        cssPath: "/css/About.css",
        message: "Welcome to the About Us page",
    });
});

// Contact page
app.get("/Contact.html", (req, res) => {
    res.redirect("/contact");
});

app.get("/contact", (req, res) => {
    res.render("Contact", {
        pageTitle: "Contact",
        cssPath: "/css/contact.css",
        message: "Welcome to the Contact Us page",
    });
});
// Dashboard page
app.get("/Dashboard.html", (req, res) => {
    res.redirect("/dashboard");
});

app.get("/dashboard", (req, res) => {
    res.render("Dashboard", {
        pageTitle: "Dashboard",
        cssPath: "/css/dashboard.css",
        message: "Welcome to the Dashboard page",
    });
});
// Consultation page
app.get("/Consultation.html", (req, res) => {
    res.redirect("/consultation");
});

app.get("/consultation", (req, res) => {
    res.render("Consultation", {
        pageTitle: "Consultation",
        cssPath: "/css/Consultation.css",
        message: "Welcome to the consultation page",
    });
});
// Contact page
app.get("/Contact.html", (req, res) => {
    res.redirect("/contact");
});

app.get("/contact", (req, res) => {
    res.render("Contact", {
        pageTitle: "Contact",
        cssPath: "/css/Contact.css",
        message: "Welcome to the Contact Us page",
    });
});



// Using Patient router
app.use("/api/patients", patientRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/appointment", appointmentRouter);
app.use("/api/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

// app.get("/", async (req, res) => {
//     try {
//         const [rows] = await db.query("SELECT * FROM patients");
//         res.json(rows);
//     } catch (err) {
//         res.status(500).send("Database Error: " + err.message);
//     }
// });

// connecting to the database and starting the server
db.getConnection()
    .then(() => {
        console.log("Connected to the database");
        const port = process.env.DB_PORT || 3001;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((err) => {
        console.log("Error connecting to the database", err);
    });

module.exports = app;
