function phone_no_check(phone_no) {
	var pattern = /^1[34578]\d{9}$/; 
	return pattern.test(phone_no); 
}

function validate() {
	var $input_ele_phone = $("#phone_no");
	var $submit = $('#submit');
	$input_ele_phone.on("change", function () {
		console.log('.on(change) = ' + $(this).val());
	});

}

jQuery(function(){  
  // change event
  var $submit = $('#submit');

  var $err_alarm = $('#format_err');

  var phone_no_ok = false;
  var order_no_ok = false;
  var broke_no_ok = false;

  $('#phone_no').on('keyup', function() {
    console.log('.on(change) = ' + $(this).val());
    if (phone_no_check($(this).val())) {
      phone_no_ok = true;
      if (phone_no_ok&&order_no_ok&&broke_no_ok) {
        $submit.removeClass('disable').addClass('submit').removeAttr('disabled');
      }
    	
      $err_alarm.attr('style','display: none');
    }else {
    	$submit.removeClass('submit').addClass('disable').attr('disabled', 'disabled');
      $err_alarm.attr('style','');
    }
  });
  
  $('#order_no').on('keyup',function() {
    if ($(this).val().length != 0) {
      order_no_ok = true;
    }else {
      order_no_ok = false;
    }
    if (phone_no_ok&&order_no_ok&&broke_no_ok) {
        $submit.removeClass('disable').addClass('submit').removeAttr('disabled');
    }else {
        $submit.removeClass('submit').addClass('disable').attr('disabled', 'disabled');
    }
  });


  $('#broke_no').on('keyup',function() {
    if ($(this).val().length != 0) {
      broke_no_ok = true;
    }else {
      broke_no_ok = false;
    }
    if (phone_no_ok&&order_no_ok&&broke_no_ok) {
        $submit.removeClass('disable').addClass('submit').removeAttr('disabled');
    }else {
        $submit.removeClass('submit').addClass('disable').attr('disabled', 'disabled');
    }
  });



  $('#submit').on('click',function () {
    if (!phone_no_ok) {
      alert("输入正确格式的手机号");
    }else if (!order_no_ok) {
      alert("输入正确格式的订单号");
    }else if (!broke_no_ok) {
      alert("输入损坏数量");
    }else {
      var pic_uploaded = true;

      var progress_bar_list = $(".progress-bar");

      console.log(progress_bar_list.length)

      if (progress_bar_list.length < 1) {
        alert("未上传图片");
        return
      }

      progress_bar_list.each(function(index,element) {
        var progress = element.style.cssText;
        if (progress.indexOf("100%") < 0) {
          pic_uploaded = false
        }
      });


      if (!pic_uploaded) {
        alert("图片未上传完毕")
        return
      }

      
      var phone_no_final = $('#phone_no').val();
      var order_no_final = $('#order_no').val();
      var broke_no_final = $('#broke_no').val();
      var buy_amount = $('#buy_amount').val();

      var d = {
        'phone_no': phone_no_final,
        'order_no': order_no_final,
        'broke_no': broke_no_final,
        'buy_amount': buy_amount
      }

      $.ajax({
        url: 'http://127.0.0.1:8005/refund',
        data: JSON.stringify(d),
        type: "post",
        dataType: "json",
        success: function(data){

          var base_err = data['base_err'];
          var server_status = data['status'];
          var insert_status = data['insert_status'];
          
          if (base_err != null) {
            alert(base_err);
            window.location.href = "https://weidian.com/?userid=909943470";
            return;
          }


          if (server_status != 1) {
            alert("此订单不存在，请检查或联系客服");
            window.location.reload();
            return;
          }

          if (insert_status == null) {
            alert("此订单已提交过");
            window.location.reload();
            return;
          }
          alert("提交成功");
          window.location.href = "https://weidian.com/?userid=909943470";
          console.log(data);
        },
        error: function(data) {
          alert('服务器错误，请稍后重试');
          console.log(data);
        }
      });
    }


  });
});