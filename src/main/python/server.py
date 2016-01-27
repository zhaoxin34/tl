#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os.path
import tornado.escape
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web

from tornado.options import define, options
from tornado.log import app_log
# from utils.logger import webLogger

define("port", default=8888, help="run on the given port", type=int)
define("webroot", default="/Users/xinzhao/working/python/tl/web", help="the web root dir", type=str)
# define("mysql_host", default="127.0.0.1:3306", help="blog database host")
# define("mysql_database", default="blog", help="blog database name")
# define("mysql_user", default="blog", help="blog database user")
# define("mysql_password", default="blog", help="blog database password")


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

    def writeData(self, header=None, body=None):
        """
        write response data, based header and body
        """
        defaultHeader = {'status': 0}
        defaultBody = {}
        self.write({'header': header or defaultHeader, 'body': body or defaultBody})

class Application(tornado.web.Application):
    def __init__(self):
        settings = dict(
            template_path=os.path.join(options.webroot, "templates"),
            static_path=os.path.join(options.webroot, "static"),
            # xsrf_cookies=True,
            cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
            debug=True,
        )
        handlers = [
            (r"/", HomeHandler),
            (r"/(login|logout)", LoginHandler),
            (
                r"/test-ng/(.*)",
                tornado.web.StaticFileHandler,
                {"path": os.path.join(options.webroot, "test-ng")}),
            (
                r"/(.*)\.html",
                HtmlHandler,
                {"path": os.path.join(options.webroot, "")}),
            (r"/phone/(.*)", PhoneHandler, dict(), "a rest api from json"),
            (
                r"/analytics_test/(.*)",
                tornado.web.StaticFileHandler,
                {"path": os.path.join(options.webroot, "analytics_test")}),
        ]
        super(Application, self).__init__(handlers, **settings)


class HtmlHandler(tornado.web.StaticFileHandler):
    def get(self, path, include_body=True):
        tornado.web.StaticFileHandler.get(self, path + ".html", include_body)

    def set_extra_headers(self, path):
        # Disable cache
        self.set_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')

class HomeHandler(BaseHandler):
    def get(self):
        self.write('hello')

class PhoneHandler(BaseHandler):
    data = {
        "phones": [
            {"name": "苹果", "snippet": "Fast just got faster with Nexus S.", "age": 0},
            {"name": "摩托罗拉 XOOM™ with Wi-Fi", "snippet": "The Next, Next Generation tablet.", "age": 1},
            {"name": "爱立信 XOOM™", "snippet": "The Next, Next Generation tablet.", "age": 2}
        ]
    }

    def get(self, key):
        if key in self.data:
            self.write({'data': PhoneHandler.data[key]})

class LoginHandler(BaseHandler):
    def post(self, path):
        # self.set_status(409)
        if path == 'login':
            app_log.debug(self.request.body_arguments)
            self.writeData(None, {'username': 'zhaoxin', 'gender': '男'})
        elif path == 'logout':
            app_log.debug(self.request.body_arguments)
            self.writeData(None, {})

def main():
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
