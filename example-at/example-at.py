#!/usr/bin/env python

import zmq
import sys
import time
import json
import argparse

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

def get_request():
  global requestId
  requestId += 1
  request = {
    'requestType': 'http://js2at.org/schema/fetchAll.json',
    'requestId': str(requestId),
    'targetUid': '1',
    'detail': {
      'role': 'heading'
    }
  }
  return request

socket.send_string('*ping*')  # Check to see if alive.

while True:
  message_from_browser = socket.recv_string()
  print 'Incoming: %s' % message_from_browser
  request = get_request()
  request_text = json.dumps(request)
  print 'Outgoing: %s' % request_text
  socket.send_string(request_text)
  time.sleep(1)  # Necessary? What should the value be?
