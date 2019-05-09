import Settings from './settings.js';

class SchemaManager {
  constructor() {
    this.ajv = new Ajv({ loadSchema: this.loadSchema});
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
    const cachedSchema = this.ajv.getSchema(pattern);
    if (cachedSchema)
      return Promise.resolve(cachedSchema);

    if (Settings.getValidation() === 'none')
      return Promise.resolve(true);  // No validation -- return empty schema, which was always validate.

    console.log('Load Js2at schema for: ', pattern);
    const patternUrl = new URL(pattern);

    return fetch(patternUrl)
      .then((response) => {
        if (response.status !== 200)
          return Promise.reject('Status error ' + response.status + ' loading ' + patternUrl);
        return response;
      })
      .then((response) => response.json())
      .then((schemaData) => {
        this.ajv.addSchema(schemaData, pattern);
        return schemaData;
      });
  }

  hasPattern(pattern) {
    return this.preparedPatterns.has(pattern);
  }

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
      .then(() => {
        this.preparedPatterns.add(pattern);
      });
  }

  validate(schemaUrl, data) {
    return this.loadSchema(schemaUrl)
      .then(() => {
        const valid = this.ajv.validate(schemaUrl, data);
        if (!valid) {
          if (Settings.getValidation() == 'reject')
            return reject( { schemaErrors: validate.errors } );
          else
            console.error('Schema errors', validate.errors);
        }
      });
  }
}

export default new SchemaManager();

