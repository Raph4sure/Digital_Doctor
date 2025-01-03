// middleware/setDashboardLink.js
const setDashboardLink = (req, res, next) => {
    let dashboardLink = "/";

    if (req.session.isLoggedIn && req.session.user.role === "patient") {
        dashboardLink = "/patientDashboard";
    } else if (req.session.isLoggedIn && req.session.user.role === "doctor") {
        dashboardLink = "/doctorDashboard";
    } else if (
        req.session.isLoggedIn &&
        (req.session.user.role === "Admin" ||
            req.session.user.role === "Super Admin")
    ) {
        dashboardLink = "/patientDashboard";
    }

    res.locals.dashboardLink = dashboardLink;
    next();
};

module.exports = setDashboardLink;
