// middleware/auth.js
const passport = require('passport');

exports.authenticateJWT = passport.authenticate('jwt', { session: false });

exports.authorizeRoles = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
};
