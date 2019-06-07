import AuthController from 'server/controllers/AuthController';
import SignInView from 'client/views/auth/SignInView';

/**
 * @swagger
 * /signin:
 *  get:
 *    tags:
 *      - auth
 *    summary: /signin
 *    description: User authorization view
 *    responses:
 *      200:
 *        content:
 *          text/html:
 *            schema:
 *              type: string
 *  post:
 *    tags:
 *      - auth
 *    summary: /signin
 *    description: User authorization route
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
 *          Successfully authenticated.
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
 *          User successfully authenticated.
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
 *      403:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: Username not found
 */
export default {
  path: '/signin',
  view: SignInView,
  local: true,
  authorized: false,
  csrf: true,
  handlers(route) {
    route.all((req, res, next) => {
      if (!req.isAuthenticated()) next();
      else if (req.acceptJson) res.status(400).send({ error: 'Already authorized' });
      else res.redirect('/');
    });
    route.post(AuthController.signIn);
  }
};
