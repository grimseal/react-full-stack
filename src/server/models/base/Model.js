import camelcase from 'camelcase';
import db, { ObjectID } from 'server/services/DbService';

/**
 * @class Model
 * @template T
 */
export default class Model {
  /** @type {boolean} */
  static cached = false;

  /**
   * @name {T}#id
   * @type {(number|ObjectID)}
   */
  get id() {
    return this._id;
  }

  /**
   * @name Model.schema
   */
  static schema = {
    /**
     * @private
     * @readonly
     * @name Model#_id
     * @type {ObjectID}
     */
    _id: {
      type: ObjectID,
      validate(value) {
        return ObjectID.isValid(value);
      }
    }
  };

  /**
   * Additional indexes for mongodb (_id not managed)
   * @type {{key:object, [options]:object}[]}
   */
  static indexes = [];

  /**
   * @const
   * @return {string} */
  static get collectionName() {
    return camelcase(this.name);
  }

  constructor(args) {
    const data = args || {};
    const { schema } = this.constructor;
    Object.keys(schema).forEach(key => {
      // TODO check how comes to constructor objects in args. like Array, Data etc.
      this[key] = data[key] || schema[key].default || null;
    });
  }

  /**
   * Equality check by model id
   * @param {(T|Model)} model
   * @returns {boolean}
   */
  equals(model) {
    if (!(model instanceof this.constructor)) return false;
    if (this === model) return true;
    switch (this.constructor.schema._id.type) {
      case ObjectID:
        return this._id.equals(model._id);
      case String:
      case Number:
        return this._id === model._id;
      default:
        return false;
    }
  }

  /**
   * Set fields to the model
   * WARNING: Method don't validate fields.
   *          So don't forget to validate fields by {@link getValidFieldValues}
   * @param {object} fields
   * @return {T}
   */
  setFields(fields) {
    Object.keys(fields).forEach(key => {
      this[key] = fields[key];
    });
    return this;
  }

  /**
   * Mapping data
   * @param {boolean} [client]
   * @return {object}
   */
  mappingData(client = true) {
    const result = {};
    if (client)
      Object.keys(this.constructor.schema).forEach(key => {
        if (!this.constructor.schema[key].hidden) result[key] = this[key];
      });
    else
      Object.keys(this.constructor.schema).forEach(key => {
        result[key] = this[key];
      });
    return result;
  }

  /**
   * Parse object and return valid fields
   * @param {object} data
   * @return {object}
   */
  static getValidFieldValues(data) {
    const result = {};
    const { schema } = this;
    Object.keys(schema).forEach(key => {
      const field = schema[key];
      if (!Object.prototype.hasOwnProperty.call(data, key)) {
        if (field.default) result[key] = field.default;
      } else if (Model.validateField(data[key], field)) {
        result[key] = data[key];
      }
    });
    return result;
  }

  static getFieldValuesByKeys(data, keys) {
    const result = {};
    keys.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(data, key)) result[key] = data[key];
    });
    return result;
  }

  static getValidFieldValuesByKeys(data, keys) {
    return this.getValidFieldValues(this.getFieldValuesByKeys(data, keys));
  }

  /**
   * @param id
   * @return {boolean}
   */
  static idIsValid(id) {
    return this.schema._id.validate(id);
  }

  /**
   * @param {string|object} field
   * @param [value]
   * @return {boolean}
   */
  static isValidField(field, value) {
    if (typeof field === 'string') {
      if (!Object.prototype.hasOwnProperty.call(this.schema, field)) return false;
      return this.validateField(value, this.schema[field]);
    }
    const key = Object.keys(field)[0];
    if (!Object.prototype.hasOwnProperty.call(this.schema, key)) return false;
    return this.validateField(field[key], this.schema[key]);
  }

  /**
   * Validate field
   * @private
   * @return {boolean}
   * */
  static validateField(value, schemaField) {
    if (!this.validateType(value, schemaField)) return false;
    if (!schemaField.validate) return true;
    switch (schemaField.validate.constructor) {
      case RegExp:
        return schemaField.validate.test(value);
      case Function:
        return schemaField.validate(value);
      default:
        throw new Error('Need to implement new validation handler');
    }
  }

  /**
   * Validate field type
   * @private
   * @return {boolean}
   * */
  static validateType(value, schemaField) {
    switch (schemaField.type) {
      case String:
        return typeof value === 'string';
      case Number:
        return typeof value === 'number';
      case ObjectID:
        return value instanceof ObjectID && ObjectID.isValid(value);
      default:
        // TODO Model.validateType implement other types
        throw new Error('Need to implement new validation handler');
    }
  }

  // DATABASE METHODS

  /**
   * @returns {Promise<T>}
   */
  async save() {
    return db.save(this);
  }

  /**
   * @returns {Promise<boolean>}
   */
  async remove() {
    // TODO implement Model.remove()
    return new Promise((resolve, reject) => {
      const err = new Error(
        `Can't remove ${this.id} from collection '${
          this.constructor.collectionName
        }'. Need to implement Model.remove()`
      );
      reject(err);
    });
  }

  /**
   * @param {ObjectID|number|string} id
   * @returns {Promise<T>}
   */
  static async getById(id) {
    if (this.schema._id.type === ObjectID && !(id instanceof ObjectID)) {
      return db.findOne(this, { _id: new ObjectID(id) });
    }
    return db.findOne(this, { _id: id });
  }

  /**
   * @param {object} query
   * @returns {Promise<T>}
   */
  static async findOne(query) {
    return db.findOne(this, query);
  }

  /**
   * @param {object} query
   * @returns {Promise<T[]>}
   */
  static async findMany(query) {
    return db.findMany(this.name, query);
  }
}
