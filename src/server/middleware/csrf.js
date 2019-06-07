import csrf from 'csurf';
import config from 'config';

function getCookie(req) {
  return config.cookies.csrf && config.cookies.csrf.cookie && config.cookies.csrf.cookie.signed
    ? req.signedCookies[config.cookies.csrf.key]
    : req.cookies[config.cookies.csrf.key];
}

export default {
  initialize: csrf({ cookie: false }),
  tokenPerSession: (req, res, next) => {
    if (!req.session) {
      next('csrf error: session is missed');
      return;
    }
    // create new token and store in session
    if (!req.session.csrfToken) req.session.csrfToken = req.csrfToken();

    const csrfCookie = getCookie(req) || null;

    // set token in response cookie
    if (req.session.csrfToken !== csrfCookie)
      res.cookie(config.cookies.csrf.key, req.session.csrfToken);

    next();
  }
};
