/**
 * Example for a use case that is currently set to pending
 */
useCase('Example Pending Use Case with Fluent DSL')
  .description('An optional but recommended description for the use case')
  .labels(['example-custom-label'])
  .pending('example pending use case')
  .describe(function () {

    scenario('just a sample scenario under construction')
      .it(function () {
        browser.get('/index.html');
        step('this code is not executed because use case is set pending');
      });

    scenario('another sample scenario under construction')
      .it(function () {
        browser.get('/index.html');
        step('this code is not executed because use case is set pending');
      });

  });
