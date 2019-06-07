import User from 'server/models/User';

const usernameIsNotValid = 'Username is not valid';
const someParamNotValid = 'Some params is not valid';

/*
async function findUserByIdOrUsername(identifier) {
  return new Promise((resolve, reject) => {
    const isId = User.isValidField({ _id: identifier });
    const isName = User.isValidField({ username: identifier });
    let query = null;
    if (isId && isName) query = { $or: [{ _id: identifier }, { username: identifier }] };
    else if (isId) query = { _id: identifier };
    else if (isName) query = { username: identifier };
    if (query) User.findOne(query).then(resolve, reject);
    else reject(new Error(usernameIsNotValid));
  });
}
*/

/** @class UserController */
const UserController = {
  inputErrors: [usernameIsNotValid, someParamNotValid, `${User.name} not exist`],

  /**
   * @param {string} username
   * @return {Promise<object>}
   */
  user(username) {
    return new Promise((resolve, reject) => {
      if (!User.isValidField({ username })) reject(new Error(usernameIsNotValid));
      else User.findOne({ username }).then(resolve, reject);
    });
  },

  /**
   * @param {User} user
   * @param {object} params
   * @return {Promise<object>}
   */
  userEdit(user, params) {
    return new Promise((resolve, reject) => {
      const { name, username, email } = params;

      const error = { params: {} };
      if (!User.isValidField({ name })) {
        error.params.name = 'Name not valid';
      }
      if (!User.isValidField({ username })) {
        error.params.username = 'Username not valid';
      }
      if (!User.isValidField({ email })) {
        error.params.email = 'Email not valid';
      }

      if (Object.keys(error.params).length) {
        error.message = someParamNotValid;
        reject(error);
        return;
      }

      new User(user.mappingData(false))
        .setFields({ name, username, email })
        .save()
        .then(resolve, reason => {
          // E11000 duplicate key error collection
          if (reason && reason.code === 11000) {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({
              message: someParamNotValid,
              params: { username: 'Username is exist' }
            });
          } else reject(error);
        });
    });
  }
};

export default UserController;
