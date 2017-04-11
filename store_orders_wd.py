import time
import datetime
import json

from tornado import httpserver
from tornado import gen
import tornado.ioloop
import tornado.options
import tornado.web
import hashlib
from tornado.options import define, options
import urllib


import motor.motor_tornado


define("port", default=8006, help="run on the given port", type=int)

mongo_url = ''
mongo_port = 27017
db_name = ''
collection_name = ''

mongo_client = motor.motor_tornado.MotorClient(mongo_url, mongo_port)
mongo_db = mongo_client[db_name]
mongo_collection = mongo_db[collection_name]



@gen.coroutine
def parse_order(request_str):
	decoded = urllib.unquote(request_str)
	message = decoded.split("content=")[1].split('&public=')[0]
	json_all = json.loads(message)
	message_co = json_all['message']

	order_id = message_co['order_id']
	buyer_phone = message_co['buyer_info']['phone']
	order_type = json_all['type']
	user_phone = message_co['user_phone']
	order_status = message_co['status']
	items_count = len(message_co['items'])

	order_info = {}
	order_info['order_id'] = order_id
	order_info['order_type'] = order_type
	order_info['order_status'] = order_status
	order_info['user_phone'] = user_phone
	order_info['buyer_phone'] = buyer_phone
	order_info['broke_no'] = 0
	order_info['items_count'] = items_count

	print order_info

	raise gen.Return(order_info)

class OrderStoreHandler(tornado.web.RequestHandler):
	@gen.coroutine
	def post(self):
		order_info = yield parse_order(self.request.body)
		doc_count = yield mongo_collection.find_one({'order_id': order_info['order_id']}).count()
		if (doc_count == 0):
			yield mongo_collection.insert_one(order_info)
		else:
			yield mongo_collection.update_one({'order_id': order_info['order_id']},{'$set': {'order_info': order_info['order_info']}})

		self.write({"status": "success"})

	@gen.coroutine
	def get(self):
		order_info = yield parse_order(self.request.body)
		doc_count = yield mongo_collection.find_one({'order_id': order_info['order_id']}).count()
		if (doc_count == 0):
			yield mongo_collection.insert_one(order_info)
		else:
			yield mongo_collection.update_one({'order_id': order_info['order_id']},{'$set': {'order_info': order_info['order_info']}})

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