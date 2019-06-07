import AuthController from 'server/controllers/AuthController';
import SignUpView from 'client/views/auth/SignUpView';

/**
 * @swagger
 * /signup:
 *  get:
 *    tags:
 *      - auth
 *    summary: /signup
 *    description: User registration view
 *    responses:
 *      200:
 *        content:
 *          text/html:
 *            schema:
 *              type: string
 *  post:
 *    tags:
 *      - auth
 *    summary: /signup
 *    description: User registration route
 *    parameters:
 *      - in: header
 *        name: CSRF-Token
 *        required: true
 *        schema:
 *          type: string,
 *          example: BWUPLKjZ-1ZniAPACNSer2Gyk8CZsUT2bKkU
 *    responses:
 *      200:
 *        description: >
 *          New user successfully registered and authenticated.
 *          The session ID is returned in a cookie named `sid`.
 *          You need to include this cookie in subsequent requests.
 *        headers:
 *          Set-Cookie:
 *            schema:
 *              type: string
 *              example: s%3AUNfPh...O27oQS.Akmht...vt5VI; Path=/; HttpOnly
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                redirect:
 *                  type: string
 *                  default: /
 *                user:
 *                  $ref: '#/components/schemas/User'
 *      302:
 *        description: >
 *          Response for text/html request accepts.
 *          New user successfully registered and authenticated.
 *          Set session cookie `sid` and redirect to /
 *        headers:
 *          Location:
 *            schema:
 *              type: string
 *              default: /
 *          Set-Cookie:
 *            schema:
 *              type: string
 *              example: s%3AUNfPh...O27oQS.Akmht...vt5VI; Path=/; HttpOnly
 *      400:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: Username is exist
 */
export default {
  path: '/signup',
  view: SignUpView,
  local: true,
  authorized: false,
  csrf: true,
  handlers(route) {
    route.all((req, res, next) => {
      if (!req.isAuthenticated()) next();
      else if (req.acceptJson) res.status(400).send({ error: 'Already authorized' });
      else res.redirect('/');
    });
    route.post(AuthController.signUp);
  }
};
