/** @type Authenticator */
import passport from 'passport';
import LocalStrategy from 'passport-local';
import User from 'server/models/User';
import AuthService from 'server/services/AuthService';
import config from 'config';
import RememberMeStrategy from './passport/remember-me';

passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    },
    (username, password, done) => {
      User.findOne({ username }).then(user => {
        if (!user) return done(null, 'Incorrect username', user);
        if (!user.verifyPassword(password)) return done(null, 'Incorrect password', user);
        return done(null, null, user);
      }, done);
    }
  )
);

passport.use(
  new RememberMeStrategy(
    config.cookies.remember,
    (token, done) => {
      AuthService.consumeRememberMeToken(token, (err, userId) => {
        if (err) done(err);
        else if (!userId) done(null, false);
        else User.findOne({ _id: userId }).then(user => done(null, user || false), done);
      });
    },
    AuthService.issueRememberMeToken
  )
);

passport.serializeUser((user, done) => done(null, user.id.toString()));

passport.deserializeUser((id, done) => User.getById(id).then(user => done(null, user), done));

export default {
  initialize: passport.initialize(),
  session: passport.session(),
  rememberMe: passport.authenticate('remember-me')
};
