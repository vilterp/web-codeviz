from google.appengine.ext import webapp
from google.appengine.ext.webapp import util

import simplejson, logging

import recordexec

# TODO: profile. something in here is taking a long time...
# TODO: timeouts

class ExecHandler(webapp.RequestHandler):
    
    def post(self):
        try:
            events = recordexec.recordexec(self.request.get('source'))
            result = {
                'type': 'success',
                'events': events
            }
        except recordexec.CompilationError, e:
            # http://docs.python.org/library/exceptions.html#exceptions.SyntaxError
            result = {
                'type': 'error',
                'msg': e.err.msg,
                'lineno': e.err.lineno
            }
        # logging.debug(result)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(simplejson.dumps(result))
    

def main():
    logging.getLogger().setLevel(logging.DEBUG)
    application = webapp.WSGIApplication([('/exec', ExecHandler)],
                                         debug=True)
    util.run_wsgi_app(application)

if __name__ == '__main__':
    main()
