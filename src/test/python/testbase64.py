import base64
from tornado import gen
from tornado.httpclient import AsyncHTTPClient
from tornado.httpclient import HTTPRequest
from tornado.ioloop import IOLoop
import urllib
import time
import threading

AsyncHTTPClient.configure("tornado.simple_httpclient.SimpleAsyncHTTPClient", defaults=dict(user_agent="MyUserAgent", content_encoding='UTF-8'))

@gen.coroutine
def sendRequest(url, **kwargs):
    httpclient = AsyncHTTPClient()
    request = HTTPRequest(url, **kwargs)
    print('=' * 50, kwargs and kwargs['method'], url)
    response = yield httpclient.fetch(request)
    print(response)
    print(response.header)
    print(response.body)


def main():
    print('listen start aha')
    IOLoop.current().start()


class MainThread(threading.Thread):
    def run(self):
        main()

try:
    t = MainThread()
    t.start()
    with open('/Users/xinzhao/Downloads/mingpian.jpg', 'rb') as fi:
        base64byte = base64.b64encode(fi.read())
        post_data = {
            'key': 'f1843020caee708756d9bc134fb0c7a1',
            'requestUrl': 'http://op.juhe.cn/hanvon/bcard/query',
            'dtype': 'json',
            'requestType': 'POST',
            'image': base64byte,
            'lang': '',
            'color': ''
        }
        sendRequest('http://www.juhe.cn/box/test', method="POST", body=urllib.parse.urlencode(post_data))

    time.sleep(2)
finally:
    pass
