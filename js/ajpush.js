var ajpush = {
    run: function() {
        ajpush.init();
        ajpush.addEventListener();
    },
    //首页执行即可
    init: function() {
        if (!window.ajpushObj) window.ajpushObj = api.require('ajpush');
        ajpushObj.init(function(ret) {
            // log("ajpush init=>" + JSON.stringify(ret));
            if (ret && ret.status) {
                // success
                // api.alert({
                //     title: 'title',
                //     msg: JSON.stringify(ret)
                // });
            }

        });

        ajpushObj.getRegistrationId(function(ret) {
            var registrationId = ret.id;
            log("ajpush=>" + JSON.stringify(ret));

            db2.setVal("ajpushid", registrationId);
        });

    },
    addEventListener: function() {
        //通用监听
        /*
        android前台、后台都可以调用到
        ios前台可以调用到
        */
        ajpushObj.setListener(
            function(ajpushret) {
                // api.alert({
                //     title: 'ios_ajpush_前台运行/或透传',
                //     msg: JSON.stringify(ajpushret)
                // });
                //ios_ajpush_前台运行

                api.sendEvent({
                    name: 'haveNewMessage',
                    extra: ajpushret.extra
                });

                var id = ajpushret.id;
                var extra = typeof ajpushret.extra == "string" ? JSON.parse(ajpushret.extra) : ajpushret.extra;
                if (api.systemType == "ios" && (extra.onlyandroid || "") == "yes") //屏蔽ios的透传
                {
                    return false;
                }
                log("setListener:"+JSON.stringify(ajpushret));
                ajpush.showNotice(extra);
            }
        );


        //在iOS平台，使用极光推送发送通知时，若应用在前台运行，则推送内容可以通过setListener方法监听到，若应用在后台，系统会往设备通知栏发送通知，当通知被点击后，APICloud会将本次推送的内容通过事件监听回调的方式交给开发者。具体使用如下：
        //本地通知被点击，也触发（只有ios会触发）
        api.addEventListener({
            name: 'noticeclicked'
        }, function(ret, err) {
            if (ret && ret.value) {
                log("addEventListener_noticeclicked:"+JSON.stringify(ret));
                var value = typeof ret.value == "string" ? JSON.parse(ret.value) : ret.value;
                var extra = value.extra;

                extra.iosBackNotice = (value.extras||"no")=="no"?false:true; //true 点击来自系统的通知栏，false来自本地通知的点击 ,ios有效(聊天专用)
                //log("后台的通知点击过了的："+extra.iosBackNotice);
                ajpush.noticeclicked(extra);
            }
        })




    },
    noticeclicked: function(extra) {
        //return false;
        log("noticeclicked:"+JSON.stringify(extra));
        //db2.setVal("lastajpushid", ajpush.id);
        if (isset(extra)) {
            //log("ajpush_extra=>"+extra);

            //alert(JSON.stringify(extra));
            if (Math.ceil(extra.needlogin) == 1) {
                if (isLogin() != true) {
                    api.toast({
                        msg: '请先登录'
                    });
                    return false;
                }
            }

            var json2url = function(jsonObj) {
                var jsonObjReturn = [];
                for (var key in jsonObj) {
                    jsonObjReturn.push(key + "=" + jsonObj[key]);
                }
                return jsonObjReturn.join("&");
            }

            switch (extra.type) {
                case "openwin":
                    try {
                        openWin(extra.pagename, json2url(extra.pageparam));
                    } catch (e) {

                    }
                    break;
                case "sendevent":
                    //log("sendevent");
                    try {

                        for (var i = 0; i < extra.event.length; i++) {
                            api.sendEvent({
                                name: extra.event[i].eventname,
                                extra: extra.event[i].eventparam
                            });

                            if (extra.event[i].eventname == "receiveNewChat") {//来自聊天通知，特殊监听下
                                api.sendEvent({
                                    name: "receiveNewChatForNotice",//通知机制
                                    extra: extra //全部发送
                                });
                            }
                        }
                    } catch (e) {

                    }
                    break;
                case "openwinsendevent":
                    try {

                        for (var i = 0; i < extra.event.length; i++) {
                            api.sendEvent({
                                name: extra.event[i].eventname,
                                extra: extra.event[i].eventparam
                            });
                        }
                        openWin(extra.pagename, json2url(extra.pageparam));

                    } catch (e) {

                    }
                    break;
            }

        }
    },
    showNotice: function(dataParam) {
        log(":" + api.systemType + ":" + JSON.stringify(dataParam));
        //log(api.systemType + ":" + dataParam.type);
        switch (dataParam.type) {
            case "openwin": //都是要等待用户点击后才可以继续
                api.notification({
                    notify: {

                        title: dataParam.title, //标题，默认值为应用名称，只Android有效
                        content: dataParam.text, //内容，默认值为'有新消息'
                        extra: { "extra": dataParam }, //传递给通知的数据，在通知被点击后，该数据将通过监听函数回调给网页
                        updateCurrent: false //是否覆盖更新已有的通知，取值范围true|false。只Android有效

                    }
                }, function(ret, err) {
                    var id = ret.id;

                });
                break;
            case "sendevent": //ios在前端直接执行了,后台时等待点击再运行，android 前、后端都直接运行;聊天功能基于此事件进行二次开发
                ajpush.noticeclicked(dataParam);
                break;
            case "openwinsendevent": //都是要等待用户点击后才可以继续,事件直接运行了
                api.notification({
                    notify: {
                        title: dataParam.title, //标题，默认值为应用名称，只Android有效
                        content: dataParam.text, //内容，默认值为'有新消息'
                        extra: { "extra": dataParam }, //传递给通知的数据，在通知被点击后，该数据将通过监听函数回调给网页
                        updateCurrent: false //是否覆盖更新已有的通知，取值范围true|false。只Android有效

                    }
                }, function(ret, err) {
                    var id = ret.id;
                });
                ajpush.noticeclicked(dataParam);
                break;

        }


    },
    jiguangClearNotification: function(id) {
        ajpushObj.clearNotification({
            id: id
        })
    },
    //关闭推送
    jiguangStopPush: function() {
        ajpushObj.stopPush(function(ret) {
            if (ret && ret.status) {
                db2.setVal("jiguangStatus", "close");

            }
        });
    },
    //恢复Push推送
    jiguangResumePush: function() {

        ajpushObj.resumePush(function(ret) {
            if (ret && ret.status) {

                db2.setVal("jiguangStatus", "ok");
            } else {
                log("jiguangResumePush:"+JSON.stringify(ret));
            }
        });
    },
    //极光安静模式
    jiguangAnJing: function() {
        var params = {};
        params.startHour = 1;
        params.startMinute = 0;
        params.endHour = 23;
        params.endMinute = 59;
        ajpushObj.setPushTime(params, function(ret) {
            if (ret && ret.status) {
                db2.setVal("jiguangStatus", "anjing");
            }
        });
    },
    //极光关闭安静模式
    jiguangClearAnJing: function() {
        var params = {};
        params.startHour = 1;
        params.startMinute = 0;
        params.endHour = 1;
        params.endMinute = 1;
        ajpushObj.setPushTime(params, function(ret) {
            if (ret && ret.status) {
                db2.setVal("jiguangStatus", "ok");
                PubApp.toast("已经关闭静音模式");
            }
        });
    },
};
