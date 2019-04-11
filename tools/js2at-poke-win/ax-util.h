#include "stdafx.h"
#include <string>
#include <map>

std::map<std::wstring, std::wstring> GetAttributeMap(CComBSTR& attributes);

std::wstring GetID(CComPtr<IAccessible> pAcc);

CComPtr<IAccessible> GetSiblingWithID(CComPtr<IAccessible> start, const std::wstring& id);

CComPtr<IAccessible> IEGetAccessibleWithID(HWND hwnd, const std::wstring& id);



