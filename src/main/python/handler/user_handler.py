#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
from . import base_handler
from tornado.log import app_log
# from mongodb_client import client as dbclient
from tornado import gen

def addHandlers(application):
    application.add_handlers(r".*", [(r"/user/check", UserCheckHandler)])
    application.add_handlers(r".*", [(r"/user/login", UserLoginHandler)])
    application.add_handlers(r".*", [(r"/user/autologin", UserAutoLoginHandler)])
    application.add_handlers(r".*", [(r"/user/submitRegist", SubmitRegistHandler)])


class UserAutoLoginHandler(base_handler.BaseHandler):
    """
        用户尝试自动登录
    """

    def post(self):
        user = self.getCurrentUser()
        if user:
            self.writeData(None, user)
            # set session
            self.setCurrentUser(user)
        else:
            self.writeData({'status': 1, 'errorMsg': '用户未登录'})

class UserLoginHandler(base_handler.BaseHandler):
    """
    用户登录控制器
    """

    @gen.coroutine
    def post(self):
        try:
            data = json.loads(self.request.body.decode('utf-8'))
            if data:
                user = yield self.db['tl']['user'].find_one({'username': data['username'], 'password': data['password']})
                if user:
                    del user['_id']
                    self.writeData(None, user)
                    # set session
                    self.setCurrentUser(user)
                else:
                    self.writeData({'status': 1, 'errorMsg': '用户名密码错误'})
            else:
                self.writeData({'status': 1, 'errorMsg': '数据错误!'})
        finally:
            self.finish()

class UserCheckHandler(base_handler.BaseHandler):
    """
    check checkName is unique
    """

    @gen.coroutine
    def post(self):
        try:
            data = json.loads(self.request.body.decode('utf-8'))
            checkName = data['field']
            checkValue = data['value']
            if checkName in ['username', 'email']:
                cursor = yield self.db['tl']['user'].find({checkName: checkValue})
                self.writeData(None, {'unique': False if cursor.count() > 0 else True})
        finally:
            self.finish()


class SubmitRegistHandler(base_handler.BaseHandler):
    @gen.coroutine
    def post(self):
        try:
            data = json.loads(self.request.body.decode('utf-8'))
            app_log.debug(data)
            yield self.db['tl']['user'].insert_one(data)
            self.writeData(None, True)
        finally:
            self.finish()

