#!/usr/bin/python
#
# Copyright 2019 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

#!/usr/bin/env python

import zmq
import sys
import time
import json
import argparse
import threading
import collections
import datetime

requestId = 0   # Incremented for each new message.
messages_to_broker = collections.deque()   # Outgoing message queue.
timers = {}
ids = { 'appId': 'xxx', 'docId': 'xxx' }

def exchange_broker_messages_thread_func(messages_to_broker, timers, ids, port):
  # Setup connection with native messaging host.
  context = zmq.Context()
  socket = context.socket(zmq.PAIR)
  address = 'tcp://127.0.0.1:%s' % port
  context.setsockopt(zmq.REQ_CORRELATE, 01)
  context.setsockopt(zmq.REQ_RELAXED, 1)
  socket.bind(address)
  count = 0
  while 1:
    try:
      message_from_broker = socket.recv_string(flags=zmq.NOBLOCK)
      message = json.loads(message_from_broker)
      try:
        then = timers[message['responseForRequestId']]
        elapsed = datetime.datetime.now() - then
        elapsed_str = str(int(elapsed.total_seconds() * 1000))
      except:
        elapsed_str = '?'
      try:
        if message['$command'] == 'observerAdded':
          ids['appId'] = message['appId']
          ids['docId'] = message['docId']
          print '*** appid=%s docId=%s' % (appId, docId)
      except:
        pass
      if elapsed_str == '?':
        print 'Incoming $command:'
      else:
        print 'Incoming response (elapsed time=%sms):' % elapsed_str
      # Reserialize with indent so that the message is easier to read:
      print json.dumps(message, indent=2)
    except zmq.error.Again:
      time.sleep(0.01)
      pass

    if messages_to_broker:
      broker_message_obj = messages_to_broker.popleft()
      broker_message = json.dumps(broker_message_obj)
      print 'Send to broker: %s' % broker_message # json.dumps(broker_message_obj, indent=2)
      timers[broker_message_obj['requestId']] = datetime.datetime.now()
      try:
        socket.send_string(broker_message, flags=zmq.NOBLOCK)
        # Serialize again, but with spaces for formatting. So this isn't the exact string sent but is easier to read:
      except zmq.error.Again:
        # TODO limit number of tries.
        # Resource wasn't ready so failed to send -- place back in deque.
        # Place on the left side that the message order is still correct once resource is free.
        messages_to_broker.appendleft(broker_message_obj)
        count = count + 1
        print 'Temporarily unable to send to broker port, count = %d' % count
        print 'Quitting and restarting works. Resetting the port has not worked so far'
        # time.sleep(1)
        # socket.unbind()
        # socket = context.socket(zmq.PAIR)
        # socket.bind(address)


def get_role_request(role):
  global requestId
  requestId += 1
  request = {
    'requestId': str(requestId),
    # Temporarily use hacky schema url location, until we serve the schemas.
    # Eventually use something nice like:
    # 'pattern': 'http://js2at.org/schema/fetchAll.json',
    'pattern': 'https://raw.githack.com/aleventhal/js2at/master/schema/fetchAll.json',
    'appId': ids['appId'],
    'docId': ids['docId'],
    'uid': '1',
    'timeout': 300,
    'detail': {
      'role': role
    }
  }
  return request

def get_ping_request():
  global requestId
  requestId += 1
  request = {
    'requestId': str(requestId),
    'pattern': '$ping',
    'appId': ids['appId'],
    'docId': ids['docId'],
    'uid': '*',
    'timeout': 300,
    'detail': {}
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

  print("""\
  Instructions, type any of the following and press Enter.
  [arbitrary JSON]               Send as request
  h                              Request all headings
  p                              Request all paragraphs
  z                              Request all zebras (will return error)
  $                              Ping / get all observers in the current document
  """)

  # Handle all port messaging on a single thread.
  exchange_broker_messages_thread = threading.Thread(target=exchange_broker_messages_thread_func, args=(messages_to_broker, timers, ids, port))
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
    elif inp[:1] == '$':
      request = get_ping_request()
    elif inp[:1] == '{':
      try:
        request = json.loads(inp)
      except ValueError as error:
        print "Invalid json: %s" % error
        continue
    else:
      print 'Not a valid command.'
      continue
    messages_to_broker.append(request)

if __name__ == '__main__':
  Main()
