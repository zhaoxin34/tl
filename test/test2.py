# def gen():
#     ret = yield 10
#     print(ret)
#     ret = yield 11
#     print(ret)

# a = gen()
# b = next(a)
# print(b)
# b = a.send(1000)
# print(b)
# b = a.send(10000)
# print(b)

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

print(id(Test.a)) # 1
print(id(test.a)) # 2

test.get()
