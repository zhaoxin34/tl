#!/usr/bin/env python
# -*- coding: utf-8 -*-
#

import hashlib
import datetime
from service.common_service import *
from config import config

def upload(requestFiles, _current_user):
    print(_current_user)
    file = requestFiles['file'][0]
    original_fname = file['filename']

    time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    md5 = hashlib.md5()
    md5.update((time + original_fname).encode())
    hash_file_name = md5.hexdigest() + '.' + original_fname.split('.')[1]
    output_file_name = config['upload']['storage_folder'] + hash_file_name
    with open(output_file_name, 'wb') as fi:
        fi.write(file['body'])
    return success({'filename': hash_file_name})
