#!/usr/bin/env python

# TODO how do we deal with multiple ATs

import struct
import sys
import threading
import time
import zmq
import argparse
import logging   # Will log to a file because there's no window for this script.
import os

at_socket = None

# Set up logging
LOGFILE = 'js2at-native-messaging-host.log'
if os.path.exists(LOGFILE):
  os.remove(LOGFILE)
logging.basicConfig(filename=LOGFILE,level=logging.DEBUG)

# On Windows, the default I/O mode is O_TEXT. Set this to O_BINARY
# to avoid unwanted modifications of the input/output streams.
if sys.platform == "win32":
  import os, msvcrt
  msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
  msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)

def global_exception_hook(exc_type, exc_value, traceback):
  if exc_type == KeyboardInterrupt:
    quit()
  else:
    logging.error("Uncaught exception", exc_info=(exc_type, exc_value, traceback))
    send_to_at(at_socket, '{ "js2at-native-messaging-host-error": "%s"}' % exc_type)
    sys.__excepthook__(exc_type, exc_value, traceback)

# Thread that reads messages from the webapp.
def read_browser_messages_thread_func(at_socket):
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
      send_to_at(at_socket, message_text)
      time.sleep(0.01)  # Necessary? Should it be longer?
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

def send_to_at(at_socket, message):
  if at_socket:
    logging.info('Send to at: %s' % message)    # Should be off by default.
    at_socket.send_string(message)

def Main(argv):
  logging.info('Begin js2at-native-messaging host, argv = %s' % argv)
  # Get port number, use --port=[portnum] or will use default port.
  parser = argparse.ArgumentParser()
  parser.add_argument('chrome-extension')
  parser.add_argument('--parent-window', type=int)
  parser.add_argument('--port', '-p')
  args = parser.parse_args()
  port = '18322'
  if args.port:
    port = args.port

  send_to_browser('{ "ping": true }')

  # Set up connection with AT
  at_address = 'tcp://*:%s' % port
  context = zmq.Context()
  at_socket = context.socket(zmq.PAIR)
  count = 0
  while 1:
    try:
      at_socket.bind(at_address)
      break
    except Exception as e:
      logging.info('Could not connect to AT via port %s' % port)
      count = count + 1
      if count < 500:     # Max tries.
        logging.info('Try again %d', count)
        time.sleep(0.1)
        continue
      raise  # Give up and re-raise exception for global handler.

  logging.info('Connected to AT via port %s' % port)

  receive_browser_message_thread = threading.Thread(target=read_browser_messages_thread_func, args=(at_socket,))
  receive_browser_message_thread.daemon = True
  receive_browser_message_thread.start()

  send_to_at(at_socket, '*ping*')

  logging.info('Begin listening for messages from at')
  while 1:
    at_socket.send_string('*wakeup*')  # Necessary otherwise cannot read messages. ??
    at_message = at_socket.recv_string()
    logging.info('Message from at: %s' % at_message)  # Should be off by default.
    send_to_browser(at_message)

# Set up global exception hook so we can get logs of errors.
sys.excepthook = global_exception_hook

if __name__ == '__main__':
  Main(sys.argv)
