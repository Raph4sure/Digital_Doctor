// // creating a function called requireLogin that protect routes by ensuring the patient is logged in.

// exports.requireLogin = (roles = []) => {
//     return (req, res, next) => {
//         // if (req.session && req.session.isLoggedIn) {
//         if (req.session.isLoggedIn) {
//             const userRoles = req.session.user?.role || [];

//             if (roles.some((role) => userRoles.includes(role))) {
//                 return next();
//             } else {
//                 return res.status(403).json({
//                     error: `Access Denied. Requires one of the following roles: ${roles.join(
//                         ", "
//                     )}`,
//                 });
//             }
//         } else {
//             /*  return res
//             .status(401)
//             .json({ error: "Unauthourized: You need to log in " }); */
//             // console.log("User not logged in, redirecting to login page...");

//             return res.redirect(
//                 "/?alert=Please%20log%20in%20to%20continue"
//             );
//         }
//     };
// };

/* 
const normalizeRoles = (roles) => {
    if (!roles) return [];
    return Array.isArray(roles) ? roles : [roles];
};


exports.requireLogin = (requiredRoles = []) => {
    // Normalize the required roles to array
    const normalizedRequiredRoles = normalizeRoles(requiredRoles);

    return (req, res, next) => {
        // Check if user is logged in
        if (!req.session?.isLoggedIn) {
            return res.redirect('/?alert=Please%20log%20in%20to%20continue');
        }

        // Get user roles from session
        const userRoles = normalizeRoles(req.session.user?.role);
        
        // Debug logging
        console.log('Session:', {
            isLoggedIn: req.session.isLoggedIn,
            user: req.session.user,
            requiredRoles: normalizedRequiredRoles,
            userRoles: userRoles
        });

        // If no specific roles are required, just being logged in is enough
        if (normalizedRequiredRoles.length === 0) {
            return next();
        }

        // Check if user has any of the required roles
        const hasRequiredRole = normalizedRequiredRoles.some(role => 
            userRoles.some(userRole => 
                userRole.toLowerCase() === role.toLowerCase()
            )
        );

        if (hasRequiredRole) {
            return next();
        }

        // If API request (Accept: application/json), send JSON response
        if (req.headers.accept?.includes('application/json')) {
            return res.status(403).json({
                error: `Access Denied. Requires one of the following roles: ${normalizedRequiredRoles.join(', ')}`
            });
        }

        // For web requests, redirect with error message
        return res.redirect('/?alert=Access%20denied.%20You%20have%20no%20permission');
    };
}; */

// authMiddleware.js

exports.requireLogin = (allowedRoles = []) => {
    return (req, res, next) => {
        // Step 1: Check if user is logged in
        if (!req.session.isLoggedIn) {
            return res.redirect("/?alert=Please%20log%20in%20to%20continue");
        }

        // Step 2: If no roles specified, allow access to logged-in user
        if (allowedRoles.length === 0) {
            return next();
        }

        // Step 3: Get user's role from session
        const userRole = req.session.user?.role;

        // For debugging
        console.log("User Role:", userRole);
        console.log("Allowed Roles:", allowedRoles);

        // Step 4: Check if user's role is allowed
        const hasAccess = allowedRoles.some((role) => userRole.includes(role));

        // Step 5: Grant or deny access
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
