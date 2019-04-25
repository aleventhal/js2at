#!/usr/bin/env python

import zmq
import sys
import time
import json
import argparse
import threading

requestId = 0

# Get port number, use --port=[portnum] or will use default port.
parser = argparse.ArgumentParser()
parser.add_argument('-p', '--port')
args = parser.parse_args()
port = '18322'
if args.port:
  port = args.port

# Setup connection with native messaging host.
context = zmq.Context()
socket = context.socket(zmq.PAIR)
socket.connect("tcp://localhost:%s" % port)

def read_browser_messages_thread_func():
  while 1:
    message_from_browser = socket.recv_string()
    print 'Incoming response: %s' % message_from_browser

def get_role_request(role):
  global requestId
  requestId += 1
  request = {
    'requestType': 'http://js2at.org/schema/fetchAll.json',
    'requestId': str(requestId),
    'targetUid': '1',
    'detail': {
      'role': role
    }
  }
  return request

socket.send_string('*ping*')  # Check to see if alive.

print("""\
Instructions, type any of the following and press Enter.
[arbitrary JSON]               Send as request
h                              Request all headings
p                              Request all paragraphs
z                              Request all zebras (will return error)
""")
print('Connected to port %s' % port)

receive_browser_message_thread = threading.Thread(target=read_browser_messages_thread_func)
receive_browser_message_thread.daemon = True
receive_browser_message_thread.start()

while 1:
  inp = raw_input('')
  if inp[:1] == 'h':
    request = get_role_request('heading')
  elif inp[:1] == 'p':
    request = get_role_request('paragraph')
  elif inp[:1] == 'z':
    request = get_role_request('zebra')
  elif inp[:1] == '{':
    try:
      request = json.loads(inp)
    except ValueError as error:
      print("Invalid json: %s" % error)
      continue
  else:
    print('Not a valid command.')
    continue
  request_text = json.dumps(request)
  print 'Outgoing request: %s' % request_text
  socket.send_string(request_text)
