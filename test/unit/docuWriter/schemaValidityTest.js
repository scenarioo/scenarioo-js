import fs from 'fs';
import assert from 'assert';
import path from 'path';
import { validateMultiple } from 'tv4';
import map from 'lodash/map';
import filter from 'lodash/filter';
import merge from 'lodash/merge';
import { loadSchemas } from '../../../src/docuWriter/entityValidator';

/**
 * This test validates our own json schemas in src/docuWriter/validationSchemas.
 * Since it is quite easy to introduce errors that render a json schema useless, it is good practice to validate
 * the validation schemas with the meta-schema (http://json-schema.org/schema)
 */
describe('schemaValidityTest', () => {

  const metaSchema = JSON.parse(fs.readFileSync(path.resolve(__dirname, './jsonMetaSchema.json')));

  it('schema validity', () => {
    const allSchemas = loadSchemas();
    const results = map(allSchemas, (schema, schemaName) => merge(validateMultiple(schema, metaSchema), {schemaName}));
    const failing = filter(results, result => !result.valid);
    assert.equal(failing.length, 0, failing.map(result => console.dir(result)));
  });

});
