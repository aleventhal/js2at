#!/bin/sh

if ! PYV=`python -c "import sys;t='{v[0]}'.format(v=list(sys.version_info[:2]));sys.stdout.write(t)";`; then
    echo Python is required.
    exit 1
fi

if ! [ $PYV -eq "2" ]; then
    echo Python 2.x is required
    exit 1
fi

if ! pip install zmq; then
    echo Could not install zmq library for Python, which is needed for communication.
    exit 1
fi

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
    # Or .. TARGET_DIR_FIREFOX="/usr/lib/mozilla/native-messaging-hosts"
  else
    TARGET_DIR_CHROME="$HOME/.config/google-chrome/NativeMessagingHosts"
    #TARGET_DIR_CHROME_CANARY  -- Canary is not available for Linux.
    TARGET_DIR_CHROMIUM="$HOME/.config/chromium/NativeMessagingHosts"
    TARGET_DIR_FIREFOX="$HOME/.mozilla/native-messaging-hosts/"
  fi
fi

HOST_NAME=org.js2at.message_broker

# Create directories to store native messaging host.
mkdir -p "$TARGET_DIR_CHROME"
if [ "$(uname -s)" = "Darwin" ]; then
  mkdir -p "$TARGET_DIR_CHROME_CANARY"
fi
mkdir -p "$TARGET_DIR_CHROMIUM"
mkdir -p "$TARGET_DIR_FIREFOX"

# Copy native messaging host manifest.
cp "$DIR/$HOST_NAME.json" "$TARGET_DIR_CHROME"
if [ "$(uname -s)" = "Darwin" ]; then
  cp "$DIR/$HOST_NAME.json" "$TARGET_DIR_CHROME_CANARY"
fi
cp "$DIR/$HOST_NAME.json" "$TARGET_DIR_CHROMIUM"
# In Firefox, use special json file
cp "$DIR/$HOST_NAME.firefox.json" "$TARGET_DIR_FIREFOX/$HOST_NAME.json"

# Update host path in the manifest.
HOST_PATH=$DIR/message-broker.py
ESCAPED_HOST_PATH=${HOST_PATH////\\/}

sed -i -e "s/HOST_PATH/$ESCAPED_HOST_PATH/" "$TARGET_DIR_CHROME/$HOST_NAME.json"
if [ "$(uname -s)" = "Darwin" ]; then
  sed -i -e "s/HOST_PATH/$ESCAPED_HOST_PATH/" "$TARGET_DIR_CHROME_CANARY/$HOST_NAME.json"
fi
sed -i -e "s/HOST_PATH/$ESCAPED_HOST_PATH/" "$TARGET_DIR_CHROMIUM/$HOST_NAME.json"
sed -i -e "s/HOST_PATH/$ESCAPED_HOST_PATH/" "$TARGET_DIR_FIREFOX/$HOST_NAME.json"

# Remove .json-e files created by sed.
rm -f "$TARGET_DIR_CHROME/$HOST_NAME.json-e"
if [ "$(uname -s)" = "Darwin" ]; then
  rm -f "$TARGET_DIR_CHROME_CANARY/$HOST_NAME.json-e"
fi
rm -f "$TARGET_DIR_CHROMIUM/$HOST_NAME.json-e"
rm -f "$TARGET_DIR_FIREFOX/$HOST_NAME.json-e"

# Set permissions for the manifest so that all users can read it.
chmod o+r "$TARGET_DIR_CHROME/$HOST_NAME.json"
if [ "$(uname -s)" = "Darwin" ]; then
  chmod o+r "$TARGET_DIR_CHROME_CANARY/$HOST_NAME.json"
fi
chmod o+r "$TARGET_DIR_CHROMIUM/$HOST_NAME.json"
chmod o+r "$TARGET_DIR_FIREFOX/$HOST_NAME.json"

echo "Native messaging host $HOST_NAME has been installed"
