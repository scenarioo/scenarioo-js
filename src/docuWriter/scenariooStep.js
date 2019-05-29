import scenarioo from '../scenarioo';

function scenariooStep(description) {
  return function(target, propertyKey, descriptor) {

    const originalMethod = descriptor.value;

    descriptor.value = function(...args) {

      const stepDescription = description || `${target.constructor.name}: ${propertyKey}`;

      scenarioo.saveStep(stepDescription);

      const result = originalMethod.apply(this, args);

      return result;
    };

    return descriptor;
  };
}

export default scenariooStep;
