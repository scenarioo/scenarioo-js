import {browser, by, element} from 'protractor';
import {reportStep} from '../../../lib'; // use 'scenarioo-js' instead of '../../lib' in real project

export class StartPage {
  private firstListItem = element(by.css('li#item_one'));
  private secondListItem = element(by.css('li#item_two'));
  private selectedItem = element(by.id('selected'));
  private header = element(by.id('header'));

  async goTo() {
    await browser.get('/index.html');
  }

  @reportStep()
  public async selectFirstListItem() {
    return this.firstListItem.click();
  }

  /**
   * By default, the @reportStep takes the Class Name followed by the method name as a description
   * (e.g. 'StartPage: selectSecondListItem').
   * This behaviour can be overwritten by providing a custom description as follows.
   */
  @reportStep('Custom message for this step') // this will result in the description: 'Custom message for this step'
  public async clickSecondListItem() {
    return this.secondListItem.click();
  }

  public async assertSelected(expectedItem: string) {
    await expect(this.selectedItem.getText()).toEqual(expectedItem);
  }

  @reportStep('a step with labels', {labels: ['step-label-example']})
  public async assertHeaderShown() {
    await expect(this.header.isDisplayed()).toBeTruthy();
  }

}
