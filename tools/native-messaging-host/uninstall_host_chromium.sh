#!/bin/sh
# Copyright 2013 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

set -e

if [ "$(uname -s)" = "Darwin" ]; then
  if [ "$(whoami)" = "root" ]; then
    TARGET_DIR="/Library/Application Support/Chromium/NativeMessagingHosts"
  else
    TARGET_DIR="$HOME/Library/Application Support/Chromium/NativeMessagingHosts"
  fi
else
  if [ "$(whoami)" = "root" ]; then
    TARGET_DIR="/etc/chromium/native-messaging-hosts"
  else
    TARGET_DIR="$HOME/.config/chromium/NativeMessagingHosts"
  fi
fi

HOST_NAME=corg.js2at.chrome_native_messaging_host
rm "$TARGET_DIR/org.js2at.chrome_native_messaging_host.json"
echo "Native messaging host $HOST_NAME has been uninstalled."
