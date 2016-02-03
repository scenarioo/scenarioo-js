var scenarioo = require('../../lib/scenarioo-js');

function useCase(name) {
  var description, labels;

  return {
    description: function (d) {
      description = d;
      return this;
    },
    labels: function (l) {
      labels = l;
      return this;
    },
    has: function (cb) {
      describe(name, function () {
        beforeAll(function () {
          scenarioo.getUseCaseContext().setDescription(description);
          scenarioo.getUseCaseContext().addLabels(labels);
        });
        return cb();
      });
    }
  };
}

function scenario(name) {
  var description, labels;

  return {
    description: function (d) {
      description = d;
      return this;
    },
    labels: function (l) {
      labels = l;
      return this;
    },
    has: function (cb) {
      it(name, function () {
        scenarioo.getScenarioContext().setDescription(description);
        scenarioo.getScenarioContext().addLabels(labels);
        return cb();
      });
    }
  };
}


global.useCase = useCase;
global.scenario = scenario;
