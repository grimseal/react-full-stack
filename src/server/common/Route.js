import { check, validationResult } from 'express-validator/check';

const ALL = 0;
const GET = 1;
const POST = 2;

class MethodHandlerPair {
  /** @type {number} */
  method;

  /** @type {function} */
  fn;

  constructor(method, fn) {
    this.method = method;
    this.fn = fn;
  }
}

export default class Route {
  /** @type {MethodHandlerPair[]} */
  handlers = [];

  constructor(options) {
    this.path = options.path;
    this.view = options.view || null;
    this.local = options.local || false;
    this.authorized = options.authorized;
    this.csrf = options.csrf || false;
    this.validation = options.validation || [];
  }

  static get check() {
    return check;
  }

  static validationResult(req, res, next) {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (errors.isEmpty()) next();
    else next('validation error');
  }

  all(...handler) {
    this.handlers.push(...handler.map(fn => new MethodHandlerPair(ALL, fn)));
    return this;
  }

  get(...handler) {
    this.handlers.push(...handler.map(fn => new MethodHandlerPair(GET, fn)));
    return this;
  }

  post(...handler) {
    const result = [];
    if (this.validation.length > 0) {
      result.push(this.validation);
      result.push(Route.validationResult);
    }
    result.push(...handler);
    this.handlers.push(...result.map(fn => new MethodHandlerPair(POST, fn)));
    return this;
  }

  postValidated(validation, ...handler) {
    const result = [];
    if (validation && validation.length > 0) {
      result.push(validation);
      result.push(Route.validationResult);
    }
    result.push(...handler);
    this.handlers.push(...result.map(fn => new MethodHandlerPair(POST, fn)));
    return this;
  }

  /** @param app Express application */
  apply(app) {
    const route = app.route(this.path);
    this.handlers.forEach(h => {
      if (h.method === ALL) route.all(h.fn);
      else if (h.method === GET) route.get(h.fn);
      else if (h.method === POST) route.post(h.fn);
    });
  }
}
