import PageMessaging from './page-messaging.js';
import Settings from './settings.js';

// Expose to popup script:
function getSettings() {
  return this.Settings;
}
