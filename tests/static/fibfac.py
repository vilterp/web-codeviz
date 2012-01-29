def fac(n):
    if n == 1:
        return 1
    else:
        return n * fac(n - 1)

def fib(n):
    if n == 0 or n == 1:
        return 1
    else:
        return fib(n-1) + fib(n-2)

if __name__ == '__main__':
    print fac(200)
