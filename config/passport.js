const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const {  models } = require('gestaohorarios-dal'); 

const JWT_SECRET = 'some_random_key';

module.exports = (passport) => {
    passport.use(
        "local",
        new LocalStrategy(
            {
                usernameField: "username",
                passwordField: "password",
              },async (username, password, done) => {
            try {
                const user = await models.User.findOne({ where: { username } });
                if (!user) return done(null, false, { message: 'Utilizador não encontrado' });

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) return done(null, false, { message: 'Password incorreta' });

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        })
    );

    // Estratégia JWT
    passport.use(
        new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: JWT_SECRET,
            },
            async (payload, done) => {
                try {
                    const user = await models.User.findByPk(payload.id);
                    if (!user) return done(null, false);

                    return done(null, user);
                } catch (err) {
                    return done(err, false);
                }
            }
        )
    );
};
