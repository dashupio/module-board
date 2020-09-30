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
   * Register all page interfaces here
   * 
   * ```
   * // register connect class
   * register(Page);
   * ```
   * 
   * Class `Page` should extend `require('@dashup/module').Page`
   * 
   * @param {Function} register 
   */
  pages(register) {
    // register sms action
    register(BoardPage);
  }
}

// create new
module.exports = new BoardModule();
