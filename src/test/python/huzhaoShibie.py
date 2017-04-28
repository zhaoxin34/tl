#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests

config = {
    'key': 'b42f049e513119f81fa008f1fd12ead6',
    'cardType': 13
}
files = {'pic': open('/Users/xinzhao/Downloads/huzhao.jpg', 'rb')}
r = requests.post('http://v.juhe.cn/certificates/query.php', data=config, files=files)

print(r.text)

