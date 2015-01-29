function IsAndroid()  
{
   var userAgentInfo = navigator.userAgent;  
   var Agents = new Array("Android");  
   var flag = false;  
   for (var v = 0; v < Agents.length; v++) {  
       if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = true; break; }  
   }  
   return flag;  
}

function IsIphone4 () {
    if (window.screen.width==320&&window.screen.height==480) {
        return true;
    }
    else {
         return false;
    }
   
}

function is_weixn(){  
    var ua = navigator.userAgent.toLowerCase();  
    
    if(ua.match(/MicroMessenger/i)=="micromessenger") {  
        return true;  
    } else {  
        return false;  
    }  
}          

function getHostUrl(){
    var href = window.location.href;
    if(href.indexOf("/color_riche_extraordinaire") > 0){
        //正式环境
        href = "http://mobile_campaign.lorealparis.com.cn/color_riche_extraordinaire"
    }else{
        //anything else but must end with "/"
        href = href.substring(0, href.lastIndexOf("/"));
    }
    
    return  href;
}

function GetRequest() {
   var url = location.search; //获取url中"?"符后的字串
   var theRequest = new Object();
   if (url.indexOf("?") != -1) {
      var str = url.substr(1);
      strs = str.split("&");
      for(var i = 0; i < strs.length; i ++) {
         theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
      }
   }
   return theRequest;
}

function showWeiXinHint(){
    $("#weixin_hint").removeClass("f-dn");
}
function hideWeiXinHint(){
    $("#weixin_hint").addClass("f-dn");
}

function wxShareSuccess(title,content,shareid){
    $.ajax({
        url: '/shareInfos',
        type: 'put',
        dataType: 'json',
        data: { openid : openid,
                shareid : shareid,
                title : title,
                content : content
            }
        }); 
}

$(function(){


    var weixin = 0,
        firstA = 0;
        firstPrize = 1,
        usedNumber = 0,
        tooLate = 0;

    var pics = new Array();

    var Request = new Object();
        Request = GetRequest();
    var shareBy = Request['shareid'] == undefined?'':Request['shareid'];
    if (shareBy.length>0) 
    {
        weixin = 1;
    };

    var jsapiTicket = $.cookie("jsticket"),
        openid = $.cookie("openid"),
        jsapiElements = jsapiTicket.split(","),
        jsapiAppId = jsapiElements[0],
        jsapiTimestamp = parseInt(jsapiElements[1]),
        jsapiNonceStr = jsapiElements[2],
        jsapiSignature = jsapiElements[3];

    

    
    wx.config({
	    debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
	    appId: jsapiAppId, // 必填，公众号的唯一标识
	    timestamp: jsapiTimestamp, // 必填，生成签名的时间戳
	    nonceStr: jsapiNonceStr, // 必填，生成签名的随机串
	    signature: jsapiSignature,// 必填，签名，见附录1
	    jsApiList: ["onMenuShareTimeline","onMenuShareAppMessage","chooseImage","uploadImage","downloadImage"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
	});

    var localUrl = location.href,
        shareid = openid+"_"+ Date.parse(new Date()),
        shareUrl = localUrl+"?shareid="+shareid,
        shareImg = "http://" + window.location.host + '/images/page1_bg.jpg';

    
    wx.ready(function(){


        var random = Math.random();
        var title = random<0.5?'福袋已打包送到，我真的只能帮你到这儿了…':'福袋很多~可是抢抢也是会没了！你可以不着急，但真的得赶紧抢呀~';
        shareData = {
                        openid : openid,
                        shareid : shareid,
                        title : title,
                        content: "test"
                    };

		wx.onMenuShareAppMessage({
		    title: title, // 分享标题
		    desc: 'wx js-sdk test', // 分享描述
		    link: shareUrl, // 分享链接
		    imgUrl: shareImg, // 分享图标
		    success: function () { 
		        // 用户确认分享后执行的回调函数
                // wxShareSuccess('分享给好友','wx js-sdk test',shareid);
                $.ajax({
                    url: '/shareInfos',
                    type: 'put',
                    dataType: 'json',
                    data: shareData,
                    success:function(responseObj){
                        alert(response.success);
                    }
                }); 
		    },
		    cancel: function () { 
		        // 用户取消分享后执行的回调函数
		    }
		});

		wx.onMenuShareTimeline({
		    title: 'test 朋友圈', // 分享标题
		    desc:'朋友圈desc',
		    link: shareUrl, // 分享链接
		    imgUrl:shareImg, // 分享图标
		    success: function () { 
		        // 用户确认分享后执行的回调函数
                wxShareSuccess('分享到朋友圈','wx js-sdk test',shareid);
		    },
		    cancel: function () { 
		        // 用户取消分享后执行的回调函数
		    }
		});

		var serverId;
		$("#chooseImg").click(function(){
			wx.chooseImage({
		    success: function (res) {
		        var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
		        wx.uploadImage({
				    localId: localIds[0], // 需要上传的图片的本地ID，由chooseImage接口获得
				    isShowProgressTips: 1, // 默认为1，显示进度提示
				    success: function (res) {
				        serverId = res.serverId; // 返回图片的服务器端ID
				    }
				});
		    }
			});
		});

		$("#downloadImg").click(function(){
			wx.downloadImage({
			    serverId: serverId, // 需要下载的图片的服务器端ID，由uploadImage接口获得
			    isShowProgressTips: 1, // 默认为1，显示进度提示
			    success: function (res) {
			        var localId = res.localId; // 返回图片下载后的本地ID
			    }
			});
		})

	});
    var imgURL = "",
        baseUrl = getHostUrl(),
        userMobile = "",
        awardCode = "",
        deviceWidth = $(window).width(),
        deviceHeight = $(window).height(),
        trackingCampaign = "color_riche" ;

//set body height according to the device width
    
        
    // var mySwiper, bgWidth = 640,
    //     mpImage,
    //     maxImageWidth = 640, 
    //     canvasWidth = 1440,
    //     canvasHeight = 1920,
    //     currentThemeId = themeYH,
    //     bgHeight = 1016,
    //     deviceWidth = $(window).width(),
    //     deviceHeight = $(window).height(),
    //     infoMasked = !1,
    //     showTip = !0,
    //     pickThemeSwiper,
    //     pickThemeSwiper2,
    //     ptSwiperTop = deviceWidth/640 * 96, 
    //     ptSwiperHeight = deviceWidth/640 * 588,
    //     ptSlideHeight = deviceWidth/640 * 492,
    //     ptSlideWidth = 327.5 * deviceWidth/640,
    //     ptScreenLeft = (640-327.5)/2 * deviceWidth/640,
    //     ptScreenWidth = 299 * ptSlideHeight/476,
    //     ptScreenLeft = (ptSlideWidth - ptScreenWidth)/2
    //     peditorWidth = 450 * deviceWidth/640, //Editor at slide6
    //     peditorLeft = (deviceWidth - peditorWidth)/2, 
    //     peditorHeight = ( 599 / 450) * peditorWidth,
    //     peditorTop = deviceWidth/640 * 120;
        
    //     if(deviceHeight<=450){
        
    //     ptSwiperTop = deviceWidth/640 * 80, 
    //     ptSwiperHeight = deviceWidth/640 * 480,
    //     ptSlideHeight = deviceWidth/640 * 392;
 
            
    //         }

    var  infoMasked = !1;
        
        
    var themeSrc = "images/poster-mobile-A.png";
    var themeSrc2 = "images/poster-mobile-A_1.jpg";
    
    var content;

    //iphone4适应
     if (IsIphone4()==true) {
        // $(".page1_bg").css("background-image","url('images/page1_bg_origin.jpg')");
        // $(".page2_bg").css("background-image","url('images/page2_bg_origin.jpg')");
        $(".page0_ip4").attr("src", "images/page0_bg_origin.jpg");
        $(".page1_ip4").attr("src", "images/page1_bg_origin.jpg");
        $(".page2_ip4").attr("src", "images/page2_bg_origin.jpg");
        $(".page3_ip4").attr("src", "images/page3_bg_origin2.jpg");
        $(".page4_ip4").attr("src", "images/page3_bg_origin2.jpg");
        $(".loading_ip4").attr("src","images/loading_image.jpg");
        $(".campInfo_ip4").attr("src","images/campInfo_origin.jpg");


    };

    // 禁止文版被拖动
        document.body.style.userSelect = 'none';
        document.body.style.mozUserSelect = 'none';
        document.body.style.webkitUserSelect = 'none';

        //禁止图片被选中
        document.onselectstart = new Function('event.returnValue=false;');
        //禁止图片被拖动
        document.ondragstart = new Function('event.returnValue=false;');

        $(window).on('touchmove.scroll', function (e) {e.preventDefault();});
        $(window).on('scroll.scroll',function (e) {e.preventDefault();});
    //字体自适应
    function adaptive(){
    var w = $(".g-doc").width();

    var h = $(".g-doc").height();
    console.log(w);
    $("#top_component").css("height",h*0.6418);
    $("#bottom_component").css("top",h*0.6418);
    $("#bottom_component").css("height",h*0.3582);
    $("body").css("font-size", 62.5 * deviceWidth / 640+"%");
}
    
    // 加载页

    /*
     * 图片预加载
     * pics 预加载图片的对象数组
     * progressCallBack 加载中回调函数
     * completeCallback 图片加载完成回调函数
     */
    
    
    $(document).find(".preload").each(function(e){
        
        if(this.src.indexOf("images")!=-1){
            pics.push(this.src+"?"+e);
        }
    });
    // pics.push("images/7.png");
    // pics.push("images/8.png");
    // pics.push("images/9.png");
 //    console.log(i = pics[i]);
    


    function loadimg(pics, progressCallBack, completeCallback) {
        var index = 0;
        var len = pics.length;
        var img = new Image();
        var load = function () {
            img.src = pics[index];
            img.onload = function () {
                // 控制台显示加载图片信息
                console.log('第' + index + '个img被预加载', img.src);
                progressCallBack(Math.floor(((index + 1) / len) * 100) + "%");
                i = index;
                index++;
                
                if (index < len) {
                    load();
                } else {
                    completeCallback()
                }
            }
            return img;
        }
        if (len > 0) {
            load();
        } else {
            progressCallBack("100%");
        }
        return {
            pics:pics,
            load:load,
            progress:progressCallBack,
            complete:completeCallback
        };
    }

    loadimg(pics,function(w){
        
            var len = pics.length;
             //console.log(w);
              var per = parseInt(w);
                //console.log(per);
                $(".loading_num").html(w);
                $(".loading_page").find(".animated").removeClass("f-dn");

        },function(){
            //$("#divLoading").remove();
            //$("#progress_word").remove();

            $(".loading_page").remove();
            if(weixin==1){
                    $(".m-screen01").removeClass("f-dn");
                if(firstA==1){
                    $(".page0_firstA").removeClass("f-dn");
                    $(".page0_circle").addClass("f-dn");

                }
                else{

                }
            }
            else{
                 $(".m-screen0").removeClass("f-dn");
                 $(".m-screen0").find(".animated").removeClass("f-ann");
            }
            

            // console.log("ok");
        });
  
    

    // 首页

    var count = parseInt($(".luckybag").html().trim());
    var count1 = parseInt(count/1000000);
    var count2 = parseInt(count/100000)%10;
    var count3 = parseInt(count/10000)%10;
    var count4 = parseInt(count/1000)%10;
    var count5 = parseInt(count/100)%10;
    var count6 = parseInt(count/10)%10;
    var count7 = parseInt(count%10);
    var numPics = ["images/0.png","images/1.png","images/2.png","images/3.png","images/4.png","images/5.png","images/6.png","images/7.png","images/8.png","images/9.png"];
    // var numUrl = changeNum(countN);
    // 字体自适应
    $("body").css("font-size", 62.5 * deviceWidth / 320+"%");
    
    function changeNum(countN){
      
      return numPics[countN];

    }


   // $("#num1").html(count1.toString());
    // $("#num1").css("background-image","url("+changeNum(count1)+")");
    $("#num1").attr("src",changeNum(count1));
    $("#num2").attr("src",changeNum(count2));
    $("#num3").attr("src",changeNum(count3));
    $("#num4").attr("src",changeNum(count4));
    $("#num5").attr("src",changeNum(count5));   
    $("#num6").attr("src",changeNum(count6));
    $("#num7").attr("src",changeNum(count7));


    $("#num21").attr("src",changeNum(count1));
    $("#num22").attr("src",changeNum(count2));
    $("#num23").attr("src",changeNum(count3));
    $("#num24").attr("src",changeNum(count4));
    $("#num25").attr("src",changeNum(count5)); 
    $("#num26").attr("src",changeNum(count6));
    $("#num27").attr("src",changeNum(count7));   


    

    // changeNum = function (countN){

    // }

    // 活动信息

    $(".page1_info").click(function(e){
        infoMasked = !0;
        // ga('send', 'event', 'Hydrapower', 'Hydrapower/toshare', 'click');
        $(".activity_info").removeClass("f-dn");
        $(".activity_btn").removeClass("f-dn");


    });



    $(".activity_info").click(function(e){
        
        if(infoMasked){
            infoMasked = !1;
            $(".activity_info").addClass("f-dn");
            $(".activity_btn").addClass("f-dn"); 
        }
    });

    $(".activity_btn").click(function(e){
        
        if(infoMasked){
            infoMasked = !1;
            $(".activity_info").addClass("f-dn");
            $(".activity_btn").addClass("f-dn"); 
        }
    });

    $(".page1_belt").click(function(e){
         
         $(".m-screen0").addClass("animated fadeOutUp1");
         ga('send', 'event', 'CNY-social', 'move', 'click');
         //$('.m-screen0').addClass("f-dn");
         $('.m-screen1').removeClass("f-dn");
         $(".m-screen1").addClass("animated f-ad1 fadeInUp1");   


         
         $(".m-screen1").find(".animated").removeClass("f-ann")
    });

    function tearBag()
    {
        $(".m-screen0").addClass("animated fadeOutUp1");
         //$('.m-screen0').addClass("f-dn");
         $('.m-screen1').removeClass("f-dn");
         $(".m-screen1").addClass("animated f-ad1 fadeInUp1");   


         
         $(".m-screen1").find(".animated").removeClass("f-ann")
    };

    // $(".page1_belt").mousemove(function(e){
    //     console.log("page1_belt mousemove");
    //     tearBag();
    // });
    // 添加手势箭头
    var startX,startY;
    var belt = $("#page1_belt");
    var beltWidth = 0.2 *screen.width;

    var bgHeight = screen.width *960/640;

    var pointRightX = parseInt(0.4 * screen.width + beltWidth);
    var pointX = parseInt(0.4 * screen.width);
    var pointY = 0.5 * bgHeight;
    var pointBottomY = pointY + beltWidth*309/134;
    console.log(pointBottomY+"y: " + pointY);
    var arrow = $(".page1_arrowMove");
    var isSuccess = false;
    var hammer = new Hammer(document.getElementById('page1_bg'));
    hammer.on('panstart',function(e){
        isSuccess = false;
        // startX = e.center.x;
        // startY = e.center.y;
        // arrow.css("display","block");
        // arrow.css("left",startX);
        // arrow.css("top",startY);
        // arrow.css("width",0);   
        $(".page1_arrow").css("display","none");

    });

    hammer.on('panmove',function(e){
        oX = e.center.x;
        oY = e.center.y;
        dX = oX-startX;
        dY = oY-startY;
        var rotate = Math.atan2(dY,dX)*180/Math.PI;
        arrow.rotate(rotate);
        // arrow.rotate(90);
        arrow.css("width",dX>0?dX:-dX);
        


        if (oX>pointX && oX<pointRightX && (oY>pointY && oY<pointBottomY))
        {
            // console.log("tear success");
            isSuccess = true;
        }
    });
    hammer.on('panend',function(e){
        if(isSuccess)
        {
            tearBag();
            ga('send', 'event', 'CNY-social', 'move', 'click');
        }
        else
        {
            $(".page1_arrow").css("display","block");
        }
        arrow.css("display","none");
    });




    /* 微信进入首页 */

     



    /*抽福袋*/
   
    // $(".m-screen1").find("#input-mobile").on('blur', function(){
    //         if($(this).attr('id') === 'input-mobile' ){
    //             if($.trim($(this).val()) === ''){
    //                 $(this).val('输入手机号立即查看中奖结果');
    //             }
    //         }
    //     }).on('focus',  function(){
    //         if($(this).attr('id') === 'input-mobile' ){
    //             if($.trim($(this).val()) === '输入手机号立即查看中奖结果'){
    //                 $(this).val('');
    //             }
    //         } 
    //     });
    
    
    
    
     $(".m-screen1").find(".page2_phoneNumber").on('blur', 'input', function(){
            if($(this).attr('id') === 'input-mobile' ){
                if($.trim($(this).val()) === ''){
                    $(this).val('输入手机号马上抢福袋!');
                }
            }
        }).on('focus', 'input', function(){
            if($(this).attr('id') === 'input-mobile' ){
                if($.trim($(this).val()) === '输入手机号马上抢福袋!'){
                    $(this).val('');
                }
            } 
        });

     $(".m-screen01").find(".page0_phoneNumber").on('blur', 'input', function(){
            if($(this).attr('id') === 'input-mobile2' ){
                if($.trim($(this).val()) === ''){
                    $(this).val('输入手机号来抢ta的福袋!');
                }
            }
        }).on('focus', 'input', function(){
            if($(this).attr('id') === 'input-mobile2' ){
                if($.trim($(this).val()) === '输入手机号来抢ta的福袋!'){
                    $(this).val('');
                }
            } 
        });


    $("#confirmPhone").click(function(e){
        var phone = $("#input-mobile").val();
       
        var phoneRex =  /^(13[0-9]{9})|(14[0-9]{9})|(15[0-9]{9})|(18[0-9]{9})|(17[0-9]{9})$/;

        if (phone=="" || phoneRex.test(phone)==false || phone.length>11){
                    alert("您输入的手机号有误")
        }
        $.ajax({
            url: '/lottery',
            type: 'put',
            dataType: 'json',
            data: { mobile: phone,
                    openid:openid,
                    sharedby:shareBy},
            success:function(data){
                if (data.success) 
                {
                    console.log("value: "+data.data.value + "code: "+data.data.code);
                    if (data.data.value == 888) 
                    {
                        firstPrize = 1;
                    }
                    else{
                        firstPrize = 0;
                    }
                    $('.page2_confirm').removeClass("f-dn");
                    $('.page2_info').removeClass("f-dn");
                }
                else{
                    if (data.errorCode == 'PHONE_USED') 
                    {
                        $('.usedNumber').removeClass("f-dn");
                        $('.usedBtn').removeClass("f-dn");
                    }

                }
            }
        });  
  

    }); 

    $(".page0_confirmPhone").click(function(e){

        var phone = $("#input-mobile2").val();
       
        var phoneRex =  /^(13[0-9]{9})|(14[0-9]{9})|(15[0-9]{9})|(18[0-9]{9})|(17[0-9]{9})$/;
        console.log(phone);

        if (phone=="" || phoneRex.test(phone)==false || phone.length>11){
                    alert("您输入的手机号有误")
        }
            else if(usedNumber==1){
                $('.usedNumber').removeClass("f-dn");
                $('.usedBtn').removeClass("f-dn");

            }else{
                $('.page2_confirm').removeClass("f-dn");
                $('.page2_info').removeClass("f-dn");    
            }
    }); 

    $('.usedBtn').click(function(e){
        $('.usedNumber').addClass("f-dn");
            $('.usedBtn').addClass("f-dn");
    })

    $(".page2_confirm").click(function(e){
        
        $('.m-screen1').addClass("animated fadeOutUp1");
        //$('.m-screen1').addClass("f-dn");


        $('.page2_confirm').addClass("f-dn");
        $('.page2_info').addClass("f-dn");
        $('.m-screen01').addClass("animated fadeOutUp1");
        //$('.m-screen01').addClass("f-dn");


        if(firstPrize==0){

            $('.draw-screen1').removeClass("f-dn");
            $('.draw-screen1').addClass("animated f-ad1 fadeInUp1")
            $(".draw-screen1").find(".animated").removeClass("f-ann")

        }
        else{
            $('.draw-screen2').removeClass("f-dn"); 
            $('.draw-screen2').addClass("animated f-ad1 fadeInUp1")
            $(".draw-screen2").find(".animated").removeClass("f-ann")
        }
         
    });


    
    // 福袋页1

    $(".page3_guide").click(function(e){

        $(".draw-screen1").addClass("animated fadeOutUp1");
        //$(".draw-screen1").addClass("f-dn");
        $(".guide-screen1").removeClass("animated fadeOutDown");
        $(".guide-screen1").removeClass("f-dn");
        $(".guide-screen1").addClass("animated f-ad1 fadeInUp1");        
    })

    $(".page3_coupon").click(function(e){
        $(".draw-screen1").addClass("animated fadeOutUp1");
        //$(".draw-screen1").addClass("f-dn");
        $(".guide-screen1").removeClass("animated fadeOutDown");
        $(".guide-screen1").removeClass("f-dn");
        $(".guide-screen1").addClass("animated f-ad1 fadeInUp1");
    })

    $(".page5_back").click(function(e){

        $(".guide-screen1").addClass("animated fadeOutDown");
        //$(".guide-screen1").addClass("f-dn");

        $(".draw-screen1").removeClass("animated fadeOutUp1");
        $(".draw-screen1").removeClass("animated fadeInUp1");
        //$(".draw-screen1").removeCladd("animated faedInDown");
        $(".draw-screen1").removeClass("f-dn");
        $(".draw-screen1").addClass("animated fadeInDown");

    })
    
    $(".page3_send").click(function(e){
        $(".share-screen").removeClass("f-dn");

    })

    //滑动祝福语


    // 大福袋
     $(".page4_guide").click(function(e){

        $(".draw-screen2").addClass("animated fadeOutUp1");
        $(".guide-screen2").removeClass("animated fadeOutDown");
        $(".guide-screen2").removeClass("f-dn");
        $(".guide-screen2").addClass("animated f-ad1 fadeInUp1");
        $(".guide-screen2").find(".animated").removeClass("f-ann")
        // $(".page6_bag").addClass("animated wobble f-ad4 ");
    })

    $(".page4_coupon").click(function(e){
        $(".draw-screen2").addClass("animated fadeOutUp1");
        $(".guide-screen2").removeClass("animated fadeOutDown");
        $(".guide-screen2").removeClass("f-dn");
        $(".guide-screen2").addClass("animated f-ad1 fadeInUp1");
        $(".guide-screen2").find(".animated").removeClass("f-ann")
        // $(".page6_bag").addClass("animated wobble f-ad4 ");

    })

    $(".page6_back").click(function(e){
        $(".guide-screen2").addClass("animated fadeOutDown");
        $(".draw-screen2").removeClass("animated fadeOutUp1");
        $(".draw-screen2").removeClass("animated fadeInUp1");

        $(".draw-screen2").removeClass("f-dn");
        $(".draw-screen2").addClass("animated fadeInDown");

        setTimeout(function(){
            $(".guide-screen2").find(".animated").addClass("f-ann");
        },1000);
        
    })

    //福袋已抢完  

    //滑动祝福语
    var i = 0;
    $(".page4_arrowR").click(function(e){
        $(".")
    })
    
    $(".page4_send").click(function(e){
        $(".share-screen").removeClass("f-dn");

    })

    //自定义祝福语
    $(".page3_cus").click(function(e){
        $(".wish-screen").removeClass("f-dn");
    })

    $(".page4_cus").click(function(e){
        $(".wish-screen").removeClass("f-dn");
    })



    $(".confirmWish_Btn").click(function(e){
        var wishStr = $(".wishText").val();
        console.log(wishStr);
        $(".wish-screen").addClass("f-dn");
    })

    $(".confirmWish_quit").click(function(e){
        $(".wish-screen").addClass("f-dn");
    })
    //分享
    $(".sharePage").click(function(e){
        $(".share-screen").addClass("f-dn");
    })

    //显示waiting
    function showWaiting(){
        var shield = $("#waiting_shield");
        shield.css("top",$(document).scrollTop());
        shield.show();
        document.documentElement.style.overflow='hidden';
    }

    function hideWaiting(){
        $("#waiting_shield").hide();
        document.documentElement.style.overflow='auto';
    }
    showWaiting();
    
    $(".track_data").click(function(){
        var track = $(this).attr("track");
        var data = $(this).attr("track-data");
        ga('send','event','CNY-social',track,data);
    })

    // $(".g-ct1").css("opacity",0);
    // $("#slide5").css("opacity",0);
    
    // var hintTop = 56 * deviceWidth/bgWidth;
    // var hintLeft = (640-434)/2 * deviceWidth/bgWidth;
    // var hintWidth = 434 * deviceWidth/bgWidth;
    // var hintHeight = hintWidth * 427/434;
    
    // $("#weixin_hint").find("#hint").height(hintHeight).width(hintWidth).css({ top: hintTop, left: hintLeft }); 
    
    // //set 手机输入框的位置和大小
    // var rawBgWidth = 541,
    //     rawBgHeight = 83,
    //     tbgW = 541 * deviceWidth/bgWidth,
    //     tbgH = tbgW * rawBgHeight / rawBgWidth,
    //     tbgLeft = (deviceWidth - tbgW)/2;
    // $(".checkbg").height(tbgH).width(tbgW).css({ left:tbgLeft });

    
    // $(".validateBg").height(tbgH).width(tbgW).css({ left:tbgLeft });
    
    // $("#slide6").find(".validateBg").on('blur', 'input', function(){
    //         if($(this).attr('id') === 'input-mobile' ){
    //             if($.trim($(this).val()) === ''){
    //                 $(this).val('输入手机号立即查看中奖结果');
    //             }
    //         }
    //     }).on('focus', 'input', function(){
    //         if($(this).attr('id') === 'input-mobile' ){
    //             if($.trim($(this).val()) === '输入手机号立即查看中奖结果'){
    //                 $(this).val('');
    //             }
    //         } 
    //     });
        

  
    
   
});
    

    
