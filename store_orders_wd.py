import time
import datetime
import json
import base64
import hmac
from hashlib import sha1 as sha
from tornado import httpserver
from tornado import gen
import tornado.ioloop
import tornado.options
import tornado.web
import hashlib
from tornado.options import define, options

define("port", default=8006, help="run on the given port", type=int)

class OrderStoreHandler(tornado.web.RequestHandler):
	def post(self):
		print self.request.body
		self.write({"status": "success"})

	def get(self):
		print self.request.body
		self.write({"status": "success"})


def main():
    application = tornado.web.Application([
        (r"/store_order", OrderStoreHandler),
    ])
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.current().start()

if __name__ == "__main__":
    main()