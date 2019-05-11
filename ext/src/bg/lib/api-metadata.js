export default {
  "alarms": {
    "clear": {
      "minArgs": 0,
      "maxArgs": 1
    },
    "clearAll": {
      "minArgs": 0,
      "maxArgs": 0
    },
    "get": {
      "minArgs": 0,
      "maxArgs": 1
    },
    "getAll": {
      "minArgs": 0,
      "maxArgs": 0
    }
  },
  "bookmarks": {
    "create": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "get": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "getChildren": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "getRecent": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "getSubTree": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "getTree": {
      "minArgs": 0,
      "maxArgs": 0
    },
    "move": {
      "minArgs": 2,
      "maxArgs": 2
    },
    "remove": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "removeTree": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "search": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "update": {
      "minArgs": 2,
      "maxArgs": 2
    }
  },
  "browserAction": {
    "disable": {
      "minArgs": 0,
      "maxArgs": 1,
      "fallbackToNoCallback": true
    },
    "enable": {
      "minArgs": 0,
      "maxArgs": 1,
      "fallbackToNoCallback": true
    },
    "getBadgeBackgroundColor": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "getBadgeText": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "getPopup": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "getTitle": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "openPopup": {
      "minArgs": 0,
      "maxArgs": 0
    },
    "setBadgeBackgroundColor": {
      "minArgs": 1,
      "maxArgs": 1,
      "fallbackToNoCallback": true
    },
    "setBadgeText": {
      "minArgs": 1,
      "maxArgs": 1,
      "fallbackToNoCallback": true
    },
    "setIcon": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "setPopup": {
      "minArgs": 1,
      "maxArgs": 1,
      "fallbackToNoCallback": true
    },
    "setTitle": {
      "minArgs": 1,
      "maxArgs": 1,
      "fallbackToNoCallback": true
    }
  },
  "browsingData": {
    "remove": {
      "minArgs": 2,
      "maxArgs": 2
    },
    "removeCache": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "removeCookies": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "removeDownloads": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "removeFormData": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "removeHistory": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "removeLocalStorage": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "removePasswords": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "removePluginData": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "settings": {
      "minArgs": 0,
      "maxArgs": 0
    }
  },
  "commands": {
    "getAll": {
      "minArgs": 0,
      "maxArgs": 0
    }
  },
  "contextMenus": {
    "remove": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "removeAll": {
      "minArgs": 0,
      "maxArgs": 0
    },
    "update": {
      "minArgs": 2,
      "maxArgs": 2
    }
  },
  "cookies": {
    "get": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "getAll": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "getAllCookieStores": {
      "minArgs": 0,
      "maxArgs": 0
    },
    "remove": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "set": {
      "minArgs": 1,
      "maxArgs": 1
    }
  },
  "devtools": {
    "inspectedWindow": {
      "eval": {
        "minArgs": 1,
        "maxArgs": 2,
        "singleCallbackArg": false
      }
    },
    "panels": {
      "create": {
        "minArgs": 3,
        "maxArgs": 3,
        "singleCallbackArg": true
      }
    }
  },
  "downloads": {
    "cancel": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "download": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "erase": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "getFileIcon": {
      "minArgs": 1,
      "maxArgs": 2
    },
    "open": {
      "minArgs": 1,
      "maxArgs": 1,
      "fallbackToNoCallback": true
    },
    "pause": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "removeFile": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "resume": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "search": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "show": {
      "minArgs": 1,
      "maxArgs": 1,
      "fallbackToNoCallback": true
    }
  },
  "extension": {
    "isAllowedFileSchemeAccess": {
      "minArgs": 0,
      "maxArgs": 0
    },
    "isAllowedIncognitoAccess": {
      "minArgs": 0,
      "maxArgs": 0
    }
  },
  "history": {
    "addUrl": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "deleteAll": {
      "minArgs": 0,
      "maxArgs": 0
    },
    "deleteRange": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "deleteUrl": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "getVisits": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "search": {
      "minArgs": 1,
      "maxArgs": 1
    }
  },
  "i18n": {
    "detectLanguage": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "getAcceptLanguages": {
      "minArgs": 0,
      "maxArgs": 0
    }
  },
  "identity": {
    "launchWebAuthFlow": {
      "minArgs": 1,
      "maxArgs": 1
    }
  },
  "idle": {
    "queryState": {
      "minArgs": 1,
      "maxArgs": 1
    }
  },
  "management": {
    "get": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "getAll": {
      "minArgs": 0,
      "maxArgs": 0
    },
    "getSelf": {
      "minArgs": 0,
      "maxArgs": 0
    },
    "setEnabled": {
      "minArgs": 2,
      "maxArgs": 2
    },
    "uninstallSelf": {
      "minArgs": 0,
      "maxArgs": 1
    }
  },
  "notifications": {
    "clear": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "create": {
      "minArgs": 1,
      "maxArgs": 2
    },
    "getAll": {
      "minArgs": 0,
      "maxArgs": 0
    },
    "getPermissionLevel": {
      "minArgs": 0,
      "maxArgs": 0
    },
    "update": {
      "minArgs": 2,
      "maxArgs": 2
    }
  },
  "pageAction": {
    "getPopup": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "getTitle": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "hide": {
      "minArgs": 1,
      "maxArgs": 1,
      "fallbackToNoCallback": true
    },
    "setIcon": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "setPopup": {
      "minArgs": 1,
      "maxArgs": 1,
      "fallbackToNoCallback": true
    },
    "setTitle": {
      "minArgs": 1,
      "maxArgs": 1,
      "fallbackToNoCallback": true
    },
    "show": {
      "minArgs": 1,
      "maxArgs": 1,
      "fallbackToNoCallback": true
    }
  },
  "permissions": {
    "contains": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "getAll": {
      "minArgs": 0,
      "maxArgs": 0
    },
    "remove": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "request": {
      "minArgs": 1,
      "maxArgs": 1
    }
  },
  "runtime": {
    "getBackgroundPage": {
      "minArgs": 0,
      "maxArgs": 0
    },
    "getBrowserInfo": {
      "minArgs": 0,
      "maxArgs": 0
    },
    "getPlatformInfo": {
      "minArgs": 0,
      "maxArgs": 0
    },
    "openOptionsPage": {
      "minArgs": 0,
      "maxArgs": 0
    },
    "requestUpdateCheck": {
      "minArgs": 0,
      "maxArgs": 0
    },
    "sendMessage": {
      "minArgs": 1,
      "maxArgs": 3
    },
    "sendNativeMessage": {
      "minArgs": 2,
      "maxArgs": 2
    },
    "setUninstallURL": {
      "minArgs": 1,
      "maxArgs": 1
    }
  },
  "sessions": {
    "getDevices": {
      "minArgs": 0,
      "maxArgs": 1
    },
    "getRecentlyClosed": {
      "minArgs": 0,
      "maxArgs": 1
    },
    "restore": {
      "minArgs": 0,
      "maxArgs": 1
    }
  },
  "storage": {
    "local": {
      "clear": {
        "minArgs": 0,
        "maxArgs": 0
      },
      "get": {
        "minArgs": 0,
        "maxArgs": 1
      },
      "getBytesInUse": {
        "minArgs": 0,
        "maxArgs": 1
      },
      "remove": {
        "minArgs": 1,
        "maxArgs": 1
      },
      "set": {
        "minArgs": 1,
        "maxArgs": 1
      }
    },
    "managed": {
      "get": {
        "minArgs": 0,
        "maxArgs": 1
      },
      "getBytesInUse": {
        "minArgs": 0,
        "maxArgs": 1
      }
    },
    "sync": {
      "clear": {
        "minArgs": 0,
        "maxArgs": 0
      },
      "get": {
        "minArgs": 0,
        "maxArgs": 1
      },
      "getBytesInUse": {
        "minArgs": 0,
        "maxArgs": 1
      },
      "remove": {
        "minArgs": 1,
        "maxArgs": 1
      },
      "set": {
        "minArgs": 1,
        "maxArgs": 1
      }
    }
  },
  "tabs": {
    "captureVisibleTab": {
      "minArgs": 0,
      "maxArgs": 2
    },
    "create": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "detectLanguage": {
      "minArgs": 0,
      "maxArgs": 1
    },
    "discard": {
      "minArgs": 0,
      "maxArgs": 1
    },
    "duplicate": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "executeScript": {
      "minArgs": 1,
      "maxArgs": 2
    },
    "get": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "getCurrent": {
      "minArgs": 0,
      "maxArgs": 0
    },
    "getZoom": {
      "minArgs": 0,
      "maxArgs": 1
    },
    "getZoomSettings": {
      "minArgs": 0,
      "maxArgs": 1
    },
    "highlight": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "insertCSS": {
      "minArgs": 1,
      "maxArgs": 2
    },
    "move": {
      "minArgs": 2,
      "maxArgs": 2
    },
    "query": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "reload": {
      "minArgs": 0,
      "maxArgs": 2
    },
    "remove": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "removeCSS": {
      "minArgs": 1,
      "maxArgs": 2
    },
    "sendMessage": {
      "minArgs": 2,
      "maxArgs": 3
    },
    "setZoom": {
      "minArgs": 1,
      "maxArgs": 2
    },
    "setZoomSettings": {
      "minArgs": 1,
      "maxArgs": 2
    },
    "update": {
      "minArgs": 1,
      "maxArgs": 2
    }
  },
  "topSites": {
    "get": {
      "minArgs": 0,
      "maxArgs": 0
    }
  },
  "webNavigation": {
    "getAllFrames": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "getFrame": {
      "minArgs": 1,
      "maxArgs": 1
    }
  },
  "webRequest": {
    "handlerBehaviorChanged": {
      "minArgs": 0,
      "maxArgs": 0
    }
  },
  "windows": {
    "create": {
      "minArgs": 0,
      "maxArgs": 1
    },
    "get": {
      "minArgs": 1,
      "maxArgs": 2
    },
    "getAll": {
      "minArgs": 0,
      "maxArgs": 1
    },
    "getCurrent": {
      "minArgs": 0,
      "maxArgs": 1
    },
    "getLastFocused": {
      "minArgs": 0,
      "maxArgs": 1
    },
    "remove": {
      "minArgs": 1,
      "maxArgs": 1
    },
    "update": {
      "minArgs": 2,
      "maxArgs": 2
    }
  }
}
