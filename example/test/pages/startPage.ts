import {browser, by, element} from 'protractor';
import {stepAnnotation} from '../../../lib'; // use 'scenarioo-js' instead of '../../lib' in real project

export class StartPage {
  firstListItem = element(by.css('li#item_one'));
  secondListItem = element(by.css('li#item_two'));
  selectedItem = element(by.id('selected'));

  constructor() {
    browser.get('/index.html');
  }

  @stepAnnotation()
  clickFirstListItem() {
    return this.firstListItem.click();
  }

  /**
   * By default, the @stepAnnotation takes the Class Name followed by the method name as a description
   * (e.g. 'StartPage: clickSecondListItem').
   * This behaviour can be overwritten by providing a custom description as follows.
   */
  @stepAnnotation("Custom message for this step") // this will result in the description: 'Custom message for this step'
  clickSecondListItem() {
    return this.secondListItem.click();
  }

  assertSelected(expectedItem: string) {
    expect(this.selectedItem.getText()).toEqual(expectedItem);
  }


}
