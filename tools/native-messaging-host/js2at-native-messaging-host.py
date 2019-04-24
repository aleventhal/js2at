#!/usr/bin/env python

# TODO how do we deal with multiple ATs

import struct
import sys
import threading
import Queue
import time
import zmq

messages_from_browser_queue = Queue.Queue()
messages_from_at_queue = Queue.Queue()
# Set up connection with AT
port = '18325'
at_address = 'tcp://*:%s' % port
context = zmq.Context()
at_socket = context.socket(zmq.PAIR)
at_socket.bind(at_address)

# On Windows, the default I/O mode is O_TEXT. Set this to O_BINARY
# to avoid unwanted modifications of the input/output streams.
if sys.platform == "win32":
  import os, msvcrt
  msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
  msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)

# Thread that reads messages from the webapp.
def browser_message_thread_func(messages_from_browser_queue):
  while 1:
    # Read the message length (first 4 bytes).
    message_length_bytes = sys.stdin.read(4)
    # Unpack message length as 4 byte integer.
    message_length = struct.unpack('i', message_length_bytes)[0]
    # Read the text (JSON object) of the message.
    message_text = sys.stdin.read(message_length).decode('utf-8')

    messages_from_browser_queue.put(message_text)

    time.sleep(0.01)  # Necessary?


def at_message_thread_func(at_socket, messages_from_at_queue):
  while 1:
    at_socket.send_string('*ping*')  # Necessary otherwise cannot send message.
    at_message = at_socket.recv_string()
    messages_from_at_queue.put(at_message)
    time.sleep(0.01)  # Necessary?

def process_browser_messages():
  try:
    while not messages_from_browser_queue.empty():
      browser_message = messages_from_browser_queue.get_nowait()
      send_to_at(browser_message)
  except Exception as e:
    send_to_at('{ "js2at-native-messaging-host-error": "%s"}' % e)
    pass

def process_at_messages():
  while not messages_from_at_queue.empty():
    at_message = messages_from_at_queue.get_nowait()
    send_to_browser(at_message)

def send_to_browser(message):
  # Write message size.
  sys.stdout.write(struct.pack('I', len(message)))
  # Write the message itself.
  sys.stdout.write(message)
  sys.stdout.flush()

def send_to_at(message):
  at_socket.send_string(message)

def Main():
  receive_browser_message_thread = threading.Thread(target=browser_message_thread_func, args=(messages_from_browser_queue,))
  receive_browser_message_thread.daemon = True
  receive_browser_message_thread.start()

  receive_at_message_thread = threading.Thread(target=at_message_thread_func, args=(at_socket, messages_from_at_queue,))
  receive_at_message_thread.daemon = True
  receive_at_message_thread.start()

  send_to_at('*ping*')
  send_to_browser('{ "ping": true }')

  while 1:
    process_browser_messages()
    process_at_messages()
    time.sleep(0.01)  # Necessary?

if __name__ == '__main__':
  Main()
