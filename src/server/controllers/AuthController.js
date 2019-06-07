/** @type Authenticator */
import passport from 'passport';
import User from 'server/models/User';
import validator from 'validator';
import config from 'config';
import AuthService from 'server/services/AuthService';

function handleSignInError(req, res, next, data, code = 403) {
  res.status(code);
  if (req.acceptJson) res.send({ error: data.error });
  else {
    res.data = data;
    next();
  }
}

async function handleRememberMe(req, res) {
  return new Promise((resolve, reject) => {
    if (!req.body.remember) resolve();
    else
      AuthService.issueRememberMeToken(req.user, (error, token) => {
        if (error) {
          reject(error);
          return;
        }
        res.cookie(config.cookies.remember.key, token, config.cookies.remember.cookie);
        resolve();
      });
  });
}

/** @class AuthController */
const AuthController = {
  /**
   * @param req
   * @param res
   * @param next
   */
  signIn(req, res, next) {
    const username = validator.trim(req.body.username);
    const password = validator.trim(req.body.password);
    const remember = !!req.body.remember;

    if (!User.isValidField({ username })) {
      handleSignInError(req, res, next, {
        error: 'Username not valid',
        username,
        password,
        remember
      });
      return;
    }

    if (!User.isValidField({ password })) {
      handleSignInError(req, res, next, {
        error: 'Password not valid',
        username,
        password,
        remember
      });
      return;
    }

    passport.authenticate('local', {}, (error, fail, user) => {
      if (error || fail) {
        if (error.notFound || fail)
          handleSignInError(req, res, next, {
            error: 'Authentication failed. Invalid username or password.',
            username,
            password,
            remember
          });
        if (error) next(error);
        return;
      }

      req.logIn(user, { session: true }, err => {
        if (err) {
          console.error('request login error', err);
          next(err);
          return;
        }
        handleRememberMe(req, res).then(() => {
          if (req.acceptJson) res.send({ redirect: '/', user: user.mappingData() });
          else res.redirect('/');
        }, next);
      });
    })(req, res, next);
  },

  /**
   * Регистрация пользователя. Создаем его в базе данных, и тут же, после сохранения,
   * вызываем метод `req.logIn`, авторизуя пользователя
   * @param req
   * @param res
   * @param next
   */
  signUp(req, res, next) {
    const username = validator.trim(req.body.username);
    const password = validator.trim(req.body.password);
    const remember = !!req.body.remember;

    if (!User.isValidField({ username })) {
      next('username not valid');
      return;
    }

    if (!User.isValidField({ password })) {
      next('password not valid');
      return;
    }

    new User({ username, password })
      .save()
      .then(user => {
        req.logIn(user, { session: true }, error => {
          if (error) {
            next(error);
            return;
          }
          handleRememberMe(req, res).then(() => {
            if (req.acceptJson) res.send({ redirect: '/', user: user.mappingData() });
            else res.redirect('/');
          }, next);
        });
      })
      .catch(error => {
        if (error.code === 11000) {
          // error: username is exist
          handleSignInError(
            req,
            res,
            next,
            {
              error: 'Username is exist',
              username,
              password,
              remember
            },
            400
          );
        } else next(error);
      });
  },

  logout(req, res) {
    req.logout();
    // clear the remember me cookie when logging out
    const cookie = config.cookies.remember.cookie.signed
      ? req.signedCookies[config.cookies.remember.key]
      : req.cookies[config.cookies.remember.key];
    if (cookie)
      AuthService.removeRememberMeToken(cookie, err => {
        if (err) console.error(err);
        res.clearCookie(config.cookies.remember.key);
        if (req.acceptJson) res.send({ redirect: '/', user: null });
        else res.redirect('/');
      });
    else if (req.acceptJson) res.send({ redirect: '/', user: null });
    else res.redirect('/');
  }
};

export default AuthController;
