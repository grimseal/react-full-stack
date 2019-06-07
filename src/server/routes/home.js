import HomeView from 'client/views/HomeView';

/**
 * @swagger
 * /:
 *  get:
 *    tags:
 *      - general
 *    summary: /
 *    description: Home route
 *    responses:
 *      200:
 *        content:
 *          text/html:
 *            schema:
 *              type: string
 *            example:
 *              $ref: '#/components/htmlTemplate'
 */
export default {
  path: '/',
  view: HomeView,
  local: true
};
