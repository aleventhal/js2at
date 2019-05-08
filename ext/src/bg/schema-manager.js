import Settings from './settings.js';

class SchemaManager {
  constructor() {
    this.ajv = new Ajv();
    this.cachedSchemas = {};
  }

  isAcceptableSchemaUrl(schemaUrl) {
    switch (Settings.getApiFilter()) {
      case 'community':
        if (schemaUrl.hostname === 'raw.githack.com' &&
          schemaUrl.pathname.startsWith('/aleventhal/js2at/master/schema/'))
          return true;
      // Fall through.
      case 'strict':
        if (schemaUrl.hostName === 'w3.org' &&
          schemaUrl.pathName.startsWith('/js2at/'))
          return true;
        break;
      default: // Experimental schemas allowed.
        return true;
    }
  }

  // Return a promise for successful schema loading and compilation.
  loadSchema(pattern) {
    if (Settings.getValidation() === 'none')
      return Promise.resolve();  // No validation -- don't even need to load it.

    let compiledSchema = this.cachedSchemas[pattern];
    if (compiledSchema)
      return Promise.resolve(compiledSchema);  // Already processed this schema.

    console.log('Load Js2at schema for: ', pattern);
    const schemaUrl = new URL(pattern);
    // May not be desirable to notify AT that the page attempted to use an
    // illegal schema url, just log to console. TODO revisit this.
    if (!this.isAcceptableSchemaUrl(schemaUrl))
      return Promise.reject( 'The following untrusted Js2at schema url has been rejected: ' + schemaUrl );

    return fetch(schemaUrl)
      .then((response) => {
        if (response.status !== 200)
          return Promise.reject('Status error ' + response.status + ' loading ' + schemaUrl);
        return response;
      })
      .then((response) => response.json())
      .then((schemaObj) => this.compileSchema(pattern, schemaObj));
  }

  hasSchema(pattern) {
    return Boolean(this.cachedSchemas[pattern]);
  }

  compileSchema(pattern, schemaObj) {
    const compiledSchema = this.ajv.compile(schemaObj);
    this.cachedSchemas[pattern] = compiledSchema;
    return compiledSchema;
  }

  validateUsingCompiledSchema(compiledSchema, data) {
    const valid = compiledSchema(data);
    if (!valid) {
      console.error('Schema errors', compiledSchema.errors);
      if (Settings.getValidation() == 'reject')
        return Promise.reject( { schemaErrors: compiledSchema.errors } );
    }
    return Promise.resolve();
  }

  validateUsingSchemaUrl(schemaUrl, data) {
    if (Settings.getValidation() === 'none')
      return Promise.resolve();  // No validation -- don't need to load schema.

    return this.loadSchema(schemaUrl)
      .then((compiledSchema) => {
        return this.validateUsingCompiledSchema(compiledSchema, data);
      });
  }
}

export default new SchemaManager();

