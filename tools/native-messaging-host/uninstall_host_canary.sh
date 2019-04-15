#!/bin/sh
# Copyright 2013 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

set -e

if [ "$(uname -s)" = "Darwin" ]; then
  if [ "$(whoami)" = "root" ]; then
    TARGET_DIR="/Library/Google/Chrome Canary/NativeMessagingHosts"
  else
    TARGET_DIR="$HOME/Library/Application Support/Google/Chrome Canary/NativeMessagingHosts"
  fi
else
  echo Canary on Linux is not supported
  exit 1
fi

HOST_NAME=corg.js2at.chrome_native_messaging_host
rm "$TARGET_DIR/org.js2at.chrome_native_messaging_host.json"
echo "Native messaging host $HOST_NAME has been uninstalled."
