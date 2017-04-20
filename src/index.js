import scenarioo from './scenarioo-js';
import * as fluentDsl from './dsl/fluentDsl';

// also expose the fluent dsl functions on `scenarioo` by default
// for working nicely with typescript typings
// and to be able to import it nicely from this library root.
scenarioo.useCase = fluentDsl.useCase;
scenarioo.scenario = fluentDsl.scenario;
scenarioo.step = fluentDsl.step;
scenarioo.fluentDslConfig = fluentDsl.config;

// to support both module systems
export default scenarioo;
if (typeof module === 'object' && module.exports) {
  module.exports = scenarioo;
}

