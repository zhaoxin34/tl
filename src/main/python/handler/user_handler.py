#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
from . import base_handler
from tornado.log import app_log
# from mongodb_client import client as dbclient
from tornado import gen
from config import config
import hashlib
import datetime

def addHandlers(application):
    application.add_handlers(r".*", [(r"/user/check", UserCheckHandler)])
    application.add_handlers(r".*", [(r"/user/login", UserLoginHandler)])
    application.add_handlers(r".*", [(r"/user/logout", UserLogoutHandler)])
    application.add_handlers(r".*", [(r"/user/autologin", UserAutoLoginHandler)])
    application.add_handlers(r".*", [(r"/user/submitRegist", SubmitRegistHandler)])
    application.add_handlers(r".*", [(r"/user/upload", UserUploadHandler)])
    application.add_handlers(r".*", [(r"/user/submitTlCreate", SubmitTlCreateHandler)])

class SubmitTlCreateHandler(base_handler.BaseHandler):
    """
        提交创建时间事件的处理器
    """

    def post(self):
        self.writeData(None, None)

class UserUploadHandler(base_handler.BaseHandler):
    """
        upload file
    """

    def post(self):
        # app_log.info(self.request.files)
        file = self.request.files['file'][0]
        original_fname = file['filename']

        time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        md5 = hashlib.md5()
        md5.update((time + original_fname).encode())
        hash_file_name = md5.hexdigest() + '.' + original_fname.split('.')[1]
        output_file_name = config['upload']['storage_folder'] + hash_file_name
        with open(output_file_name, 'wb') as fi:
            fi.write(file['body'])
        self.writeData(None, {'filename': hash_file_name})

class UserLogoutHandler(base_handler.BaseHandler):
    """
        退出登录
    """

    def post(self):
        self.clear_all_cookies()
        self.getSession().clear()


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

