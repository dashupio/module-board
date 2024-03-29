
// import page interface
import { Struct } from '@dashup/module';

/**
 * build address helper
 */
export default class ListBlock extends Struct {

  /**
   * returns page type
   */
  get type() {
    // return page type label
    return 'list';
  }

  /**
   * returns page type
   */
  get icon() {
    // return page type label
    return 'fad fa-th-list';
  }

  /**
   * returns page type
   */
  get title() {
    // return page type label
    return 'List';
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
      view   : 'block/list',
      config : 'block/list/config',
    };
  }

  /**
   * returns category list for page
   */
  get categories() {
    // return array of categories
    return ['phone', 'dashboard'];
  }

  /**
   * returns page descripton for list
   */
  get description() {
    // return description string
    return 'List of items';
  }
}