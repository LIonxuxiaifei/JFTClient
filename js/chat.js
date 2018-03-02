var chat = {
    //自动展示消息提现（智能判断）
    //在index.html运行即可
    //前置：ajpush.js引入
    "getNewChatEventName": "receiveNewChatForNotice", //事件接收名
    autoShowNotice: function() {
        //有新的消息过来了
        api.addEventListener({
            name: chat.getNewChatEventName
        }, function(ret, err) {
            if (ret) {
                //ret.value.fromuserid

                var dataParam = ret.value;
                var timestamp = new Date().getTime();
                var windowsHeadLastTime = db2.getVal("winName" + dataParam.pagename); //获取响应窗口最后的心跳事件

                if (accSubtr(timestamp, (isNaN(windowsHeadLastTime)?0:windowsHeadLastTime)) > 2000) { //超出2秒的心跳时间

                    //通知更新好友列表（未读消息数更新下,有新增）
                    api.sendEvent({
                        name: 'upFriendLists',
                    });

                    dataParam.type = "openwin"; //修改事件
                    if((dataParam.iosBackNotice||false)==true)//ios,从通知栏点击过的,直接打开窗口,不要再次提醒了
                    {
                        ajpush.noticeclicked(dataParam);
                    }
                    else
                    {

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
                    }
                }

            } else {
                alert(JSON.stringify(err));
            }
        });

    },
    run: function() {

    },
    //首页执行即可
    init: function() {

    },
    addEventListener: function() {



    },
    noticeclicked: function(extra) {

    },
    showNotice: function(dataParam) {



    }
};
