// creating a function called requireLogin that protect routes by ensuring the patient is logged in.

exports.requireLogin = (req, res, next)  => {
    if (req.session && req.session.isLoggedIn) {
        next();
    } else {
        /*  return res
            .status(401)
            .json({ error: "Unauthourized: You need to log in " }); */
        // console.log("User not logged in, redirecting to login page...");

                return res.redirect('/login?alert=Please%20log%20in%20to%20continue');
    }
}

