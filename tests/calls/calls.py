def fibcalls(n):
    if n == 1 or n == 0:
        return {
            'name': 'fib',
            'args': [n],
            'subcalls': [],
            'result': 1
        }
    else:
        call_n1 = fibcalls(n-1)
        call_n2 = fibcalls(n-2)
        return {
            'name': 'fib',
            'args': [n],
            'subcalls': [call_n1, call_n2],
            'result': call_n1['result'] + call_n2['result']
        }

def faccalls(n):
    if n == 1:
        return {
            'name': 'fac',
            'args': [n],
            'subcalls': [],
            'result': 1
        }
    else:
        call = faccalls(n-1)
        return {
            'name': 'fac',
            'args': [n],
            'subcalls': [call],
            'result': call['result'] * n
        }

def numcalls(call):
    acc = 0
    for sc in call['subcalls']:
        acc += numcalls(sc)
    return acc + 1
