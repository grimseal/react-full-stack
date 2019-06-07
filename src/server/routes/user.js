import UserView from 'client/views/user/UserView';
import UserController from 'server/controllers/UserController';

/**
 * @swagger
 * /user/{username}:
 *  get:
 *    tags:
 *      - user
 *    summary: /user/username
 *    description: User profile view
 *    parameters:
 *    - in: path
 *      name: username
 *      schema:
 *        type: string
 *        required: true
 *        description: Id of the user to get
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                data:
 *                  type: object
 *                  properties:
 *                    user:
 *                      $ref: '#/components/schemas/User'
 */
export default {
  path: '/user/:username',
  view: UserView,
  handlers(route) {
    route.get((req, res, next) => {
      UserController.user(req.params.username)
        .then(user => {
          res.data.user = user.mappingData();
          next();
        })
        .catch(reason => {
          if (!UserController.inputErrors.includes(reason.message)) next(reason);
          else if (req.acceptJson) res.status(404).send({ message: reason.message });
          else res.sendStatus(404);
        });
    });
  }
};
