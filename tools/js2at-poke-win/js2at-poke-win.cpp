#include "stdafx.h"
#include "ax-util.h"
#include <string>
#include <sstream>
#include <map>
#include <memory>
#include <windows.h>
#include <comdef.h>
using namespace std;

CComPtr<IAccessible> at2js_slot;
HWND js_server_hwnd;  // Window handle for last js2at window.
static int message_counter = 0;
constexpr wchar_t *message_prefix = L"g57d7ffvl";  // Should be randomized and changed for each new window.

HWINEVENTHOOK g_hEventHook = NULL;

void CALLBACK WinEventProc(HWINEVENTHOOK hEvent,
  DWORD event,
  HWND hwndMsg,
  LONG idObject,
  LONG idChild,
  DWORD idThread,
  DWORD dwmsEventTime);

void InitializeMSAA()
{
  CoInitialize(NULL);
  g_hEventHook = SetWinEventHook(EVENT_MIN, EVENT_MAX, NULL, WinEventProc, 0, 0, WINEVENT_OUTOFCONTEXT | WINEVENT_SKIPOWNPROCESS);
}

// Unhooks the event and shuts down COM.
//
void ShutdownMSAA()
{
  at2js_slot = NULL;
  UnhookWinEvent(g_hEventHook);
  CoUninitialize();
}

void SendToJs(const std::wstring& message_info) {
  ++message_counter;
  std::wstringstream string_stream;
  string_stream << "[{\"messageId\":\"" << message_counter << L"-" << message_prefix << L"\"," << message_info.c_str() << L"}]";
  CComBSTR message(string_stream.str().c_str());

  // For IE, we need to get it each time -- the IAccessible* cannot be saved between calls.
  CComPtr<IAccessible> slot = at2js_slot ? at2js_slot : IEGetAccessibleWithID(js_server_hwnd, L"at2js-slot");
  if (!slot) {
    printf("No #at2js-slot object available for sending message");
    return;
  }
  std::wstring id = GetID(slot);
  wprintf(L"ID of at2js slot = %s\n", id.c_str());
  CComVariant varSelf(CHILDID_SELF, VT_I4);
  wprintf(L"Sending: %s\n", message);
  HRESULT hr = slot->put_accValue(varSelf, message);
  if (FAILED(hr)) {
    wprintf(L"Failure sending message: %s.\n", message);
    _com_error err(hr);
    LPCTSTR errMsg = err.ErrorMessage();
    wprintf(L"Error = %s\n", errMsg);
  }
}

void RunTest(int messageNum) {
  switch (messageNum) {
  case 1:
    SendToJs(L"\"messageType\":\"checkReady\"");
    break;
  case 2:
    SendToJs(L"\"messageType\":\"fetchAll\",\"custom\":{\"role\":\"heading\"}");
    break;
  case 3:
    SendToJs(L"\"messageType\":\"fetchAll\"");
    break;
  case 4:
    SendToJs(L"\"messageType\":\"gobbedlygook\"");
    break;
  case 5:
    SendToJs(L"");  // TODO multiple messages.
    break;
  }
}

int _tmain(int argc, _TCHAR* argv[])
{
  InitializeMSAA();
  
  printf(
    "js2at-poke-win, a tool for testing js2at implemenations on the web.\n"
    "Step 1: Reload the page so that it fires at least one event on the #js2at-slot object.\n"
    "Step 2: Press one or more of the following hotkeys (any window can have focus):\n"
    "Ctrl+Alt+Shift+1: Send messageType = checkReady\n"
    "Ctrl+Alt+Shift+2: Send messageType = fetchAll with role = heading\n"
    "Ctrl+Alt+Shift+3: Send messageType = fetchAll with undefined role\n"
    "Ctrl+Alt+Shift+4: Send messageType = [unhandled type]\n"
    "Ctrl+Alt+Shift+5: Send multiple fetchAll messages fired at once.\n");

  RegisterHotKey(NULL, 1, MOD_CONTROL | MOD_SHIFT | MOD_ALT, '1');
  RegisterHotKey(NULL, 2, MOD_CONTROL | MOD_SHIFT | MOD_ALT, '2');
  RegisterHotKey(NULL, 3, MOD_CONTROL | MOD_SHIFT | MOD_ALT, '3');
  RegisterHotKey(NULL, 4, MOD_CONTROL | MOD_SHIFT | MOD_ALT, '4');
  RegisterHotKey(NULL, 5, MOD_CONTROL | MOD_SHIFT | MOD_ALT, '5');

  MSG msg;

  while (GetMessage(&msg, NULL, 0, 0))
  {
    TranslateMessage(&msg);
    DispatchMessage(&msg);
    if (msg.message == WM_HOTKEY)
      RunTest(msg.wParam);  // Send the hotkey number.
  }

  UnregisterHotKey(NULL, 1);
  ShutdownMSAA();
}

void CALLBACK WinEventProc(
  HWINEVENTHOOK hEvent,
  DWORD event,
  HWND hwndMsg,
  LONG idObject,
  LONG idChild,
  DWORD idThread,
  DWORD dwmsEventTime)
{
  // Ignore mouse events.
  if (idObject == OBJID_CURSOR || idObject == OBJID_CARET)
    return;
  if (event != EVENT_OBJECT_VALUECHANGE)
    return;

  // TODO: MS Edge says you shall not pass.

  // Require an IAccessible*.
  CComPtr<IAccessible> pAcc;
  CComVariant varChild;
  HRESULT hr = AccessibleObjectFromEvent(hwndMsg, idObject, idChild, &pAcc, &varChild);
  if (!pAcc)
    return;

  CComVariant varSelf(CHILDID_SELF, VT_I4);

  // Make sure the ID is correct.
  std::wstring id = GetID(pAcc);

  if (id != L"js2at-slot")
    return;

  // Receive incoming message.
  at2js_slot = GetSiblingWithID(pAcc, L"at2js-slot");
  if (!at2js_slot)
    js_server_hwnd = hwndMsg;

  // Get the current field value.
  CComBSTR accValue;
  hr = pAcc->get_accValue(varChild, &accValue);
  wprintf(L"Received: %s \n", accValue);
}
