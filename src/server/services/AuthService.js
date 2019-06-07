import client from 'server/common/redisClient';
import nanoid from 'nanoid';
import config from 'config';
import { ObjectID } from 'mongodb';

const key = `${config.redis.prefix}_remember_token:`;

class Token {
  constructor(id, userId) {
    this.id = id;
    this.userId = userId;
  }

  /** @private */
  static create(userId, callback) {
    const id = nanoid(32);
    client.set(key + id, userId, 'NX', 'PX', config.cookies.remember.cookie.maxAge, (err, res) => {
      if (err) callback(err);
      else callback(null, res === null ? null : new Token(id, userId));
    });
  }

  /** @private */
  static generateToken(userId, resolve, reject) {
    this.create(userId, (err, token) => {
      if (err) reject(err);
      else if (token) resolve(token);
      else this.generateToken(userId, reject, resolve);
    });
  }

  /**
   * @param {string} userId
   * @returns {Promise<Token>}
   */
  static async generate(userId) {
    return new Promise((resolve, reject) => {
      this.generateToken(userId, resolve, reject);
    });
  }

  /**
   * @param {string} id
   * @returns {Promise<Token>}
   */
  static async find(id) {
    return new Promise((resolve, reject) => {
      if (!/^[-_A-Za-z0-9]{32}$/.test(id)) {
        reject('token not valid');
        return;
      }
      client.get(key + id, (err, reply) => {
        if (err) reject(err);
        else if (!reply) reject('not exist');
        else resolve(new Token(id, reply));
      });
    });
  }

  remove() {
    return new Promise((resolve, reject) => {
      client.del(key + this.id, (err, reply) => {
        if (err) reject(err);
        else resolve(reply === 1);
      });
    });
  }
}

/** @class AuthService */
export default {
  consumeRememberMeToken(tokenId, next) {
    Token.find(tokenId).then(token => {
      const { userId } = token;
      // invalidate the single-use token
      token.remove().then(() => next(null, new ObjectID(userId)), next);
    }, next);
  },

  issueRememberMeToken(user, next) {
    Token.generate(user._id.toString()).then(token => next(null, token.id), next);
  },

  removeRememberMeToken(tokenId, next) {
    client.del(key + tokenId, (err, reply) => {
      if (err) next(err);
      else next(null, reply === 1);
    });
  }
};
