import { Router } from "express";

export default class CustomRouter {
  constructor() {
    this.router = Router();
    this.init();
  }

  getRouter() {
    return this.router;
  }

  init() {} // Para ser extendido en clases heredadas.

  get(path, middlewares, ...callbacks) {
    this.router.get(path, ...middlewares, this.applyCallbacks(callbacks));
  }

  post(path, middlewares, ...callbacks) {
    this.router.post(path, ...middlewares, this.applyCallbacks(callbacks));
  }

  put(path, middlewares, ...callbacks) {
    this.router.put(path, ...middlewares, this.applyCallbacks(callbacks));
  }

  delete(path, middlewares, ...callbacks) {
    this.router.delete(path, ...middlewares, this.applyCallbacks(callbacks));
  }

  applyCallbacks(callbacks) {
    return callbacks.map((callback) => async (...params) => {
      try {
        await callback.apply(this, params);
      } catch (error) {
        console.log(error);
        params[1].status(500).send({ status: "Error", error });
      }
    });
  }
}
