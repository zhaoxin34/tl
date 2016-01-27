def gen():
    ret = yield 10
    print('after yield 10', ret)
    ret = yield 11
    print('after yield 11', ret)

a = gen()
b = next(a)
print('next', b)
b = a.send(1000)
print('after send 1000', b)
b = a.send(10000)
print('after send 10000', b)
a.send(100)

class Test():
    a = 1
    b = {}

    def get(self):
        print(id(self.a))
        print(id(Test.a))
        print(id(self.b))
        print(id(Test.b))

test = Test()
test.a = 2

print("test.a", test.a)
print("Test.a", Test.a)
print("id(test.a)", id(test.a))  # 1
print("id(Test.a)", id(Test.a))  # 1

test.get()
