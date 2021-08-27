
// import page interface
import { Struct } from '@dashup/module';

/**
 * build address helper
 */
export default class BoardPage extends Struct {

  /**
   * returns page type
   */
  get type() {
    // return page type label
    return 'board';
  }

  /**
   * returns page type
   */
  get icon() {
    // return page type label
    return 'fad fa-columns text-info';
  }

  /**
   * returns page type
   */
  get title() {
    // return page type label
    return 'Board';
  }

  /**
   * returns page data
   */
  get data() {
    // return page data
    return {};
  }

  /**
   * returns object of views
   */
  get views() {
    // return object of views
    return {
      view   : 'page/board',
      config : 'page/board/config',
    };
  }

  /**
   * returns category list for page
   */
  get categories() {
    // return array of categories
    return ['View'];
  }

  /**
   * returns page descripton for list
   */
  get description() {
    // return description string
    return 'Board view with moveable columns and cards';
  }
}