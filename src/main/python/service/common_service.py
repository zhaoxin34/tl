#!/usr/bin/env python
# -*- coding: utf-8 -*-

def success(bodyKwArgs=None):
    """
    正常返回
    """
    return {
        'header': 0,
        'body': bodyKwArgs
    }

def error(status, errorMsg, bodyKwArgs=None):
    """
    错误返回
    """
    return {
        'header': {
            'status': status,
            'errorMsg': errorMsg
        },
        'body': bodyKwArgs
    }

def check(field, value, __db):
    if field in ['username', 'email']:
        count = yield __db['tl']['user'].find({field: value}).count()
        return success({'unique': False if count > 0 else True})
    else:
        return success({'unique': True})
