from twisted.web.server import Site
from twisted.web import static
from twisted.web.resource import Resource
from twisted.internet import reactor
import ujson
import logging
import recordexec

logging.basicConfig(level=logging.INFO)

class ExecCall(Resource):
  def render_POST(self, request):
    logging.info('exec %s' % request.args['title'])
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

root = static.File('frontend')
root.putChild('exec', ExecCall())
factory = Site(root)

port = 3000

logging.info('starting up...')
reactor.listenTCP(port, factory)
logging.info('running on port %d' % port)
reactor.run()
