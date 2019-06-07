import { MongoClient, ObjectID } from 'mongodb';
import config from 'config';
import fs from 'fs';
import path from 'path';
import equal from 'deep-equal';

const modelsDir = path.resolve(__dirname, '..', 'models');

// TODO cache models in redis

class Error {
  constructor(message) {
    this.message = message;
    this.notFound = true;
  }
}

/**
 * Database service
 */
class DbService {
  /** @type {MongoClient} */
  client;

  /** @type {Db} */
  db;

  constructor(host, port) {
    this.client = new MongoClient(`mongodb://${host}:${port}/`, { useNewUrlParser: true });
  }

  async init() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve();
        return;
      }
      this.client.connect().then(() => {
        this.db = this.client.db(config.mongodb.db);
        this.initModels().then(resolve, reject);
      });
    });
  }

  close() {
    return this.client.close();
  }

  /**
   * @param {Model} model
   * @return {Promise<Model>}
   */
  async save(model) {
    return new Promise((resolve, reject) => {
      const collection = this.db.collection(model.constructor.collectionName);
      const data = model.mappingData(false);

      if (data._id)
        collection
          .updateOne({ _id: data._id }, { $set: data })
          .then(() => resolve(model))
          .catch(reject);
      else
        collection
          .insertOne(data)
          .then(result => {
            // eslint-disable-next-line no-param-reassign
            model._id = result.insertedId;
            resolve(model);
          })
          .catch(reject);
    });
  }

  /**
   * @param {Model.} Model
   * @param {object} query
   * @return Promise<Model>}
   */
  async findOne(Model, query) {
    return new Promise((resolve, reject) => {
      this.db.collection(Model.collectionName).findOne(
        query,
        /**
         * @param {MongoError} error
         * @param {object} result
         */
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(new Model(result));
          else reject(new Error(`${Model.name} not exist`));
        }
      );
    });
  }

  /**
   * @param {Model.} Model
   * @param {object} query
   * @return Promise<Model[]>}
   */
  async findMany(Model, query) {
    return new Promise((resolve, reject) => {
      this.db.collection(Model.collectionName).find(
        query,
        /**
         * @param {MongoError} err
         * @param {Cursor} cursor
         */
        (err, cursor) => {
          if (err) reject(err);
          else {
            resolve(cursor.toArray().map(doc => new Model(doc)));
            cursor.close().catch(console.error);
          }
        }
      );
    });
  }

  /**
   * @private
   * @return {Promise<void>}
   */
  async initModels() {
    return new Promise((resolve, reject) => {
      fs.readdir(modelsDir, (err, files) => {
        if (err) {
          reject(err);
          return;
        }

        /** @type {Model.[]} */
        const models = files
          .filter(file => file.match(/\.js$/) !== null)
          // eslint-disable-next-line import/no-dynamic-require, global-require
          .map(file => require(path.join(modelsDir, file)).default)
          .filter(model => model.name !== 'Model');

        this.db.listCollections({}, { nameOnly: true }).toArray((error, collections) => {
          if (error != null) {
            reject(error);
            return;
          }
          const names = collections.map(collection => collection.name);
          const promises = models.map(model => this.updateCollection(model, names));
          Promise.all(promises).then(resolve, reject);
        });
      });
    });
  }

  /**
   * @private
   * @param {Model.} model
   * @param {string[]} collectionNames
   * @return {Promise<void>}
   */
  async updateCollection(model, collectionNames) {
    const name = model.collectionName;
    return new Promise((resolve, reject) => {
      if (collectionNames.includes(name)) {
        this.updateCollectionIndexes(model).then(resolve, reject);
      } else {
        this.db.createCollection(name, err => {
          if (err) reject(err);
          else this.updateCollectionIndexes(model).then(resolve, reject);
        });
      }
    });
  }

  /**
   * @private
   * @param {Model.} model
   * @return {Promise<void>}
   */
  async updateCollectionIndexes(model) {
    const name = model.collectionName;
    return new Promise((resolve, reject) => {
      this.db
        .collection(name)
        .indexInformation({ full: true })
        .then(indexInformation => {
          const promises = [];
          const modelIndexes = [...(model.indexes || [])];

          indexInformation
            .filter(index => index.name !== '_id_')
            .forEach(index => {
              const arrayIndex = modelIndexes.findIndex(modelIndex =>
                equal(index.key, modelIndex.key)
              );
              if (arrayIndex > -1) {
                const modelIndex = modelIndexes[arrayIndex];
                const options = { ...modelIndex.options };
                if (!Object.keys(options).some(key => index[key] !== options[key])) {
                  modelIndexes.splice(arrayIndex, 1);
                  return;
                }
              }
              promises.push(this.dropCollectionIndex(name, index));
            });

          modelIndexes.forEach(index => {
            promises.push(this.createCollectionIndex(name, index));
          });

          Promise.all(promises).then(resolve, reject);
        }, reject);
    });
  }

  /**
   * @private
   * @param {string} name
   * @param {object} index
   * @return {Promise<void>}
   */
  async dropCollectionIndex(name, index) {
    console.log(`Drop index ${JSON.stringify(index.key)} for collection '${name}'`);
    return new Promise((resolve, reject) => {
      this.db
        .collection(name)
        .dropIndex(index.name)
        .then(resolve, reject);
    });
  }

  /**
   * @private
   * @param {string} name
   * @param {object} index
   * @return {Promise<void>}
   */
  async createCollectionIndex(name, index) {
    console.log(`Create new index ${JSON.stringify(index)} for collection '${name}'`);
    const { key, options } = index;
    return new Promise((resolve, reject) => {
      this.db
        .collection(name)
        .createIndex(key, options)
        .then(resolve, reject);
    });
  }
}

const { host, port } = config.mongodb;
export default new DbService(host, port);
export { ObjectID, Error };
