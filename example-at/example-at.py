#!/usr/bin/env python

import zmq
import sys
import time
import json
import argparse
import threading
import collections

requestId = 0   # Incremented for each new message.
messages_to_broker = collections.deque()   # Outgoing message queue.

def exchange_broker_messages_thread_func(messages_to_broker, socket):
  while 1:
    try:
      message_from_broker = socket.recv_string(flags=zmq.NOBLOCK)
      print 'Incoming response: %s' % message_from_broker
    except zmq.error.Again:
      pass

    if messages_to_broker:
      broker_message = messages_to_broker.popleft()
      try:
        socket.send_string(broker_message, flags=zmq.NOBLOCK)
        print 'Sent to broker: %s' %  broker_message    # Should be off by default.
      except zmq.error.Again:
        # TODO limit number of tries.
        # Resource wasn't ready so failed to send -- place back in deque.
        # Place on the left side that the message order is still correct once resource is free.
        messages_to_broker.appendleft(broker_message)
        pass


def get_role_request(role):
  global requestId
  requestId += 1
  request = {
    # Temporarily use hacky schema url location, until we serve the schemas:
    'requestType': 'https://raw.githack.com/aleventhal/js2at/master/schema/fetchAll.json',
    # 'requestType': 'http://js2at.org/schema/fetchAll.json',
    'requestId': str(requestId),
    'targetUid': '1',
    'detail': {
      'role': role
    }
  }
  return request

def Main():
  # Get port number, use --port=[portnum] or will use default port.
  parser = argparse.ArgumentParser()
  parser.add_argument('-p', '--port')
  args = parser.parse_args()
  port = '18323'
  if args.port:
    port = args.port

  # Setup connection with native messaging host.
  context = zmq.Context()
  socket = context.socket(zmq.PAIR)
  address = 'tcp://127.0.0.1:%s' % port
  socket.bind(address)
  print 'Connected to port %s' % port

  print("""\
  Instructions, type any of the following and press Enter.
  [arbitrary JSON]               Send as request
  h                              Request all headings
  p                              Request all paragraphs
  z                              Request all zebras (will return error)
  """)

  # Handle all port messaging on a single thread.
  exchange_broker_messages_thread = threading.Thread(target=exchange_broker_messages_thread_func, args=(messages_to_broker, socket))
  exchange_broker_messages_thread.daemon = True
  exchange_broker_messages_thread.start()

  # Continuously check for new commands on stdin and add corrsponding requests
  # to outgoing message queue.
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
        print "Invalid json: %s" % error
        continue
    else:
      print 'Not a valid command.'
      continue
    request_text = json.dumps(request)
    messages_to_broker.append(request_text)

if __name__ == '__main__':
  Main()
