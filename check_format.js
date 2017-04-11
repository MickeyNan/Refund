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
      var phone_no_final = $('#phone_no').val();
      var order_no_final = $('#order_no').val();
      var broke_no_final = $('#broke_no').val();

      var d = {"phone_no":17}
      $.ajax({
        url: 'http://127.0.0.1:8005/refund',
        data: JSON.stringify(d),
        type: "post",
        dataType: "json",
        success: function(data){
          alert(data);
          console.log(data);
        },
        error: function(data) {
          alert('0');
          console.log(data);
        }
      });
    }


  });
});