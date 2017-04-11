access_token=`curl -s "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=&secret="`
echo ${access_token} > /root/workspace/Refund/access_token.json