import tornado.ioloop
import tornado.web

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.set_cookie('abc', '123', expires_days=30)
        print('=============', self.request.cookies)
        self.write("Hello, world")

application = tornado.web.Application([
    (r"/", MainHandler),
    (r"/test/", MainHandler),
])

if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.current().start()
