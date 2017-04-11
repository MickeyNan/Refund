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
from concurrent.futures import ThreadPoolExecutor

define("port", default=8005, help="run on the given port", type=int)

class RefundHandler(tornado.web.RequestHandler):
	def post(self):
		self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
		self.set_header("Access-Control-Allow-Origin","*")
		self.set_header('Access-Control-Allow-Headers','*')
		request_body = self.request.body
		print request_body
		self.write({"status":"ok"});

def main():
    application = tornado.web.Application([
        (r"/refund", RefundHandler),
    ])
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.current().start()

if __name__ == "__main__":
    main()