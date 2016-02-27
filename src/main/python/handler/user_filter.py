#!/usr/bin/env python
# -*- coding: utf-8 -*-
#

from tl_exception import TlException

def before(handler):
    """
    before handler call doMethod
    """
    path = handler.request.path
    if (path.startswith('/user/')):
        if not handler.current_user:
            raise TlException('用户未登录')

def after(handler):
    """
    after handler call eoMethod
    """
    pass
