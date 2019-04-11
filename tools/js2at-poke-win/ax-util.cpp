#include "stdafx.h"
#include <oleacc.h>
#include "ia2-api-merged.h"
#include "ax-util.h"
#include <string>
#include <mshtml.h>
#include <Exdisp.h>

std::map<std::wstring, std::wstring> GetAttributeMap(CComBSTR& attributes) {
  std::wstring attributes_str(attributes, SysStringLen(attributes));

  std::map<std::wstring, std::wstring> map;

  const wchar_t *s = attributes_str.c_str();
  while (*s) {
    std::wstring key_and_value[2];  // Key at index 0, value at index 1.
    int part_index = 0;  // Start off recording the key.
    // parse the key and value
    while (*s) {
      if (*s == '\\') {  // Record an escaped character.
        key_and_value[part_index] += *++s;
      }
      else if (*s == ':' && part_index == 0) {  // Start recording the value now.
        ++part_index;
      }
      else if (*s == ';') {
        ++s;  // Set position to start of next key/value.
        break;  // Record current key/value.
      }
      else if (!*s) {
        break;  // End of string: record current key/value.
      }
      else {
        key_and_value[part_index] += *s;  // Record a character.
      }
      ++s;
    }
    // Insert in map.
    if (key_and_value[0].size())  // Only add for non-zero length key.
      map.insert_or_assign(key_and_value[0], key_and_value[1]);
  }

  return map;
}

// TODO Get from UIA if IA2 not available.
std::wstring GetID(CComPtr<IAccessible> pAcc) {
  // Get IA2 in order (only needed to check that the ID matches a field we care about,
  // but this could also be provided via UIA, which is TBD here).
  CComQIPtr<IServiceProvider> pService(pAcc);
  if (pService) {
    CComPtr<IAccessible2> pIA2;
    HRESULT hr = pService->QueryService(IID_IAccessible, IID_IAccessible2, (void**)&pIA2);
    if (pIA2) {
      // Note, IAccessible2_2 appears to have a get_attribute() which allows getting
      // a single attribute directly, but does not appear to be implemented in Chrome.
      CComBSTR attributes;
      pIA2->get_attributes(&attributes);

      auto attribute_map = GetAttributeMap(attributes);
      return attribute_map[L"id"];
    }

    // Special case for IE: use HTMLElement.
    CComPtr<IHTMLElement> pHTMLElement;
    pService->QueryService(IID_IHTMLElement, IID_IHTMLElement, (void**)&pHTMLElement);
    if (pHTMLElement) {
      CComBSTR id;
      if (S_OK == pHTMLElement->get_id(&id) && id) {
        std::wstring id_str(id, SysStringLen(id));
        return id_str;
      }
    }
  }
  return std::wstring();
}


// Special case for IE: use IHTMLDocument3::getElementById() to get directly.
CComPtr<IAccessible> IEGetAccessibleWithID(HWND hwnd, const std::wstring& id) {
  HINSTANCE hInst = ::LoadLibrary(L"OLEACC.DLL");
  if (!hInst)
    return NULL;

  CComPtr<IHTMLDocument3> pDoc;
  LRESULT lRes;

  UINT nMsg = ::RegisterWindowMessage(L"WM_HTML_GETOBJECT");
  ::SendMessageTimeout(hwnd, nMsg, 0L, 0L, SMTO_ABORTIFHUNG, 1000, (DWORD*)&lRes);

  LPFNOBJECTFROMLRESULT pfObjectFromLresult = (LPFNOBJECTFROMLRESULT)::GetProcAddress(hInst, "ObjectFromLresult");
  if (!pfObjectFromLresult)
    return NULL;

  (*pfObjectFromLresult)(lRes, IID_IHTMLDocument3, 0, (void**)&pDoc);
  if (!pDoc)
    return NULL;
  
  CComPtr<IHTMLElement> pHTMLElementWithId;
  CComBSTR id_bstr(id.c_str());
  pDoc->getElementById(id_bstr, &pHTMLElementWithId);
  if (!pHTMLElementWithId)
    return NULL;

  CComQIPtr<IServiceProvider> pServiceElementWithId(pHTMLElementWithId);
  if (!pServiceElementWithId)
    return NULL;

  CComQIPtr<IAccessible> pAccessibleWithId;
  pServiceElementWithId->QueryService(IID_IAccessible, IID_IAccessible, (void**)&pAccessibleWithId);
  if (!pAccessibleWithId)
    return NULL;

  return pAccessibleWithId;
}

CComPtr<IAccessible> GetSiblingWithID(CComPtr<IAccessible> start, const std::wstring& id) {
  CComPtr<IDispatch> parent_dispatch;
  HRESULT hr = start->get_accParent(&parent_dispatch);
  if (FAILED(hr) || !parent_dispatch) {
    printf("No parent of sibling\n");
    return NULL;
  }
  CComQIPtr<IAccessible> parent = parent_dispatch;
  if (!parent) {
    printf("Parent of sibling is not accessible\n");
    return NULL;
  }
  LONG num_children;
  if (FAILED(parent->get_accChildCount(&num_children))) {
    printf("Failed to get children of parent\n");
    return NULL;
  }

  for (LONG index = 0; index < num_children; index++) {
    CComVariant varChild(index, VT_I4);
    CComPtr<IDispatch> child_dispatch;
    if (FAILED(parent->get_accChild(varChild, &child_dispatch))) {
      // This occurs in IE when objects provided with events are detached
      // from ax object hierarchy. Try to get directly via IE DOM.
      return NULL;
    }
    CComQIPtr<IAccessible> child = child_dispatch;
    if (GetID(child) == id)
      return child;
  }

  return NULL;
}


