'use strict';

var
    Q = require('q');

function registerMockGlobals() {

    // define our mock jasmine object that contains dummy scenarioo environment (state about current useCases/scenarios)
    global.jasmine = {
        scoEnv: {
            currentUseCase: {
                description: 'UseCaseDescription'
            },
            currentScenario: {
                description: 'ScenarioDescription'
            }
        }
    };

    global.browser = {
        getCurrentUrl: function () {
            var deferred = Q.defer();
            deferred.resolve('http://example.url.com/#/somepage');
            return deferred.promise;
        },
        takeScreenshot: function () {
            var deferred = Q.defer();
            deferred.resolve('dummyImageDate');
            return deferred.promise;
        }
    };

    global.by = {
        css: function () {
        }
    };

    global.element = function () {
        return {
            getOuterHtml: function () {
                var outerHtmlDeferred = Q.defer();
                outerHtmlDeferred.resolve('<html></html>');
                return outerHtmlDeferred.promise;
            }
        };
    };
}

module.exports = {
    registerMockGlobals: registerMockGlobals
};