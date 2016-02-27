#!/usr/bin/env python
# -*- coding: utf-8 -*-

from service.common_service import *

def login(username, password, __db, _handler):
    user = yield __db['tl']['user'].find_one({'username': username, 'password': password})
    if user:
        del user['_id']
        _handler.current_user = user
        return success(user)
    else:
        return error(1, '用户名密码错误')

def autologin(_handler):
        user = _handler.current_user
        if user:
            return success(user)
        else:
            return error(1, '用户未登录')

def logout(_session, _handler):
    _session.clear()
    _handler.clear_all_cookies()
    return success(True)

def regist(_args, __db):
    yield __db['tl']['user'].insert_one(_args)
    return success(True)
