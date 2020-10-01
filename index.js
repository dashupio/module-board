// require first
const { Module } = require('@dashup/module');

// import base
const BoardPage = require('./pages/board');

/**
 * export module
 */
class BoardModule extends Module {

  /**
   * construct discord module
   */
  constructor() {
    // run super
    super();
  }
  
  /**
   * registers dashup structs
   *
   * @param {*} register 
   */
  register(fn) {
    // register sms action
    fn('page', BoardPage);
  }
}

// create new
module.exports = new BoardModule();
