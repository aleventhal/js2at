#!/usr/bin/env python

# This broker passes messages from AT to browser, and vice-versa.
# AT communication is done via a tcp port that the AT opens.
# Browser communication is done via the native messaging api (stdin/stdout).
# TODO how do we deal with multiple ATs, multiple brokers (one per browser)

import argparse
import atexit
import logging
import os
import collections
import signal
import struct
import sys
import threading
import time
import zmq

messages_from_browser = collections.deque()

# Set up logging, both to ./message-broker.log and to stderr.
# To see stderr output when browser is running the script, launch the browser
# via command line in a terminal window.
LOGFILE = 'message-broker.log'
if os.path.exists(LOGFILE):
  os.remove(LOGFILE)
logging.basicConfig(filename=LOGFILE,level=logging.DEBUG)
logging.getLogger().addHandler(logging.StreamHandler(sys.stderr))

# On Windows, the default I/O mode is O_TEXT. Set this to O_BINARY
# to avoid unwanted modifications of the input/output streams.
if sys.platform == "win32":
  import os, msvcrt
  msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
  msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)

# Thread that reads messages from the browser via stdin.
def read_browser_messages_thread_func():
  logging.info('Begin listening for messages from browser')
  while 1:
    try:
      # Read the message length (first 4 bytes).
      message_length_bytes = sys.stdin.read(4)
      if len(message_length_bytes) == 0:
        continue
      # Unpack message length as 4 byte integer.
      message_length = struct.unpack('i', message_length_bytes)[0]
      # Read the text (JSON object) of the message.
      message_text = sys.stdin.read(message_length).decode('utf-8')
      logging.info('Message from browser: %s' % message_text)  # Should be off by default.
      messages_from_browser.append(message_text)
    except ValueError as error:
      logging.error("Exception reading browser messages: %s" % error)
      pass

# Send a message to browser via stdout.
def send_to_browser(message):
  logging.info('Send to browser: %s' % message)  # Should be off by default.
  # Write message size.
  sys.stdout.write(struct.pack('I', len(message)))
  # Write the message itself.
  sys.stdout.write(message)
  sys.stdout.flush()

def Main():
  at_socket = None
  # Set up global exception hook so we can get logs of errors.
  def global_exception_hook(exc_type, exc_value, traceback):
    logging.error("Uncaught exception", exc_info=(exc_type, exc_value, traceback))
    if at_socket:
      at_socket.send_string('{ "$js2at-message-broker-error": "%s"}' % exc_type)
    sys.__excepthook__(exc_type, exc_value, traceback)
  sys.excepthook = global_exception_hook

  logging.info('\n\nBegin native-message broker')
  # Get port number, use --port=[portnum] or will use default port.
  parser = argparse.ArgumentParser()
  parser.add_argument('chrome-extension', nargs='?')
  parser.add_argument('--parent-window', type=int)
  parser.add_argument('--port', '-p')
  args = parser.parse_args()
  port = '18323'
  if args.port:
    port = args.port

  # Set up connection with AT, this side is the client, and the AT is the server.
  context = zmq.Context()
  at_socket = context.socket(zmq.PAIR)
  at_address = 'tcp://127.0.0.1:%s' % port
  at_socket.connect(at_address)
  logging.info('Connected to AT via port %s' % port)

  # Browser messages on read from stdin on a separate thread.
  receive_browser_message_thread = threading.Thread(target=read_browser_messages_thread_func)
  receive_browser_message_thread.daemon = True
  receive_browser_message_thread.start()

  logging.info('Begin listening for messages from at')
  while 1:
    # If message available from AT, get it and send to the browser.
    at_message = None
    try:
      at_message = at_socket.recv_string(flags=zmq.NOBLOCK)
    except zmq.error.Again:
      pass

    if at_message:
      send_to_browser(at_message)

    # If message queued up to send to AT, get and send it.
    if messages_from_browser:
      browser_message = messages_from_browser.popleft()
      try:
        at_socket.send_string(browser_message, flags=zmq.NOBLOCK)
        logging.info('Sent to at: %s' %  browser_message)    # Should be off by default.
      except zmq.error.Again:
        # Resource wasn't ready so failed to send -- place back in deque.
        # Place on the left side that the message order is still correct once resource is free.
        messages_from_browser.appendleft(browser_message)
        pass

if __name__ == '__main__':
  Main()
