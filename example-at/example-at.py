#!/usr/bin/env python

import zmq
import sys
import time
import json

port = "18325"
context = zmq.Context()
socket = context.socket(zmq.PAIR)
socket.connect("tcp://localhost:%s" % port)
requestId = 0

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

while True:
  message_from_browser = socket.recv_string()
  print 'Incoming: %s' % message_from_browser
  request = get_request()
  request_text = json.dumps(request)
  print 'Outgoing: %s' % request_text
  socket.send_string(request_text)
  time.sleep(1)
