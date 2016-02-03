# -*- coding: utf-8 -*-
from tornado.ioloop import IOLoop
from tornado.web import RequestHandler, Application, url
import threading
import time
from termcolor import cprint, colored
from tornado.httpclient import AsyncHTTPClient
from tornado.httpclient import HTTPRequest
from tornado import gen
from urllib import parse
import tornado

# AsyncHTTPClient.configure("tornado.curl_httpclient.CurlAsyncHTTPClient", defaults=dict(user_agent="MyUserAgent"))
AsyncHTTPClient.configure("tornado.simple_httpclient.SimpleAsyncHTTPClient", defaults=dict(user_agent="MyUserAgent", content_encoding='UTF-8'))

# httputils里面有个解析body的方法，一旦发现headers理由Content-Encoding就不会解析body了
# 试图写一个过滤掉 Content-Encoding的headers的方法，结果失败
#


class BaseHandler(RequestHandler):
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

class HelloHandler(BaseHandler):
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
        print('get_argument(\'arg1\', \'defulat\')', colored(self.get_argument('arg1', 'default'), 'yellow'))
        print('request.body', colored(self.request.body, 'yellow'))
        print('request.body_aguments', colored(self.request.body_arguments, 'yellow'))
        print('get_body_argument(\'arg1\', \'default\')', colored(self.get_argument('arg1', 'default'), 'yellow'))
        print('applications.settings', colored(self.application.settings, 'yellow'))
        self.write('hello')
        self.set_header('abc', 'bcd')

    def post(self):
        self.get()


def make_app():
    return Application([
        url(r"/", HelloHandler)
    ])


def main():
    app = make_app()
    app.listen(8899)
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
    def visitServer(url, **kwargs):
        request = None
        if kwargs:
            request = HTTPRequest(url, **kwargs)
        else:
            request = HTTPRequest(url)

        print('=' * 50, kwargs and kwargs['method'])
        response = yield httpclient.fetch(request)
        cprint('response.headers:{0}'.format(response.headers), 'blue')
        cprint('response.body:{0}'.format(response.body), 'blue')

    # visitServer('http://localhost:8888/')
    # visitServer('http://localhost:8888/?test=113')
    post_data = {'arg1': '赵鑫test'}
    body = parse.urlencode(post_data)
    visitServer(
        'http://localhost:8899/?test=113', method="POST", headers={
            'header1': 'header1 value', 'Content-Type': 'application/x-www-form-urlencoded'},
        # body='arg1=' + tornado.escape.url_escape('赵鑫'))
        body=body)
    time.sleep(2)
finally:
    IOLoop.current().stop()
    pass
