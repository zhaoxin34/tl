def gen():
    ret = yield 10
    print(ret)
    ret = yield 11
    print(ret)

a = gen()
b = next(a)
print(b)
b = a.send(1000)
print(b)
b = a.send(10000)
print(b)

