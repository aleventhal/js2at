import Settings from './settings.js';

class SchemaManager {
  constructor() {
    this.ajv = new Ajv({ loadSchema: (schemaUrl) => this.loadSchema(schemaUrl) });
    this.preparedPatterns = new Set();
  }

  isTrustedPatternUrl(patternUrl) {
    switch (Settings.getApiFilter()) {
      case 'community':
        if (patternUrl.hostname === 'raw.githack.com' &&
          patternUrl.pathname.startsWith('/aleventhal/js2at/master/schema/'))
          return true;
      // Fall through.
      case 'strict':
        if (patternUrl.hostName === 'w3.org' &&
          patternUrl.pathName.startsWith('/js2at/'))
          return true;
        break;
      default: // Experimental schemas allowed.
        return true;
    }
  }

  // Return a promise for successful schema loading and compilation.
  loadSchema(pattern) {
    if (Settings.getUseLocalSchemas())
      pattern = pattern.replace('https://raw.githack.com/aleventhal/js2at/master/', 'http://localhost:8000/');
    const patternUrl = new URL(pattern);

    const cachedSchema = this.ajv.getSchema(pattern);
    if (cachedSchema)
      return Promise.resolve(cachedSchema);

    console.log('Load Js2at schema for: ', pattern);
    function fetchIt() {
      if (Settings.getValidation() === 'none') {
        // No validation -- return empty schema, which was always validate.
        return Promise.resolve(true);
      }
      return fetch(patternUrl)
        .then((response) => {
          if (response.status !== 200)
            return Promise.reject('Status error ' + response.status + ' loading ' + patternUrl);
          return response;
        })
        .then((response) => response.json());
    }

    return fetchIt()
      .then((schemaData) => {
        this.ajv.addSchema(schemaData, pattern);
        return schemaData;
      });
  }

  hasPattern(pattern) {
    return this.preparedPatterns.has(pattern);
  }

  // Pre-compile the pattern, recursively loading and compiling sub-schemas.
  preparePattern(pattern) {
    if (this.hasPattern(pattern))
      return Promise.resolve();

    // May not be desirable to notify AT that the page attempted to use an
    // illegal schema url, just log to console. TODO revisit this.
    const patternUrl = new URL(pattern);
    if (patternUrl.protocol !== 'http:' && patternUrl.protocol !== 'https:')
      return Promise.reject( 'Page attempted to observe a schema url that did not begin with http: or https:' );
    if (patternUrl.hash)
      return Promise.reject( 'Page attempted to observe a schema url that contained a # hash' );
    if (patternUrl.search)
      return Promise.reject( 'Page attempted to observe a schema url that contained a ? query string' );
    if (!patternUrl.pathname.endsWith('.json'))
      return Promise.reject( 'Page attempted to observe a schema url that did not end with .json' );
    if (patternUrl.pathname.includes('/ref/'))
      return Promise.reject( 'Page attempted to observe a schema url that should only be used as a referenced subschema via $ref' );

    if (!this.isTrustedPatternUrl(patternUrl))
      return Promise.reject( 'Page attempted to observe an untrusted schema url' );

    return this.loadSchema(pattern)
      .then((schemaData) => {
        this.preparedPatterns.add(pattern);
        console.assert(pattern == schemaData['$id'], 'The $id property for a top-level pattern must be the same as the schema url:\n' + pattern + ' !=\n' + schemaData['$id']);
        return this.ajv.compileAsync(schemaData);
      });
  }

  validate(schemaUrl, data) {
    return this.loadSchema(schemaUrl)
      .then(() => {
        const validationResult = this.ajv.validate(schemaUrl, data);
        if (!validationResult) {
          if (Settings.getValidation() == 'reject')
            return Promise.reject( { schemaErrors: this.ajv.errors } );
          else
            console.error('Schema errors', this.ajv.errors);
        }
      });
  }
}

export default new SchemaManager();

