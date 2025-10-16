const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config({ path: "./config.env" });
// Importing others
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bodyParser = require("body-parser");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

// Importing the router
const commonRouter = require("./routes/commonRoutes");
const patientRouter = require("./routes/patientRoutes");
const doctorRouter = require("./routes/doctorRoutes");
const appointmentRouter = require("./routes/appointmentRoutes");
const adminRouter = require("./routes/adminRoutes");
// Importing database.js
const db = require("./database");

const cors = require("cors");
const methodOverride = require("method-override");

/* const crypto = require("crypto");
const secret = crypto.randomBytes(64).toString("hex");
console.log(secret); */


const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { ca: fs.readFileSync(__dirname + "/ca.pem") },
});


const app = express();
app.use(cors()); // Use CORS to allow requests from any origin

// to view images in the browser
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

// Parse application/json
app.use(bodyParser.json());

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
        store: sessionStore,
        cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    })
);

// for method override
app.use(methodOverride("_method"));

app.use((req, res, next) => {
    console.log(
        `Incoming request: ${req.method} ${req.url}`
    );
    next();
});

// Api route
/* app.use("/api/patients", patientRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/appointment", appointmentRouter);
app.use("/api/admin", adminRouter);*/

// static routes
app.use("/", commonRouter);
app.use("/", doctorRouter);
app.use("/", adminRouter);
app.use("/", patientRouter);
app.use("/", appointmentRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // setting locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

// connecting to the database and starting the server
db.getConnection()
    .then(() => {
        console.log("Connected to the database");
        const port = process.env.PORT || 3300;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((err) => {
        console.log("Error connecting to the database", err);
    });

module.exports = app;
