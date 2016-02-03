#!/usr/bin/env python
# -*- coding: utf-8 -*-

class Session():
    SESSION_POOL = dict()

    @staticmethod
    def createSession(cookieId):
        session = Session()
        Session.SESSION_POOL.update({cookieId: session})
        return session

    @staticmethod
    def getSession(cookieId):
        if cookieId in Session.SESSION_POOL:
            return Session.SESSION_POOL[cookieId]

    def __init__(self, dict=None):
        self.data = {}
        if dict:
            self.data.update(dict)

    def put(self, key, value):
        self.data[key] = value

    def remove(self, key):
        self.data.remove(key)

    def get(self, key):
        if key in self.data:
            return self.data[key]
        return None

    def clear(self):
        self.data.clear()
