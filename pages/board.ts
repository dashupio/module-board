
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
    return 'fa fa-columns';
  }

  /**
   * returns page type
   */
  get title() {
    // return page type label
    return 'Board Page';
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
      view   : 'page/board/view',
      menu   : 'page/board/menu',
      config : 'page/board/config',
    };
  }

  /**
   * returns category list for page
   */
  get categories() {
    // return array of categories
    return ['frontend'];
  }

  /**
   * returns page descripton for list
   */
  get description() {
    // return description string
    return 'Kanban board view';
  }
}