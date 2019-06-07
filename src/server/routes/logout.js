import AuthController from 'server/controllers/AuthController';

/**
 * @swagger
 * /logout:
 *  get:
 *    summary: /logout
 *    description: Logout route. Session will be deleted on server side.
 *    tags:
 *      - auth
 *    security:
 *      - session: []
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                redirect:
 *                  type: string
 *                  default: /
 *                user:
 *                  type: object
 *                  nullable: true
 *                  default: null
 *      302:
 *        description: >
 *          Response for text/html request accepts.
 *          Delete session and redirect to /
 *        headers:
 *          Location:
 *            schema:
 *              type: string
 *              default: /
 *      400:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  default: Not authorized
 *          text/html:
 *            schema:
 *              type: string
 */
export default {
  path: '/logout',
  authorized: true,
  handlers(route) {
    route.all((req, res, next) => {
      if (req.isAuthenticated()) AuthController.logout(req, res, next);
      else if (req.acceptJson) res.status(400).send({ error: 'Not authorized' });
      else res.redirect('/');
    });
  }
};
