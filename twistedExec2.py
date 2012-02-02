from twisted.web.server import Site
from twisted.web import static
from twisted.web.resource import Resource
from twisted.internet import reactor
import ujson
import logging
import recordexec

class ExecCall(Resource):
		def render_POST(self, request):
				try:
						events = recordexec.recordexec(request.args["source"][0])
						result = {
								'type': 'success',
								'events': events
						}
				except recordexec.CompilationError, e:
						result = {
						'type': 'error',
						'msg': e.err.msg,
						'lineno': e.err.lineno
						}
				return ujson.encode(result)

root = static.File('html')
root.putChild('exec', ExecCall())
factory = Site(root)
reactor.listenTCP(3000, factory)
reactor.run()


        

