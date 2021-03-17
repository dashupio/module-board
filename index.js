// require first
const { Module } = require('@dashup/module');

// import base
const BoardPage = require('./pages/board');
const ListBlock = require('./blocks/list');

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
    // register pages
    fn('page', BoardPage);

    // register blocks
    fn('block', ListBlock);
  }
}

// create new
module.exports = new BoardModule();
