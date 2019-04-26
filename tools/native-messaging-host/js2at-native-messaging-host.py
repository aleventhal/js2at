#!/usr/bin/env python

# TODO how do we deal with multiple ATs

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

# Set up logging, both to ./js2at-native-messaging-host.log and to stderr.
# To see stderr output when browser is running the script, launch the browser
# via command line in a terminal window.
LOGFILE = 'js2at-native-messaging-host.log'
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

# Thread that reads messages from the webapp.
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

def send_to_browser(message):
  logging.info('Send to browser: %s' % message)  # Should be off by default.
  # Write message size.
  sys.stdout.write(struct.pack('I', len(message)))
  # Write the message itself.
  sys.stdout.write(message)
  sys.stdout.flush()

def Main(argv):
  at_socket = None
  # Set up global exception hook so we can get logs of errors.
  def global_exception_hook(exc_type, exc_value, traceback):
    logging.error("Uncaught exception", exc_info=(exc_type, exc_value, traceback))
    if at_socket:
      at_socket.send_string('{ "js2at-native-messaging-host-error": "%s"}' % exc_type)
    sys.__excepthook__(exc_type, exc_value, traceback)
  sys.excepthook = global_exception_hook

  logging.info('\n\nBegin js2at-native-messaging host, argv = %s' % argv)
  # Get port number, use --port=[portnum] or will use default port.
  parser = argparse.ArgumentParser()
  parser.add_argument('chrome-extension', nargs='?')
  parser.add_argument('--parent-window', type=int)
  parser.add_argument('--port', '-p')
  args = parser.parse_args()
  port = '18323'
  if args.port:
    port = args.port

  send_to_browser('{ "ping": true }')

  # Set up connection with AT
  context = zmq.Context()
  def cleanup(): # TODO why isn't this called when browser closes us?
    context.term()
  def signal_handler(signal, frame):
    logging.info('Signal %s' % signal)
    cleanup()
    sys.exit(0)
  atexit.register(cleanup)
  signal.signal(signal.SIGTERM, signal_handler)
  signal.signal(signal.SIGINT, signal_handler)
  at_socket = context.socket(zmq.PAIR)
  at_address = 'tcp://127.0.0.1:%s' % port
  count = 0
  while 1:
    try:
      at_socket.bind(at_address)
      break
    except zmq.error.ZMQError as e:
      logging.info('Exception %s\nCould not connect to AT via port %s' % (e, port))
      count = count + 1
      if count < 50:     # Max tries.
        logging.info('Try again %d', count)
        time.sleep(0.1)
        continue
      raise  # Give up and re-raise exception for global handler.

  logging.info('Connected to AT via port %s' % port)

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
        at_socket.send_string(browser_message)
        logging.info('Sent to at: %s' %  browser_message)    # Should be off by default.
      except zmq.error.Again:
        # Resource wasn't ready so failed to send -- place back in queue.
        # Place on the left side that the message order is still correct once resource is free.
        messages_from_browser.appendleft(browser_message)
        pass

if __name__ == '__main__':
  Main(sys.argv)
