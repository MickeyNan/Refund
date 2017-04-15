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

import motor.motor_tornado


define("port", default=8005, help="run on the given port", type=int)


mongo_url = '127.0.0.1'
mongo_port = 27017
db_name = 'refund'
collection_refundinfo = 'refund_info'
collection_orderinfo = 'order_info'

mongo_client = motor.motor_tornado.MotorClient(mongo_url, mongo_port)
		
@gen.coroutine
def login(c,db_name):
	yield c[db_name].authenticate("user_refund", "1234")		

@gen.coroutine
def check_order(order_id):
	yield login(mongo_client,db_name)

	mongo_db = mongo_client[db_name]

	mongo_orderinfo = mongo_db[collection_orderinfo]

	doc_count = yield mongo_orderinfo.find({'order_id': order_id}).count()
	print type(doc_count)
	if ( doc_count == 0):
		exists = {"status":0}
		raise gen.Return(exists)
	else:
		exists = {"status":1}
		raise gen.Return(exists)

class RefundHandler(tornado.web.RequestHandler):
	@gen.coroutine
	def post(self):
		yield login(mongo_client,db_name)

		mongo_db = mongo_client[db_name]


		mongo_orderinfo = mongo_db[collection_orderinfo]
		mongo_refundinfo = mongo_db[collection_refundinfo]

		self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
		self.set_header("Access-Control-Allow-Origin","*")
		self.set_header('Access-Control-Allow-Headers','*')
		request_body = self.request.body

		print request_body

		request_dic = {}
		try:
			request_dic = eval(request_body)
		except Exception as e:
			print e
			self.write({"base_err": "Request Format Error"})
			return
		
		phone_no = request_dic['phone_no']
		order_id = request_dic['order_no']
		broke_no = request_dic['broke_no']
		buy_amount = request_dic['buy_amount']

		exists_status = yield check_order(order_id)

		doc_inser = {
			"phone_no": phone_no,
			"order_id": order_id,
			"broke_no": broke_no,
			"buy_amount": buy_amount
		}

		print exists_status

		mongo_refundinfo = yield mongo_db[collection_refundinfo]
		if (exists_status['status'] == 0):
			self.write(exists_status)
		else:
			refund_order_exis = yield mongo_refundinfo.find({'order_id': order_id}).count()
			print "refund_order_exis is " + str(refund_order_exis)
			if (refund_order_exis == 0):
				try:
					yield mongo_refundinfo.insert(doc_inser)
					exists_status['insert_status'] = "ok"
				except Exception as e:
					print e
					exists_status['insert_status'] = "wrong"
			else:
				pass
			
			self.write(exists_status)

class OrderCheckerHandler(tornado.web.RequestHandler):
	@gen.coroutine
	def post(self):
		self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
		self.set_header("Access-Control-Allow-Origin","*")
		self.set_header('Access-Control-Allow-Headers','*')
		request_body = self.request.body
		array = request_body.split("=")

		if (len(array) != 2):
			self.write("{'err_status': '1',error': 'need 1 param'}")
			return
		if not ('order_id' in array):
			self.write("{'err_status': '2','error': 'request params wrong'}")
			return

		order_id = array[1]

		yield login(mongo_client,db_name)

		mongo_db = mongo_client[db_name]


		mongo_orderinfo = mongo_db[collection_orderinfo]
		mongo_refundinfo = mongo_db[collection_refundinfo]

		dup_doc_count = yield mongo_refundinfo.find({'order_id': order_id}).count()

		exists_doc_count = yield mongo_orderinfo.find({'order_id': order_id}).count()
		
		print dup_doc_count,exists_doc_count

		if (dup_doc_count > 0):
			self.write("{'err_status': '3','error': 'order exists in refundinfo'}")
			return
		elif (exists_doc_count < 1):
			self.write("{'err_status': '4','error': 'order not exists in orderinfo'}")
			return
		elif (exists_doc_count >=1 and dup_doc_count < 1):
			self.write("{'err_status': '0','error': ''}")
			return


		



def main():
    application = tornado.web.Application([
        (r"/refund", RefundHandler),
        (r"/order_checker",OrderCheckerHandler),
    ])
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.current().start()

if __name__ == "__main__":
    main()