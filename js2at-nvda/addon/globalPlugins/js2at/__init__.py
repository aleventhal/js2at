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
from scriptHandler import script
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

# as a prototype, this gets put in the menu to start js2at
def connect():
	socket.connect("tcp://127.0.0.1:%s" % port)

def read_browser_messages_thread_func():
	while True:
		message_from_browser = socket.recv_string()  # flags=NOBLOCK ?
		ui.message(message_from_browser)


class GlobalPlugin(globalPluginHandler.GlobalPlugin):

	def __init__(self):		super(GlobalPlugin, self).__init__()
		self.thread = receive_browser_message_thread = threading.Thread(target=read_browser_messages_thread_func)
		receive_browser_message_thread.daemon = True
		receive_browser_message_thread.start()
		self.thread._Thread__stop()



	def chooseNVDAObjectOverlayClasses(self, obj, clsList):
		pass 

	@script(gesture = "kb:nvda+alt+f7",
	description = "js2at thing")
	def script_testJZQ(self, gesture):
		ui.message("setting up system")
		connect()
		ui.message("js2at was successfully set up!")
