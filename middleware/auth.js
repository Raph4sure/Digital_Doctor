// creating a function called requireLogin that protect routes by ensuring the patient is logged in.

function requireLogin(req, res, next) {
    if (req.session && req.session.isLoggedIn) {
        next();
    } else {
        return res
            .status(401)
            .json({ error: "Unathourized: You need to log in " });
    }
}

module.exports = requireLogin;
