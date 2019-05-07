# js2at: An Add-on for nvda that does <Insert thing here>

#Copyright (C) 2019 Google

#This file is covered by the GNU General Public License.
#See the file COPYING for more details.

"""js2at:
A global plugin to implement the basics of js2at
"""

import os
import sys
import threading
import time

import addonHandler
from logHandler import log
from scriptHandler import script
import speech
import globalPluginHandler
import ui
import json
#hack: NVDA loops over all packages in its addons dirs, adding them to the globalPlugins package.
# NVDA only ships the bits of the stdlib we really need in production, so add our polyfill_libs to the path.
sys.path.append(os.path.join (os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "polyfill_lib"))
#It doesn't add the path for the place where our zmq package is.
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
import zmq
sys.path.remove(sys.path[-1])
#don't remove our polyfills, incase something imports these later.
#We need to initialize translation and localization support:
addonHandler.initTranslation()

requestId = 0
port = '18323'
context = zmq.Context()
socket = context.socket(zmq.PAIR)
exit_now = False
requestId = 1

def get_role_request(role):
	global requestId
	requestId += 1
	request = {
		'pattern': 'http://js2at.org/schema/fetchAll.json',
		'requestId': str(requestId),
		'uid': '1',
		'detail': {
			'role': role
		}
	}
	return request
# as a prototype, thisscript starts js2at.
def connect():
	socket.bind("tcp://127.0.0.1:%s" % port)

def read_browser_messages_thread_func():
	speech.speakMessage("starting thread!")
	while not exit_now:
		if socket.poll(10):
			log.debug("I just polled this!")
			message_from_browser = socket.recv_string()  # flags=NOBLOCK ?
			speech.cancelSpeech()
			speech.speakMessage(message_from_browser)


class GlobalPlugin(globalPluginHandler.GlobalPlugin):

	def __init__(self):
		global exit_now
		super(GlobalPlugin, self).__init__()



	def chooseNVDAObjectOverlayClasses(self, obj, clsList):
		pass

	@script(gesture = "kb:nvda+alt+f7",
	description = "js2at thing")
	def script_testJZQ(self, gesture):
		ui.message("setting up system")
		connect()
		receive_browser_message_thread = threading.Thread(target=read_browser_messages_thread_func)
		receive_browser_message_thread.daemon = True
		receive_browser_message_thread.start()
		ui.message("js2at was successfully set up!")

	def terminate(self):
		exit_now = True
