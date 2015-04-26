#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os.path
import tornado.escape
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web

from tornado.options import define, options

define("port", default=8888, help="run on the given port", type=int)
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

class Application(tornado.web.Application):
    def __init__(self):
        settings = dict(
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            xsrf_cookies=True,
            cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
            debug=True,
        )
        handlers = [
            (r"/", HomeHandler),
            (
                r"/test-ng/(.*)",
                tornado.web.StaticFileHandler,
                {"path": os.path.join(os.path.dirname(__file__), "test-ng")}),
            (
                r"/(.*)\.html",
                HtmlHandler,
                {"path": os.path.join(os.path.dirname(__file__), "")}),
            (r"/phone/(.*)", PhoneHandler, dict(), "a rest api from json")
        ]
        super(Application, self).__init__(handlers, **settings)


class HtmlHandler(tornado.web.StaticFileHandler):
    def get(self, path, include_body=True):
        tornado.web.StaticFileHandler.get(self, path + ".html", include_body)


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

def main():
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
