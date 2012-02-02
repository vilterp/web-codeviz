import sys, copy

EVENTS = []
OR = 0

# TODO: sandbox -- no IO, no imports
# TODO: line events -- local variable changes
# TODO: deal width lambdas, classes

RESTRICTED_BUILTINS = {}
blacklist = set(['open', 'input', 'raw_input', 'eval', 'quit', '__import__', 'SystemExit'])
import __builtin__
for item in dir(__builtin__):
    if item not in blacklist:
        RESTRICTED_BUILTINS[item] = getattr(__builtin__, item)

def recordexec(code):
    global EVENTS, OR
    EVENTS = []
    OR = False
    clean_globals = {
        "__name__": "__main__",
        "__file__": '<codeviz source>',
        '__builtins__': RESTRICTED_BUILTINS
    }
    actual_stdout = sys.stdout
    sys.stdout = OutputRecorder()
    sys.settrace(tracefunc)
    try:
        exec code in clean_globals
    except SyntaxError, e:
        sys.settrace(None)
        raise CompilationError(e)
    except Exception, e:
        sys.settrace(None)
        EVENTS.append({
            'type': 'exception',
            'name': e.__class__.__name__,
            'msg': str(e)
        })
    finally:    
        sys.settrace(None)
        sys.stdout = actual_stdout
    return build_call_objects(EVENTS)

def build_call_objects(events):
    
    def bco(events, start_ind):
        evt = events[start_ind]
        call = {
            'type': 'call',
            'func': evt['func'],
            'args': evt['args'],
            'subevents': []
        }
        nextind = start_ind + 1
        subevents = call['subevents']
        while True:
            nextevt = events[nextind]
            if nextevt['type'] == 'print':
                buf = ''
                while nextevt['type'] == 'print':
                    buf += nextevt['output']
                    nextind += 1
                    nextevt = events[nextind]
                subevents.append({
                    'type': 'print',
                    'output': buf
                })
            elif nextevt['type'] == 'call':
                callobj, nextind = bco(events, nextind)
                subevents.append(callobj)
            elif nextevt['type'] == 'return':
                call['retval'] = nextevt['val']
                nextind += 1
                break
            else:
                raise Exception('unknown event type', nextevt) # todo: handle exceptions...
        return (call, nextind)
    
    call, nextind = bco(events, 0)
    if nextind == len(events):
        return call
    else:
        raise Exception('events left over: ', events[nextind:])

class OutputRecorder:
    
    def write(self, out):
        global EVENTS
        EVENTS.append({
            'type': 'print',
            'output': copy.deepcopy(out)
        })
    

class CompilationError(Exception):
    
    def __init__(self, e):
        self.err = e
    
    def __str__(self):
        return str(self.err)
    

def tracefunc(frame, event, arg):
    global EVENTS, OR
    if event == 'return':
        if OR > 0:
            OR -= 1
        else:
            EVENTS.append({
                'type': 'return',
                'val': copy.deepcopy(arg)
            })
    elif event == 'call':
        if OR > 0:
            OR += 1
        else:
            codeobj = frame.f_code
            numargs = codeobj.co_argcount
            argnames = codeobj.co_varnames[:numargs]
            argvals = [copy.deepcopy(frame.f_locals[name]) for name in argnames]
            func_name = codeobj.co_name
            if len(argvals) > 0 and isinstance(argvals[0], OutputRecorder):
                OR += 1
            else:
                EVENTS.append({
                    'type': 'call',
                    'func': func_name,
                    'args': argvals
                })
    else:
        pass
        #print 'not doing', event, 'yet'
    return tracefunc

def testonfile(fn):
    source = open(fn).read()
    return recordexec(source)

if __name__ == '__main__':
    if len(sys.argv) == 2:
        fn = sys.argv[1]
        callobj = recordexec(open(fn).read())
        import pprint
        pprint.pprint(callobj)
    else:
        print 'supply file as arg'
