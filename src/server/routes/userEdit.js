import UserEditView from 'client/views/user/UserEditView';
import UserController from 'server/controllers/UserController';
import validator from 'validator';

/**
 * @swagger
 * /user/{username}/edit:
 *  get:
 *    tags:
 *      - user
 *    security:
 *      - session: []
 *    summary: /user/username/edit
 *    description: User profile edit view
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
  path: '/user/:username/edit',
  view: UserEditView,
  authorized: true,
  csrf: true,
  handlers(route) {
    route.all((req, res, next) => {
      const redirectUrl = `/user/${req.params.username}`;
      if (req.isAuthenticated() && req.user.username === req.params.username) next();
      else if (req.acceptJson) res.status(403).send({ redirect: redirectUrl });
      else res.redirect(302, redirectUrl);
    });

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

    route.post((req, res, next) => {
      const name = validator.trim(req.body.name);
      const username = validator.trim(req.body.username);
      const email = validator.trim(req.body.email);

      UserController.userEdit(req.user, { name, username, email })
        .then(user => {
          req.user = user;
          const userMapped = user.mappingData();
          res.user = userMapped;
          res.data.user = userMapped;
          if (req.params.username !== res.user.username)
            res.redirectUrl = `${userMapped.link}/edit`;
          next();
        })
        .catch(error => {
          if (!UserController.inputErrors.includes(error.message)) next(error);
          else {
            res.status(400);
            if (req.acceptJson) res.send({ error });
            else {
              res.data = { error, name, username, email };
              next();
            }
          }
        });
    });
  }
};
