// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// This demonstrates the ability to serve back all headings in a document that
// is only partially loaded.

import Js2atObserver from '../polyfills/js2at-observer.js';
import Js2atUniqueIdManager from '../polyfills/js2at-unique-id-manager.js';

const containerEl = document.getElementById('container');

const kCaretPattern =
  new URL('https://raw.githack.com/aleventhal/js2at/master/schema/caret.json');
const caretRequestObserver = new Js2atObserver(kCaretPattern, caret, cancelCaret);
caretRequestObserver.observe(containerEl);

function caret(request) {
  document.addEventListener('selectionchange', () => {
    const selection = document.getSelection();
    if (!selection) {
      return;
    }

    const bounds = selection.getRangeAt(0).getBoundingClientRect();
    request.sendOne({
      carets: {
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
      }
    });
  });
}

function cancelCaret(request, isTimeout) {
  clearTimeout(caret.timeout);
  console.log('cancelled, from timeout? ', isTimeout);
}

const kFetchAllPattern =
  // Temporarily use hacky schema url location, until we have a better location:
  new URL('https://raw.githack.com/aleventhal/js2at/master/schema/fetchAll.json');
const fetchRequestObserver = new Js2atObserver(kFetchAllPattern, fetchAll, cancelFetchAll);
fetchRequestObserver.observe(containerEl);

function fetchAll(request) {
  const detail = request.detail;
  if (!detail || detail.role !== 'heading') {
    request.error('Only headings handled');
    return;
  }

  // Use timeout to simulate what an async response may look like
  fetchAll.timeout = setTimeout(respond, 0);

  function respond() {
    const headings = document.querySelectorAll('h1');
    const objects = [];

    // Add the actual headings from the page.
    for (let index = 0; index < headings.length; index++) {
      const heading = headings[index];
      objects.push({
        role: 'heading',
        name: heading.innerText,
        uid: Js2atUniqueIdManager.getOrCreateUid(heading)
      });
    }

    // Now add an extra fake heading. In a real use case, this would likely
    // check the server for the complete list of headings.
    objects.push({
      role: 'heading',
      name: 'Magical heading that only exists in the ether',
      uid: Js2atUniqueIdManager.createUid()
    });
    console.log(request);

    request.complete({ objects });
  }
}

// If cancelled by AT or via timeout.
function cancelFetchAll(request, isTimeout) {
  clearTimeout(fetchAll.timeout);
  console.log('cancelled, from timeout? ', isTimeout);
}


