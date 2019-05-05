// Return Promise and cached compiled schema if not filtered.

const cachedSchemas = {};
let ajv;

function isAcceptableSchemaUrl(schemaUrl) {
  switch (settings.apiFilter) {
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
// TODO clean up and test rejections.
function loadSchema(type) {
  if (settings.validation === 'none')
    return Promise.resolve();  // No validation -- don't even need to load it.

  let compiledSchema = cachedSchemas[type];
  if (compiledSchema)
    return Promise.resolve(compiledSchema);  // Already processed this schema.

  console.log('Load Js2at schema for: ', type);
  const schemaUrl = new URL(type);
  // May not be desirable to notify AT that the page attempted to use an
  // illegal schema url, just log to console. TODO revisit this.
  if (!isAcceptableSchemaUrl(schemaUrl))
    return Promise.reject( 'The following untrusted Js2at schema url has been rejected: ' + schemaUrl );

  return new Promise((resolve, reject) => {
    fetch(schemaUrl)
      .then((response) => {
        if (response.status !== 200) {
          reject('Status error ' + response.status + ' loading ' + schemaUrl);
          return;
        }

        // Examine the text in the response
        response.json().then(function(schema) {
          ajv = ajv || new Ajv();
          compiledSchema = ajv.compile(schema);
          cachedSchemas[type] = compiledSchema;
          return compiledSchema;
        });
      })
      .catch(reject);  // TODO is this necessary? Return Promise.reject() ?
  });
}

// If rejected returns
function validate(type, data) {
  if (settings.validation === 'none')
    return Promise.resolve();  // No validation -- don't need to load schema.

  return loadSchema(type)
    .then((compiledSchema) => {
      valid = compiledSchema(data);
      if (!valid) {
        console.error('Schema errors', compiledSchema.errors);
        if (settings.validation == 'reject')
          return Promise.reject( { schemaErrors: compiledSchema.errors } );
      }
    });
}
