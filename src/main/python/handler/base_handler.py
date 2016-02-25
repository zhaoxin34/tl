#!/usr/bin/env python
# -*- coding: utf-8 -*-
import tornado.escape
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import hashlib
import datetime
from tornado.log import app_log
from web_util.session import Session
import tl_exception

class BaseHandler(tornado.web.RequestHandler):
    """
    the handler deal the header, remove Content-Encoding, reparse the request body
    """

    def prepare(self):
        request = self.request
        if request.headers and 'Content-Encoding' in request.headers:
            del request.headers['Content-Encoding']
        request.body_arguments = {}
        request.files = {}
        tornado.httputil.parse_body_arguments(
            request.headers.get("Content-Type", ""), request.body, request.body_arguments, request.files)
        for k, v in request.body_arguments.items():
            request.arguments.setdefault(k, []).extend(v)

        # cookie
        cookieId = self.get_cookie('cookie_id')
        if not cookieId or not Session.getSession(cookieId):
            # create cookie id
            ua = self.request.headers.get("User-Agent", '')
            ip = self.request.remote_ip
            time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            md5 = hashlib.md5()
            md5.update((ua + ip + time).encode())
            cookieId = md5.hexdigest()
            Session.createSession(cookieId)
            app_log.info('set cookie id ' + cookieId)
            self.set_cookie('cookie_id', cookieId, path="/", expires_days=30)

        self.cookieId = cookieId
        self.db = self.settings['db']

    def writeData(self, header=None, body=None):
        """
        write response data, based header and body
        """
        defaultHeader = {'status': 0}
        defaultBody = {}
        self.write({'header': header or defaultHeader, 'body': body or defaultBody})

    def getSession(self):
        """
        必须在调用果prepair后才能调用
        """

        cookieId = self.cookieId
        if not cookieId:
            raise tl_exception.TlException('cookie id not exists')
        session = Session.getSession(cookieId)
        if not session:
            raise tl_exception.TlException('session not exsits')
        return session

    def getCurrentUser(self):
        """
            return e: {'username':'xxx', 'email': 'aaaa', 'password':xxx}
            return the db document that set by login method
        """
        return self.getSession().get("CURRENT_USER")

    def setCurrentUser(self, user):
        self.getSession().put("CURRENT_USER", user)
