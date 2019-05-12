#!/bin/sh
# Copyright 2013 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
if [ "$(uname -s)" = "Darwin" ]; then
  if [ "$(whoami)" = "root" ]; then
    TARGET_DIR_CHROME="/Library/Google/Chrome/NativeMessagingHosts"
    TARGET_DIR_CHROME_CANARY="/Library/Google/Chrome Canary/NativeMessagingHosts"
    TARGET_DIR_CHROMIUM="/Library/Application Support/Chromium/NativeMessagingHosts"
    TARGET_DIR_FIREFOX="/Library/Application Support/Mozilla/NativeMessagingHosts"
  else
    TARGET_DIR_CHROME="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
    TARGET_DIR_CHROME_CANARY="$HOME/Library/Application Support/Google/Chrome Canary/NativeMessagingHosts"
    TARGET_DIR_CHROMIUM="$HOME/Library/Application Support/Chromium/NativeMessagingHosts"
    TARGET_DIR_FIREFOX="$HOME/Library/Application Support/Mozilla/NativeMessagingHosts"
  fi
else
  if [ "$(whoami)" = "root" ]; then
    TARGET_DIR_CHROME="/etc/opt/chrome/native-messaging-hosts"
    #TARGET_DIR_CHROME_CANARY  -- Canary is not available for Linux.
    TARGET_DIR_CHROMIUM="/etc/chromium/native-messaging-hosts"
    TARGET_DIR_FIREFOX="/usr/lib64/mozilla/native-messaging-hosts"
  else
    TARGET_DIR_CHROME="$HOME/.config/google-chrome/NativeMessagingHosts"
    #TARGET_DIR_CHROME_CANARY  -- Canary is not available for Linux.
    TARGET_DIR_CHROMIUM="$HOME/.config/chromium/NativeMessagingHosts"
    TARGET_DIR_FIREFOX="$HOME/.mozilla/native-messaging-hosts/"
  fi
fi

HOST_NAME=org.js2at.message_broker

rm "$TARGET_DIR_CHROME/$HOSTNAME*"
if [ "$(uname -s)" = "Darwin" ]; then
  rm "$TARGET_DIR_CHROME_CANARY/$HOST_NAME*"
fi
rm "$TARGET_DIR_CHROMIUM/org.js2at.$HOST_NAME.json*"
rm "$TARGET_DIR_FIREFOX_CHROMIUM/org.js2at.$HOST_NAME*"
echo "Native messaging host $HOST_NAME has been uninstalled."
