from tornado.ioloop import IOLoop
from tornado.web import RequestHandler, Application, url
import threading
import time
from termcolor import cprint, colored
from tornado.httpclient import AsyncHTTPClient
from tornado import gen


# AsyncHTTPClient.configure("tornado.curl_httpclient.CurlAsyncHTTPClient", defaults=dict(user_agent="MyUserAgent"))
AsyncHTTPClient.configure("tornado.simple_httpclient.SimpleAsyncHTTPClient", defaults=dict(user_agent="MyUserAgent"))

class HelloHandler(RequestHandler):
    def get(self):
        cprint('get ... {0}'.format(self.request), 'green')
        print('request.arguments', colored(self.request.arguments, 'yellow'))
        print('request.full_url()', colored(self.request.full_url(), 'yellow'))
        print('request.cookies', colored(self.request.cookies, 'yellow'))
        print('request.headers', colored(self.request.headers, 'yellow'))
        print('request.files', colored(self.request.files, 'yellow'))
        print('request.request_time()', colored(self.request.request_time(), 'yellow'))
        print('path_args', colored(self.path_args, 'yellow'))
        print('path_kwargs', colored(self.path_kwargs, 'yellow'))
        print('get_argument(\'test\', \'defulat\')', colored(self.get_argument('test', 'default'), 'yellow'))

    def post(self):
        self.write("post")

def make_app():
    return Application([
        url(r"/", HelloHandler)
        ])

def main():
    app = make_app()
    app.listen(8888)
    print('listen start aha')
    IOLoop.current().start()

class MainThread(threading.Thread):
    def run(self):
        main()


try:
    t = MainThread()
    t.start()
    time.sleep(1)
    curlargs = ('-s')
    # curlars = ('-v', '-s')
    cprint(" get request ".center(80, '*'), 'green', attrs=['reverse', 'blink'])
    # subprocess.call(['/usr/bin/curl', 'http://localhost:8888', curlargs])
    # subprocess.call(['/usr/bin/curl', 'http://localhost:8888/?test=1', curlargs])
    httpclient = AsyncHTTPClient()

    @gen.coroutine
    def visitServer(url, *args):
        response = yield httpclient.fetch(url)
        cprint('response:{0}'.format(response.body), 'blue')

    visitServer('http://localhost:8888/')
    visitServer('http://localhost:8888/?test=113')
    time.sleep(2)
finally:
    IOLoop.current().stop()
