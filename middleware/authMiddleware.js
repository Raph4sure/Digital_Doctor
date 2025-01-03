// creating a function called requireLogin that protect routes by ensuring the patient is logged in.

exports.requireLogin = (roles = []) => {
    return (req, res, next) => {
        // if (req.session && req.session.isLoggedIn) {
        if (req.session.isLoggedIn) {
            const userRoles = req.session.user?.role || [];

            if (roles.some((role) => userRoles.includes(role))) {
                return next();
            } else {
                return res.status(403).json({
                    error: `Access Denied. Requires one of the following roles: ${roles.join(
                        ", "
                    )}`,
                });
            }
        } else {
            /*  return res
            .status(401)
            .json({ error: "Unauthourized: You need to log in " }); */
            // console.log("User not logged in, redirecting to login page...");

            return res.redirect(
                "/?alert=Please%20log%20in%20to%20continue"
            );
        }
    };
};
