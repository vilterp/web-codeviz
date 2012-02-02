import inspect, pydoc

def getdocurl(obj):
    mod = inspect.getmodule(obj)
    if mod:
        d = pydoc.Doc()
        return d.getdocloc(mod)
    else:
        return None
