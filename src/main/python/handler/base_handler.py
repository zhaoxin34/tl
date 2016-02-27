#!/usr/bin/env python
# -*- coding: utf-8 -*-
import tornado.escape
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import hashlib
import json
import importlib
import datetime
from tornado.log import app_log
from tornado import gen
from web_util.session import Session
import tl_exception
import inspect
import handler.user_filter

class BaseHandler(tornado.web.RequestHandler):
    """
    the handler deal the header, remove Content-Encoding, reparse the request body
    set cookie id
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
        必须在调用过prepair后才能调用
        """

        cookieId = self.cookieId
        if not cookieId:
            raise tl_exception.TlException('cookie id not exists')
        session = Session.getSession(cookieId)
        if not session:
            raise tl_exception.TlException('session not exsits')
        return session

    @gen.coroutine
    def get(self):
        yield self._doMethod()

    @gen.coroutine
    def post(self):
        yield self._doMethod()

    @gen.coroutine
    def head(self):
        yield self._doMethod()

    @gen.coroutine
    def put(self):
        yield self._doMethod()

    @gen.coroutine
    def _doMethod(self):
        try:
            # print('request.uri', self.request.uri)
            # print('request.path', self.request.path)
            # print('request.query', self.request.query)
            # print('request.remote_ip', self.request.remote_ip)
            # print('request.protocol', self.request.protocol)
            # print('request.host', self.request.host)
            # print('request.files', self.request.files)
            # print('xcookies', self.cookies)
            # print('iterate cookies')
            # for k in self.cookies:
            #     # print(type(self.request.cookies[k]))
            #     print('\trequest.cookie[{0}]= {1}'.format(k, self.get_cookie(k)))
            # print('request.arguments', self.request.arguments)
            # for k in self.request.arguments:
            #     print('\trequest.arguments[{0}] = {1}'.format(k, self.get_argument(k)))
            # print('request.headers', self.request.headers)
            # for k in self.request.headers:
            #     print('\trequest.headers[{0}]= {1}'.format(k, self.request.headers[k]))

            # deal request argument

            # do the filter
            handler.user_filter.before(self)

            self.__cookieArgs = None
            self.__headerArgs = None
            self.__args = None
            self.__requestArgs = None

            # deal request arguemnt
            def getRequestArg(param):
                if not self.__requestArgs:
                    self.__requestArgs = {
                        'requestUri': self.request.uri,
                        'requestPath': self.request.path,
                        'requestRemoteIp': self.request.remote_ip,
                        'reqeustProtocol': self.request.protocol,
                        'requestHost': self.request.host,
                        'requestFiles': self.request.files,
                        'requestMethod': self.request.method.lower()
                    }
                    app_log.debug('deal request args: %s', self.__requestArgs)
                return None if param not in self.__requestArgs else self.__requestArgs[param]

            # deal cookie arguemnt
            def getCookieArg(param):
                if not self.__cookieArgs:
                    self.__cookieArgs = {}
                    for k in self.cookies:
                        key = 'cookie' + k.lower().title().replace('-', '').replace('_', '')
                        self.__cookieArgs[key] = self.get_cookie(k)
                    app_log.debug('deal cookie args: %s', self.__cookieArgs)

                return None if param not in self.__cookieArgs else self.__cookieArgs[param]

            # deal header argument
            def getHeaderArg(param):
                if not self.__headerArgs:
                    self.__headerArgs = {}
                    for k in self.request.headers:
                        key = 'header' + k.lower().title().replace('-', '').replace('_', '')
                        self.__headerArgs[key] = self.request.headers[k]
                    app_log.debug('deal header args: %s', self.__headerArgs)

                return None if param not in self.__headerArgs else self.__headerArgs[param]

            # deal args
            def getArgs():
                if not self.__args:
                    self.__args = {}

                    for k in self.request.arguments:
                        self.__args[k] = self.get_argument(k)
                    if 'Content-Type' in self.request.headers:
                        contentType = self.request.headers['Content-Type']
                        if (contentType.find('application/json') != -1 and self.request.method.lower() == 'post'):
                            bodyData = json.loads(self.request.body.decode('utf-8'))
                            for k, v in bodyData.items():
                                self.__args[k] = v
                        elif (contentType.find('application/x-www-form-urlencoded') != -1 and self.request.method.lower() == 'post'):
                            for k in self.request.body_arguments:
                                self.__args[k] = self.get_body_argument(k)
                    app_log.debug('deal __args: %s', self.__args)
                return self.__args

            def getArg(param):
                args = getArgs()
                return None if param not in args else args[param]

            def getSettingArg(param):
                param = param.replace('__', '')
                return None if param not in self.settings else self.settings[param]

            # deal path to service mapping
            path = self.request.path
            # /common@test.do or /user/tl@create.do
            paths = path.split('/')
            packages = paths[:-1]
            moduleAndMethod = paths[-1].split('@')
            module = moduleAndMethod[0]
            method = moduleAndMethod[1]
            fullModule = [p for p in packages if p]
            fullModule.append(module)
            fullModule = 'service.' + '.'.join(fullModule) + '_service'
            module = importlib.import_module(fullModule)
            methodName = method.replace('.do', '')
            method = getattr(module, methodName)
            methodParams = inspect.getargspec(method)[0]

            # define method args
            methodArgs = {}
            if methodParams:
                for param in methodParams:
                    if param.startswith('header'):
                        methodArgs[param] = getHeaderArg(param)
                    elif param.startswith('request'):
                        methodArgs[param] = getRequestArg(param)
                    elif param.startswith('cookie'):
                        methodArgs[param] = getCookieArg(param)
                    elif param.startswith('__'):
                        methodArgs[param] = getSettingArg(param)
                    elif param == '_session':
                        methodArgs['_session'] = self.getSession()
                    elif param == '_handler':
                        methodArgs['_handler'] = self
                    elif param == '_args':
                        methodArgs['_args'] = getArgs()
                    elif param == '_current_user':
                        methodArgs[param] = self.current_user
                    else:
                        methodArgs[param] = getArg(param)

            # execute method
            if (inspect.isgeneratorfunction(method)):
                method = gen.coroutine(method)
                data = yield method(**methodArgs)
            else:
                data = method(**methodArgs)
            self.writeData(**data)

            # do the after filter
            handler.user_filter.after(self)
        except Exception as e:
            app_log.exception(e)
            self.writeData({'status': -100, 'errorMsg': str(e)})
        # finally:
        #     self.finish()

    def get_current_user(self):
        """
            session is web_util.session
            return e: {'username':'xxx', 'email': 'aaaa', 'password':xxx}
            return the db document that set by login method
        """
        return self.getSession().get("CURRENT_USER")

    @tornado.web.RequestHandler.current_user.setter
    def current_user(self, value):
        self._current_user = value
        self.getSession().put("CURRENT_USER", value)
