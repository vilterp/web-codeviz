f = open('/Users/pete/Desktop/out.txt', 'w')

def realout(w):
    f.write(w + '\n')

class Recorder:
    
    def __init__(self):
        self.outputs = []
    
    def write(self, out):
        self.outputs.append(out)
    

r = Recorder()
print r

import sys
sys.stdout = r

print 'hello world'

realout(str(r.outputs))
