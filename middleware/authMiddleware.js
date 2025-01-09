// authMiddleware.js
exports.requireLogin = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.session.isLoggedIn) {
            return res.redirect("/?alert=Please%20log%20in%20to%20continue");
        }

        if (allowedRoles.length === 0) {
            return next();
        }

        const userRole = req.session.user?.role;

        // For debugging
        console.log("User Role:", userRole);
        console.log("Allowed Roles:", allowedRoles);

        const hasAccess = allowedRoles.some((role) => userRole.includes(role));

        if (hasAccess) {
            next();
        } else {
            return res.redirect(
                "/?alert=Access%20denied.%20You%20have%20no%20permission"
            );
            // res.status(403).json({
            //     error: `Access Denied. Required roles: ${allowedRoles.join(', ')}`
            // });
        }
    };
};
