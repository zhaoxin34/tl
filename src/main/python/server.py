#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os.path
import tornado.escape
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web

# import handler.user_handler
from handler.base_handler import BaseHandler
from tornado.options import define, options
from tornado.log import app_log
import motor
# from utils.logger import webLogger

define("port", default=8888, help="run on the given port", type=int)
define("webroot", default="/Users/xinzhao/working/python/tl/web", help="the web root dir", type=str)
define("mongodb_host", default="localhost", help="mongodb host", type=str)
define("mongodb_port", default=27017, help="mongodb port", type=int)

# define("mysql_host", default="127.0.0.1:3306", help="blog database host")
# define("mysql_database", default="blog", help="blog database name")
# define("mysql_user", default="blog", help="blog database user")
# define("mysql_password", default="blog", help="blog database password")


class Application(tornado.web.Application):
    def __init__(self):
        db = motor.motor_tornado.MotorClient("mongodb://" + options.mongodb_host + ":" + str(options.mongodb_port), max_pool_size=10)
        settings = dict(
            template_path=os.path.join(options.webroot, "templates"),
            static_path=os.path.join(options.webroot, "static"),
            # xsrf_cookies=True,
            cookie_secret="0eebeaca-0eae-47d7-99cf-d99a449349a8",
            debug=True,
            db=db
        )
        handlers = [
            (
                r"/(.*)\.html",
                HtmlHandler,
                {"path": os.path.join(options.webroot, "")}),
        ]
        super(Application, self).__init__(handlers, **settings)


class HtmlHandler(tornado.web.StaticFileHandler):
    def get(self, path, include_body=True):
        app_log.debug('HtmlHandler deal {0}'.format(path))
        tornado.web.StaticFileHandler.get(self, path + ".html", include_body)

    def set_extra_headers(self, path):
        # Disable cache
        self.set_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')

# class PhoneHandler(BaseHandler):
#     data = {
#         "phones": [
#             {"name": "苹果", "snippet": "Fast just got faster with Nexus S.", "age": 0},
#             {"name": "摩托罗拉 XOOM™ with Wi-Fi", "snippet": "The Next, Next Generation tablet.", "age": 1},
#             {"name": "爱立信 XOOM™", "snippet": "The Next, Next Generation tablet.", "age": 2}
#         ]
#     }

#     def get(self, key):
#         if key in self.data:
#             self.write({'data': PhoneHandler.data[key]})


def main():
    # parse args
    tornado.options.parse_command_line()

    # create application and load handlers
    application = Application()
    application.add_handlers(r".*", [(r"/.*\.do", BaseHandler)])
    # handler.user_handler.addHandlers(application)

    # set process number, set listen port
    # sockets = tornado.netutil.bind_sockets(options.port)
    server = tornado.httpserver.HTTPServer(application, xheaders=True)
    server.listen(options.port)

    # TODO 不debug时打开
    # server.bind(options.port)
    # server.start(0)

    # server.add_sockets(sockets)

    app_log.info('IOLoop starting...')
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
