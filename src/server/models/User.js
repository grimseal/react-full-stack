import validator from 'validator';
import Model from './base/Model';

/** @extends {Model<User>} */
export default class User extends Model {
  /** @type {boolean} */
  static cached = true;

  /**
   * @lends User#
   */
  static schema = {
    ...Model.schema,

    /** @type {string} */
    name: {
      type: String,
      validate(value) {
        return validator.isByteLength(validator.trim(value), { min: 0, max: 128 });
      }
    },

    /** @type {string} */
    email: {
      type: String,
      validate(value) {
        return validator.isEmail(value);
      }
    },

    /** @type {string} */
    username: {
      type: String,
      validate(value) {
        return (
          /^[-0-9a-zA-Z]{3,128}$/.test(value) &&
          !/^-/.test(value) &&
          !/--/.test(value) &&
          !/-$/.test(value)
        );
      }
    },

    // TODO store password hash
    /** @type {string} */
    password: {
      type: String,
      hidden: true,
      validate(value) {
        return validator.isByteLength(value, { min: 1, max: 128 });
      }
    }
  };

  static indexes = [{ key: { username: 1 }, options: { unique: true } }];

  /**
   * @param {string} string
   * @return {boolean}
   */
  verifyPassword(string) {
    return this.password === string;
  }

  /**
   * @param {boolean} [client]
   * @return {object}
   */
  mappingData(client = true) {
    if (client) return { ...super.mappingData(), link: `/user/${this.username}` };
    return super.mappingData(false);
  }
}

/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      nullable: true
 *      properties:
 *        _id:
 *          type: string
 *        name:
 *         type: string
 *        email:
 *         type: string
 *        username:
 *         type: string
 *        link:
 *         type: string
 *      default: null
 *      example:
 *        _id: 5ce1a74101a2ddf82dd47ba4
 *        name: Admin
 *        email: admin@reactfullstack.com
 *        username: admin
 *        link: /user/admin
 */
