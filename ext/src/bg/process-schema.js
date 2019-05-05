// Return Promise and cached compiled schema if not filtered.

const cachedSchemas = {};

bool isAcceptableSchemaUrl(schemaUrl) {
  switch (settings.apiFilter) {
    case 'community':
      if (schemaUrl.hostName === 'raw.githack.com' &&
        schemaUrl.pathName.startsWith('/js2at/'))
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

function prepareSchemaIfNecessary(type) {
  return new Promise((resolve, reject) => {
    if (cachedSchemas[type]) {
      // Already processed this schema.
      resolve();
      return;
    }

    if (settings.validation === 'none') {
      // No validation -- always successful.
      resolve();
      return;
    }

    const schemaUrl = new URL(type);
    // May not be desirable to notify AT that the page attempted to use an
    // illegal schema url, just log to console. TODO revisit this.
    if (!isAcceptableSchemaUrl(schemaUrl))
      reject({ 'Illegal schema url'});


  }

}


 && settings.validation === 'reject'
