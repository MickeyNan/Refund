accessid = ''
accesskey = ''
host = ''
policyBase64 = ''
signature = ''
callbackbody = ''
filename = ''
key = ''
expire = 0
g_object_name = ''
now = timestamp = Date.parse(new Date()) / 1000; 
order_id = ''

server_ip = "http://127.0.0.1"

function send_request()
{
    var xmlhttp = null;
    if (window.XMLHttpRequest)
    {
        xmlhttp=new XMLHttpRequest();
    }
    else if (window.ActiveXObject)
    {
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
  
    if (xmlhttp!=null)
    {
        serverUrl = "http://127.0.0.1" + ':8002/token'
        xmlhttp.open( "GET", serverUrl, false );
        xmlhttp.send(null);
        return xmlhttp.responseText
    }
    else
    {
        alert("Your browser does not support XMLHTTP.");
    }
};

function order_check(order_id) {
    var xmlhttp = null;
    if (window.XMLHttpRequest)
    {
        xmlhttp=new XMLHttpRequest();
    }
    else if (window.ActiveXObject)
    {
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
  
    if (xmlhttp!=null)
    {
        serverUrl = server_ip + ':8005/order_checker'
        xmlhttp.open("POST", serverUrl, false);     
        xmlhttp.send('order_id=' + order_id);
        console.log(xmlhttp.responseText)

        return xmlhttp.responseText
    }
    else
    {
        alert("Your browser does not support XMLHTTP.");
    }
}

function get_signature()
{
    //可以判断当前expire是否超过了当前时间,如果超过了当前时间,就重新取一下.3s 做为缓冲
    now = timestamp = Date.parse(new Date()) / 1000; 
    if (expire < now + 3)
    {
        body = send_request()
        var obj = eval ("(" + body + ")");
        host = obj['host']
        policyBase64 = obj['policy']
        accessid = obj['accessid']
        signature = obj['signature']
        expire = parseInt(obj['expire'])
        callbackbody = obj['callback'] 
        key = obj['dir']
        return true;
    }
    return false;
};

function random_string(len) {
　　len = len || 32;
　　var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';   
　　var maxPos = chars.length;
　　var pwd = '';
　　for (i = 0; i < len; i++) {
    　　pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

function get_suffix(filename) {
    pos = filename.lastIndexOf('.')
    suffix = ''
    if (pos != -1) {
        suffix = filename.substring(pos)
    }
    console.log(filename.substring(0,pos));
    return suffix;
}

function calculate_object_name(filename)
{   
    var order_no_ele = $('#order_no');

    if (order_no_ele.length == 0) {
        order_id = 'no_order_id';
    }else {
        order_id = $('#order_no').val();
    }
    
    

    pos = filename.lastIndexOf('.');

    if (pos != -1) {
        prefix = filename.substring(0,pos);
        suffix = filename.substring(pos);
    }else {
        prefix = filename;
        suffix = '';
    }
    
    g_object_name = key + order_id + '_' + Date.parse(new Date()) + random_string(6) + suffix;
    console.log(g_object_name);
    return '';
}


function set_upload_param(up, filename, ret)
{
    if (ret == false)
    {
        ret = get_signature()
    }
    g_object_name = key;
    if (filename != '') {
        calculate_object_name(filename)
    }
    new_multipart_params = {
        'key' : g_object_name,
        'policy': policyBase64,
        'OSSAccessKeyId': accessid, 
        'success_action_status' : '200', //让服务端返回200,不然，默认会返回204
        'callback' : callbackbody,
        'signature': signature,
    };

    up.setOption({
        'url': host,
        'multipart_params': new_multipart_params
    });

    var phone_no = document.getElementById("phone_no").value;
    var order_id = document.getElementById("order_no").value;
    var broke_no = document.getElementById("broke_no").value;


    if (!phone_no_check(phone_no)) {
        alert("请输入正确格式的手机号");
        return 
    }

    if (order_id == '') {
        alert("请输入订单号")
        return
    }

    

    check_response = order_check(order_id)

    check_dic = eval("(" + check_response + ")")

    console.log(check_dic['err_status'])

    if (check_dic['err_status'] == "3") {
        alert("此订单已提交过退款申请")
        return
    }

    if (check_dic['err_status'] == "4") {
        alert("系统暂未生成此订单，请核实")
        return

    }

    if (broke_no == '') {
        alert("请输入损坏数量")
        return
    }

    

    if (check_dic['err_status']=="0"){
        up.start();
    }
}

function insertDB() {
    var phone_no = document.getElementById("phone_no").value;
    var order_id = document.getElementById("order_no").value;
    var broke_no = document.getElementById("broke_no").value;

    console.log(order_id);
    
}

var uploader = new plupload.Uploader({
	runtimes : 'html5,flash,silverlight,html4',
	browse_button : 'selectfiles', 
    multi_selection: false,
	container: document.getElementById('container'),
	flash_swf_url : 'lib/plupload-2.1.2/js/Moxie.swf',
	silverlight_xap_url : 'lib/plupload-2.1.2/js/Moxie.xap',
    url : 'http://oss.aliyuncs.com',

    filters: {
        mime_types : [ //只允许上传图片和zip,rar文件
        { title : "Image files", extensions : "jpg,png,bmp" }, 
        { title : "Zip files", extensions : "zip,rar" }
        ],
        max_file_size : '10mb', //最大只能上传10mb的文件
        prevent_duplicates : true, //不允许选取重复文件
    },
	init: {
		PostInit: function() {
			document.getElementById('ossfile').innerHTML = '';
			document.getElementById('postfiles').onclick = function() {
            set_upload_param(uploader, '', false);
            return false;
			};
		},

		FilesAdded: function(up, files) {
            var max_files = 2;

			plupload.each(files, function(file) {
                if (up.files.length > max_files) {
                    alert("最多支持上传3个文件");
                    up.removeFile(file);
                }else{
                    document.getElementById('ossfile').innerHTML += '<div id="' + file.id + '" style="font-size:25px">' + file.name + ' (' + plupload.formatSize(file.size) + ')<b></b>'
                     +'<div class="progress"><div class="progress-bar" style="width: 0%"></div></div>'
                     +'</div>';
                }
				
			});
		},

		BeforeUpload: function(up, file) {
            set_upload_param(up, file.name, true);
        },

		UploadProgress: function(up, file) {
			var d = document.getElementById(file.id);
			d.getElementsByTagName('b')[0].innerHTML = '<span>' + file.percent + "%</span>";
            var prog = d.getElementsByTagName('div')[0];
			var progBar = prog.getElementsByTagName('div')[0]
			progBar.style.width= file.percent+'%';
			progBar.setAttribute('aria-valuenow', file.percent);
		},

		FileUploaded: function(up, file, info) {
            if (info.status == 200)
            {
                document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = '上传成功';
            }
            else
            {
                document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = '上传成功但是后台出现问题';
            } 
		},

		Error: function(up, err) {
            if (err.code == -600) {
                document.getElementById('console').appendChild(document.createTextNode("\n选择的文件需小于10M"));
            }
            else if (err.code == -601) {
                document.getElementById('console').appendChild(document.createTextNode("\n仅支持png,jpg,bmp"));
            }
            else if (err.code == -602) {
                document.getElementById('console').appendChild(document.createTextNode("\n这个文件已经上传过一遍了"));
            }
            else 
            {
                document.getElementById('console').appendChild(document.createTextNode("\nError xml:" + err.response));
            }
		}
	}
});

uploader.init();
