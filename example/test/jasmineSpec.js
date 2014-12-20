var scenarioo = require('../../lib/scenarioo-js');


describe('Example UseCase', function () {


  it('Example Scenario', function () {


  });


});


// do this in jasmine reporter: reportSuiteResults
scenarioo.docuWriter.saveUseCase({
  name: 'Example UseCase',
  description: 'use case description',
  status: 'success', // or "failed"
  labels: ['labelUcOne', 'labelUcTwo']
});


// do this in jasmine reporter:  reportSpecResults
scenarioo.docuWriter.saveScenario('Example UseCase', {
  name: 'Example Scenario',
  description: 'scenario description',
  status: 'success', // or "failed"
  labels: ['labelScOne', 'labelScTwo']
});