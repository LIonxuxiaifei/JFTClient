var config = {
    //remoteurl: "http://app.jifee.cn/", //远程请求地址，"http://all.t.com/XinYuXiaoRenTong/index.php"，则填写"http://all.t.com/XinYuXiaoRenTong/"
    //"remoteurl": "http://192.168.1.170/chiguanshi/public/", //远程请求地址，"http://192.168.1.170/www/YunLongHuApp/index.php"，则填写"http://127.0.0.1/www/YunLongHuApp/"

    //"remoteurl":"http://192.168.1.29/", //bz
    //"remoteurl":"http://192.168.1.165/", //zx
    "remoteurl":"http://app.shiguangmajia.com/",

    "debug": true, //调试模式下会显示一个调试信息
};

function log(msg) {
    var appVersion = db2.getVal("appVersion");
    if (config["debug"] == true && appVersion.indexOf("00.00.") >= 0) {
        console.log(msg);
    }
}

function runQQ(type, num) {
    var systemType = api.systemType; // 比如： iOS
    //判断是否安装QQ
    var r = function() {
        log("type->" + type);
        if (type == "qq") {
            if (systemType == "android") {
                window.open("mqqwpa://im/chat?chat_type=wpa&uin=" + num);
            } else {
                window.open("mqq://im/chat?chat_type=wpa&uin=" + num + "&version=1&src_type=web");
            }
        }
        if (type == "qun") {
            window.open("mqqapi://card/show_pslcard?src_type=internal&version=1&uin=" + num + "&card_type=group&source=qrcode");
        }
    };
    r();
    api.appInstalled({
        //Android 平台为应用包名，iOS 平台为应用定义的 URL Scheme。iOS 中的 URL Scheme 与包名不一样，一个应用只有一个包名，但是可以配置多个 URL Scheme
        appBundle: systemType == "android" ? "com.tencent.mobileqq" : "mqq://",
    }, function(ret, err) {
        if (ret.installed) {
            api.toast({
                msg: '正在转向QQ',
                location: 'middle'
            });
        } else {
            api.toast({
                msg: '本机没有安装QQ，请先安装!'
            });
            return false;
        }
    });
    $('#guestlist').hide();
}

//单地址转绝对地址（转成含有域名的地址）
function toAbsUrl(locationstring, isnocache) {
    //log("Img2Abs->"+locationstring);
    if (!locationstring) {
        return locationstring;
    }
    if (locationstring.indexOf("http") < 0) {
        locationstring = locationstring.replace("./", "");
        locationstring = locationstring.replace("/chiguanshi/public", "");
        var remateurl = config["remoteurl"] + locationstring;

        if (isset(isnocache) == true) {
            api.imageCache({ //缓存图片
                url: remateurl
            }, function(ret, err) {
                //log(JSON.stringify(ret));
                //return ret.url + ".jpg";
            });
        }

        //好像过多的图片会造成ios 闪退

        return remateurl;
    } else {
        return locationstring;
    }
}


//图片单地址转绝对地址（转成含有域名的地址）
function ImgtoAbsUrl(locationstring, width, height, type) {

    if (!locationstring) {
        return locationstring;
    }
    if (locationstring.indexOf("http") < 0) {
        locationstring = locationstring.replace("./", "");
        var remateurl = config["remoteurl"] + locationstring;

        remateurl = config["remoteurl"] + "index.php?g=Api&m=Base&a=imgautosize&imgsrc=" + escape(remateurl) + "&w=" + (Math.ceil(width) || 100) + "&h=" + (Math.ceil(height) || 100) + "&type=" + (type || 1);
        //log("Img2Abs->"+remateurl);
        return remateurl;
    } else {
        return locationstring;
    }
}

//首页启动里初始化,api已经初始化时调用
function appinit() {
    //将加密数据载入本地库里
    api.loadSecureValue({
        key: 'token'
    }, function(ret, err) {
        log("ret.value:" + ret.value);
        db2.setVal("app_token", ret.value);
    });
    db2.setVal("runApptimestamp", (new Date()).valueOf()); //每次运行APP都不同

    db2.setVal("appVersion", api.appVersion);
    //设置iOS头部为
    api.setStatusBarStyle({
        style: 'light'
    });

    db.init();

    //检测更新
    setTimeout(function() {
        checkAndUploadApp();
    }, 8 * 1000); //8秒后检测更新
}
//如：openWin("a", "h=250&w=200")
//openWin("https://item.taobao.com/item.htm?spm=a21hy.85651.390164.1.9gNH2U&id=534001653335")
function openWin(name, pageParam, ipt) {
    if (ipt == undefined) {
        ipt = "pan";
    }

    var oldname = name;
    //log( "Open Windows->name:'" + name + "';'pageParam'=>" + pageParam );
    var res = {};
    if (pageParam && pageParam != "" && typeof pageParam != undefined) {
        var string = pageParam.split('&');
        for (var i = 0; i < string.length; i++) {
            var str = string[i].split('=');
            res[str[0]] = str[1];
        }
    }
    var url = name;
    if (url.indexOf("http") < 0) {
        if (url.indexOf(".html") < 0) {
            url += ".html";
        }
    } else {
        url = "browser.html";
        //alert(res);
        res["urls"] = name;
        //res= {urls: name};
    }
    //var windowname = oldname + ( isset( pageParam ) ? pageParam : "" );
    var windowname = oldname;
    log("Open Windows->name:'" + windowname + "';'pageParam'=>" + pageParam);
    api.openWin({
        name: windowname,
        url: url,
        scrollToTop: true,
        //softInputMode: ipt,
        softInputMode: "auto",
        //useWKWebView:true,
        vScrollBarEnabled: false,
        hScrollBarEnabled: false,
        bgColor: 'rgba(0,0,0,0)',
        //bgColor: '#fff',
        allowEdit: true,
        slidBackEnabled: false,
        // animation: {
        //     type: "push", //动画类型（详见动画类型常量）
        //     subType: "from_right", //动画子类型（详见动画子类型常量）
        //     duration: 300 //动画过渡时间，默认300毫秒
        // },
        rect: {
            x: 0,
            y: 0
        },
        pageParam: res
    });
}
//调用系统的分享功能
//share({text:"要分享的文字",type:"text"})
function share(jsonobj) {
    api.showProgress({
        title: "创建分享",
        model: 0
    });
    var sharedModule = api.require('shareAction');
    //  var sharedMsg = {
    //      text : jsonobj.text,
    //      type : typeof(jsonobjtype)=="undefined" ? "text" :jsonobj.type
    //  };
    //alert(JSON.stringify(sharedMsg));
    sharedModule.share(jsonobj);
    api.hideProgress();
}
var mask;
//app 公用函数
var PubApp = {
        //分享到微信好友
        "share": function() {

            //share_title,share_desc,share_pic,share_url;已经在页面有了
            //share_url 必需是网络图片
            var shareHtml = "";
            // shareHtml += '<div class="share_box hide" id="share_box" _style="display: none">';
            // shareHtml += '    <div class="detail_like">';
            // shareHtml += '        <span class="line left">';
            // shareHtml += '        </span>';
            // shareHtml += '        <span class="txt">';
            // shareHtml += '            分享到';
            // shareHtml += '        </span>';
            // shareHtml += '        <span class="line right">';
            // shareHtml += '        </span>';
            // shareHtml += '    </div>';
            // shareHtml += '    <div class="share_way clearfix">';
            // shareHtml += '        <ul>';
            // shareHtml += '            <li>';
            // shareHtml += '                <div class="item" id="weixin" style="background-image:url(../css/images/weixin.png)">';
            // shareHtml += '                </div><div class="titles">微信好友</div>';
            // shareHtml += '            </li>';
            // shareHtml += '            <li>';
            // shareHtml += '                <div class="item" id="pengyouquan" style="background-image:url(../css/images/pengyouquan.png)">';
            // shareHtml += '                </div><div class="titles">微信朋友圈</div>';
            // shareHtml += '            </li>';
            // shareHtml += '            <li>';
            // shareHtml += '                <div class="item" id="weibo" style="background-image:url(../css/images/weibo.png)">';
            // shareHtml += '                </div><div class="titles">新浪微博</div>';
            // shareHtml += '            </li>';
            // shareHtml += '            <li>';
            // shareHtml += '                <div class="item" id="qq" style="background-image:url(../css/images/qq.png)">';
            // shareHtml += '                </div><div class="titles">QQ好友</div>';
            // shareHtml += '            </li>';
            // shareHtml += '            <li>';
            // shareHtml += '                <div class="item" id="qqzone" style="background-image:url(../css/images/qqzone.png)">';
            // shareHtml += '                </div><div class="titles">QQ空间</div>';
            // shareHtml += '            </li>';
            // shareHtml += '            <li>';
            // shareHtml += '                <div class="item" id="fx" style="background-image:url(../css/images/fx.png)">';
            // shareHtml += '                </div><div class="titles">短信</div>';
            // shareHtml += '            </li>';
            // shareHtml += '        </ul>';
            // shareHtml += '    </div>';
            // shareHtml += '    <div class="cancel" id="btn_cancel" tapmode="hover">';
            // shareHtml += '        取消';
            // shareHtml += '    </div>';
            // shareHtml += '</div>';

            shareHtml = '<div id="share_box" class="action-sheet-control share hide">' +
                            '<div class="share-box">' +
                                '<div class="title">分享至</div>' +
                                '<ul class="btn-items">' +
                                    '<li class="item" id="weixin"><span class="btn img-box wechat"></span><b>微信好友</b></li>' +
                                    '<li class="item" id="pengyouquan"><span class="btn img-box wechat-friend"></span><b>朋友圈</b></li>' +
                                    '<li class="item" id="qq"><span class="btn img-box qq"></span><b>QQ</b></li>' +
                                    '<li class="item" id="qqzone"><span class="btn img-box qzone"></span><b>QQ空间</b></li>' +
                                    '<li class="item" id="vh"><span class="btn img-box vh"></span><b>二维码</b></li>' +
                                '</ul>' +
                                '<div class="btn-cancel">取消</div>' +
                            '</div>' +
                        '</div>';

            //$api.remove($api.dom("#share_box"));
            $api.append($api.dom("body"), shareHtml);

            mask = mui.createMask(function() {
                //mask.close();//关闭遮罩
                $api.addCls($api.dom("#share_box"), "hide");
            }); //callback为用户点击蒙版时自动执行的回调；

            // mask.show(); //显示遮罩
            // $api.removeCls($api.dom("#share_box"), "hide");

            //绑定事件
            mui("#share_box").on("tap", ".btn-cancel", function() {
                $api.addCls($api.dom("#share_box"), "hide");
                mask.close();
            });

            //二维码关闭
            mui("body").on("tap", ".qr-close", function() {
                document.querySelector(".mask-box.vh").classList.remove("show");
            });

            // var shareUrl = "http://jiafutong.iaapp.cn/index.php/app/Share/register/Pid/" + db2.getVal("user_pid");
            var shareUrl = "http://app.shiguangmajia.com/index.php/App/Share/register/Pid/" + db2.getVal("user_pid");
            var vhSrc = 'http://tool.oschina.net/action/qrcode/generate?data='+encodeURIComponent(shareUrl)+'&output=image%2Fgif&error=L&type=0&margin=0&size=4';

            //分享操作
            var doShare = function(id, imgurl) {
                switch (id) {
                    case "vh": //打开二维码
                        console.log(vhSrc);
                        api.hideProgress();
                        $api.addCls($api.dom("#share_box"), "hide");
                        mask.close();
                        if (document.querySelector(".mask-box.vh")) {
                            setTimeout(function() {
                                document.querySelector(".mask-box.vh").classList.add("show");
                            }, 20);
                        } else {
                            var vhBox = document.createElement("div");
                            vhBox.className = "mask-box vh";
                            vhBox.innerHTML = '<div class="qr-box center-middle">\
                                                    <div class="qr">\
                                                        <div class="pic-box"><img src=\"'+vhSrc+'\" /></div>\
                                                        <div class="tips"></div>\
                                                    </div>\
                                                </div>\
                                                <span class="mui-icon mui-icon-closeempty qr-close"></span>';
                            document.querySelector("body").appendChild(vhBox);
                            setTimeout(function() {
                                document.querySelector(".mask-box.vh").classList.add("show");
                            }, 20);
                        }
                        break;
                    case "weixin": //微信好友
                        var wx = api.require('wx');
                        api.imageCache({
                            url: imgurl
                        }, function(ret, err) {
                            wx.shareImage({
                                scene: 'session',
                                thumb: ret.url,
                                contentUrl: imgurl
                            }, function(ret, err) {
                                api.hideProgress();

                                $api.addCls($api.dom("#share_box"), "hide");
                                mask.close();
                                if (ret.status) {
                                    PubApp.toast('分享成功');
                                } else {
                                    //alert( err.code );
                                }
                            });
                        });
                        break;
                    case "pengyouquan": //微信朋友圈
                        var wx = api.require('wx');
                        api.imageCache({
                            url: imgurl
                        }, function(ret, err) {

                            wx.shareImage({
                                scene: 'timeline',
                                thumb: ret.url,
                                contentUrl: imgurl
                            }, function(ret, err) {
                                api.hideProgress();

                                $api.addCls($api.dom("#share_box"), "hide");
                                mask.close();
                                if (ret.status) {
                                    PubApp.toast('分享成功');
                                } else {
                                    //alert( err.code );
                                }
                            });
                        });
                        break;
                    case "weibo": //微博

                        var weibo = api.require('weibo');
                        share_pic = share_pic.replace("./", "");
                        var remateurl = config["remoteurl"] + share_pic;


                        api.imageCache({ //缓存图片
                            url: remateurl
                        }, function(ret, err) {
                            api.hideProgress();

                            weibo.shareWebPage({
                                text: share_desc,
                                title: share_title,
                                description: share_desc,
                                thumb: ret.url,
                                contentUrl: share_url
                            }, function(ret, err) {
                                //if (ret.status)
                                {
                                    api.hideProgress();
                                    $api.addCls($api.dom("#share_box"), "hide");
                                    mask.close();
                                }
                            });

                            //log(JSON.stringify(ret));
                            //return ret.url + ".jpg";
                        });
                        break;
                    case "qq":
                        var qq = api.require('QQPlus');
                        qq.shareImage({
                            type : 'QFriend',
                            imgPath: imgurl
                        },function(ret,err){
                            api.hideProgress();
                            $api.addCls($api.dom("#share_box"), "hide");
                            mask.close();
                        });
                        break;
                    case "qqzone":
                        var qq = api.require('QQPlus');
                        qq.shareImage({
                            type : 'QZone',
                            imgPath: imgurl
                        },function(ret,err){
                            try {
                              api.hideProgress();
                              $api.addCls($api.dom("#share_box"), "hide");
                              mask.close();
                            } catch (e) {

                            };
                        });
                        break;
                    case "fx":
                        api.sms({
                            text: share_desc + share_url
                        }, function(ret, err) {

                        });

                        /*var clipBoard = api.require( 'clipBoard' );
                        clipBoard.set( {
                            value: share_title + share_url
                        }, function( ret, err ) {
                            if ( ret ) {
                                PubApp.toast( "已经复制!" );
                            } else {
                                //alert( JSON.stringify( err ) );
                            }
                        } );*/

                        $api.addCls($api.dom("#share_box"), "hide");
                        mask.close();

                        break;
                }
            };

            mui("#share_box").on('tap', '.item', function() {
                api.showProgress({
                    title: "",
                    text: "",
                    modal: true
                });

                //获取id
                var id = this.getAttribute("id");

                //请求二维码
                var urlParam = "pid=" + db2.getVal("user_pid")+"&serve=0";
                doAjax("Member", "setQRcode", urlParam, "post", function(rs) {
                    if (rs.code == 1) {
                        api.download({
                            url: toAbsUrl(rs.data.imgurl),
                            report: true,
                            cache: true,
                            allowResume: true
                        }, function(ret, err) {
                            if (ret.state == 1) {
                                doShare(id, ret.savePath);
                            }
                        });
                    } else {
                        api.toast({ msg: rs.msg });
                    }
                });

            });
            //__绑定事件
        },
        "toast": function(msg, glob) {
            if(msg == ""){return false};
            glob = glob || false;
            api.toast({
                msg: msg,
                global: glob,
                //location: 'middle'
            });
        },
        readCookie: function(name) {
            try {


            var cookieValue = "";

            var search = name + "=";

            if (document.cookie.length > 0){

                offset = document.cookie.indexOf(search);

                if (offset != -1)

                {

                    offset += search.length;

                    end = document.cookie.indexOf(";", offset);

                    if (end == -1) end = document.cookie.length;

                    cookieValue = unescape(document.cookie.substring(offset, end))

                }

            }

            return cookieValue;
          } catch (e) {

          }
        },
        //writeCookie("myCookie", "my name", 24);
        writeCookie: function(name, value, hours) {
            var expire = "";
            if (hours != null) {
                expire = new Date((new Date()).getTime() + hours * 3600000);

                expire = "; expires=" + expire.toGMTString();

            }
            document.cookie = name + "=" + escape(value) + expire;
        },
        clearCookie: function(name) {
            PubApp.writeCookie(name, "", -1);
        },
        setCloseBtn: function(AfterClickFun, fixed) {
            //set button
            if (!window.UIButton) window.UIButton = api.require('UIButton');
            UIButton.open({
                rect: {
                    x: 0,
                    y: 0,
                    w: 60,
                    h: 44
                },
                bg: {
                    normal: 'rgba(0,0,0,0)',
                    highlight: 'rgba(0,0,0,0)',
                    active: 'rgba(0,0,0,0)',
                },
                fixedOn: api.frameName,
                fixed: fixed || true,
                move: false
            }, function(ret, err) {
                if (ret) {
                    if (ret.eventType == "click") {
                        if (typeof AfterClickFun == "function") {
                            AfterClickFun();
                        }
                        api.closeWin();
                    }
                } else {

                }
            });
            //__set button

            if (typeof AfterClickFun == "function") {
                api.addEventListener({
                    name: 'keyback'
                }, function(ret, err) {
                    AfterClickFun();
                    api.closeWin();
                });
            }



        },
        closeWin: function(settimeout) {
            setTimeout(function() {
                api.closeWin();
            }, settimeout || 0);
        },
        setLeftBtn: function(AfterClickFun, x, y, w, h) {
            //set button
            if (!window.UIButton){window.UIButton = api.require('UIButton')};
            UIButton.open({
                rect: {
                    x: x || 0,
                    y: y || 0,
                    w: w || 60,
                    h: h || 44
                },
                bg: {
                    normal: 'rgba(0,0,0,0)',
                    highlight: 'rgba(0,0,0,0)',
                    active: 'rgba(0,0,0,0)',
                },
                fixedOn: api.frameName,
                fixed: false,
                move: false
            }, function(ret, err) {
                if (ret) {
                    if (ret.eventType == "click") {
                        if (typeof AfterClickFun == "function") {
                            AfterClickFun();
                        }
                    }
                } else {

                }
            });
            //__set button
        },
        setRightBtn: function(AfterClickFun, x, y, w, h) {
            var thisX = x || api.winWidth - 60;
            PubApp.setLeftBtn(AfterClickFun, thisX, y, w, h);
        },
        doScanQrcode: function() {
            var FNScanner = api.require('FNScanner');
            PubApp.toast("正在打开摄像头");
            FNScanner.openScanner({
                autorotation: false,
                sound: "widget://css/scan.wav"
            }, function(ret, err) {
                if (ret) {
                    //扫描成功
                    if (ret.eventType == "success") {
                        var getContent = ret.content;
                        try {
                            //log(getContent);
                            getContentJsonObj = JSON.parse(getContent);
                            switch (getContentJsonObj.a) {
                                case "pay": //非商户就支付
                                    openWin("meShaoyishoAfter", "uid=" + getContentJsonObj.u);
                                    break;
                                case "friend": //非商户就聊天
                                    openWin("dialogue", "touid=" + getContentJsonObj.u);
                                    break;
                                case "configorder": //确认订单
                                    api.execScript({ //如果窗口已经打开，那么就执行这里
                                        name: 'meshoporder',
                                        script: "order_num=" + getContentJsonObj.id + ";thisApp.requestData();"
                                    });
                                    openWin("meshoporder", "order_num=" + getContentJsonObj.id);
                                    break;
                                default:
                                    PubApp.toast("不可识别的二维码!");
                            }
                        } catch (e) {
                            PubApp.toast("不可识别的二维码!");
                        }


                    }

                } else {
                    alert(JSON.stringify(err));
                }
            });
        },
        doLogoutFun: function() {
            log("退出了###################");
            var userToken = db2.getVal('user_token');
            if(!isset(userToken) && userToken == ""){return false;
            }else{
            // db2.setVal("user_token", "null");
            // db2.setVal("user_id", "null");
            // db2.setVal("user_mobile", "null");
            // db2.setVal("user_headimg", "null");
            // db2.setVal("user_nicename", "null");
            db2.setVal("user_token", null);
            db2.setVal("user_avatar", null);
            db2.setVal("user_nickname", null);
            db2.setVal("user_level", null);
            db2.setVal("user_sex", null);
            db2.setVal("user_tel", null);
            db2.setVal("user_city", null);
            db2.setVal("user_intro", null);
            db2.setVal("user_balance", null);
            db2.setVal("user_province", null);
            db2.setVal("user_issetpaypwd", null);
            db2.setVal("user_issetloginpwd", null);
            api.sendEvent({
                name: 'userloginorout'
            });};
        },
        //退出操作
        doLogout: function() {
            api.confirm({
                title: '提醒',
                msg: '确认要退出吗？',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                if (ret) {
                    if (ret.buttonIndex == 1) {
                        PubApp.doLogoutFun();
                        api.toast({
                            msg: '已经退出',
                            duration: 2000,
                            //location: 'midden'
                        });
                        setTimeout(function() {
                            api.closeToWin({
                                name: 'root',
                                // animation: {
                                //     type: "push", //动画类型（详见动画类型常量）
                                //     subType: "from_right", //动画子类型（详见动画子类型常量）
                                //     duration: 300 //动画过渡时间，默认300毫秒
                                // }
                            });
                        }, 800);
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    alert(JSON.stringify(err));
                }
            });
        },
        //打开手机只带的导航地图
        //支付经纬度、或地址的方式
        nav: function(lat, lon, title, address) {
            //PubApp.toast("正在开启地图");

            if (!lat) {


                if (api.appInstalled({
                        sync: true,
                        appBundle: (api.systemType == "android" ? "com.baidu.BaiduMap" : "baidumap") //百度地图是否安装
                    })) {

                    window.location.href = 'baidumap://map/place/search?query=' + address;
                    return;

                } else {
                    if (api.appInstalled({ //高德地图是否安装
                            sync: true,
                            appBundle: (api.systemType == "android" ? 'com.autonavi.minimap' : "iosamap")
                        })) {
                        window.location.href = api.systemType == "android" ? 'androidamap://poi?sourceApplication=mpgj&keywords=' + address : 'iosamap://poi?sourceApplication=mpgj&name=' + address;
                        return;
                    } else {
                        openWin('http://map.baidu.com/mobile/webapp/search/search/qt=s&vt=map&wd=' + address, "title=" + (title || address)); //百度H5版本
                    }
                }

            } else {
                if (api.appInstalled({
                        sync: true,
                        appBundle: (api.systemType == "android" ? "com.baidu.BaiduMap" : "baidumap") //百度地图是否安装
                    })) {

                    window.location.href = 'baidumap://map/marker?location=' + lat + ',' + lon + '&title=' + (title || address) + '&content=' + address + "&src=mycjhapp";
                    return;

                } else {
                    //采集的是百度的经纬度，所以高德还是用地址搜索
                    if (api.appInstalled({ //高德地图是否安装
                            sync: true,
                            appBundle: (api.systemType == "android" ? 'com.autonavi.minimap' : "iosamap")
                        })) {

                        window.location.href = api.systemType == "android" ? 'androidamap://poi?sourceApplication=mpgj&keywords=' + address : 'iosamap://poi?sourceApplication=mpgj&name=' + address;
                        return;

                    } else {
                        PubApp.toast("手机端未安装百度、高德地图APP");
                        //openWin('http://map.baidu.com/mobile/webapp/search/search/qt=s&vt=map&wd=' + address, "title=" + address); //百度H5版本
                    }
                }
            }
        },
        tel: function(mobile) {
            if (mobile) {
                api.call({
                    type: 'tel_prompt',
                    number: mobile
                });
            } else {
                api.toast({
                    msg: '没有号码'
                });
            }
        },
        html: function(querySelector, html) {
            try {
                if (typeof html != "undefined") {
                    var querySelectorAll = document.querySelectorAll(querySelector);
                    for (var i = 0; i < querySelectorAll.length; i++) {
                        querySelectorAll[i].innerHTML = html;
                    }
                } else {
                    return document.querySelector(querySelector).innerHTML;

                }

            } catch (e) {
                alert(JSON.stringify(e));
            }
        },
        val: function(querySelector, value) {
            try {
                if (typeof value != "undefined") {
                    var querySelectorAll = document.querySelectorAll(querySelector);
                    for (var i = 0; i < querySelectorAll.length; i++) {
                        querySelectorAll[i].value = value;
                    }
                } else {
                    return document.querySelector(querySelector).value;
                }
            } catch (e) {
                alert(JSON.stringify(e));
            }
        },
        attr: function(querySelector, attr, value) {
            try {
                if (typeof value != "undefined") {
                    document.querySelector(querySelector).setAttribute(attr, value);
                } else {
                    return document.querySelector(querySelector).getAttribute(attr);
                }
            } catch (e) {
                alert(JSON.stringify(e));
            }
        },
        addClass: function(querySelector, value) {
            try {
                var querySelectorAll = document.querySelectorAll(querySelector);
                for (var i = 0; i < querySelectorAll.length; i++) {
                    querySelectorAll[i].classList.add(value);
                }

            } catch (e) {
                alert(JSON.stringify(e));
            }
        },
        removeClass: function(querySelector, value) {
            try {
                var querySelectorAll = document.querySelectorAll(querySelector);
                for (var i = 0; i < querySelectorAll.length; i++) {
                    querySelectorAll[i].classList.remove(value);
                }

            } catch (e) {
                alert(JSON.stringify(e));
            }
        },
        addEventListener: function(querySelector, Event, functions) {
            try {
                var eventType = (typeof Event == "function" ? "tap" : Event);
                document.querySelector(querySelector).addEventListener(eventType, function() {
                    typeof Event == "function" ? Event() : functions();
                })
            } catch (e) {
                alert(JSON.stringify(e));
            }
        },

        otherFunction: function() {

        }
    }
    //直接拨打电话


//仅仅是显示图片
//imgjsonObj:"[1.jpg,2.jpg]"
function showimgzoom(imgjsonObj, activeIndexNum) {
    //alert(imgjson);
    var photoBrowser = api.require('imageBrowser');
    var activeIndex = 0;
    if (typeof activeIndexNum != "undefined") {
        activeIndex = activeIndexNum;
    }
    photoBrowser.openImages({
        imageUrls: imgjsonObj,
        activeIndex: activeIndex,
        //placeholderImg: 'widget://res/img/apicloud.png',
        showList: false
    }, function(ret, err) {
        if (ret) {
            //alert( JSON.stringify( ret ) );
        } else {
            //alert( JSON.stringify( err ) );
        }
    });
}

function uploadimg(filepath, fun) {
    api.showProgress({
        title: "正在上传",
    });

    var jm = getJiaMi("Index", "upload_pic");
    //var jm = getJiaMi("Member", "uploadUserHead");
    //var urls = jm.baseurl + "?app_token=" + jm.app_token + "&times=" + jm.times + "&rnds=" + jm.rnds;
    var urls = jm.baseurl;

    api.ajax({
        url: urls,
        method: 'post',
        timeout: 30,
        dataType: 'json',
        returnAll: false,
        data: {
            values: {
                token: db2.getVal("user_token")
            },
            files: {
                file: filepath
            }
        }
    }, function(ret, err) {
        api.hideProgress();
        if (ret) {
            log(filepath);
            log("上传结果：" + JSON.stringify(ret));
            if (ret["code"] == 0) {
                //alert(filepath);
                api.toast({
                    msg: ret["msg"],
                    //location: 'middle'
                });
                return false;
            }
            fun(ret["data"]);
            //$(".filewarp:eq(" + uploadbtn_index + ")").append('<span><input type="hidden" name="imgs' + uploadbtn_index + '" value="' + ret["data"] + '" /><img src="' + url + '" /></span><i class="aui-iconfont aui-icon-roundclosefill"></i>');
        } else {
            log(urls);
            api.hideProgress();
            api.alert({
                //msg: filepath
                msg: ('错误码：' + err.code + '；错误信息：' + err.msg + '网络状态码：' + err.statusCode)
            });
        }
    });
}
//获取图片并手动裁剪后的图片地址
//返回图片的file地址
//参数是是回调函数
/**
 * [getImgAndCrop description]
 * @param  {[type]} funs         [回调函数]
 * @param  {[type]} targetWidth  [目标宽度ios有效]
 * @param  {[type]} targetHeight [目标高度ios有效]
 * @return {[type]}              []
 */
function getImgAndCrop(funs, targetWidth, targetHeight, imgLength) {
    if (imgLength == "undefined") {
        imgLength = null;
    }
    api.actionSheet({
        title: '选择图片',
        cancelTitle: '取消',
        //destructiveTitle: '红色警告按钮',
        buttons: ['拍照', '相册']
    }, function(ret, err) {
        if (ret) {
            if (ret.buttonIndex == 2 && imgLength != null) {
                selectPicFromAlbum(funs, imgLength);
                return;
            }

            var sourceType = "camera";
            if (ret.buttonIndex == 3) { //取消
                return false;
            }
            if (ret.buttonIndex == 1) {
                sourceType = "camera";
            }
            if (ret.buttonIndex == 2 && imgLength == null) {
                sourceType = "library";
            }
            api.getPicture({
                sourceType: sourceType,
                encodingType: 'jpg',
                mediaValue: 'pic',
                destinationType: 'url',
                allowEdit: true,
                quality: 100,
                targetWidth: targetWidth,
                targetHeight: targetHeight,
                saveToPhotoAlbum: false
            }, function(ret, err) {
                if (ret) {
                    if ($api.trim(ret.data) != "") {
                        funs(ret.data);
                    }
                } else {
                    //                          api.alert({
                    //                              msg : err.msg
                    //                          });
                }
            });
        } else {
            alert(JSON.stringify(err));
        }
    });
}

//从相册选择图片
function selectPicFromAlbum(fn, length) {
    var UIMediaScanner = api.require('UIMediaScanner');
    UIMediaScanner.open({
        type: 'picture',
        column: 4,
        classify: true,
        max: 3 - length,
        sort: {
            key: 'time',
            order: 'desc'
        },
        texts: {
            stateText: '已选择*项',
            cancelText: '取消',
            finishText: '完成'
        },
        styles: {
            bg: '#fff',
            mark: {
                icon: '',
                position: 'bottom_left',
                size: 20
            },
            nav: {
                bg: '#eee',
                stateColor: '#000',
                stateSize: 14,
                cancelBg: 'rgba(0,0,0,0)',
                cancelColor: '#000',
                cancelSize: 14,
                finishBg: 'rgba(0,0,0,0)',
                finishColor: '#000',
                finishSize: 14
            }
        },
        exchange: true,
        rotation: true
    }, function(ret) {
        if (ret) {
            //alert(JSON.stringify(ret));
            if (ret.eventType == 'confirm') fn(ret.list);
        }
    });
}

function isLogin() {
    var user_token = db2.getVal("user_token");
    if (user_token != "" && user_token != null) {
        //alert("有登陆的的");
        return true;
    } else {
        //alert("已经退出");
        return false;
    }
}

//sqlite,大数据，异步处理
//因官方DB模块不支持内容中含有单引号，so直接使用H5的sqlite
var db = (function() {
    var fns = {
        //异步的，给打开一点点时间
        "init": function() {
            var db = openDatabase('cjhdb', '1.0', 'appDb', 1024 * 50); //数据库名 版本 数据库描述 大小
            db.transaction(function(tx) {
                tx.executeSql('CREATE TABLE if not exists setconfig(itemname varchar(255), info TEXT)', [], function(tx, err) {
                    log("打开库，并执行了创建默认表");
                });
            })
        },
        "getConfig": function(keys, func) {
            var db = openDatabase('cjhdb', '1.0', 'appDb', 1024 * 50); //数据库名 版本 数据库描述 大小
            db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM setconfig where itemname='" + keys + "'", [], function(tx, result) {
                    if (result.rows.length == 0) {
                        log("获取缓存【" + keys + "】,但不存在记录哦");
                        func("");
                    } else {
                        var data = result.rows.item(0).info;
                        log("获得缓存【" + keys + "】值【" + data + "】");
                        func(data);
                    }
                })
            })
        },
        "setConfig": function(keys, vals) {
            //log("写入参数操作");
            try {
                var db = openDatabase('cjhdb', '1.0', 'appDb', 1024 * 50); //数据库名 版本 数据库描述 大小
                db.transaction(function(tx) {
                    tx.executeSql("delete from setconfig where itemname='" + keys + "'", [], function(tx, result) {});
                })
                if (vals != null) {
                    db.transaction(function(tx) {
                        tx.executeSql("insert into setconfig(itemname,info) values(?,?)", [keys, vals], function(tx, result) {});
                    })
                }

            } catch (e) {

            }
        }
    }
    return fns;
})();




function gethtml(msgtext) {
    if (msgtext != "") {
        msgtext = msgtext.replace(new RegExp('&lt;', 'gm'), '<');
        msgtext = msgtext.replace(new RegExp('&gt;', 'gm'), '>');
        msgtext = msgtext.replace(new RegExp('&quot;', 'gm'), '"');
        msgtext = msgtext.replace(new RegExp('&2339;', 'gm'), '\'');
    }
    return msgtext;
}
//localStorage,常规数库，Html5支持,限5M，适合常规固定小数据
var db2 = (function() {
    var fns = {
        "getVal": function(keys) {
            if (!window.localStorage.getItem(keys)) window.localStorage.setItem(keys, "");
            return window.localStorage.getItem(keys);
            //return PubApp.readCookie(keys);
        },
        "setVal": function(keys, vals) {

            window.localStorage.removeItem(keys);
            //在iPhone/iPad上有时设置setItem()时会出现诡异的QUOTA_EXCEEDED_ERR错误，这时一般在setItem之前，先removeItem()就ok了。
            if (vals != null && vals != "null") {
                window.localStorage.setItem(keys, vals);
            }

            // PubApp.clearCookie(keys);
            // if (vals != null && vals != "null") {
            //     PubApp.writeCookie(keys,vals,24*365);
            // }
        },
        "reset": function() {
            window.localStorage.clear();
        }
    };
    return fns;
})();



//封装请求的URL，参数：m为Thinkphp 的modle,a为action
//如:http://192.168.1.115/XinYuXiaoRenTong/index.php?s=Dl&m=Student&a=getabcd
function getJiaMi(m, a) {
    var times = new Date().getTime();
    var rnds = Math.ceil(Math.random() * 9999999999999);
    var app_token = md5(db2.getVal("app_token") + (times + "" + rnds + "" + db2.getVal("app_token")));
    //封装URL
    if (m == "") alert("URL参数m错误");
    if (a == "") alert("URL参数a错误");
    if (typeof config == "undefined") alert("未导入配置config.js");
    //if (typeof db2.getVal("app_token") == "undefined" || db2.getVal("app_token") == "" || db2.getVal("app_token") == null) alert("db2 中获取 app_token失败");
    if (typeof config['remoteurl'] == "undefined") alert("remoteurl未设置");
    var baseurl = config['remoteurl'] + "index.php/App/" + m + "/" + a; //index.php/dl/index/login
    return {
        times: times,
        rnds: rnds,
        app_token: app_token,
        baseurl: baseurl
    };
}
//二次封装doajax，加入当前会员账号信息,即服务器验证要求用户已经登陆才可操作
function doAjaxByUser(m, a, get, getOrPost, fun) {
    //此处封装下user_token
    var currenttime = new Date().getTime();
    doAjax(m, a, "currentUserId=" + db2.getVal("user_id") + "&currenttime=" + currenttime + "&" + get, getOrPost, fun);
}
//ajax的再次封装，支持输出提交的url
//操作模块，操作名，传递参数（字符串格式）,get或post，回调函数funs(data)
var neterrorlimit = true;
var isCanContactNet = true;

function returnSkipCheckUpdate() {
    //判断本次运行是否提现过了
    var isTipsendMark = db2.getVal("runApptimestamp") + "isSelectSkipUpdate";
    if (isset(db2.getVal(isTipsendMark))) //用户选择本次跳过更新
    {
        return "&skipversion=1";
    } else {
        return "";
    }
}
function doAjax(m, a, get, getOrPost, fun) {
    if (isCanContactNet == false) return false;
    var jm = getJiaMi(m, a);
    var getstr = "";
    if (getOrPost == "" || getOrPost.toLocaleLowerCase() == "get") //采用get提交
    {
        getOrPost = "get";
        var urls = jm.baseurl + "?app_token=" + jm.app_token + "&times=" + jm.times + "&rnds=" + jm.rnds + "&appversion=" + api.appVersion + "&appos=" + api.systemType + "&appimei=" + api.deviceId + "&" + get + returnSkipCheckUpdate() + "&currentUserToken=" + db2.getVal("user_token")+"&lat="+db2.getVal("location_lat")+"&lon="+db2.getVal("location_lon");
    } else //采用POST提交
    {
        var urls = jm.baseurl;
        getstr = "app_token=" + jm.app_token + "&times=" + jm.times + "&rnds=" + jm.rnds + "&appversion=" + api.appVersion + "&appos=" + api.systemType + "&appimei=" + api.deviceId + "&" + get + returnSkipCheckUpdate() + "&currentUserToken=" + db2.getVal("user_token")+"&lat="+db2.getVal("location_lat")+"&lon="+db2.getVal("location_lon");
    }
    //__装装URL
    log("Ajax(" + getOrPost + "):" + urls + "?" + getstr);
    log("-->" + get);
    if (getOrPost == "post") {
        var string = getstr.split('&');
        var res = {};
        for (var i = 0; i < string.length; i++) {
            var str = string[i].split('=');
            res[str[0]] = str[1];
        }
        //alert(getstr);
    }
    api.ajax({
        url: urls,
        method: getOrPost,
        timeout: 30,
        dataType: 'json',
        returnAll: false,
        data: {
            values: res
        },
    }, function(retsystem, err) {
        //alert(JSON.stringify(err));
        //log("Ajax->"+JSON.stringify(retsystem));
        log("<--" + JSON.stringify(retsystem));
        if (!err) {
            //var urlJson = JSON.stringify(ret);
            //api.alert({msg: urlJson});
            if (isset(retsystem.code)) {
                var requeststatus = Number(retsystem.code);
                if (requeststatus <= -1000) {
                    api.hideProgress();
                    api.refreshHeaderLoadDone();
                    if (requeststatus >= -2000) { //-1~-1999

                        if (requeststatus == -1002) //Token错误
                        {
                            var userToken = db2.getVal('user_token');
                            if(!isset(userToken) && userToken != ""){
                              setTimeout(function() {
                                api.closeToWin({
                                    name: 'root',
                                  });
                              }, 800);
                            }
                            PubApp.doLogoutFun(); //强行退出
                        }else{
                          api.toast({
                              msg: retsystem.info,
                              //location: 'midden'
                          });
                        }
                    } else if (requeststatus >= -3000) //-3000~-2000,版本问题
                    {
                        /*if ( checkUpdateTipsOpenStatus() == 'hide' ) { //防止跳出多个
                            if ( requeststatus == -2001 ) //提醒升级
                            {
                                doUpdateApp( retsystem, false );
                            } else if ( requeststatus == -2002 ) //强制升级
                            {
                                doUpdateApp( retsystem, true );
                            }
                        }*/
                        //abc
                    }
                } else {
                    fun(retsystem);
                }
            } else //for兼容
            {
                fun(retsystem);
            }
        } else {
            /*--------------------timerCount close--------------------------*/
            try{
              if (thisPage && thisPage.timerCount != undefined) {
                  setTimeout(function() { thisPage.timerCount = 1; }, 2000);
              }
            }catch(e){};
            /*--------------------timerCount close--------------------------*/
            var connectionType = api.connectionType;
    				if(connectionType != "none"){
                api.toast({
                    //msg : "Ajax:"+err.msg
                    //msg: "服务器错误" + err.statusCode
                    msg: "获取网络失败"
                    //msg: a
                });
    				};
            api.hideProgress();
            api.refreshHeaderLoadDone();
            log("Sys Error:" + err.msg);
            return false;
        }
    });
}



//升级APP
//2017-1-3，独立检测版本
function checkAndUploadApp() {
    if (api.appVersion.indexOf("00.00") >= 0) {
        return true;
    }

    doAjax("Main", "checkAndUploadApp", "", "get", function(result) {
        if (result.code == 0) {
            return false;
        }
        var buttons = ['确定', '取消'];
        var str = '版本:' + result.data.version + '\r\n更新:' + result.data.updateTip + '\r\n时间:' + result.data.time;
        var absupdate = result.data.absupdate || 0;
        if (Math.ceil(absupdate) == 1) //要求强制升级
        {
            alert('发现新版本' + '\r\n' + str);
            if (api.systemType == "android") {
                api.download({
                    url: result.data.source,
                    report: true
                }, function(ret, err) {
                    if (ret && 0 == ret.state) { /* 下载进度 */
                        api.toast({
                            msg: "正在下载应用" + ret.percent + "%",
                            duration: 2000
                        });
                    }
                    if (ret && 1 == ret.state) { /* 下载完成 */
                        var savePath = ret.savePath;
                        api.installApp({
                            appUri: savePath
                        });
                    }
                });
            }
            if (api.systemType == "ios") {
                api.openApp({
                    iosUrl: result.data.source, //例如调用系统浏览器Safari打开
                    appParam: {
                        appParam: 'app参数'
                    }
                });
            }

        } else {
            api.confirm({
                title: '发现新版本',
                msg: str,
                buttons: buttons
            }, function(ret, err) {

                if (ret.buttonIndex == 1) {
                    if (api.systemType == "android") {
                        api.download({
                            url: result.data.source,
                            report: true
                        }, function(ret, err) {
                            if (ret && 0 == ret.state) { /* 下载进度 */
                                api.toast({
                                    msg: "正在下载应用" + ret.percent + "%",
                                    duration: 2000
                                });
                            }
                            if (ret && 1 == ret.state) { /* 下载完成 */
                                var savePath = ret.savePath;
                                api.installApp({
                                    appUri: savePath
                                });
                            }
                        });
                    }
                    if (api.systemType == "ios") {
                        api.openApp({
                            iosUrl: result.data.source, //例如调用系统浏览器Safari打开
                            appParam: {
                                appParam: 'app参数'
                            }
                        });
                    }
                }
            });
        }


    })

    setTimeout(function() {
        checkAndUploadApp();
    }, 1000 * 60 * 30); //每半小时查一次
}

/**
 * [isset 模拟php isset]
 * @param  {[type]} obj [description]
 * @return {[type]}   true or false
 */
function isset(obj) {
    if (typeof obj == "undefined") {
        return false;
    }
    if (obj == "") {
        return false;
    }
    if (obj == "null" || obj == null) {
        return false;
    }
    if (!obj) {
        return false;
    }
    return true;
}
//根据



function _parserUrl(tourl) //解析URL并转换为json形式
{}

function getLocalTime(nS, formatstyle) {
    //return new Date(parseInt(nS) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
    var unixTimestamp = new Date(parseInt((("" + nS).length > 10 ? nS : nS * 1000)));
    var m = (unixTimestamp.getMonth() + 1);
    if (m <= 9) m = "0" + m;
    var d = (unixTimestamp.getDate());
    if (d <= 9) d = "0" + d;
    var h = (unixTimestamp.getHours());
    if (h <= 9) h = "0" + h;
    var i = (unixTimestamp.getMinutes());
    if (i <= 9) i = "0" + i;
    var s = (unixTimestamp.getSeconds());
    if (s <= 9) s = "0" + s;
    if (typeof formatstyle != "undefined") {
        switch (formatstyle) {
            case "Y-m-d":
                datas = unixTimestamp.getFullYear() + "-" + m + "-" + d;
                break;
            case "H:i:s":
                datas = h + ":" + i + ":" + s;
                break;
            case "i:s":
                datas = i + ":" + s;
                break;
            case "H:i":
                datas = h + ":" + i;
                break;
            case "H":
                datas = unixTimestamp.getHours();
            case "d":
                datas = unixTimestamp.getDate();
        }
    } else {
        datas = unixTimestamp.getFullYear() + "-" + m + "-" + d + " " + h + ":" + i + ":" + s;
    }
    return datas;
}

var apicloudsignature;

function md5(string) {
    if (!apicloudsignature) {
        apicloudsignature = api.require('signature');
    }
    var value = apicloudsignature.md5Sync({
        data: string
    });
    if (isset(value)) {
        return value.toLowerCase();
    } else {
        return "";
    }
}

function GetsystemType() {
    var is_android = (function() {
        return navigator.userAgent.toLowerCase().indexOf('android') !== -1
    })();
    return is_android ? "android" : "ios";
}

var shopcar = {
    clearOtherShopGoods: function(shopIp) { //防止跨店铺
        var lastshopIp = db2.getVal("lastshopIp");
        if ((lastshopIp && shopIp != lastshopIp) || lastshopIp == "") //跨店了
        {
            db2.setVal("shopcarone", null);
            db2.setVal("shopcar", null);
            db2.setVal("lastshopIp", shopIp);
            log("跨店了");
        } else {
            log("没有跨店;this_shopId:" + shopIp + "；old_shop_id:" + lastshopIp);
        }
    },
    inOne: function(id, name, type, num, img, price, kucun, shopIp) { //单品直接购买（不进购物车）
        shopcar.clearOtherShopGoods(shopIp);
        var issuccess = true;
        if (kucun <= 0) {
            issuccess = false;
            PubApp.toast("库存不足");
            return false;
        } else {
            var t = [{
                "id": id,
                "t": type,
                "c": num,
                'img': img,
                'name': name,
                'price': price,
                'kc': kucun
            }];
            shopcarrs = JSON.stringify(t);

            db2.setVal("shopcarone", shopcarrs);
        }
        return issuccess;
    },
    in : function(id, name, type, num, img, price, kucun, shopIp) {
        this.clearOtherShopGoods(shopIp);
        var issuccess = true;
        if (kucun <= 0) {
            issuccess = false;
            PubApp.toast("库存不足");

            //PubApp.toast("库存不足");
            //layer.open({type:});
            return false;
        } else {
            var shopcar = db2.getVal("shopcar");
            var shopcarobj = [{}];
            if (shopcar) {
                shopcarobj = JSON.parse(shopcar);
                var isfound = false;

                for (var i = 0; i < shopcarobj.length; i++) {
                    x = shopcarobj[i]
                    if (num > 0) {
                        if (x["id"] == id && x["t"] == type) {
                            isfound = true;
                            x["c"] = Math.round(x["c"]) + Math.round(num);
                            if (x["c"] > kucun) {
                                x["c"] = kucun;
                                issuccess = false;
                                PubApp.toast("没有更多了");
                            }
                            if (kucun == 0 && x["c"] != kucun) {
                                delete shopcarobj[i];
                                issuccess = false;
                                PubApp.toast("已销完");
                            }
                        }
                    } else if (num == 0) {
                        delete shopcarobj[i];
                    }
                };
                if (isfound == false && num > 0) {
                    var t = {
                        "id": id,
                        "t": type,
                        "c": num,
                        'img': img,
                        'name': name,
                        'price': price,
                        'kc': kucun
                    };
                    shopcarobj.push(t);
                }
            } else {
                var t = [{
                    "id": id,
                    "t": type,
                    "c": num,
                    'img': img,
                    'name': name,
                    'price': price,
                    'kc': kucun
                }];
                shopcarobj = t;
            }
            shopcarrs = JSON.stringify(shopcarobj);
            shopcarrs = shopcarrs.replace(/null/gi, "");
            shopcarrs = shopcarrs.replace(/,,/gi, ",");
            shopcarrs = shopcarrs.replace(/,]/gi, "]");
            shopcarrs = shopcarrs.replace(/\[,/gi, "[");
            db2.setVal("shopcar", shopcarrs);
            //订制提醒消息
            switch (type) {
                case "weidanqiang":
                    msginfo = "已放入购物车，抢购结果以最终支付成功为准";
                    break;
                default:
                    msginfo = "已放入购物车";
                    break;
            }
            //__订制提醒消息
            if (issuccess == true) {
                PubApp.toast(msginfo);

                //shopcar.updatejiaobiao();
            }
        }
        return issuccess;
    },
    del: function(id) {
        var shopcar = db2.getVal("shopcar");
        var shopcarobj = [{}];
        if (shopcar) {
            shopcarobj = JSON.parse(shopcar);
            var isfound = false;
            for (var i = 0; i < shopcarobj.length; i++) {
                x = shopcarobj[i]
                if (x["id"] == id) {
                    delete shopcarobj[i];
                }
            };
        }
        shopcarrs = JSON.stringify(shopcarobj);
        shopcarrs = shopcarrs.replace(/null/gi, "");
        shopcarrs = shopcarrs.replace(/,,/gi, ",");
        shopcarrs = shopcarrs.replace(/,]/gi, "]");
        shopcarrs = shopcarrs.replace(/\[,/gi, "[");
        db2.setVal("shopcar", shopcarrs);
        //shopcar.updatejiaobiao()
    },
    change: function(id, num) {
        var shopcar = db2.getVal("shopcar");
        var shopcarobj = [{}];
        var maxkucun = 0;
        var issuccess = true;
        if (shopcar) {
            shopcarobj = JSON.parse(shopcar);
            var isfound = false;
            for (var i = 0; i < shopcarobj.length; i++) {
                x = shopcarobj[i];
                if (num > 0) {
                    if (x["id"] == id) {
                        isfound = true;
                        x["c"] = Math.round(num);
                    }
                    if (x["c"] > x["kc"]) {
                        issuccess = false;
                        x["c"] = Math.round(x["kc"]);
                        maxkucun = Math.round(x["kc"]);
                        PubApp.toast("库存不足，共" + x["kc"] + "份");
                    }
                } else if (num == 0) {
                    delete shopcarobj[i];
                }
            };
            //shopcar.updatejiaobiao()
        }
        shopcarrs = JSON.stringify(shopcarobj);
        db2.setVal("shopcar", shopcarrs);
        return {
            "issuccess": issuccess,
            "maxkucun": Math.round(maxkucun)
        };
    },
    //classFullName  ".goods_id" //input.checkbox 的classsname
    //返回统计的价格
    rebuldByselect: function(classFullName) { //根据用户勾选，生成最终结算数据
        var classNamegroup = [];
        var objlist = document.querySelectorAll(classFullName);
        for (var i = 0; i < objlist.length; i++) {

            var isCheck = objlist[i].checked ? true : false;
            //log("isCheck=>"+$api.attr(objlist[i], 'goods_id')+isCheck);
            if (isCheck) {
                classNamegroup.push($api.attr(objlist[i], 'goods_id'));
            }
        }

        if (classNamegroup.length <= 0) {
            return 0;
        }

        var selectDataString = classNamegroup.join(",");
        //log(selectDataString);

        shopcarobj = JSON.parse(db2.getVal("shopcar"));
        shopcarlastobj = []; //最终用于交易的
        shopcarnextobj = []; //没有参与交易的

        var totalPrice = 0;
        for (var i = 0; i < shopcarobj.length; i++) {
            var x = shopcarobj[i];
            if (("," + selectDataString + ",").indexOf("," + x["id"] + ",") >= 0) {
                totalPrice += Math.floor(x.price) * Math.ceil(x.c);
                shopcarlastobj.push(x);
            } else {
                shopcarnextobj.push(x);
            }
        };
        db2.setVal("shopcarlastobj", JSON.stringify(shopcarlastobj)); //最终用于交易的
        db2.setVal("shopcarnextobj", JSON.stringify(shopcarnextobj)); //没有参与交易的
        return totalPrice;
    },
    payafter: function() { //订单支付完成了
        db2.setVal("shopcar", null);
        db2.setVal("shopcarlastobj", null);
        if (db2.getVal("shopcarnextobj")) {
            db2.setVal("shopcar", db2.getVal("shopcarnextobj"));
        }
    },
    updatejiaobiao: function() { //更新角标
        var goodscount = 0;
        //统计商品数量
        var shopcar = db2.getVal("shopcar");
        var shopcarobj = [{}];
        if (shopcar) {
            shopcarobj = JSON.parse(shopcar);
            /*$.each( shopcarobj, function( i, x ) {
                goodscount += x[ "c" ];
            } );*/
        }
        //__统计商品数量
        //$( "#jbbox" ).remove();
        if (goodscount > 0) {

        }
    }
};

var Pay = {
    //弹出支付方式选择
    selectPayWay: function(afterSelectFunction) {
        api.actionSheet({
            title: '选择支付方式',
            cancelTitle: '取消',
            //destructiveTitle: '红色警告按钮',
            buttons: ['支付宝', '微信']
        }, function(ret, err) {
            if (ret) {
                if (ret.buttonIndex == 1 || ret.buttonIndex == 2) {
                    afterSelectFunction(ret.buttonIndex);
                } else {

                }
            } else {
                alert(JSON.stringify(err));
            }
        });
    },
    //启动第三方支付APP
    openPayApp: function(channel, orderData, successFunction, failFunction) {

        //特殊转义
        switch (channel) {
            case 1:
                channel = "app_zfb";
                break;
            case "1":
                channel = "app_zfb";
                break;
            case 2:
                channel = "app_wx";
                break;
            case "2":
                channel = "app_wx";
                break;
            default:

                break;
        }

        switch (channel) {
            case "app_zfb":
                var aliPayPlus = api.require('aliPayPlus');
                aliPayPlus.payOrder({
                    orderInfo: orderData
                }, function(ret, err) {
                    if (ret.code == 9000) {
                        if (typeof successFunction == "function") {
                            successFunction(ret);
                        } else {
                            api.alert({
                                title: '支付结果',
                                msg: ret.code,
                                buttons: ['确定']
                            });
                        }
                    } else {
                        //code: 1 //字符串类型；支付结果状态码，取值范围如下：
                        //9000：支付成功
                        //8000：正在处理中，支付结果未知（有可能已经支付成功），请查询商户订单列表中订单的支付状态
                        //4000：订单支付失败
                        //5000：重复请求
                        //6001：用户中途取消支付操作
                        //6002：网络连接出错
                        //6004：支付结果未知（有可能已经支付成功），请查询商户订单列表中订单的支付状态
                        //0001：缺少商户配置信息（商户id，支付公钥，支付密钥）
                        //0002：缺少参数（subject、body、amount、tradeNO）
                        //0003：签名错误（公钥私钥错误）
                        if (typeof failFunction == "function") {
                            failFunction(ret);
                        } else {
                            api.alert({
                                title: '支付结果',
                                msg: ret.code,
                                buttons: ['确定']
                            });
                        }
                    }
                });
                break;
            default:
                api.alert({
                    title: 'title',
                    msg: channel,
                }, function(ret, err) {

                });
        }
    }
};


/*
 * APICloud JavaScript Library
 * Copyright (c) 2014 apicloud.com
 */
(function(window) {
    var u = {};
    var isAndroid = (/android/gi).test(navigator.appVersion);
    var uzStorage = function() {
        var ls = window.localStorage;
        if (isAndroid) {
            ls = os.localStorage();
        }
        return ls;
    };

    function parseArguments(url, data, fnSuc, dataType) {
        if (typeof(data) == 'function') {
            dataType = fnSuc;
            fnSuc = data;
            data = undefined;
        }
        if (typeof(fnSuc) != 'function') {
            dataType = fnSuc;
            fnSuc = undefined;
        }
        return {
            url: url,
            data: data,
            fnSuc: fnSuc,
            dataType: dataType
        };
    }
    u.trim = function(str) {
        if (String.prototype.trim) {
            return str == null ? "" : String.prototype.trim.call(str);
        } else {
            return str.replace(/(^\s*)|(\s*$)/g, "");
        }
    };
    u.trimAll = function(str) {
        return str.replace(/\s*/g, '');
    };
    u.isElement = function(obj) {
        return !!(obj && obj.nodeType == 1);
    };
    u.isArray = function(obj) {
        if (Array.isArray) {
            return Array.isArray(obj);
        } else {
            return obj instanceof Array;
        }
    };
    u.isEmptyObject = function(obj) {
        if (JSON.stringify(obj) === '{}') {
            return true;
        }
        return false;
    };
    u.addEvt = function(el, name, fn, useCapture) {
        if (!u.isElement(el)) {
            console.warn('$api.addEvt Function need el param, el param must be DOM Element');
            return;
        }
        useCapture = useCapture || false;
        if (el.addEventListener) {
            el.addEventListener(name, fn, useCapture);
        }
    };
    u.rmEvt = function(el, name, fn, useCapture) {
        if (!u.isElement(el)) {
            console.warn('$api.rmEvt Function need el param, el param must be DOM Element');
            return;
        }
        useCapture = useCapture || false;
        if (el.removeEventListener) {
            el.removeEventListener(name, fn, useCapture);
        }
    };
    u.one = function(el, name, fn, useCapture) {
        if (!u.isElement(el)) {
            console.warn('$api.one Function need el param, el param must be DOM Element');
            return;
        }
        useCapture = useCapture || false;
        var that = this;
        var cb = function() {
            fn && fn();
            that.rmEvt(el, name, cb, useCapture);
        };
        that.addEvt(el, name, cb, useCapture);
    };
    u.dom = function(el, selector) {
        if (arguments.length === 1 && typeof arguments[0] == 'string') {
            if (document.querySelector) {
                return document.querySelector(arguments[0]);
            }
        } else if (arguments.length === 2) {
            if (el.querySelector) {
                return el.querySelector(selector);
            }
        }
    };
    u.domAll = function(el, selector) {
        if (arguments.length === 1 && typeof arguments[0] == 'string') {
            if (document.querySelectorAll) {
                return document.querySelectorAll(arguments[0]);
            }
        } else if (arguments.length === 2) {
            if (el.querySelectorAll) {
                return el.querySelectorAll(selector);
            }
        }
    };
    u.byId = function(id) {
        return document.getElementById(id);
    };
    u.first = function(el, selector) {
        if (arguments.length === 1) {
            if (!u.isElement(el)) {
                console.warn('$api.first Function need el param, el param must be DOM Element');
                return;
            }
            return el.children[0];
        }
        if (arguments.length === 2) {
            return this.dom(el, selector + ':first-child');
        }
    };
    u.last = function(el, selector) {
        if (arguments.length === 1) {
            if (!u.isElement(el)) {
                console.warn('$api.last Function need el param, el param must be DOM Element');
                return;
            }
            var children = el.children;
            return children[children.length - 1];
        }
        if (arguments.length === 2) {
            return this.dom(el, selector + ':last-child');
        }
    };
    u.eq = function(el, index) {
        return this.dom(el, ':nth-child(' + index + ')');
    };
    u.not = function(el, selector) {
        return this.domAll(el, ':not(' + selector + ')');
    };
    u.prev = function(el) {
        if (!u.isElement(el)) {
            console.warn('$api.prev Function need el param, el param must be DOM Element');
            return;
        }
        var node = el.previousSibling;
        if (node.nodeType && node.nodeType === 3) {
            node = node.previousSibling;
            return node;
        }
    };
    u.next = function(el) {
        if (!u.isElement(el)) {
            console.warn('$api.next Function need el param, el param must be DOM Element');
            return;
        }
        var node = el.nextSibling;
        if (node.nodeType && node.nodeType === 3) {
            node = node.nextSibling;
            return node;
        }
    };
    u.closest = function(el, selector) {
        if (!u.isElement(el)) {
            console.warn('$api.closest Function need el param, el param must be DOM Element');
            return;
        }
        var doms, targetDom;
        var isSame = function(doms, el) {
            var i = 0,
                len = doms.length;
            for (i; i < len; i++) {
                if (doms[i].isEqualNode(el)) {
                    return doms[i];
                }
            }
            return false;
        };
        var traversal = function(el, selector) {
            doms = u.domAll(el.parentNode, selector);
            targetDom = isSame(doms, el);
            while (!targetDom) {
                el = el.parentNode;
                if (el != null && el.nodeType == el.DOCUMENT_NODE) {
                    return false;
                }
                traversal(el, selector);
            }

            return targetDom;
        };

        return traversal(el, selector);
    };
    u.contains = function(parent, el) {
        var mark = false;
        if (el === parent) {
            mark = true;
            return mark;
        } else {
            do {
                el = el.parentNode;
                if (el === parent) {
                    mark = true;
                    return mark;
                }
            } while (el === document.body || el === document.documentElement);

            return mark;
        }

    };
    u.remove = function(el) {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    };
    u.attr = function(el, name, value) {
        if (!u.isElement(el)) {
            console.warn('$api.attr Function need el param, el param must be DOM Element');
            return;
        }
        if (arguments.length == 2) {
            return el.getAttribute(name);
        } else if (arguments.length == 3) {
            el.setAttribute(name, value);
            return el;
        }
    };
    u.removeAttr = function(el, name) {
        if (!u.isElement(el)) {
            console.warn('$api.removeAttr Function need el param, el param must be DOM Element');
            return;
        }
        if (arguments.length === 2) {
            el.removeAttribute(name);
        }
    };
    u.hasCls = function(el, cls) {
        if (!u.isElement(el)) {
            console.warn('$api.hasCls Function need el param, el param must be DOM Element');
            return;
        }
        if (el.className.indexOf(cls) > -1) {
            return true;
        } else {
            return false;
        }
    };
    u.addCls = function(el, cls) {
        if (!u.isElement(el)) {
            console.warn('$api.addCls Function need el param, el param must be DOM Element');
            return;
        }
        if ('classList' in el) {
            el.classList.add(cls);
        } else {
            var preCls = el.className;
            var newCls = preCls + ' ' + cls;
            el.className = newCls;
        }
        return el;
    };
    u.removeCls = function(el, cls) {
        if (!u.isElement(el)) {
            console.warn('$api.removeCls Function need el param, el param must be DOM Element');
            return;
        }
        if ('classList' in el) {
            el.classList.remove(cls);
        } else {
            var preCls = el.className;
            var newCls = preCls.replace(cls, '');
            el.className = newCls;
        }
        return el;
    };
    u.toggleCls = function(el, cls) {
        if (!u.isElement(el)) {
            console.warn('$api.toggleCls Function need el param, el param must be DOM Element');
            return;
        }
        if ('classList' in el) {
            el.classList.toggle(cls);
        } else {
            if (u.hasCls(el, cls)) {
                u.removeCls(el, cls);
            } else {
                u.addCls(el, cls);
            }
        }
        return el;
    };
    u.val = function(el, val) {
        if (!u.isElement(el)) {
            console.warn('$api.val Function need el param, el param must be DOM Element');
            return;
        }
        if (arguments.length === 1) {
            switch (el.tagName) {
                case 'SELECT':
                    var value = el.options[el.selectedIndex].value;
                    return value;
                    break;
                case 'INPUT':
                    return el.value;
                    break;
                case 'TEXTAREA':
                    return el.value;
                    break;
            }
        }
        if (arguments.length === 2) {
            switch (el.tagName) {
                case 'SELECT':
                    el.options[el.selectedIndex].value = val;
                    return el;
                    break;
                case 'INPUT':
                    el.value = val;
                    return el;
                    break;
                case 'TEXTAREA':
                    el.value = val;
                    return el;
                    break;
            }
        }

    };
    u.prepend = function(el, html) {
        if (!u.isElement(el)) {
            console.warn('$api.prepend Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('afterbegin', html);
        return el;
    };
    u.append = function(el, html) {
        if (!u.isElement(el)) {
            console.warn('$api.append Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('beforeend', html);
        return el;
    };
    u.before = function(el, html) {
        if (!u.isElement(el)) {
            console.warn('$api.before Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('beforebegin', html);
        return el;
    };
    u.after = function(el, html) {
        if (!u.isElement(el)) {
            console.warn('$api.after Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('afterend', html);
        return el;
    };
    u.html = function(el, html) {
        if (!u.isElement(el)) {
            console.warn('$api.html Function need el param, el param must be DOM Element');
            return;
        }
        if (arguments.length === 1) {
            return el.innerHTML;
        } else if (arguments.length === 2) {
            el.innerHTML = html;
            return el;
        }
    };
    u.text = function(el, txt) {
        if (!u.isElement(el)) {
            console.warn('$api.text Function need el param, el param must be DOM Element');
            return;
        }
        if (arguments.length === 1) {
            return el.textContent;
        } else if (arguments.length === 2) {
            el.textContent = txt;
            return el;
        }
    };
    u.offset = function(el) {
        if (!u.isElement(el)) {
            console.warn('$api.offset Function need el param, el param must be DOM Element');
            return;
        }
        var sl = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
        var st = Math.max(document.documentElement.scrollTop, document.body.scrollTop);

        var rect = el.getBoundingClientRect();
        return {
            l: rect.left + sl,
            t: rect.top + st,
            w: el.offsetWidth,
            h: el.offsetHeight
        };
    };
    u.css = function(el, css) {
        if (!u.isElement(el)) {
            console.warn('$api.css Function need el param, el param must be DOM Element');
            return;
        }
        if (typeof css == 'string' && css.indexOf(':') > 0) {
            el.style && (el.style.cssText += ';' + css);
        }
    };
    u.cssVal = function(el, prop) {
        if (!u.isElement(el)) {
            console.warn('$api.cssVal Function need el param, el param must be DOM Element');
            return;
        }
        if (arguments.length === 2) {
            var computedStyle = window.getComputedStyle(el, null);
            return computedStyle.getPropertyValue(prop);
        }
    };
    u.jsonToStr = function(json) {
        if (typeof json === 'object') {
            return JSON && JSON.stringify(json);
        }
    };
    u.strToJson = function(str) {
        if (typeof str === 'string') {
            return JSON && JSON.parse(str);
        }
    };
    u.setStorage = function(key, value) {
        if (arguments.length === 2) {
            var v = value;
            if (typeof v == 'object') {
                v = JSON.stringify(v);
                v = 'obj-' + v;
            } else {
                v = 'str-' + v;
            }
            var ls = uzStorage();
            if (ls) {
                ls.setItem(key, v);
            }
        }
    };
    u.getStorage = function(key) {
        var ls = uzStorage();
        if (ls) {
            var v = ls.getItem(key);
            if (!v) {
                return;
            }
            if (v.indexOf('obj-') === 0) {
                v = v.slice(4);
                return JSON.parse(v);
            } else if (v.indexOf('str-') === 0) {
                return v.slice(4);
            }
        }
    };
    u.rmStorage = function(key) {
        var ls = uzStorage();
        if (ls && key) {
            ls.removeItem(key);
        }
    };
    u.clearStorage = function() {
        var ls = uzStorage();
        if (ls) {
            ls.clear();
        }
    };


    /*by king*/
    u.fixIos7Bar = function(el) {
        if (!u.isElement(el)) {
            console.warn('$api.fixIos7Bar Function need el param, el param must be DOM Element');
            return;
        }
        var strDM = api.systemType;
        if (strDM == 'ios') {
            var strSV = api.systemVersion;
            var numSV = parseInt(strSV, 10);
            var fullScreen = api.fullScreen;
            var iOS7StatusBarAppearance = api.iOS7StatusBarAppearance;
            if (numSV >= 7 && !fullScreen && iOS7StatusBarAppearance) {
                el.style.paddingTop = '20px';
            }
        }
    };
    u.fixStatusBar = function(el) {
        if (!u.isElement(el)) {
            console.warn('$api.fixStatusBar Function need el param, el param must be DOM Element');
            return;
        }
        var sysType = api.systemType;
        if (sysType == 'ios') {
            u.fixIos7Bar(el);
        } else if (sysType == 'android') {
            var ver = api.systemVersion;
            ver = parseFloat(ver);
            if (ver >= 4.4) {
                el.style.paddingTop = '25px';
            }
        }
    };
    u.toast = function(title, text, time) {
        var opts = {};
        var show = function(opts, time) {
            api.showProgress(opts);
            setTimeout(function() {
                api.hideProgress();
            }, time);
        };
        if (arguments.length === 1) {
            var time = time || 500;
            if (typeof title === 'number') {
                time = title;
            } else {
                opts.title = title + '';
            }
            show(opts, time);
        } else if (arguments.length === 2) {
            var time = time || 500;
            var text = text;
            if (typeof text === "number") {
                var tmp = text;
                time = tmp;
                text = null;
            }
            if (title) {
                opts.title = title;
            }
            if (text) {
                opts.text = text;
            }
            show(opts, time);
        }
        if (title) {
            opts.title = title;
        }
        if (text) {
            opts.text = text;
        }
        time = time || 500;
        show(opts, time);
    };
    u.post = function( /*url,data,fnSuc,dataType*/ ) {
        var argsToJson = parseArguments.apply(null, arguments);
        var json = {};
        var fnSuc = argsToJson.fnSuc;
        argsToJson.url && (json.url = argsToJson.url);
        argsToJson.data && (json.data = argsToJson.data);
        if (argsToJson.dataType) {
            var type = argsToJson.dataType.toLowerCase();
            if (type == 'text' || type == 'json') {
                json.dataType = type;
            }
        } else {
            json.dataType = 'json';
        }
        json.method = 'post';
        api.ajax(json,
            function(ret, err) {
                if (ret) {
                    fnSuc && fnSuc(ret);
                }
            }
        );
    };
    u.get = function( /*url,fnSuc,dataType*/ ) {
        var argsToJson = parseArguments.apply(null, arguments);
        var json = {};
        var fnSuc = argsToJson.fnSuc;
        argsToJson.url && (json.url = argsToJson.url);
        //argsToJson.data && (json.data = argsToJson.data);
        if (argsToJson.dataType) {
            var type = argsToJson.dataType.toLowerCase();
            if (type == 'text' || type == 'json') {
                json.dataType = type;
            }
        } else {
            json.dataType = 'text';
        }
        json.method = 'get';
        api.ajax(json,
            function(ret, err) {
                if (ret) {
                    fnSuc && fnSuc(ret);
                }
            }
        );
    };

    /*end*/


    window.$api = u;

})(window);


/**
 * 删除左右两端的空格
 */
String.prototype.trim = function() {
    return this.replace(/(^\s*)|(\s*$)/g, '');
}
/**
 * 删除左边的空格
 */
String.prototype.ltrim = function() {
    return this.replace(/(^\s*)/g, '');
}
/**
 * 删除右边的空格
 */
String.prototype.rtrim = function() {
    return this.replace(/(\s*$)/g, '');
}



//除法函数
function accDiv(arg1, arg2) {
    var t1 = 0,
        t2 = 0,
        r1, r2, n;
    try {
        t1 = arg1.toString().split(".")[1].length;
    } catch (e) { t1 = 0; }
    try {
        t2 = arg2.toString().split(".")[1].length;
    } catch (e) { t2 = 0; }
    with(Math) {
        r1 = Number(arg1.toString().replace(".", ""));
        r2 = Number(arg2.toString().replace(".", ""));
        n = Math.max(t1, t2);
        return (r1 / r2) * pow(10, t2 - t1);
    }
}

//乘法函数
function accMul(arg1, arg2) {
    var t1 = 0,
        t2 = 0,
        r1, r2;
    try {
        t1 = arg1.toString().split(".")[1].length;
    } catch (e) { t1 = 0; }
    try {
        t2 = arg2.toString().split(".")[1].length;
    } catch (e) { t2 = 0; }
    with(Math) {
        r1 = Number(arg1.toString().replace(".", ""));
        r2 = Number(arg2.toString().replace(".", ""));
        return (r1 * r2) / pow(10, t2 + t1);
    }
}
function openChat(id) {
    if(!isLogin()){ openWin("login");  return false;};
    openWin('chat', 'user_id=' + id);
};
//加法函数
function accAdd(arg1, arg2) {
    var t1 = 0,
        t2 = 0,
        m;
    try {
        t1 = arg1.toString().split(".")[1].length;
    } catch (e) { t1 = 0; }
    try {
        t2 = arg2.toString().split(".")[1].length;
    } catch (e) { t2 = 0; }
    with(Math) {
        m = Math.pow(10, Math.max(t1, t2));
        return (arg1 * m + arg2 * m) / m;
    }
}

//减法函数
function accSubtr(arg1, arg2) {
    var t1 = 0,
        t2 = 0,
        m, n;
    try {
        t1 = arg1.toString().split(".")[1].length;
    } catch (e) { t1 = 0; }
    try {
        t2 = arg2.toString().split(".")[1].length;
    } catch (e) { t2 = 0; }
    with(Math) {
        //动态控制精度长度
        n = Math.max(t1, t2);
        m = Math.pow(10, n);
        //return (arg1  * m - arg2 * m) / m;
        return ((arg1 * m - arg2 * m) / m).toFixed(n);
    }
}


//给String类型增加一个div方法，调用起来更加方便。除法
String.prototype.bcdiv = function(arg) {
    return accDiv(this, arg);
}

//给String类型增加一个mul方法，调用起来更加方便。乘法
String.prototype.bcmul = function(arg) {
    return accMul(arg, this);
}

//给String类型增加一个add方法，调用起来更加方便。加法
String.prototype.bcadd = function(arg) {
    return accAdd(arg, this);
}

//给String类型增加一个subtr方法，调用起来更加方便。减法
String.prototype.bcsub = function(arg) {
    return accSubtr(this, arg);
}

/*
* create at: 2017.4.13, last alter at: 2017.6.5
* v 1.0.2
*/
if (document.querySelector(".mui-bar")) {
    document.querySelector(".mui-bar").addEventListener("touchmove", function(e) {
        e.preventDefault();
    });
}
if (document.querySelector(".top-tab-filter")) {
    document.querySelector(".top-tab-filter").addEventListener("touchmove", function(e) {
        e.preventDefault();
    });
}
var PageControl;
(function() {
    var winBack = function() {
        document.querySelector(".icon-houtui").addEventListener("tap", function() {
            api.closeWin();
        });
    };
    var darkClose = function() {
        mui("body").on("tap", ".dark", function() {
            document.querySelector(".mui-content").style = 'overflow:auto;';
            this.parentNode.classList.remove("active");
            document.querySelector(".top-tab-filter .on").classList.remove("on");
        });
    };
    var fixedHide = function(control) {
        var winHeight = document.documentElement.clientHeight;

        window.addEventListener("resize", function() {
            var curHeight = document.documentElement.clientHeight;

            if ((curHeight - winHeight) < 0) {
                control.style.display = 'none';
            } else {
                control.style.display = 'block';
            }
        });
    };
    var htmlDecode = function (text) {
        var temp = document.createElement("div");
        temp.innerHTML = text;
        var output = temp.innerText || temp.textContent;
        temp = null;
        return output;
    };
    var getIndex = function(a, i) {
        var selfIndex = -1;
        a.forEach(function(item, index) {
            if (item == i) {
                selfIndex = index;
            }
        });
        return selfIndex;
    };
    PageControl = function() {
        this.winBack = winBack;
        this.darkClose = darkClose;
        this.fixedHide = fixedHide;
        this.htmlDecode = htmlDecode;
        this.getIndex = getIndex;
    };
})();

var Set = function() {
    this.value = [];
    this.getIndex = function(value) {
        var result = -1;
        this.value.forEach(function(element, index) {
            if (element == value) result = index;
        });
        return result;
    };
};
Set.prototype.add = function(value) {
    if (typeof value == 'object') {
        for (var i in value) {
            this.value.push(value[i]);
        }
    } else {
        this.value.push(value);
    }
    return this;
};
Set.prototype.alter = function(value) { //param type: array
    if (typeof value == 'object') {
        this.value = value;
    } else {
        throw 'value must be array!'
    }
    return this;
};
Set.prototype.remove = function(value) {
    var index = this.getIndex(value);
    this.value.splice(index, 1);
    return this;
};
Set.prototype.clear = function() {
    this.value = [];
    return this;
};
Set.prototype.getValue = function() {
    return this.value.join(",");
};
