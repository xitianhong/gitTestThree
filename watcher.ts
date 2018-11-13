﻿
module ZM.Watcher {//3333
    //3
    //3
    let lesson_wrapper = $('.lesson-selection-wrapper');
    let lesson_list:any = lesson_wrapper.find('.lesson-list');
    let list_data:any = [];
    let list_data_error:any=[];
    let list_data_search:any=[];
    let list_data_save:any = [];
    let list_data_search_save:any = [];
    let list_data_error_save:any=[];
    export let error_choose_types = ["1", "2", "3", "4"];
    let list_type_isall:boolean = true;
    let session_map:any = localStorage.getItem('sessionList')?JSON.parse(localStorage.getItem('sessionList')):{};
    let message_interval:any;
    export let session_message_map:any = {};
    let lessonSocket:any = null;
    let zm:any = ZM;
    let retryTimer:number = 30000;
    let isFirstInit:boolean = true;
    let win:any = window;
    let start:number = 1;
    let limit:number = 8;
    let total:number = 1;

    let teacherImgUrl:string;
    let studentImgUrl:string;

    let isErrorList:boolean = true;
    let isOneToMore:boolean = false;
    let isPianoTrain:boolean = false;
    let fetchErrorListTimer:any;
    let error_timer:any;
    let oneToMore_timer:any;
    let pianoTrain_timer:any;


    let questionList = {
        1: "音频问题",
        2: "课件问题",
        3: "掉线与卡顿问题",
        4: "其它"
    };
    let stateList:any={
        1:"待处理",
        2:"转开发",
        3:"已处理待确认",
        4:"已处理已确认",
        5:"需跟进",
        6:"未接单"
    };
    let evaluateList:any={
        1:"已解决",
        2:"未解决",
        3:"时好时坏",
        4:"误报没异常"
    };

    let startPage:number = 1;
    let totalPage:number = 1;
    let pageSize:number = 20;
    let startNo:number = 1;
    let totalNo:number = 1;
    let pagelimit:number = 20;

    let startAll:number = 1;
    let limitAll:number =40;
    let totalAll:number = 1;

    let channel_option_html:any = '';
    let teaMobile:any;
    let stuMobile:any;

    let questionTypeData:any ;
    let resultTypeData:any;
    let reresultTypeData:any;
    let confirmTypeData:any;
    let currentChannel:any;

    let isAlert = false;
    let oneToMoreAlert = false;
    let roleMap:any = {'teacher':'老师','student':'学生','watcher':'技术支持','seller':'销售','':''};
    let selectedIndex:any = 0;
    let isOneToMoreSession = false;

    let ticketBu:any = 1;

    let list_data_oneToMore:any=[];
    let list_data_pianoTrain:any = [];
    let lessonTypeMap:any = {
        'regular-lesson':'正式课',
        'test-lesson':'测评课',
        'debug-lesson':'调试课',
        '未知':'未知'
        };

    let permissionList:any=[];
    let addSessionClick:any = false;

    let rateList:any = [
        {value:'',name:'服务评分(全部)'},
        {value:0,name:'未评分'},
        {value:1,name:'1星'},
        {value:2,name:'2星'},
        {value:3,name:'3星'},
        {value:4,name:'4星'},
        {value:5,name:'5星'}

    ]
    //let stateCountSelect

    var roleList = localStorage.getItem('user.roleList') ? localStorage.getItem('user.roleList').split(';') : [];
    let $switchRoleWrapper = $('.switch-role-modal-wrapper');


    function loadCss(url:string) {
        $('head').find('[href="' + url + '"]').remove();
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    }

    export function init():void {
        loadCss('build/watcher-styles.css');
        loadCss('build/tables.css');
        loadCss('build/button.css');
        loadCss('build/form.css');
        loadCss('build/vender/simplePagination/simplePagination.css');
        requirejs(['jquery.scrollTo.min'],function(content:string){
            init_header();
            init_header_events();
        })
        
        
       

    }

    function init_header():void {
        var switchRole = roleList.length > 1 ? '<div class="title-selected title-unselected" type="5">切换角色</div>' : '';
        let memberTab = '<div class="title-selected title-unselected member-list-tab" type="4">人员管理</div>';
        console.log("init_header");
        var head_html = '<div class="header"><div class="header-tap">' +
            '<div class="title-selected" type="0">设备监控</div>' +
            '<div class="title-selected title-unselected" type="1">会话</div>' +
            '<div class="title-selected title-unselected" type="2">录像查询</div>' +
            '<div class="title-selected title-unselected" type="3">问题记录</div>' +
            memberTab + switchRole +
            '</div></div>';
        lesson_list.append(head_html);
        init_get_permisson_list();
    }

    function init_header_events():void {
        console.log("init_header_events");
        lesson_list.find('.header-tap').find('div').bind('click', function (e:any) {
            //console.log("clicked")
            let type = $(this).attr('type');
            switch_tab(type);
            if(type == '5'){
                init_role_switch();
                init_role_event();
            } else {

                lesson_list.find('.header-tap').find('div').addClass("title-unselected");
                if (type == '0') {
                    error_choose_types = ["1", "2", "3", "4"];
                    init_content_list();
                    watch_list_event();
                } else if (type == '1') {
                    isErrorList = false;
                    isOneToMore = false;
                    init_session_page();
                    init_session_event();
                }
                else if (type == '2') {
                    isErrorList = false;
                    isOneToMore = false;
                    init_record_page();
                    init_record_event();

                } else if (type == '3') {
                    isErrorList = false;
                    isOneToMore = false;
                    init_question_page();
                    init_question_event();
                } else if(type == '4'){
                    // init_member_page();
                    init_new_member_page();
                }
                $(this).removeClass("title-unselected");
            }
        });
        lesson_list.find('.header-tap').find('div').first().click();

    }

    function init_record_page():void {
        console.log("init_record_page");

        lesson_list.find('.content_list').remove();
        lesson_list.find('.info_list').remove();
        lesson_list.find('.session_record').remove();

        if (lesson_list.find('.session_list').length > 0) {
            lesson_list.find('.session_list').hide();
        }
        if (lesson_list.find('.question_list').length > 0) {
            lesson_list.find('.question_list').hide();
        }

        if (lesson_list.find('.record_list').length > 0) {
            lesson_list.find('.record_list').show();
        } else {
            var list_html = '<div class="record_list">' +
                '<div class="search"><div class="search-input"><input  type="text"  placeholder="输入学生手机号按回车" /></div>' +
                '<div class="search-img"><i class="iconfont icon-search"></i></div>' +
                '<div class="date-input"><input name="date" id="reccord-date-picker" class="ui-input date-picker"  style="width:240px;"  type="text"/></div>' +
                '</div>' +
                '<div class="list"></div>' +
                '<div class="pagenav"></div>' +
                '</div>';
            lesson_list.append(list_html);
        }


    }

    function init_content_list():void {
        console.log("init_content_list");
        lesson_list.find('.info_list').remove();
        lesson_list.find('.session_record').remove();
        lesson_list.find('.content_list').remove();
        if (lesson_list.find('.session_list').length > 0) {
            lesson_list.find('.session_list').hide();
        }
        if (lesson_list.find('.record_list').length > 0) {
            lesson_list.find('.record_list').hide();
        }
        if (lesson_list.find('.question_list').length > 0) {
            lesson_list.find('.question_list').hide();
        }
        //lesson_list.find('.session_list').remove();


        var list_html = '<div class="content_list">' +
            '<div class="search"><div class="search-input"><input  type="text"  placeholder="搜索学生或老师" /></div>' +
            '<div class="search-img"><i class="iconfont icon-search"></i></div>' +
            '<div class="pianotrain-device device-tab" >钢琴陪练(<span id="pianotrainCounts"></span>)</div><div class="oneToMore-device  device-tab" data-type="1">小班课(<span id="oneToMoreCounts"></span>)</div><div class="oneToOne-device device-choose device-tab " data-type="0">一对一(<span id="oneToOneCounts"></span>)</div>' +
            '</div>' +
            //'<div class="error-check"><input type="checkbox" checked data-value="1"/> 音频问题  <input type="checkbox" checked data-value="2">课件问题 <input type="checkbox" checked data-value="3">掉线卡顿问题  <input type="checkbox" checked data-value="4"> 其他问题</div>' +
            '<div class="list"></div>' +
            // '<div class="page-box allListPageBox" style="display: none;">' +
            // '<span>每页显示&nbsp;<i class="pageSize"></i>&nbsp;行,共&nbsp;<i class="totalCount"></i>&nbsp;条记录</span>'+
            // '<div id="allListPaging" class="zm-theme simple-pagination pagenav"></div>' +
            '</div>' +
            '</div>';
        lesson_list.append(list_html);

    }

    function init_session_page():void {

        console.log("init_session_page");
        lesson_list.find('.content_list').remove();
        lesson_list.find('.info_list').remove();
        lesson_list.find('.session_record').remove();
        if (lesson_list.find('.record_list').length > 0) {
            lesson_list.find('.record_list').hide();
        }
        if (lesson_list.find('.question_list').length > 0) {
            lesson_list.find('.question_list').hide();
        }
        if (lesson_list.find('.session_list').length > 0) {
            lesson_list.find('.session_list').show();
        } else {
            var session_html = '<div class="session_list">' +
                '<div class="left"></div>' +
                '<div class="loading-content">'+
                '<div class="left-span"></div>' +
                '<div class="center messages-wrapper">' +
                '<div class="messages"></div>' +
                '<div class="send">' +
                '<input  type="text" class="sendarea"/>' +
                '<div id="menu_list" style="display:none" class="showcase">' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="right">' +
                '<div class="tabWrapper"></div>'+
                '<div class="teacher">' +
                '<div class="name"><span class="lable">姓名:</span><span class="value"></span><i class="iconfont icon-ellipse-fill"></i><button class="unlock button" >解锁</button></div>' +
                '<div class="mobile"><span class="lable">联系电话:</span><span class="value"></span></div>' +
                '<div class="qq"><span class="lable">QQ:</span><span class="value"></span></div>' +
                '<div class="weixin"><span class="lable">微信:</span><span class="value"></span></div>' +
                '<div class="lessonUid"><span class="lable">lessonUid:</span><span class="value"></span></div>'+
                '<div class="channel"><span class="lable">通道:</span><span class="value"></span></div>'+
                '<div class="network"><span class="lable">网络状况:</span><span class="value"></span><button class="button update-net-speed" disabled="disabled">实时测速</button></div>' +
                '<div class="platform"><span class="lable">平台信息:</span><span class="value"></span></div>' +
                '<div class="edition"><span class="lable">版本号:</span><span class="value"></span></div>' +
                '<div class="devices"><span class="lable">设备状况:</span><span class="value"></span></div>' +
                '<div class="currentdevice"><span class="lable">当前设备:</span><button class="button">更改</button></div>' +
                '<div class="micphone"><span class="lable">麦克风:</span><span class="value"></span></div>' +
                '<div class="video"><span class="lable">摄像头:</span><span class="value"></span></div>' +
                '<div class="speaker"><span class="lable">扬声器:</span><span class="value"></span></div>' +
                '<div class="question"><span class="lable">问题:</span><span class="value"></span></div>' +
                '<div class="questionDesc"><span class="lable">问题描述:</span><span class="value"></span></div>' +
                '<div class="questionImg"><span class="lable">问题图片:</span><span><button class="button" disabled>显示图片</button></span></div>' +
                '</div>' +
                '<div class="action">' +
                '<div class="over"><button class="button">处理完成</button></div>' +
                '<div class="turndevelop" style="display:none"><button class="button">转开发</button></div>' +
                '<div class="turnchannel"><button class="button"> 切换通道</button></div>' +
                '<div class="close"><button class="button"> 关闭会话</button></div>' +
                    // '<div class="turnserver"><button class="button">服务端</button></div>' +
                    // '<div class="p2p"><button class="button">p2p</button></div>' +
                '<div class="randomSocketAddress"><button class="button">重置socket</button></div>' +

                '</div>' +
                '</div>'+
                '</div>' +
                '</div>';
            lesson_list.append(session_html);
            init_session_list();

        }


    }

    function init_question_page():void {
        lesson_list.find('.info_list').remove();
        lesson_list.find('.content_list').remove();
        lesson_list.find('.session_record').remove();

        if (lesson_list.find('.record_list').length > 0) {
            lesson_list.find('.record_list').hide();
        }
        if (lesson_list.find('.session_list').length > 0) {
            lesson_list.find('.session_list').hide();
        }
        if (lesson_list.find('.question_list').length > 0) {
           // init_LessonType_count()
            //init_question_recourd_list();
            lesson_list.find('.question_list').show();
            init_search_params_list(1);
        } else {
            var list_html = '<div class="question_list">' +
                '<div class="question_header">' +
                    '<div class="lesson-type-wrapper"><span class="lesson-type selected" data-lessontype="0">一对一<span class="oneToOneCount"></span></span>' +
                    '<span class="lesson-type" data-lessontype="1">小班课<span class="oneToMoreCount"></span></span></div>'+
                '<div class="question-tab">' +
                '</div>' +
                '<div class="question-search-box">' +
                '<div class="nameBox" ><input class="ui-input" type="text" placeholder="输入老师\学生姓名" id="userName" ></div>' +
                '<select class="ui-select"  name="questionType" id="questionType"></select>' +
                    //'<select class="ui-select" name="platform" id="platform"><option value="">平台信息</option></select>' +
                '<input class="ui-input" type="text" placeholder="平台信息"  id="platform">' +
                '<input class="ui-input" type="text" placeholder="版本号" id="version">' +
                '<select class="ui-select" name="channellist" id="channelList"></select>' +
                '<select class="ui-select" name="rateList" id="rateList"></select>' +
                    // '<select class="ui-select" name="edition" id="edition"><option value="">版本号</option></select>' +
                '<select class="ui-select big-select" name="watchlist" id="watcherList"></select>' +
                '<select class="ui-select big-select" name="" id="watchResultType"></select>'+
                '<select class="ui-select big-select" name="" id="confirmResultType"></select>' +
                '<select class="ui-select big-select" name="" id="rewatchResultType"></select>'+
                '<select class="ui-select big-select" name="" id="reconfirmResultType"></select>'+
                '<input  value="'+moment().format('YYYY-MM-DD')+'"   type="text" name="date" class="ui-input" id="J-date-start" data-widget-cid="widget-2" data-explain="" readonly>' +
                '<input value="'+moment().format('YYYY-MM-DD')+'" type="text" name="date" class="ui-input"  id="J-date-end" data-widget-cid="widget-2" data-explain="" readonly>' +
                '<button class="ui-button queryBtn " id="searchBtn">查询</button><button class="ui-button queryBtn" id="downloadExcel">导出Exel</button>' +
                '</div>' +
                '</div>' +
                '<div class="table-wrapper">' +
                '<div>' +
                '<table class="table table-striped table-bordered"><thead>' +
                '<tr><th>姓名</th><th>问题类型</th><th>问题描述</th><th>问题图片</th><th>版本号</th><th>网络情况</th><th>问题状态</th><th>操作</th><th>用户信息</th><th>会话信息</th><th>通道</th></tr>' +
                '</thead></table>' +
                '</div>' +
                '<div class="table-box">' +
                '</div>' +
                '</div>';

            lesson_list.append(list_html);

            initDatePicker();
            init_question_category_list();
            //init_LessonType_count();
            init_question_recourd_list();
            init_get_allWorker_list();
            init_get_channel_list();
            init_rate_list();
            get_watch_result_type();
            get_confirm_result_type();
            get_watch_reresult_type();
            get_reconfirm_result_type();
            get_question_type();
            init_get_permisson_list();


        }


    }

    //录像查询
    function init_record_table():void {

        var table_html = '<table id="recoid-query-list" class="ui celled striped table" style="display: table;">' +
            '<thead><tr><th>学生姓名</th><th>老师姓名</th><th>班主任姓名</th>' +
            '<th>科目</th><th>上课时间</th><th>录像状态</th></tr></thead><tbody></tbody></table>';
        lesson_list.find('.record_list .list').append(table_html);

        lesson_list.find('.record_list').find('table tbody').on('click', 'button', function (e:any, elem:any) {
            var lessonUid = e.currentTarget.dataset.uid;
            var teacher_mobile = e.currentTarget.dataset.ttel;
            var student_mobile = e.currentTarget.dataset.stel;
            var data_form:any = {
                lessonUID: lessonUid,
                teacherMobile: teacher_mobile
            }

            if (student_mobile)data_form["studentMobile"] = student_mobile;

            zm.API.onelogin(zm.API.resolve('zm-chat:/api/lesson/synthetic_audio'), data_form).then((msg:any)=> {
                if (msg.code == "0") {
                    swal({title: "", text: "合成录像失败", timer: 2000, showConfirmButton: false, type: "error"});
                } else {
                    swal({title: "", text: "录像5分钟后生成", timer: 2000, showConfirmButton: false, type: "success"});
                }

            }).fail(()=> {
                //$courseManagement.waitMe('hide');

            });


        })

    }

    function init_record_data():void {

        if (lesson_list.find('.record_list').find('.search-input').find('input').val() == "")return;
        lesson_list.find('.record_list').waitMe({effect: 'bounce', text: '查询数据中...'});
        zm.API.onelogin(zm.API.resolve('zm-chat:/api/lesson/student_lesson_status'), {
            pageNo: start,
            mobile: lesson_list.find('.record_list').find('.search-input').find('input').val(),
            startTime: lesson_list.find('.record_list').find('.date-input').find('input').val(),
            pageSize: limit
        }).then((msg:any)=> {
            console.log("course-management-list-msg", msg);
            lesson_list.find('.record_list').waitMe('hide');
            if (msg.code == "0") {
                swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
            } else {
                make_table_first_level_tr(msg.data.data);
                total = msg.data.total;
                init_page_nav(start);
            }


        }).fail(()=> {
            //$courseManagement.waitMe('hide');
            lesson_list.find('.record_list').waitMe('hide');

        });

    }

    function make_table_first_level_tr(data:any) {
        lesson_list.find('.record_list').find('table tbody').html('');


        for (var i = 0; i < data.length; i++) {
            (function (index:any) {
                var tr_html = "<tr><td>" + data[index].studentName + "</td><td>" + data[index].teacherName + "</td><td>"
                    + data[i].sellerName + "</td><td>" + data[index].subject + "</td>"
                    + "<td>" + moment(data[index].startTime).format("YYYY-MM-DD HH:mm") + "</td>"
                    + '<td>' + record_result(data[index]) + "</td>"
                    + "</tr>";
                lesson_list.find('.record_list').find('table tbody').append(tr_html)

            })(i);

        }


    }

    function record_result(item:any) {

        if (item.audioState == 0) {
            return "<a style='color:green'>正常</a>";
        } else if (item.audioState == 1) {
            return '<a style="color:orangered">录像准备中（老师未上传）</a>';
        } else if (item.audioState == 2) {
            return '<a style="color:orangered">录像准备中（学生未上传）</a><button data-ttel="' + item.teacherMobile + '"   data-uid="' + item.lesUid + '"  class="button" style="height: 25px;width: 70px;">合成</button>';
        } else if (item.audioState == 3) {
            return '<a style="color:orangered">录像准备中（音频未合成）</a><button data-ttel="' + item.teacherMobile + '"  data-stel="' + item.studentMobile + '" data-uid="' + item.lesUid + '"  class="button" style="height: 25px;width: 70px;">合成</button>';
        }
    }

    function init_page_nav(page:any):void {
        requirejs(["simplePagination/jquery.simplePagination"], function () {
            $(function () {
                lesson_list.find('.record_list').find('.pagenav').pagination({
                    items: total,
                    itemsOnPage: limit,
                    currentPage: page,
                    prevText: '上一页',
                    nextText: '下一页',
                    onPageClick: function (i:any, e:any) {
                        console.log(i, e);
                        start = i;
                        init_record_data();
                    },
                    cssStyle: 'zm-theme'
                });
            });

        })


    }

    function init_record_event():void {

        let win:any = window;
        if (lesson_list.find('.record_list').find('table').length == 0) {
            lesson_list.find('.record_list').find('input').bind('keydown', function (event:any) {
                if (event.keyCode == 13) {
                    start = 1;
                    init_record_data();
                }
            })
            win.ZM.loadCss('build/vender/Calendar/calendar.css');
            win.ZM.loadCss('build/vender/simplePagination/simplePagination.css');

            win.requirejs(["Calendar/calendar.min"], function () {
                    var Calendar:any = win.require('/calendar.js');
                    var calendar = new Calendar({
                        trigger: '#reccord-date-picker'
                        //,
                        //range: [win.moment(), null]
                    });

                    init_record_table();
                    init_record_data()

                }
            )
        } else {
            init_record_data()

        }


    }


    //会话
    function appendSystemMessage(message:string):void {
        var $messagesWrapper:any = lesson_list.find('.session_list').find('.messages');

        $(`<li class="system-message  enable-contextmenu"></li>`)
            .text(message)
            .appendTo($messagesWrapper);

    }

    function appendMessage(message:any, msgtype:string):JQuery {
        var css = "";
        if (message.roule == 'watcher')css = 'from-me';
        else if (message.roule == 'teacher')css = 'teacher';
        else if (message.roule == 'student')css = 'student';
        else if (message.roule == 'seller')css = 'seller';

        var $messagesWrapper:any = lesson_list.find('.session_list').find('.messages');

        var $li = $(`
            <li class="message enable-contextmenu">
                <div class="avatar"></div>
                <div class="title">姓名-角色</div>
                <div ><p class="text"></p></div>
            </li>
        `);

        $li
            .find('.text')
            .text(`${message.text}`);
        $li.addClass(css + ' sending');
        
        $li.find('.title').html(`${moment(message.timestamp).format('HH:mm') + ' '} ${message.nickname?message.nickname:''}${message.roule ? '-' + zm.User.roleMap[message.roule] : ''}:`)
        $li.appendTo($messagesWrapper);
        $messagesWrapper.scrollTop(9999);
        return $li;
    }

    function clear_session_data():void {


        var right = lesson_list.find('.session_list').find('.right');
        var center = lesson_list.find('.session_list').find('.center');
        var left = lesson_list.find('.session_list').find('.left');
        var tabItem = lesson_list.find('.session_list').find('.tabItem');
        delete session_map[left.find('.selected').attr('uid')];
        delete session_message_map[left.find('.selected').attr('uid')];
        center.find('.messages').html('');
        tabItem.html('');
        var teacher = right.find('.teacher');
        teacher.find('.value').text('');
        teacher.find('.name').find('i').removeClass("fine error");
        lesson_list.find('.devices').find('.value').nextAll().remove();
        lesson_list.find('.video').find('.value').nextAll().remove();
        lesson_list.find('.micphone').find('.value').nextAll().remove();       
        lessonSocket?lessonSocket.disconnect():'';
        left.find('.selected').remove();
        localStorage.setItem('sessionList',JSON.stringify(session_map));


    }

    function init_session_event():void {                                                 

        get_question_type ();
        get_watch_result_type();

        lesson_list.find('.session_list').find('.over ,.turndevelop,.turnchannel,.close,.p2p,.turnserver,.randomSocketAddress').find('button').unbind('click');
        var left = lesson_list.find('.session_list').find('.left');
        var session_list:any = lesson_list.find('.session_list');
        lesson_list.find('.session_list').find('.close').find('button').bind('click', function () {
            if (left.find('.selected').length == 0) {
                swal({title: "", text: "未选择会话...", timer: 2000, showConfirmButton: false, type: "error"});
                return;

            }
            swal({
                title: "提示",
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonColor: "#fe5b56",
                animation: "slide-from-top",
                type: "success",
                text: '确定关闭此会话么?'
            }, (isConfirm) => {
                if (isConfirm) {
                    clear_session_data();
                }
            })

        })
        lesson_list.find('.session_list').find('.randomSocketAddress').find('button').bind('click', function () {
            if (left.find('.selected').length == 0) {
                swal({title: "", text: "未选择会话...", timer: 2000, showConfirmButton: false, type: "error"});
                return;

            }
            swal({
                title: "确定重置socket服务器?",
                showConfirmButton: true,
                showCancelButton: true,
                closeOnConfirm: false,
                confirmButtonColor: "#fe5b56",
                animation: "slide-from-top",
                html: true,
                text: '<div style="font-size: large;color: red;">建议课程未开始切换，否则会丢失白板和音频数据!</div>'
            }, (isConfirm) => {
                if (isConfirm) {
                    zm.API.onelogin(zm.API.resolve('zm-chat:/api/watcher/changeServer'),
                        {
                            lessonUID: left.find('.selected').attr('uid'),
                            mobile: zm.user.mobile
                        }).then((msg:any)=> {
                        if (msg.code == "0") {
                            swal({title: "", text: "重置成功失败", timer: 2500, showConfirmButton: false, type: "error"});
                        } else {
                            swal({
                                title: "",
                                text: "重置成功，请告知学生和老师重新进入房间。",
                                timer: 2000,
                                showConfirmButton: false,
                                type: "success"
                            });
                        }

                    }).fail(()=> {
                        //$courseManagement.waitMe('hide');

                    });
                }
            })

        })

        lesson_list.find('.session_list').find('.p2p').find('button').bind('click', function () {
            if (left.find('.selected').length == 0) {
                swal({title: "", text: "未选择会话...", timer: 2000, showConfirmButton: false, type: "error"});
                return;

            }
            swal({
                title: "提示",
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonColor: "#fe5b56",
                animation: "slide-from-top",
                type: "success",
                text: '确定转换为p2p模式么?'
            }, (isConfirm) => {
                if (isConfirm) {
                    lessonSocket.emit('connect type', "p2p", (timestamp:any) => {
                        //console.log("update device",timestamp)
                    });
                }
            })

        })
        lesson_list.find('.session_list').find('.turnserver').find('button').bind('click', function () {
            if (left.find('.selected').length == 0) {
                swal({title: "", text: "未选择会话...", timer: 2000, showConfirmButton: false, type: "error"});
                return;

            }
            swal({
                title: "提示",
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonColor: "#fe5b56",
                animation: "slide-from-top",
                type: "success",
                text: '确定转换为turnserver模式么?'
            }, (isConfirm) => {
                if (isConfirm) {

                    lessonSocket.emit('connect type', "turnserver", (timestamp:any) => {
                        //console.log("update device",timestamp)
                    });

                }
            })

        })
        lesson_list.find('.session_list').find('.over').find('button').bind('click', function () {
            $('input[name="questionType"]').val('');
           // console.log(999999,$('input[name="questionType"]:checked').val());
            if (left.find('.selected').length == 0) {
                swal({title: "", text: "未选择会话...", timer: 2000, showConfirmButton: false, type: "error"});
                return;

            }

            var questionType_html:any = '';
            var resultType_html:any = '';
            $.each(questionTypeData,function(index:any,item:any){
                questionType_html += '<div class="radioDiv" style="'+(isOneToMoreSession?"display:none":"")+'"><input value="'+item.id+'" type="radio" name="questionType"><label>'+item.name+'</label></div>';
            });
            $.each(resultTypeData,function(index:any,item:any){
                resultType_html += '<div class="inputDiv"><input value="'+item.id+'" type="radio" name="resultType"><label>'+item.name+'</label></div><br/>';

            })


            swal({
                title: "",
                showCancelButton: true,
                closeOnConfirm: false,
                confirmButtonColor: "#fe5b56",
                animation: "slide-from-top",
                text:'<div class="sweetalert-choose-qustiontype">' +
                '<div style="text-align:left;">' +
                '<div class="title" style="'+(isOneToMoreSession?"display:none":"")+'"><span class="ui-form-required">*</span>请选择问题类型：</div>' +
                questionType_html +
                '</div>' +
                '<div>' +
                '<div class="title" ><span class="ui-form-required">*</span>请选择处理结果：</div>' +
                resultType_html+
                '</div>'+
                '</div>',
                html: true
            },(isConfirm) => {
                if(isConfirm){
                    if(isOneToMoreSession){
                        if(!$('input[name="resultType"]:checked').val())return;
                    }else{
                        if(!$('input[name="resultType"]:checked').val()||!$('input[name="questionType"]:checked').val()) return;
                    }
                    zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/solveByLessonUid'), {
                        //zm.API.onelogin('http://192.168.8.213:8080/api/feedback/solveByLessonUid ', {
                        lessonUid: left.find('.selected').attr('uid'),
                        employeeId:zm.user.userId,
                        remark:'',
                        resultId:$('input[name="resultType"]:checked').val(),
                            categoryId:$('input[name="questionType"]:checked').val()?$('input[name="questionType"]:checked').val():''
                    }).then(function(msg:any){
                        if(msg.code==1){
                            //session_list.waitMe('hide');
                            clear_session_data();
                            swal({title: "提示", text: "问题提交成功", timer: 2000, showConfirmButton: false, type: "success"});
                        }else{
                            //session_list.waitMe('hide');
                            swal({title: "提示", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
                        }
                    })
                }
            })

        });
        lesson_list.find('.session_list').find('.turndevelop').find('button').bind('click', function (){
            if (left.find('.selected').length == 0) {
                swal({title: "", text: "未选择会话...", timer: 2000, showConfirmButton: false, type: "error"});
                return;
            }

            var questionType_html:any = '';
            var resultType_html:any = '';
            $.each(questionTypeData,function(index:any,item:any){
                questionType_html += '<div class="radioDiv" ><input value="'+item.id+'" type="radio" name="questionType"><label>'+item.qcategoryName+'</label></div>';
            });
            $.each(resultTypeData,function(index:any,item:any){
                resultType_html += '<div class="inputDiv" id=""><input value="'+item.id+'" type="radio" name="resultType" '+(item.id==4?"checked":"")+' disabled><label>'+item.qresultName+'</label></div><br/>';
            })


            swal({
                    title: "",
                    showCancelButton: true,
                    closeOnConfirm: false,
                    confirmButtonColor: "#fe5b56",
                    animation: "slide-from-top",
                    text:'<div class="sweetalert-choose-qustiontype">' +
                    '<div style="text-align: left;">' +
                    '<div class="title"><span class="ui-form-required">*</span>请选择问题类型：</div>' +
                    questionType_html +
                    '</div>' +
                    '<div>' +
                    '<div class="title"><span class="ui-form-required">*</span>请选择处理结果：</div>' +
                    resultType_html+
                    '</div>'+
                    '</div>',
                    html: true
            },(isConfirm) => {
                if(isConfirm){
                    if(!$('input[name="questionType"]:checked').val()) return;
                    zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/turnToDeveloper'), {
                    //zm.API.onelogin('http://121.43.100.229:8080/api/feedback/turnToDeveloper', {
                        lessonUid: left.find('.selected').attr('uid'),
                        workerId:zm.user.userId,
                        remark:'',
                        qResultId:$('input[name="resultType"]:checked').val(),
                        qCategoryId:$('input[name="questionType"]:checked').val()
                    }).then(function(msg:any){
                        if(msg.code==1){
                            //session_list.waitMe('hide');
                            clear_session_data();
                            swal({title: "", text: "转开发成功", timer: 2000, showConfirmButton: false, type: "success"});
                        }else{
                            //session_list.waitMe('hide');
                            swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
                        }
                    })
                }
            })

        })

        lesson_list.find('.session_list').find('.turnchannel').find('button').bind('click', function (){

            if (left.find('.selected').length == 0) {
                swal({title: "", text: "未选择会话...", timer: 2000, showConfirmButton: false, type: "error"});
                return;
            }
            var param:any = {lessonUID:left.find('.selected').attr('uid')};
            if(isOneToMoreSession){
                param = {
                    lessonUID:left.find('.selected').attr('uid'),
                    type:'mutil'
                };
            }
            zm.API.onelogin(zm.API.resolve('zm-chat:/api/watcher/getCommonChannel'), param).then(function(msg:any){
                if(msg.code==1){
                    if(!msg.data.commonChannel ||!msg.data.firstChannel){
                        swal({title: "", text: "没有可切换通道可选", timer: 2000, showConfirmButton: false, type: "error"})
                    }else{
                        var channel_data = JSON.parse(msg.data.commonChannel);
                        channel_option_html='';
                        for(var i=0;i<channel_data.length;i++){
                            console.log(channel_data.length,channel_data[i])
                            channel_option_html+='<option>'+channel_data[i]+'</option>';
                        }
                        var current_channel_html ='<span class="currentChannel">'+msg.data.firstChannel+'</span>'
                        var channel_select_html = $('<select class="channel"></select>');
                        channel_select_html.html(channel_option_html);

                        swal({
                            title: "",
                            showCancelButton: true,
                            closeOnConfirm: false,
                            confirmButtonColor: "#fe5b56",
                            animation: "slide-from-top",
                            text:'<div class="sweetalert-choose-device">' +
                            '当前通道：'+
                            current_channel_html+'<br/>' +
                            '切换通道：' +
                            channel_select_html[0].outerHTML +
                            '<div style="font-size: large;color: red;margin-top:20px">建议课程未开始切换，否则会影响录像！</div>' +
                            '</div>',
                            html: true
                        },(isConfirm) => {
                            var paramData:any ={
                                teaMobile:left.find('.selected').attr('teaMobile'),
                                stuMobile:left.find('.selected').attr('stuMobile'),
                                channel:$('.sweetalert-choose-device .channel').val()
                            };
                            if(isOneToMoreSession){
                                paramData = {
                                    lessonUID:left.find('.selected').attr('uid'),
                                    type:'mutil',
                                    channel:$('.sweetalert-choose-device .channel').val()
                                }

                            };

                            if(isConfirm){
                                var updtaChannel = $('.sweetalert-choose-device .channel').val();
                                console.log(left.find('.selected').attr('teaMobile'),left.find('.selected').attr('stuMobile'),$('.sweetalert-choose-device .channel').val())
                                zm.API.onelogin(zm.API.resolve('zm-chat:/api/watcher/updateFirstChannel'), paramData).then(function(msg:any){
                                    if(msg.code==1){
                                        swal({title: "", text: "通道切换成功，请告知学生或老师重新进入房间。",timer: 2000, showConfirmButton: false, type: "success"});
                                        get_device_info_by_uid(left.find('.selected').attr('uid'));
                                        if(ticketBu !== '1'){
                                            lessonSocket.emit('emit on self', { name: 'refresh channel', data: updtaChannel })
                                        }
                                        

                                    }else{
                                        swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
                                    }
                                })
                            }
                        })
                    }



                }else{
                    swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
                }
            })





        })


        lesson_list.find('.session_list').find('.currentdevice').find('button').unbind('click');
        lesson_list.find('.session_list').find('.currentdevice').find('button').bind("click", function (event:any) {
            // if(isOneToMoreSession) return;

            var video_devices:any = [];
            var voice_devices:any = [];
            var speaker_devices:any = [];

            var voice_select_html = $('<select class="voice"></select>');
            var video_select_html = $('<select class="video"></select>');
            var speaker_select_html = $('<select class="speaker"></select>');

            var device_div = $(this).parent().prev();

            var video_div:any = $(this).parent().parent().find('.video');
            var micphone_div:any = $(this).parent().parent().find('.micphone');
            var speaker_div:any = $(this).parent().parent().find('.speaker');

            var mic_div:any = device_div.find('.mic');
            var vid_div:any = device_div.find('.vid');
            var spe_div:any = device_div.find('.spe');

            console.log('mic_div',mic_div);
            mic_div.each(function (index:number, item:any) {

                var is_selected = $(item).attr('deviceid') == micphone_div.find('.device').attr('deviceid') ? "selected" : "";

                voice_select_html.append('<option ' + is_selected + ' value ="' + $(item).attr('deviceid') + '">' + $(item).text() + '</option>');
                //voice_devices.push({id:$(item).attr('deviceid'),name:$(item).text()})
            })

            vid_div.each(function (index:number, item:any) {

                var is_selected = $(item).attr('deviceid') == video_div.find('.device').attr('deviceid') ? "selected" : "";
                video_select_html.append('<option ' + is_selected + ' value ="' + $(item).attr('deviceid') + '">' + $(item).text() + '</option>');
                //voice_devices.push({id:$(item).attr('deviceid'),name:$(item).text()})
            })

            spe_div.each(function (index:number, item:any) {

                var is_selected = $(item).attr('deviceid') == speaker_div.find('.device').attr('deviceid') ? "selected" : "";
                speaker_select_html.append('<option ' + is_selected + ' value ="' + $(item).attr('deviceid') + '">' + $(item).text() + '</option>');
                //voice_devices.push({id:$(item).attr('deviceid'),name:$(item).text()})
            })



            console.log("mic_div", mic_div)
            console.log("vid_div", vid_div);
            console.log("spe_div", spe_div);



            if (mic_div.length == 0 && vid_div.length == 0 && spe_div.length ==0 ) {
                swal({title: "", text: "没有设备可以选择...", timer: 2000, showConfirmButton: false, type: "error"});
                return;
            }


            swal({
                    title: "",
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonColor: "#fe5b56",
                    animation: "slide-from-top",
                    text: '<div class="sweetalert-choose-device">' +
                    '麦克风：' +
                    voice_select_html[0].outerHTML +
                    '<br>' +
                    '摄像头：' +
                    video_select_html[0].outerHTML +
                    '<br>' +
                    '扬声器：'+
                    speaker_select_html[0].outerHTML +
                    '</div>',
                    html: true
                }, (isConfirm) => {
                    if (isConfirm) {


                        var message:any = {
                            mobile: $(this).parent().parent().find('.mobile').find('.value').text(),
                            voiceid: $(".sweetalert-choose-device").find('.voice').val(),
                            videoid: $(".sweetalert-choose-device").find('.video').val(),
                            speakerid:$(".sweetalert-choose-device").find('.speaker').val()
                        }

                        //console.log("micphone_div",micphone_div.find('.device').val(),$(".sweetalert-choose-device").find('.voice').find("option:selected").text());

                        //micphone_div.find('.device').text(1212)
                        micphone_div.find('.device').text($(".sweetalert-choose-device").find('.voice').find("option:selected").text())
                        micphone_div.find('.device').attr("deviceid", $(".sweetalert-choose-device").find('.voice').val())
                        video_div.find('.device').text($(".sweetalert-choose-device").find('.video').find("option:selected").text())
                        video_div.find('.device').attr("deviceid", $(".sweetalert-choose-device").find('.video').val())
                        speaker_div.find('.device').text($(".sweetalert-choose-device").find('.speaker').find("option:selected").text())
                        speaker_div.find('.device').attr("deviceid", $(".sweetalert-choose-device").find('.speaker').val())
                        //video_div.find('.device').text(345)

                        lessonSocket.emit('update device', message, (timestamp:any) => {
                            console.log("update device", timestamp)
                        });
                    }
                }
            )
        });
        lesson_list.find('.session_list .teacher').find('.questionImg').find('button').unbind('click');
        lesson_list.find('.session_list').find('.questionImg').find('button').bind("click", function () {
            //console.info('返回图片：',teacherImgUrl);
           
            let i = 0;
            let win:any = window;
            requirejs([
                    "artDialog/dialog"
                ],
                function (content:string) {
                    var d = new win.dialog({
                        content: '<div style="width:900px;height:640px; background: #fff; border-radius: 6px; ">' +
                    '<div class="icon-close d-close" style=" width:18px;height:18px;top:18px;right:18px;z-index:1"></div>' +
                    '<div style="width:100%;height:100%;padding:30px;text-align: center;position: relative;">'+
                    '<img src="'+(teacherImgUrl[i] + "?m=" + Date.now())+'" alt="" class="questionImg" style="width:100%;height:100%;" >' +
                    '<div class="prev" style="position: absolute;width: 40px;height: 60px;background:rgba(0,0,0,0.5);left: 30px;top: 50%;margin-top: -30px;border-radius: 0 4px 4px 0;line-height: 60px;cursor: pointer;color:#fff"><i class="iconfont icon-arrow-left"></i></div>'+
                    '<div class="next" style="position: absolute;width: 40px;height: 60px;background:rgba(0,0,0,0.5);right: 30px;top: 50%;margin-top: -30px;border-radius: 4px 0 0 4px;line-height: 60px;cursor: pointer;color:#fff"><i class="iconfont icon-arrow-right"></i></div>'+
                    '<div class="page"><span>'+(i+1)+'</span>/<span>'+teacherImgUrl.length+'</span></div>'+
                    '</div></div>',
                        onclose: function () {
                        },
                        
                        onshow: function () {
                           // $('.questionImg').attr('src', teacherImgUrl[i] + "?m=" + Date.now());
                            $('.d-close').click(function () {
                                d.close();
                                //console.info('返回图片：',teacherImgUrl)
                            });
                        }
                    })
                    d.addEventListener('show',function(){
                        $('.next').click(function(){
                            if(i === teacherImgUrl.length - 1)return;
                            i++;
                            console.log('chahhahahah',i);
                            $('.questionImg').attr('src', teacherImgUrl[i] + "?m=" + Date.now());
                            $('.page').html('<span>'+(i+1)+'</span>/<span>'+teacherImgUrl.length+'</span>')
                        })
                        $('.prev').click(function(){
                            if(i === 0)return;
                            i--;
                            $('.questionImg').attr('src', teacherImgUrl[i] + "?m=" + Date.now());
                            $('.page').html('<span>'+(i+1)+'</span>/<span>'+teacherImgUrl.length+'</span>')
                        })
                       
                    })
                    d.showModal();
                })

        });


        lesson_list.find('.session_list').find('.send').find('input').keypress(function (event:any) {
            if (event.keyCode != 13 || !lessonSocket) {
                return;
            }

            var $input = $(this);

            var text = (<string>$input.val()).trim();

            if (!text) {
                return;
            }

            $input.val('');

            var message = {
                nickname: zm.user.name,
                mobile: zm.user.mobile,
                roule: zm.user.role,
                timestamp: Date.now(),
                text: text
            };
            appendMessage(message, 'from-me');

            lessonSocket.emit('chat message', message, (timestamp:any) => {
                console.log("chat message", timestamp)
            });
        })

        lesson_list.find('.session_list .student').find('.unlock').unbind('click');
        lesson_list.find('.session_list').find('.unlock').click(function () {
            swal({
                title: "提示",
                showCancelButton: true,
                closeOnConfirm: false,
                showConfirmButton: true,
                confirmButtonColor: "#fe5b56",
                animation: "slide-from-top",
                type: "warning",
                text: '确定解除学生端锁屏功能吗?'
            }, (isConfirm) => {
                if (isConfirm) {

                    lessonSocket.emit('operation notify', '2', (timestamp:any) => {
                        console.log("update device", timestamp);
                        swal({title: "", text: "学生端已解除锁屏模式", timer: 2000, showConfirmButton: false, type: "success"});
                    });

                } else {
                    return
                }
            })

        })

        lesson_list.find('.session_list').find('.update-net-speed').unbind('click');
        lesson_list.find('.session_list').find('.update-net-speed').click(function(){
            if (left.find('.selected').length == 0) {
                swal({title: "", text: "未选择会话...", timer: 2000, showConfirmButton: false, type: "error"});
                return;
            }
            var mobile = lesson_list.find('.session_list').find('.mobile .value').text();
            lessonSocket.emit('emit on self', { name: 'refresh netspeed' ,data: mobile});
        })

        session_messages_event();

    }

    function init_session_page_socket(uid:any):void {
        // if (!session_data || !session_data.lessonUid) {
        //     swal({title: "", text: "该堂课已结束", timer: 2000, showConfirmButton: false, type: "error"});
        //     return;
        // }
        var session_list:any = lesson_list.find('.session_list .loading-content');
        session_list.waitMe({effect: 'bounce', text: 'loading'});

        if (lessonSocket) {
            //zm.testobjs=lessonSocket;
            lessonSocket.disconnect();
            lessonSocket.destroy();
        }
        var ajaxfail = new Promise<any>((resolve, reject) => {
            var requestUrl = 'zm-chat:/api/load-balancing/fetch-server';
            if(isOneToMoreSession){
                requestUrl = 'zm-chat:/api/load-balancing/fetch-mutil-server';
            }else{
                requestUrl = 'zm-chat:/api/load-balancing/fetch-server';
            }
            jQuery.ajax({
                type: "POST",
                url: zm.API.resolve(requestUrl),
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify({
                    lessonUID: uid
                }),
                timeout: 6000,
                error: function (msg:any) {

                    resolve({code: 2})
                },
                success: function (msg:any) {
                    resolve(msg)
                }

            })

        });

        ajaxfail.then(msg => {

            if (msg.code == 0) {

                var serverAddress = msg.data;
                //serverAddress="http://172.16.7.91:1337";
                lessonSocket = io(serverAddress, {
                    reconnectionDelay: 30 * 1000,
                    timeout: 30 * 1000,
                    reconnection: false,
                    'force new connection': true,
                    'connect timeout': 30 * 1000,
                    'reconnection delay': 30 * 1000,
                    query: {
                        name: zm.user.name,
                        mobile: zm.user.mobile,
                        //mobile: "10000001545",
                        password: zm.user.password,
                        roleName: "技术支持",
                        //password: "hello1545",
                        lessonUID: uid,
                        lessonType: "regular-lesson",
                        get lastIndex():number {
                            return -1;
                        },
                        get lastMessageIndex():number {
                            return -1;
                        },
                        //lessonType: currentLesson.type,
                        //role:"seller"
                        role: zm.user.role
                    }
                });


                //lessonSocket.io.onbeforereconnect = (next:any) => {


                // var ajaxfail=new Promise<any>((resolve, reject) => {
                //     jQuery.ajax({
                //         type: "POST",
                //         url: zm.API.resolve('zm-chat:/api/load-balancing/fetch-server'),
                //         contentType:'application/json; charset=UTF-8',
                //         data:JSON.stringify({
                //             lessonUID: session_data.lessonuid
                //         }),
                //         timeout:3000,
                //         error: function(msg:any)
                //         {
                //
                //             //resolve({code:2})
                //         },
                //         success: function(msg:any) {resolve(msg) }
                //
                //     })
                //
                // });
                //
                // ajaxfail.then(msg =>{
                //   if(msg.code==0){
                //
                //     var serverAddress = msg.data;
                //     //serverAddress="http://172.16.7.91:1337";
                //     lessonSocket.io.uri = serverAddress;
                //   }
                //
                // })
                // .then(next);

                //};


                lessonSocket.on('chat message catch up events', (messages:any) => {
                    console.log('chat message catch up events');
                        for (let message of messages) {
                            var $li = appendMessage(message, '');
                        }
                    }
                );
                lessonSocket.on('chat message current events', (messages:any) => {
                        console.log('chat message current events');
                        for (let message of messages) {
                            var $li = appendMessage(message, '');
                        }
                    }
                );

                lessonSocket.on('chat message', (message:any) => {
                    if (message.roule != 'watcher') {
                        let $li = appendMessage(message, '');
                    }

                    // $li.find('.avatar')
                    //     .css('background-image', `url(${ targetUser.avatar })`);
                });

                lessonSocket.on('client id', (clientId:number) => {
                    session_list.waitMe('hide');
                    //console.log("client id")


                });
                lessonSocket.on("turnservers", (message:any) => {
                    //console.log("turnservers:", message);
                });

                lessonSocket.on('user connect', (connectuser:any) => {

                    // if (connectuser.mobile == zm.user.mobile) {
                    //       return;
                    // }

                    if (connectuser.role != 'watcher') {
                        appendSystemMessage(`${connectuser.name}${zm.User.roleMap[connectuser.role] ? `-${zm.User.roleMap[connectuser.role]}` : ''} 已经上线`);
                    }


                });

                lessonSocket.on('user disconnect', (connectuser:any) => {

                    if (connectuser.role != 'watcher') {
                        appendSystemMessage(`${connectuser.name}${zm.User.roleMap[connectuser.role] ? `-${zm.User.roleMap[connectuser.role]}` : ''} 已经下线`);
                    }

                })


                lessonSocket.on("send device", (message:any)=> {
                    console.log("send device:", message);

                    //lesson_list.find('.devices').find('.value').nextAll().remove();
                    //lesson_list.find('.video').find('.value').nextAll().remove();
                    //lesson_list.find('.micphone').find('.value').nextAll().remove();
                    //for (var i = 0; i < message.length; i++) {
                    //    //init_device_info(message[i]);
                    //}

                })
                

                lessonSocket.on("realtime netspeed",(message:any)=>{
                    console.log("realtime netspeed",message);
                    var channel = lesson_list.find('.session_list').find('.channel .value').text();
                    swal({
                        title: "",
                        showCancelButton: true,
                        closeOnConfirm: false,
                        confirmButtonColor: "#fe5b56",
                        confirmButtonText:'重新测试',
                        cancelButtonText:'关闭',
                        animation: "slide-from-top",
                        text:'<div class="sweetalert-choose-qustiontype">' +
                        '<div style="height:40px;">' +
                        '<span>当前通道：</span>' +
                        channel +
                        '</div>' +
                        '<div>' +
                        '<span>网络状况：</span>' +
                        message+
                        '</div>'+
                        '</div>',
                        html: true
                    },(isConfirm) => {
                        if(isConfirm){
                            var mobile = lesson_list.find('.session_list').find('.mobile .value').text();
                            var lessonUid = lesson_list.find('.session_list').find('.lessonUid .value').text();
                            lessonSocket.emit('emit on self', { name: 'refresh netspeed' ,data: mobile});
                            //get_device_info_by_uid(lessonUid);
                           
                        }
                    })

                })

            }

        });

    }

    function fetch_message():void {

        if (message_interval)return;
        message_interval = setInterval(function () {

            var lessonUIDs:any = [];
            var readTimes:any = [];
            var lessonUid:any =[];
            for (var uid in session_message_map) {
                lessonUIDs.push(session_message_map[uid].uid);
                readTimes.push(session_message_map[uid].time);
                lessonUid.push(uid);
            }


            jQuery.ajax({
                type: "POST",
                url: zm.API.resolve('zm-chat:/api/lesson/get_message_count'),
                //url: 'http://172.16.5.152:8080/api/lesson/get_message_count',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify({
                    mobile: zm.user.mobile,
                    password: zm.user.password,
                    lessonUIDs: lessonUIDs,
                    readTimes: readTimes
                }),
                timeout: 30000,
                error: function (msg:any) {


                },
                success: function (msg:any) {

                    if (msg.code == 1) {
                        for(var i=0;i<msg.data.length;i++){
                            session_message_map[lessonUid[i]].message = msg.data[i];
                        }
                       
                        var left = lesson_list.find('.session_list').find('.left');
                        left.find('.listitem').each(function (index:any, item:any) {
                            //console.log('item heheh',$(item).attr('uid'),msg.data[attr_index]);
                            var attr_index = lessonUid.indexOf($(item).attr('uid'));
                            if (attr_index >= 0 && !$(item).hasClass('selected')) {
                                $(item).find('.unreadnums').text(msg.data[attr_index]);
                            }

                        });
                    }
                    console.log("get_message_count", msg);
                }

            })


        }, 30000)


    }

                                                    

    function get_session_data_by_uid(uid:string):any {
       // console.log('uid1111',uid,list_data,list_data_error,list_data_search);
        // if(list_data_save.length==0){
        //     //list_data_save = list_data_save.concat(list_data_error).concat(list_data_search_save);
        //     list_data_save = list_data_save.concat(list_data_search_save);
        // }
        // //var allResultData = list_data_save.concat(list_data_error).concat(list_data_search_save);
        // var allResultData = list_data_save.concat(list_data_search_save);
        var allResultData = list_data.concat(list_data_oneToMore).concat(list_data_pianoTrain).concat(list_data_search_save);
        //console.log('xinnnn',allResultData);
        var result:any = {};
        for (var i = 0; i < allResultData.length; i++) {
            if (allResultData[i].lessonUid == uid) {
                result = allResultData[i];
               // console.log('result', result);
                break;
            }

        }
        return result;

    }

    //校验课堂是否存在
    function check_session_item(uid:any,state:any){
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/getGroupState'), {
            //zm.API.onelogin('http://192.168.8.213:8080/api/feedback/scrambleByLessonUid', {
            lessonUid: uid,
            state:state
        }).then(function (msg:any) {
            if (msg.code == 1) {
                if(msg.data){
                    init_session_page_socket(uid);
                }else{
                    swal({title: "", text: "该堂课已结束", timer: 2000, showConfirmButton: false, type: "error"});
                }

            } else {
                swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
            }
        })
    }

    //会话左侧列表事件
    function session_left_list_event(){
        var left = lesson_list.find('.session_list').find('.left');
        left.html('');
        var session_list_data:any = [];
        for(var i in session_map){
            session_list_data.push(session_map[i]);
        }
        $.each(session_list_data,function(index:any,item:any){
            for(var i=0;i<item.deviceProfiles.length;i++){
                if(item.deviceProfiles[i].role=='teacher'){
                    teaMobile = item.deviceProfiles[i].mobile;
                }else if(item.deviceProfiles[i].role=='student'){
                    stuMobile = item.deviceProfiles[i].mobile;
                }  
            }
        
            left.prepend('<div class="listitem" uid="' + item.lessonUid + '" state="'+item.state+'"  ticketBu = "'+item.ticketBu+' "teaMobile="'+teaMobile+'" stuMobile="'+stuMobile+'" lessontype="'+item.groupType+'">' +
                '<span class="lesson-type-icon '+(item.groupType?"onetomore-icon":"")+'"></span>' +
                '<span>' + item.deviceProfiles[0].name+
                '</span> —— <span>' + item.deviceProfiles[1].name + '</span> <span class="unreadnums">'+(session_message_map[item.lessonUid]&&session_message_map[item.lessonUid].message?session_message_map[item.lessonUid].message:0)+'</span></div>');
            if(session_message_map[item.lessonUid])return;
            session_message_map[item.lessonUid] = {
                uid:session_map[item.lessonUid].groupType==1?'mutil-lesson-message-events-'+item.lessonUid:'lesson-message-events-' + item.lessonUid,
                time:Date.now()
            } ;
           
        })
        
        left.find('.listitem').unbind('click');
        left.find('.listitem').bind('click', function () {
        left.find('.listitem').removeClass('selected');
            $(this).addClass('selected');
            $(this).find('.unreadnums').text(0);
            var lessonUid = $(this).attr('uid');
            var lessontype:any = $(this).attr('lessontype');
            ticketBu = $(this).attr('ticketBu');
            var state:any = $(this).attr('state');
            if(lessontype == 1){
            //$('.turnchannel').hide();
                isOneToMoreSession = true;
            }else{
                $('.turnchannel').show();
                isOneToMoreSession = false;
            }
            // console.log("uid uid uid", uid);
            session_message_map[lessonUid] = {uid:session_map[lessonUid].groupType==1?'mutil-lesson-message-events-'+lessonUid:'lesson-message-events-' + lessonUid, time:Date.now()}
            var center = lesson_list.find('.session_list').find('.center');
            center.find('.messages').html('');
            selectedIndex = 0;
            check_session_item(lessonUid,state);
            
            get_device_info_by_uid(lessonUid);
            fetch_message();
            

        //init_session_page_data(get_session_data_by_uid(uid));
        });

    }
    //新增一条会话列表
    function init_new_session(uid:any):void {
        
        var lessonuid = uid;
        var left = lesson_list.find('.session_list').find('.left');
        
        if (!session_map[uid]) {
            var session_data = get_session_data_by_uid(uid);
            //session_data.lessonuid="FXntC4LsHF8uLcyTY3zbKFaqkJp8sJYq";
            session_map[uid] = session_data;
            session_message_map[uid] = {
                uid:session_map[uid].groupType==1?'mutil-lesson-message-events-'+uid:'lesson-message-events-' + uid,
                time:Date.now()
            } ;
           
            localStorage.setItem('sessionList',JSON.stringify(session_map));
            
        
        
            
        } 

        
        session_left_list_event();
        left.find('[uid=' + lessonuid + ']').click();
          

    }

    //初始进入会话
    function init_session_list(){
        if(addSessionClick)return;
        var left = lesson_list.find('.session_list').find('.left');
        session_left_list_event();
        left.find('.listitem').first().click();
        

    }
    
    function make_time(time:any):string {
        if (time)return moment(time).format('HH:mm')
        else return "";

    }
    function get_format_time(time:any):any{
         var s:any = 1000;
         var m:any = 60*s;
         var h:any = 60*m;
         var hour:any = time/h;
         var minute:any = (time - parseInt(hour)*h)/m;
         var second:any = (time - parseInt(hour)*h - parseInt(minute)*m)/s;
         var time_hour:any = hour<10?('0'+ parseInt(hour).toString()+':'):(parseInt(hour).toString()+':');
         var time_minute:any = minute < 10?('0'+ parseInt(minute).toString() +':'):(parseInt(minute).toString()+':');
         var time_second:any = second < 10?('0'+ parseInt(second).toString()):(parseInt(second).toString());
         var new_time:string = time_hour + time_minute +  time_second;
         return  new_time;
    }

     function initDatePicker() {
        win.ZM.loadCss('build/vender/Calendar/calendar.css');
        win.ZM.loadCss('build/vender/simplePagination/simplePagination.css');
        requirejs(["Calendar/calendar.min"], function () {
            var Calendar:any = require('/calendar.js');
            var startTimeCalendar = new Calendar({
                trigger: '#J-date-start',
                range: [null, moment()]
               //focus:moment().format('YYYY-MM-DD')
            });
            var endTimeCalendar = new Calendar({
                trigger: '#J-date-end',
                range: [null, moment()]
               // focus:moment().format('YYYY-MM-DD')

            });
            startTimeCalendar.on('selectDate',function(date:any){
                var startDate = $('#J-date-start').val();
                var endDate = $('#J-date-end').val();
                if(moment(startDate).valueOf()<= date.valueOf() && date.valueOf()<= moment(endDate).valueOf() || moment(date.valueOf()).add(1,'month').valueOf() >= moment(endDate).valueOf() && date.valueOf()<=moment(endDate).valueOf() )return;
                $('#J-date-end').val(moment(date.valueOf()).add(1,'month').valueOf() - moment().valueOf()>0 ?moment().format('YYYY-MM-DD'):moment(date.valueOf()).add(1,'month').format('YYYY-MM-DD'));
            })

            endTimeCalendar.on('selectDate',function(date:any){
                var startDate = $('#J-date-start').val();
                var endDate =  $('#J-date-end').val();
                if(moment(startDate).valueOf()<= date.valueOf() && date.valueOf()<= moment(endDate).valueOf() || moment(date.valueOf()).add(-1,'month').valueOf() <= moment(startDate).valueOf() && date.valueOf()>=moment(startDate).valueOf())return;
                $('#J-date-start').val(moment(date.valueOf()).add(-1,'month').format('YYYY-MM-DD'));
            })


        })
    }

    //1对1列表
    function fetch_oneToOne_error_list_data() {
        if(!isErrorList){
            return
        }else{
            zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/listAllAbnormalGroupsByTicketBu'), {ticketBu:1}).then(function (msg:any) {
                //zm.API.onelogin('http://192.168.8.213:8080/api/feedback/listAllAbnormalGroups', {lessonType:0}).then(function(msg:any){

                if (msg.code == 1) {
                    list_data = msg.data.userGroups;
                    //list_data_save = list_data_save.concat(msg.data);
                    error_timer = setTimeout(function(){fetch_oneToOne_error_list_data()},retryTimer);
                    draw_watch_list_html();
                    lesson_list.find('#oneToMoreCounts').html(msg.data.oneToManyCounts);
                    lesson_list.find('#oneToOneCounts').html(msg.data.oneToOneCounts);
                    lesson_list.find('#pianotrainCounts').html(msg.data.zmTrainCounts);
                    

                } else {
                    swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
                }
            })
        }


    }

    //小班课列表
    function fetch_oneToMore_error_list_data() {
        if(!isOneToMore){
            return
        }else{
           // zm.API.onelogin('http://192.168.8.213:8080/api/feedback/listAllAbnormalGroups', {lessonType:1}).then(function(msg:any){
            zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/listAllAbnormalGroupsByTicketBu'), {
                ticketBu:2
            }).then(function (msg:any) {
                if (msg.code == 1) {
                    // list_data = msg.data;
                    // list_data_save = list_data_save.concat(msg.data);
                    list_data_oneToMore = msg.data.userGroups;
                    oneToMore_timer = setTimeout(function(){fetch_oneToMore_error_list_data()},retryTimer);
                    draw_watch_list_html();
                    //init_allList_page_event(startAll);
                    // totalAll = msg.data.totalCount || 0;
                    // lesson_list.find('.content_list').find('.page-box').find('.pageSize').html(limitAll);
                    // lesson_list.find('.content_list').find('.page-box').find('.totalCount').html(totalAll);
                } else {
                    swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
                }
            })



        }


    }

    //搜索列表
    function fetch_search_list_data(){
        //zm.API.onelogin('http://192.168.8.213:8080/api/feedback/searchGroupList', {
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/searchGroupList'),{
            lessonType:$('.device-tab.device-choose').data('type'),
            keyWord:$('.content_list').find('.search-input input').val().replace(/(^\s*)/g, "")
        }).then(function(msg:any){
            if(msg.code==1){
                // list_data=[];
                // list_data_search = msg.data;
                // list_data = msg.data;
                // list_data_search_save = list_data_search_save.concat(msg.data) ;
                list_data_search = msg.data;
                list_data_search_save = list_data_search_save.concat(msg.data) ;
                draw_watch_list_html();
            }else{
                swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
            }
        })
    }

    //钢琴陪练列表
    function fetch_pianoTrain_list_data(){
        if(!isPianoTrain){
            return
        }else{

            zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/listAllAbnormalGroupsByTicketBu'), {
                ticketBu:3
                }).then(function (msg:any) {
                    if (msg.code == 1) {
                        // list_data = msg.data;
                        // list_data_save = list_data_save.concat(msg.data);
                        list_data_pianoTrain = msg.data.userGroups;
                        pianoTrain_timer = setTimeout(function(){fetch_pianoTrain_list_data()},retryTimer);
                        draw_watch_list_html();
                        //init_allList_page_event(startAll);
                        // totalAll = msg.data.totalCount || 0;
                        // lesson_list.find('.content_list').find('.page-box').find('.pageSize').html(limitAll);
                        // lesson_list.find('.content_list').find('.page-box').find('.totalCount').html(totalAll);
                    } else {
                        swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
                    }
                })
        }
    }
    function data_process(result_data:any){
        var keyword = lesson_list.find('.content_list').find('input').val();
        for(var i=0;i<result_data.length;i++){
            if(result_data[i].deviceProfiles.length==0){
                result_data[i].deviceProfiles[0]={
                    name:'未上线',
                    role:"teacher",
                    offline: true
                }
                result_data[i].deviceProfiles[1]={
                    name:'未上线',
                    role:"student",
                    offline: true
                }
            }else if(result_data[i].deviceProfiles.length==1){
                result_data[i].deviceProfiles[1]={
                    name:'未上线',
                    mobile:'',
                    offline: true
                }
            }
        }
        var filter_data:any = [];
        filter_data =  result_data ;

        var list_dom = lesson_list.find('.content_list .list');
        var item_html='';

        for(var i=0;i<filter_data.length;i++){
            var state_deal = 'nothing';
            var state = '';
            var state_text = '';
            if(filter_data[i].state==1){
                state_text = get_format_time(Date.now() - filter_data[i].brokenTime);
                if(Date.now() - filter_data[i].brokenTime<300000){
                    state_deal = "notdealing";
                }else{
                    state_deal = "warningdealing";
                    state = "warning";
                }
            }else if(filter_data[i].state==2){
                state_deal="dealing";
                state_text = filter_data[i].workerName;
            }



            var state_text:string = filter_data[i].state== 2 ? filter_data[i].workerName: filter_data[i].state== 1?moment((Date.now() - filter_data[i].brokenTime)).format('mm:ss'):'';

            var lessonType = filter_data[i].lesType?filter_data[i].lesType:'未知';
            //var   = filter_data[i].lesType == 'test-lesson'?'testlesson':'regular-lesson'?'regularlesson':'debuglesson'

            var new_data:any = [] ;
            var teacher_data = result_data[i].deviceProfiles.filter((item:any)=> item.role =='teacher' );
            var student_data = result_data[i].deviceProfiles.filter((item:any)=> item.role =='student' );
            new_data = teacher_data.concat(student_data);

            if(new_data.length==0){
                new_data[0]={
                    name:'未上线',
                    role:"teacher",
                    offline: true
                }
                new_data[1]={
                    name:'未上线',
                    role:"student",
                    offline: true
                }
            }else if(new_data.length==1){
                if(new_data[0].role=='teacher'){
                    new_data[1]={
                        name:'未上线',
                        role:"student",
                        mobile:'',
                        offline: true
                    }
                }else{
                    new_data.unshift({name:'未上线',role:"teacher", mobile:'', offline: true})
                }
            }
            var span_html = '';
            new_data.map((item:any)=>{
                return span_html += '<span class="'+(item.offline?"offilen":item.state== '0'?"fine":"error")+'">'+item.name+'<i class="iconfont icon-ellipse-fill"></i>'+(item.state== '0' ? '' : make_time(item.updateTime))+'</span>'+
                        '<span style="'+(item.role=="teacher"?"":"display:none")+'">——</span>';
            });
            item_html +='<div style="'+(filter_data[i].groupType==1?"width:50%":"33.3%")+'" type="'+filter_data[i].groupType+'" class="oneitem '+state+'" uid="' + filter_data[i].lessonUid + '"  state="'+filter_data[i].state+'" watcher="'+(filter_data[i].workerName?filter_data[i].workerName:"")+'">' +
                    '<i class="'+lessonType+'">'+lessonTypeMap[lessonType]+'</i>'+
                span_html+
                '<i class="'+state_deal+'">'+state_text+'</i>' +
                '</div>';

        }
        list_dom.html(item_html);

        list_dom.find('.oneitem').unbind('click');
        list_dom.find('.oneitem').bind('click', function (e:any) {
            var uid = $(this).attr('uid');
            var state= $(this).attr('state');
            var watchername = $(this).attr('watcher');
            if (state == '2') {
                addSessionClick = true;
                lesson_list.find('.header-tap').find('div')[1].click();               
                init_new_session(uid);
            }else if(state =='0') {
                addSessionClick = true;
                lesson_list.find('.header-tap').find('div')[1].click();               
                init_new_session(uid);
            }else if(state =='1'){
                handle_question_list_by_uid(uid);

            }
            //lesson_list.find('.header-tap').find('div')[1].click();
            // init_new_session(uid)

        })
    }

    function draw_watch_list_html() {
        if(isErrorList){
            data_process(list_data);
            //超时提醒
            // isAlert = false;
            // list_data.map((item:any,index:any)=>{
            //     if(item.state==1 && Date.now() - item.brokenTime >300000)return isAlert = true;
            // });

            // if(isAlert){
            //     swal({
            //         title: "超时提醒",
            //         text: "当前有在线帮助超时未响应，请尽快处理！",
            //         timer: 29000,
            //         showConfirmButton:true,
            //         type: "warning"
            //     })
            // }
        }else if(isOneToMore){
            data_process(list_data_oneToMore);
            //超时提醒
            // oneToMoreAlert = false;
            // list_data.map((item:any,index:any)=>{
            //     if(item.state ==1 && Date.now() - item.brokenTime >300000)return oneToMoreAlert = true;
            // })
            // if(oneToMoreAlert){
            //     swal({
            //         title: "超时提醒",
            //         text: "当前有在线帮助超时未响应，请尽快处理！",
            //         timer: 29000,
            //         showConfirmButton:true,
            //         type: "warning"
            //     })
            // }
        }else if(isPianoTrain){
            data_process(list_data_pianoTrain);
        }else{
            data_process(list_data_search);
        }

    }

    function init_allList_page_event(page:any){
        var allListPaging:any = $('.content_list').find('#allListPaging');
        requirejs(["simplePagination/jquery.simplePagination"], function () {
           // console.log('allListPaging',allListPaging);
            (function (allListPaging:any) {
                allListPaging.pagination({
                    items: totalAll,
                    itemsOnPage: limitAll,
                    currentPage: page,
                    prevText: '上一页',
                    nextText: '下一页',
                    onPageClick: function (i:any, e:any) {
                        //console.log(i, e);
                        startAll = i;
                        fetch_oneToMore_error_list_data();
                    },
                    cssStyle: 'zm-theme'
                });
            })(allListPaging);

        })
    }

    //工单列表
    function watch_list_event(){

        lesson_list.find('.content_list').find('.oneToOne-device').unbind('click');
        lesson_list.find('.content_list').find('.oneToOne-device').bind('click', function (e:any) {
            lesson_list.find('.content_list').find('.device-tab').removeClass("device-choose");
            $(this).addClass("device-choose");
            isErrorList = true;
            isOneToMore = false;
            isPianoTrain = false;
            clearTimeout(error_timer);
            clearTimeout(pianoTrain_timer);
            fetch_oneToOne_error_list_data();
            lesson_list.find('.content_list').find('.page-box').hide();
        });

        lesson_list.find('.content_list').find('.oneToMore-device').unbind('click');
        lesson_list.find('.content_list').find('.oneToMore-device').bind('click', function (e:any) {
            lesson_list.find('.content_list').find('.device-tab').removeClass("device-choose");
            $(this).addClass("device-choose");
            isErrorList = false;
            isOneToMore = true;
            isPianoTrain = false;
            clearTimeout(oneToMore_timer);
            clearTimeout(pianoTrain_timer);
            fetch_oneToMore_error_list_data();
            lesson_list.find('.content_list').find('.page-box').show();
        })

        lesson_list.find('.content_list').find('.pianotrain-device').unbind('click');
        lesson_list.find('.content_list').find('.pianotrain-device').bind('click', function (e:any) {
            lesson_list.find('.content_list').find('.device-tab').removeClass("device-choose");
            $(this).addClass("device-choose");
            isErrorList = false;
            isOneToMore = false;
            isPianoTrain = true;
            clearTimeout(error_timer);
            clearTimeout(oneToMore_timer);
            fetch_pianoTrain_list_data();
            lesson_list.find('.content_list').find('.page-box').hide();
        });

        lesson_list.find('.content_list').find('input').unbind('keydown');
        lesson_list.find('.content_list').find('input').bind('keydown', function (event:any) {
            if (event.keyCode == 13) {
                if($('.content_list').find('.search-input input').val().replace(/(^\s*)/g, "")=='')return;
                isErrorList = false;
                isOneToMore = false;
                isPianoTrain = false;
                // lesson_list.find('.content_list').find('.error-device').removeClass("device-choose");
                // lesson_list.find('.content_list').find('.all-device').addClass("device-choose");
                // lesson_list.find('.content_list').find('.page-box').hide();
                fetch_search_list_data();
            }
        })

        lesson_list.find('.content_list').find('.oneToOne-device').click();


    }

    function handle_question_list_by_uid(uid:any) {
       zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/scrambleByLessonUid'), {
            //zm.API.onelogin('http://192.168.8.213:8080/api/feedback/scrambleByLessonUid', {
            lessonUid: uid,
                employeeId: zm.user.userId
        }).then(function (msg:any) {
            if (msg.code == 1) {
                swal({title: "", text: "接单成功", timer: 2000, showConfirmButton: false, type: "success"});
                addSessionClick = true;
                lesson_list.find('.header-tap').find('div')[1].click();                
                init_new_session(uid);

            } else {
                swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
            }
        })
    }


    function get_device_info_by_uid(uid:any) {
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/getGroupDetail'), {
        //zm.API.onelogin('http://192.168.8.213:8080/api/feedback/getGroupDetail', {
           // zm.API.onelogin('http://121.43.100.229:8080/api/feedback/getDeviceDetail', {
            lessonUid: uid
        }).then(function (msg:any) {
            if (msg.code == 1) {
                draw_device_info_list(msg.data);
            } else {
                swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
            }
        })
    }

    function make_tab_content_html(data:any,index:any,device_data:any){

        //var left = lesson_list.find('.session_list').find('.left');
        if((data[index].versionInfo && data[index].versionInfo.indexOf('pc')>-1 && data[index].versionInfo.slice(3)>='2.0.0') || (data[index].versionInfo && data[index].versionInfo.indexOf('node')>-1) ){
           
            $('.update-net-speed').removeAttr('disabled');
        }else{
        
            $('.update-net-speed').attr('disabled', 'disabled');
        }

        var right = lesson_list.find('.session_list').find('.right');
        var center = lesson_list.find('.session_list').find('.center');
        //center.find('.messages').html('');
        var tab = right.find('.tabWrapper');
        var teacher = right.find('.teacher');




        lesson_list.find('.devices').find('.value').nextAll().remove();
        lesson_list.find('.video').find('.value').nextAll().remove();
        lesson_list.find('.micphone').find('.value').nextAll().remove();
        lesson_list.find('.speaker').find('.value').nextAll().remove();

        var device_div= teacher.find('.devices');
        var video_div:any = teacher.find('.video');
        var micphone_div:any = teacher.find('.micphone');
        var speaker_div:any = teacher.find('.speaker');

        var deviceStateInfo = JSON.parse(data[index].deviceStateInfo);
        var voice = deviceStateInfo.voice;
        var video = deviceStateInfo.video;
        var speaker = deviceStateInfo.speaker;
        var speaker_show = deviceStateInfo.showSpeaker;

        device_div.append("<br><span>麦克风:</span>")


        for (var i = 0; i < voice.devices.length; i++) {
            var html_str:string = `<span class="mic" deviceid=${voice.devices[i].id}>${voice.devices[i].name}</span>`;
            if ((voice.devices.length - 1) != i)html_str += "<span>,</span>"
            device_div.append(html_str);
        }

        device_div.append("<br><span>摄像头:</span>")

        for (var i = 0; i <video.devices.length; i++) {
            var html_str:string = `<span class="vid" deviceid=${video.devices[i].id}>${video.devices[i].name}</span>`;
            if ((video.devices.length - 1) != i)html_str += "<span>,</span>"
            device_div.append(html_str);
        }
        if(speaker_show){
            device_div.append("<br><span>扬声器:</span>");
            var isSpeakerOkCss = speaker.devices && speaker.devices.length>0 ? "ok" : "error";
            var isSpeakerOkStr = speaker.devices && speaker.devices.length>0 ? ((speaker.volume != 0 && speaker.volume != 100) ? "正常" : "无音波"):"无设备";
            for (var i = 0; i <speaker.devices.length; i++) {
                var html_str:string = `<span class="spe" deviceid=${speaker.devices[i].id}>${speaker.devices[i].name}</span>`;
                if ((speaker.devices.length - 1) != i)html_str += "<span>,</span>"
                device_div.append(html_str);
            }
            speaker_div.find('.value').nextAll().remove();
            speaker_div.append('<span class="device ' + isSpeakerOkCss + '" deviceid="' + speaker.currentid + '">' + speaker.currentname + '</span> <span class="' + isSpeakerOkCss + '"> ' + isSpeakerOkStr + '</span>');
        }else{
            device_div.append("<br><span>扬声器:<span class='error' style='margin-left:6px'>该版本暂不提供</span></span>");
            speaker_div.append('<span></span>');
        }



        var isVideoOkCss = video.devices.length > 0 ? 'ok' : 'error';
        var isVoiceOkCss = voice.devices.length > 0 && voice.volume != 0 && voice.volume != 100 ? 'ok' : 'error';
        var isVideoOkStr = video.devices.length > 0 ? "正常" : "无设备";
        var isVoiceOkStr = voice.devices.length > 0 ? ((voice.volume != 0 && voice.volume != 100) ? "正常" : "无音波") : "无设备";

        video_div.find('.value').nextAll().remove();
        video_div.append('<span class="device ' + isVideoOkCss + '" deviceid="' + video.currentid + '">' + video.currentname + '</span> <span class="' + isVideoOkCss + '"> ' + isVideoOkStr + '</span>');
        micphone_div.find('.value').nextAll().remove();
        micphone_div.append('<span class="device ' + isVoiceOkCss + '" deviceid="' + voice.currentid + '">' + voice.currentname + '</span><span class="' + isVoiceOkCss + '">  ' + isVoiceOkStr + '</span>');



        teacher.find('value').text('');

        teacher.find('.name').find('.value').text(data[index].name);
        teacher.find('.mobile').find('.value').text(data[index].mobile);
        teacher.find('.qq').find('.value').text(JSON.parse(data[index].contact).qq);
        teacher.find('.weixin').find('.value').text(JSON.parse(data[index].contact).weixin);
        teacher.find('.lessonUid').find('.value').text(device_data.lessonUid);
        teacher.find('.channel').find('.value').text(device_data.channel);
        teacher.find('.platform').find('.value').text(data[index].platformInfo ?data[index].platformInfo.split(" ").slice(1, 7).join(" ") : "");
        teacher.find('.network').find('.value').text((data[index].netState ? data[index].netState : "未知") + " ");
        teacher.find('.question').find('.value').text(data[index].categoryName?data[index].categoryName: '');
        teacher.find('.questionDesc').find('.value').text(data[index].questionDesc ? data[index].questionDesc : '');
        teacher.find('.edition').find('.value').text(data[index].versionInfo ? data[index].versionInfo : '');

        var span_css = data[index].categoryName? "error" : "fine";
        teacher.find('.name').find('i').removeClass("fine error");
        teacher.find('.name').find('i').addClass(span_css);
        teacherImgUrl = data[index].imageUrls;

        if (teacherImgUrl && teacherImgUrl.length>0) {
            lesson_list.find('.session_list .teacher').find('.questionImg').find('button').removeAttr('disabled');
        } else {
            lesson_list.find('.session_list .teacher').find('.questionImg').find('button').attr('disabled', true);
        }
        if(data[index].role == 'teacher'|| isOneToMoreSession){
            teacher.find('.name').find('.unlock').hide()
        }else{
            teacher.find('.name').find('.unlock').show()
        }
        // if(isOneToMoreSession){
        //     lesson_list.find('.session_list .currentdevice').find('button').hide();
        // }else{
        //     lesson_list.find('.session_list .currentdevice').find('button').show();
        // }
       
       


    }

    function draw_device_info_list(device_data:any) {


        var right = lesson_list.find('.session_list').find('.right');
        var center = lesson_list.find('.session_list').find('.center');
        //center.find('.messages').html('');
        var tab = right.find('.tabWrapper');
        var teacher = right.find('.teacher');

        tab.find('.tabItem').remove();
        var studentTab = '';
        if(!device_data || !device_data.detailList || device_data.detailList.length==0)return;
        var list = device_data.detailList;
        list.map((item:any,index:any)=>{
            return studentTab += '<div class="tabItem" data-index="'+index+'">'+item.name+'<span>('+roleMap[item.role]+')</span><span class="'+(item.categoryName?"error":"fine")+'"><i class="iconfont icon-ellipse-fill"></i></span></div>'
        });
        var widthcss = 100/list.length+'%';
        tab.append(studentTab);
        lesson_list.find('.tabItem').css('width',widthcss);
        lesson_list.find('.tabItem').eq(0).addClass('selectItem');
        make_tab_content_html(list, selectedIndex, device_data);



        lesson_list.find('.tabItem').unbind('click');
        lesson_list.find('.tabItem').bind('click', function (e:any){

            $(this).siblings().removeClass('selectItem');
            $(this).addClass('selectItem');
            selectedIndex = $(this).data('index');
            make_tab_content_html(list, selectedIndex, device_data);
        });
    }

    //菜单初始化
    function show_repl_menu(){

         requirejs(["contextMenu/jquery.contextMenu.min"], function () {
            win.testobj=win.$.contextMenu({
                selector: ".sendarea",
                className: 'menu-title',
                items: win.$.contextMenu.fromMenu($('#menu_list')),
                events:{
                    show:function(options:any){
                    },
                    hide:function(options:any){
                         //alert('destroy');

                         //get_repl_list();


                    }
                }
            })

            init_right_event();

    })


    }
    //事件绑定

    function init_right_event(){
        $('.menu-title').find('.add').unbind('click');
            $('.menu-title').find('.add').click(function () {
                $('.menu-title').trigger('contextmenu:hide');
                swal({
                    title: "", type: '',
                    text: '<div class="swaltext addbox"><div>添加常用语</div>' +
                    '<div><textarea name="" maxlength="50" rows="5" id="addarea"></textarea></div>' +
                    //'<div class="tip">常用语不能为空哦！</div>' +
                    '</div>',
                    html: true,
                    showCancelButton: true,
                    closeOnConfirm: false,
                    confirmButtonColor: "#fe5b56",
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    animation: "slide-from-top"
                },
                    (isConfirm) => {
                    if (!isConfirm) {
                       return;
                    } else {
                        if ($('#addarea').val().length>0) {
                           // $('.addbox').find('.tip').hide();
                            var id = '';
                            edit_or_add_repl_list_data(id, $('#addarea').val());

                        }else{
                           // $('.addbox').find('.tip').show();
                            return false;
                        }

                    }
                }
                )
            })


            $('.menu-title').find('.menu-close').unbind('click');
            $('.menu-title').find('.menu-close').click(function () {
                $('.menu-title').trigger('contextmenu:hide');

            })

            $('.menu-title').find('.edit').unbind('.click');
            $('.menu-title').find('.edit').click(function () {
                //var content = $(this).parent().prev().text();
                var content = $(this).parent().parent().attr('text');
                var id = $(this).parent().parent().attr('id');
                $('.menu-title').trigger('contextmenu:hide');
                swal({
                    title: "", type: '',
                    text: '<div class="swaltext editbox"><div>编辑常用语</div>' +
                    '<div><textarea name="" maxlength="50" rows="5" id="editarea">'+(content?content:"")+'</textarea></div>' +
                        //'<div class="tip">常用语不能为空哦！</div>' +
                    '</div>',
                    html: true,
                    showCancelButton: true,
                    closeOnConfirm: false,
                    confirmButtonColor: "#fe5b56",
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    animation: "slide-from-top"
                }, (isConfirm) => {
                    if (!isConfirm) {
                        return;
                    } else {
                        if ($('#editarea').val().length>0) {
                            edit_or_add_repl_list_data(id, $('#editarea').val());
                        }else{
                            return false;
                        }
                    }
                })


            });

            $('.menu-title').find('.delete').unbind('.click');
            $('.menu-title').find('.delete').click(function () {
                var id = $(this).parent().parent().attr('id');
                $('.menu-title').trigger('contextmenu:hide');
                swal({
                    title: "提示", type: 'warning', text: "确定要删除该常用语吗?",
                    confirmButtonText: '确定', cancelButtonText: '取消', showCancelButton: true,
                    closeOnConfirm: true, confirmButtonColor: "#fe5b56", animation: "slide-from-top"
                }, (isConfirm) => {
                    if (!isConfirm) {
                        return;
                    } else {
                        delete_repl_list_data(id);
                    }
                })

            })

            $('.menu-title').find('.item_list_text').unbind('click');
            $('.menu-title').find('.item_list_text').click(function () {
                if (!lessonSocket) {
                    return
                }
                var text = (<string>$(this).parent().attr("text")).trim();
                if (!text) {
                    return;
                }

                $('.menu-title').trigger('contextmenu:hide');

                var message = {
                    nickname: zm.user.name,
                    mobile: zm.user.mobile,
                    roule: zm.user.role,
                    timestamp: Date.now(),
                    text: text
                };
                appendMessage(message, 'from-me');

                lessonSocket.emit('chat message', message, (timestamp:any) => {
                    console.log("chat message", timestamp)
                });
            })

    }

    //右键编辑事件
    function session_messages_event() {
        win.ZM.loadCss('build/vender/contextMenu/contextMenu.min.css');
        var $messages = lesson_list.find('.session_list .messages');
        var $contextMenu = lesson_list.find('.session_list .messages .context-menu');
        get_repl_list();
        //show_repl_menu();






    }

    //获取常用语
    function get_repl_list() {
        if(win.$.contextMenu)win.$.contextMenu('destroy'); //如果存在，注销之
        var menuList = lesson_list.find('#menu_list');
        menuList.html('');
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/getAllCommonWordsByUserId'), {userId:zm.user.userId}).then(function (msg:any) {
            //zm.API.onelogin('http://192.168.34.178:8080/api/feedback/getAllCommonWords', {}).then(function (msg:any) {
                //zm.API.onelogin('http://121.43.100.229:8080/api/feedback/getAllCommonWords', {}).then(function (msg:any) {
            if (msg.code == 1) {

                var repl_list = '<div class="title">常用语<div class="right"><span class="add">新增</span><span class="icon-close menu-close"></span></div></div>';
                for (var i = 0; i < msg.data.length; i++) {
                    repl_list += '<div class="item_list" id="' + msg.data[i].id + '" title="'+msg.data[i].content+'" text="'+msg.data[i].content+'"><div class="item_list_text">'+(msg.data[i].content.length>19?(msg.data[i].content.substring(0,19)+"..."):msg.data[i].content)+'</div>' +
                        '<div class="right"><span class="edit">编辑</span><span class="delete">删除</span></div></div>';
                }
                menuList.html(repl_list);
                show_repl_menu();
               // console.log('repl_list',repl_list );
            } else {
                swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
            }
        })

    }

    //编辑添加常用语
    function edit_or_add_repl_list_data(id:any, content:any) {
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/addOrEditCommonWord'), {
           // zm.API.onelogin('http://192.168.34.178:8080/api/feedback/addOrEditCommonWord', {
                //zm.API.onelogin('http://121.43.100.229:8080/api/feedback/addOrEditCommonWord', {
            id: id,
            content: content,
            userId:zm.user.userId
        }).then(function (msg:any) {
            if (msg.code == 1) {
                swal({title: "", text: "操作成功", timer: 2000, showConfirmButton: false, type: "success"});
                get_repl_list();

            } else {
                swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
            }
        })
    }

    //删除常用语
    function delete_repl_list_data(id:any) {
        //console.log(33,id,parseInt(id))
        //zm.API.onelogin('http://121.43.100.229:8080/api/feedback/deleteCommonWord ', {
        //zm.API.onelogin('http://192.168.34.178:8080/api/feedback/deleteCommonWord ', {
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/deleteCommonWord'), {
            id:parseInt(id)
        }).then(function (msg:any) {
            if(msg.code==1){
                 get_repl_list();

            }else{
                swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
            }

        })
    }

    function get_question_type (){
        //获取工单处理问题类型
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/getReasonCategory'), {}).then(function(msg:any){
            if(msg.code == 1){
                questionTypeData = msg.data;

            }
        })
    }
    //获取技术支持处理结果分类
    function get_watch_result_type(){
        var watchResultType = $('.question_list').find('#watchResultType');
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/getResultCategory'), {}).then(function(msg:any){
            if(msg.code == 1){
                resultTypeData = msg.data;
                watchResultType.empty();
                watchResultType.append('<option value="">技术支持处理结果</option>');
                for (var i = 0; i < msg.data.length; i++) {
                    watchResultType.append('<option value="'+msg.data[i].id+'">' + msg.data[i].name + '</option>');
                }

            }

        })

    }
    //获取用户确认结果
    function get_confirm_result_type(){
        var confirmResultType =  $('.question_list').find('#confirmResultType');
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/getConfirmCategory'), {}).then(function(msg:any){
            if(msg.code == 1){
                confirmTypeData = msg.data;
            //    confirmResultType.empty();
            //    confirmResultType.append('<option value="">用户处理结果</option>');
            //    for (var i = 0; i < msg.data.length; i++) {
            //        confirmResultType.append('<option value="'+msg.data[i].id+'">' + msg.data[i].name + '</option>');
            //    }
            //
            }
        })
    }
    //技术支持再次跟进分类
    function get_watch_reresult_type(){
        var watchReresultType = $('.question_list').find('#rewatchResultType');
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/getReprocessCategories'), {}).then(function(msg:any){
            if(msg.code == 1){
                reresultTypeData = msg.data;
                watchReresultType.empty();
                watchReresultType.append('<option value="">二次跟进状态</option>');
                for (var i = 0; i < msg.data.length; i++) {
                    watchReresultType.append('<option value="'+msg.data[i].id+'">' + msg.data[i].name + '</option>');
                }

            }

        })
    }
    //用户二次确认分类
    function get_reconfirm_result_type(){
        var reconfirmResultType =  $('.question_list').find('#reconfirmResultType');
        //zm.API.onelogin('https://workorder-dev.zmlearn.com/api/feedback/getReConfirmCategory', {}).then(function(msg:any){
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/getReConfirmCategory'), {}).then(function(msg:any){
            if(msg.code == 1){
                reconfirmResultType.empty();
                reconfirmResultType.append('<option value="">二次确认结果</option>');
                for (var i = 0; i < msg.data.length; i++) {
                    reconfirmResultType.append('<option value="'+msg.data[i].id+'">' + msg.data[i].name + '</option>');
                }

            }
        })
    }


    function init_question_category_list(){
        var questionTypeList = $('.question_list').find('#questionType');
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/getTicketCategory'), {}).then(function (msg:any) {
            if(msg.code==1){
                questionTypeList.empty();
                questionTypeList.append('<option value="">请选择问题类型</option>');
                for (var i = 0; i < msg.data.length; i++) {
                    questionTypeList.append('<option value="'+msg.data[i].id+'">' + msg.data[i].name + '</option>');
                }
            }
        })
    }

    function init_get_allWorker_list(){
        var watcher_select =  $('.question_list').find('#watcherList');
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/getNotifiedEmployees'), {}).then(function(msg:any){
            if(msg.code==1){
                watcher_select.empty();
                watcher_select.append('<option  value="">请选择技术支持</option>');
                for(var i=0;i<msg.data.length;i++){
                    watcher_select.append('<option value="'+msg.data[i].id+'"><span>'+msg.data[i].name+'</span>(' + msg.data[i].mobile + ')</option>')
                }
            }
        })
    }

    function init_get_channel_list(){
        var channel_select =  $('.question_list').find('#channelList');
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/getSessionChannels'), {}).then(function(msg:any){
            if(msg.code==1){
                channel_select.empty();
                channel_select.append('<option  value="">请选择通道</option>');
                for(var i=0;i<msg.data.length;i++){
                    channel_select.append('<option value="'+msg.data[i].id+'"><span>'+msg.data[i].name+'</span></option>')
                }
            }
        })
    }
    function init_rate_list(){
        var rate_select =  $('.question_list').find('#rateList');
        rateList.map((item:any,index:any)=>{
            rate_select.append('<option value="'+item.value+'"><span>'+item.name+'</span></option>')
        })
        
    }

    function init_LessonType_count(){
        //zm.API.onelogin('http://192.168.8.213:8080/api/feedback/listLessonStateCount', {}).then(function(msg:any){
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/listLessonStateCount'), {}).then(function(msg:any){
            if(msg.code ==1){
                for(var i=0;i<msg.data.length;i++){
                    if(msg.data[i].state == 0){
                        $('.question_list').find('.oneToOneCount').html(`(${msg.data[i].count})`);
                    }else if(msg.data[i].state == 1){
                        $('.question_list').find('.oneToMoreCount').html(`(${msg.data[i].count})`);
                    }
                }

            }
        })
    }
    //获取用户权限
    function init_get_permisson_list(){
        // zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/getPermissonsByMobile'), {mobile:zm.user.mobile}).then(function(msg:any){
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/employeeManage/getPermissonsById'), {employeeId: zm.user.userId}).then(function(msg:any){
            if(msg.code ==1){
                permissionList = msg.data;
                if(permissionList.indexOf('manageEmployee') + 1){
                    $('.member-list-tab').show();
                } else {
                    $('.member-list-tab').hide();
                }
            }
        })
    }


    function init_question_recourd_list() {
        var lessonType:any = $('.question_list .lesson-type.selected').data('lessontype');
        var question_tab_html:any= '';
        var oneTonOneStateMap:any = {
            0:'全部',1:'待处理',2:'转开发',3:'已处理待确认',4:'已解决已确认',5:'需跟进',6:'未接单'
        };
        var oneToMoreStateMap:any={
            0:'全部',
            1:'待处理',
            2:'转开发',
            3:'已处理',
            6:'未接单'
        };
        var oneToMoreHandledStateMap:any={
            1:'已解决',
            2:'已改为其他方式上课',
            3:'外部原因',
            4:'转开发'
        }

        //各状态工单数不再显示
        // zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/listTicketStateCount'), {lessonType:lessonType}).then(function (msg:any) {
        // //zm.API.onelogin('http://192.168.8.213:8080/api/feedback/listTicketStateCount', {lessonType:lessonType}).then(function(msg:any){
        //     if (msg.code == 1) {
            
        //         if(lessonType == 0 ){
        //             msg.data.map((item:any,index:any)=>{
        //                 return question_tab_html +='<span class="spanline" style="'+(index==0 ||item.state==2?"display:none":"")+'">|</span>' +
        //                     '<span class="question-state '+(index==0?"selected":"")+'" state="'+item.state+'" style="'+(item.state==2?"display:none":"")+'">' + oneTonOneStateMap[item.state]+
        //                     '<span>('+item.count+')</span></span>'
        //             });
        //         }else{
        //             msg.data.map((item:any,index:any)=>{
        //                 if(item.state == 6 ){
        //                     question_tab_html = '<span class="question-state '+(index==0?"selected":"")+'" state="'+item.state+'" >' +oneToMoreStateMap[item.state]+'<span>('+item.count+')</span></span>'
        //                 }else{
        //                     question_tab_html += '<span class="spanline">|</span><span class="question-state" state="'+item.state+'" >' +oneToMoreStateMap[item.state]+'<span>('+item.count+')</span></span>'
        //                 }
        //                 // if(item.state == 3){
        //                 //     question_tab_html += '<span class="spanline">|</span><span class="question-state" state="'+item.state+'" >' +oneToMoreStateMap[item.state]+'<span>('+item.count+')</span></span>'
        //                 //     // item.children.map((value:any,idx:any)=>{
        //                 //     //     return question_tab_html += '<span class="spanline">|</span><span class="question-state" state="3">'+oneToMoreHandledStateMap[value.state]+'<span>('+value.count+')</span></span>'
        //                 //     // })
        //                 // }
        //             })

        //         }

        //         $('.question_list').find('.question-tab').html(question_tab_html);


        //         lesson_list.find('.question_list').find('.question-tab .question-state').unbind('click');
        //         lesson_list.find('.question_list').find('.question-tab .question-state').bind("click", function () {
        //             if($(this).hasClass('selected')) return;
        //             $(this).addClass('selected');
        //             $(this).siblings().removeClass('selected');
        //             clear_question_list();
        //             init_search_params_list($(this).attr('state'));
        //         })

        //     } else {
        //         swal({title: "", text:msg.message, timer: 2000, showConfirmButton: false, type: "error"});
        //     }
        // });
        // var oneToOneSateList:any = [
        //     {state:0,}
        // ]
       var oneToOneStateList = [
           {state:6,name:'未接单'},
           {state:1,name:'待处理'},
           {state:3,name:'已处理待确认'},
           {state:4,name:'已解决已确认'},
           {state:5,name:'需跟进'},
           {state:0,name:'全部'},
       ];
       var oneToMoreStateList = [
        {state:6,name:'未接单'},
        {state:1,name:'待处理'},
        {state:3,name:'已处理待确认'},
        {state:0,name:'全部'},
       ];
     
      
       if(lessonType == 0 ){
            oneToOneStateList.map((item:any,index:any)=>{
                return question_tab_html +='<span class="spanline" style="'+(index==0 ?"display:none":"")+'">|</span>' +
                    '<span class="question-state '+(index==0?"selected":"")+'" state="'+item.state+'">' + item.name+
                    '</span>'
            });
       }else{
            oneToMoreStateList.map((item:any,index:any)=>{
                return question_tab_html +='<span class="spanline" style="'+(index==0 ?"display:none":"")+'">|</span>' +
                    '<span class="question-state '+(index==0?"selected":"")+'" state="'+item.state+'"  >' + item.name+
                    '</span>'
            });
       }
       $('.question_list').find('.question-tab').html(question_tab_html);
       lesson_list.find('.question_list').find('.question-tab .question-state').unbind('click');
                lesson_list.find('.question_list').find('.question-tab .question-state').bind("click", function () {
                    if($(this).hasClass('selected')) return;
                    $(this).addClass('selected');
                    $(this).siblings().removeClass('selected');
                    clear_question_list();
                    init_search_params_list($(this).attr('state'));
                })
    }


    //搜索列表
    function init_search_params_list(state:any){

        if(state == 1 ||state == 6){
            $('.question_list').find('.big-select').hide();
        }else if(state ==3){
            $('.question_list').find('.big-select').hide();
            $('.question_list').find('#watcherList').show();
            $('.question_list').find('#watchResultType').show();
        }else if(state == 4){
            $('.question_list').find('.big-select').hide();
            $('.question_list').find('#watcherList').show();
            $('.question_list').find('#watchResultType').show();
            $('.question_list').find('#confirmResultType').show();
            $('.question_list').find('#confirmResultType').empty();
            var confrimType_html ='<option value="">请选择用户确认结果</option>';
            $.each(confirmTypeData,function(index:any,item:any){
                if(item.id==3) return;
                confrimType_html+='<option value="'+item.id+'">'+item.name+'</option>'
            })
            $('.question_list').find('#confirmResultType').append(confrimType_html);
        }else if(state == 5){
            $('.question_list').find('#watcherList').show();
            $('.question_list').find('#watchResultType').show();
            $('.question_list').find('#confirmResultType').show();
            $('.question_list').find('#rewatchResultType').show();
            $('.question_list').find('#reconfirmResultType').show();
            $('.question_list').find('#confirmResultType').empty();
            var confrimType_html ='';
            $.each(confirmTypeData,function(index:any,item:any){
                if(item.id==1 || item.id == 2 || item.id==5) return;
                confrimType_html+='<option value="'+item.id+'">'+item.name+'</option>'
            })
            $('.question_list').find('#confirmResultType').append(confrimType_html);
        }else if(state == 0){
            $('.question_list').find('.big-select').hide();
            $('.question_list').find('#watcherList').show();
            $('.question_list').find('#watchResultType').show();
            $('.question_list').find('#confirmResultType').show();
            $('.question_list').find('#confirmResultType').empty();
            var confrimType_html ='<option value="">请选择用户确认结果</option>';
            $.each(confirmTypeData,function(index:any,item:any){
                confrimType_html+='<option value="'+item.id+'">'+item.name+'</option>'
            })
            $('.question_list').find('#confirmResultType').append(confrimType_html);

            $('.question_list').find('#confirmResultType').change(function(){
                if($(this).val() == 3){
                    $('.question_list').find('#rewatchResultType').show();
                    $('.question_list').find('#reconfirmResultType').show();
                }else{
                    $('.question_list').find('#rewatchResultType').hide();
                    $('.question_list').find('#reconfirmResultType').hide();
                }
            })



        }

    }

    function init_search_question_list() {
        var $question_list:any = $('.lesson-list');
        var questionlist:any = $('.question_list');
        questionlist.scrollTo('-1000px');
        $question_list.waitMe({ effect : 'bounce',text : '加载中,请稍后...'});
        //zm.API.onelogin('http://192.168.24.233:8080/api/feedback/findTicketPageByQuery', {
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/findTicketPageByQuery'), {
            username:$('#userName').val(),
            categoryId:$('#questionType').val(),
            platformInfo:$('#platform').val(),
            versionInfo:$('#version').val(),
            employeeId:$('#watcherList').is(":visible")?$('#watcherList').val():'',
            lessonStart:moment($('#J-date-start').val()).toDate().getTime(),
            lessonEnd:moment($('#J-date-end').val()).add(1,'days').toDate().getTime(),
            resultId: $('.question_list').find('#watchResultType').is(":visible")?$('.question_list').find('#watchResultType').val():'',
            answerId:$('#confirmResultType').is(":visible")?$('.question_list').find('#confirmResultType').val():'',
            reResultId:$('#rewatchResultType').is(":visible")?$('#rewatchResultType').val():'',
            reAnswerId:$('#reconfirmResultType').is(":visible")?$('#reconfirmResultType').val():'',
            pageNo:startPage,
            pageSize:pageSize,
            state:$('.question-state.selected').attr('state'),
            lessonType:$('.lesson-type.selected').data('lessontype'),
            channel:$('#channelList').val(),
            score:$('#rateList').val(),
        }).then(function (msg:any) {

            if (msg.code == 1) {
                $question_list.waitMe('hide');
                var question_data = msg.data;
                clear_question_list();
                draw_question_list(question_data);
                init_page_event(startPage);

               // question_list.waitMe('hide');
            } else {
                swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
            }
        })
    }

    function clear_question_list(){
        $('.question_list').find('.table-box').html('');
    }

    function draw_question_list(question_data:any){
        totalPage = question_data.totalCount||0;

        if(!question_data||!question_data.data||question_data.data.length==0){
            $('.question_list').find('.table-box').html('暂无信息');
        }
        var html = '' ;
        var user_html = '';
        question_data.data.map((value:any,index:any)=>{
            var reconfirmResultValue:any = $('#reconfirmResultType').is(":visible")?$('#reconfirmResultType').val():'';
            var closed:any = reconfirmResultValue === '-2' && permissionList.indexOf('closeTicket')!==-1;
            
            var state:any = !value.isOnline && (value.lessonType==0 && value.state==5 || value.state == 1) && !value.isReprocessed;
            var workName:string = value.employeeName ||'';
            var processResult:string = value.processResult ||'';
            var confirmResult:string = value.confirmResult ||'';
            var reconfirmResult:string = value.reconfirmResult || '';
            var reprocessResult:string = value.reprocessResult || '';
            var channel:string = value.channel || '';
            var lessonUid:string = value.lessonUid || '';
            var rate = value.score || 0;
            var ratehtml = '<div class="star-rating">'+
            '<div class="star-rating-top" style="width:'+rate/5*100+'%">'+
                '<span></span><span></span><span></span><span></span><span></span></div>'+
            '<div class="star-rating-bottom"><span></span><span></span><span></span><span></span><span></span></div></div>'


            value.userList.map((item:any,index:any)=>{
                var categoryName = item.categoryName ||'';
                var questionDesc = item.questionDesc || '';
                var imageUrls = item.imageUrls ||'';
                var versionInfo = item.versionInfo ||'';
                var platformInfo = item.platformInfo || '';
                var netState = item.netState || '';

                if(index == 0){
                    return user_html = '<tr data-orderid="'+value.tickedId+'" data-uid="'+value.lessonUid+'"><td>'+item.name+'<span>('+roleMap[item.role]+')</span></td><td>'+categoryName+'</td><td>'+questionDesc+'</td>' +
                        '<td class="J-img-show" data-imgurl="'+imageUrls+'">'+(imageUrls.length>0?"查看图片":"")+'</td>' +
                    '<td>'+versionInfo+'</td><td>'+netState+'</td><td rowspan="'+value.userList.length+'" >'+stateList[value.state]+'</td>' +
                        '<td class="J_dealing" rowspan="'+value.userList.length+'" data-deal="'+state+'" data-lessonuid="'+value.lessonUid+'" data-state="'+value.state+'" data-lessontype="'+value.lessonType+'" data-closed="'+closed+'">'+(closed?"关闭工单":state?"处理工单":"")+'</td>' +
                        '<td class="J-click-info" rowspan="'+value.userList.length+'" >查看信息</td><td class="J-click-session" rowspan="'+value.userList.length+'" data-state="'+value.state+'">'+(value.state===6?"":"查看会话")+'</td>' +
                        '<td rowspan="'+value.userList.length+'"><span>通道：'+channel+'</span><br/><span>lessonUid:'+lessonUid+'</span></td></tr>';
                }else{
                    return user_html += '<tr data-orderid="'+value.tickedId+'" data-uid="'+value.lessonUid+'"><td>'+item.name+'<span>('+roleMap[item.role]+')</span></td><td>'+categoryName+'</td><td>'+questionDesc+'</td>' +
                        '<td class="J-img-show" data-imgurl="'+imageUrls+'">'+(imageUrls.length>0?"查看图片":"")+'</td>' +
                    '<td>'+versionInfo+'</td><td>'+netState+'</td></tr>';
                }


            })
            html += '<table class="table table-striped table-bordered J-question-table">' +
            '<thead><tr>' +
            '<th colspan="2">上课时间：<span>'+moment(value.startTime).format('YYYY-MM-DD')+'</span></th>' +
            '<th colspan="2">技术支持：<span>'+workName+'</span></th>' +
            '<th colspan="3" >处理结果：<span>'+processResult+'</span></th>' +
            '<th colspan="3">确认结果：<span>'+confirmResult+'</span></th>' +
            '<th></th></tr></thead>' +
            '<tbody>' +
            '<tr class="second-result" style="'+(value.lessonType?"display:none":"")+'">' +
            '<th colspan="4">跟进状态：<span>'+reprocessResult+'</span></th>' +
            '<th colspan="3">跟进结果：<span>'+reconfirmResult+'</span></th>'+
            '<th colspan="4">技术支持评价：<span>'+(rate?ratehtml:"未评分")+'</span></th></tr>'+
            user_html+
            '</tbody>' +
            '</table>' ;

        })

      
        html += '<div class="page-box">' +
            '<span>每页显示&nbsp;<i class="pageSize">'+pageSize+'</i>&nbsp;行,共&nbsp;<i class="totalCount">'+ totalPage+'</i>&nbsp;条记录</span>'+
            '<div id="questionListPaging" class="zm-theme simple-pagination pagenav"></div>' +
            '</div>';
        $('.question_list').find('.table-box').append(html);
        init_search_question_list_event();



    }

    function init_page_event(page:any){
        requirejs(["simplePagination/jquery.simplePagination"], function () {
            var questionListPaging:any = $('.question_list').find('#questionListPaging');
            (function (questionListPaging:any) {
                questionListPaging.pagination({
                    items: totalPage,
                    itemsOnPage: pageSize,
                    currentPage: page,
                    prevText: '上一页',
                    nextText: '下一页',
                    onPageClick: function (i:any, e:any) {
                        startPage = i;
                        init_search_question_list();
                    },
                    cssStyle: 'zm-theme'
                });
            })(questionListPaging);

        })
    }

    function init_question_event() {
        lesson_list.find('.question_list').find('.lesson-type-wrapper .lesson-type').unbind('click');
        lesson_list.find('.question_list').find('.lesson-type-wrapper .lesson-type').bind("click", function () {
            if($(this).hasClass('selected')) return;
            $(this).addClass('selected');
            $(this).siblings().removeClass('selected');
            init_question_recourd_list();

            clear_question_list();
            init_search_params_list(1);
    
        })

        lesson_list.find('.question_list').find('#searchBtn').unbind('click');
        lesson_list.find('.question_list').find('#searchBtn').bind("click", function(){
            startPage = 1;
            init_search_question_list();

        })

        //导出Excel
        lesson_list.find('.question_list').find('#downloadExcel').unbind('click');
        lesson_list.find('.question_list').find('#downloadExcel').click(function(){
            $(this).attr('disabled','true');
            $(this).text('导出中...');
            download_search_data_excel();

        })

    }

    function init_search_question_list_event(){

        $('.question_list').find('.J-click-info').unbind('click');
        $('.question_list').find('.J-click-info').click(function () {
            lesson_list.find('.question_list').hide();
            var orderid =  $(this).parent().data('orderid');
            init_user_info(orderid);
            if($('.info_list').length>0){
                $('.info_list').show();
            }else{
                var info_html = '<div class="info_list">' +
                    '<div class="info_header">' +
                    '<div class="return left"><i class="iconfont icon-arrow-left">返回</i></div>用户信息' +
                    '</div>' +
                    '<div class="info_table">' +
                    '<table class="table table-striped table-bordered J-userInfo-table">' +
                    '<thead ><tr><th style="width:5%">姓名</th><th style="width:5%">联系电话</th><th style="width:5%">QQ</th><th style="width:5%">微信号</th>' +
                    '<th style="width:5%">网络状态</th><th style="width:15%">信息平台</th><th style="width:5%">版本</th><th style="width:20%">设备状态</th>' +
                    '<th style="width:5%">问题</th><th style="width:10%">问题描述</th><th style="width:5%">问题图片</th><th style="width:15%">其他信息</th></tr></thead>' +
                    '<tbody>' +
                    '</tbody>' +
                    '</table>' +
                    '</div>' +
                    '</div>';
                lesson_list.append(info_html);
            }



            return_question_event();



        });
        //进入处理工单
        $('.question_list').find('.J_dealing').unbind('click');
        $('.question_list').find('.J_dealing').click(function(){
           
            var orderid = $(this).parent().data('orderid');
            var lessonType:any = $(this).data('lessontype');
            startNo = 1;
            var state:any = $(this).data('state');
            var lessonUid:any = $(this).data('lessonuid');
            var deal = $(this).data('deal');
            var closed = $(this).data('closed');
            if(closed) close_order_event(orderid);
            if(!deal)return;
            var secondResultType_html:any = '';
            var questionType_html:any = '';
            var resultType_html:any = '';
            $.each(reresultTypeData,function(index:any,item:any){
                if(item.id==-1)return;
                secondResultType_html += '<div class="radioBox" ><input value="'+item.id+'" type="radio" name="reresultType"><label>'+item.name+'</label></div>';
            });

            $.each(questionTypeData,function(index:any,item:any){
                questionType_html += '<div class="radioDiv" style="'+(lessonType?"display:none":"")+'"><input value="'+item.id+'" type="radio" name="questionType"><label>'+item.name+'</label></div>';
            });
            $.each(resultTypeData,function(index:any,item:any){
                resultType_html += '<div class="inputDiv" ><input value="'+item.id+'" type="radio" name="resultType"><label>'+item.name+'</label></div><br/>';

            })
            if(state == 1){
                $('input[name="questionType"]').val('');

                swal({
                    title: "",
                    showCancelButton: true,
                    closeOnConfirm: false,
                    confirmButtonColor: "#fe5b56",
                    animation: "slide-from-top",
                    text:'<div class="sweetalert-choose-qustiontype">' +
                    '<div style= "text-align: left;">' +
                    '<div class="title" style="'+(lessonType?"display:none":"")+'"><span class="ui-form-required">*</span>请选择问题类型：</div>' +
                    questionType_html +
                    '</div>' +
                    '<div>' +
                    '<div class="title"><span class="ui-form-required">*</span>请选择处理结果：</div>' +
                    resultType_html+
                    '</div>'+
                    '</div>',
                    html: true
                },(isConfirm) => {
                    if(isConfirm){
                        if(lessonType == 1){
                            if(!$('input[name="resultType"]:checked').val())return;
                        }else{
                            if(!$('input[name="resultType"]:checked').val()||!$('input[name="questionType"]:checked').val()) return;
                        }

                        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/solveByTicketId'), {
                            //zm.API.onelogin('http://192.168.8.213:8080/api/feedback/solveByTicketId ', {
                            ticketId:orderid,
                            employeeId:zm.user.userId,
                            resultId:$('input[name="resultType"]:checked').val(),
                            categoryId:$('input[name="questionType"]:checked').val()
                        }).then(function(msg:any){
                            if(msg.code==1){
                                swal({title: "提示", text: "问题提交成功", timer: 2000, showConfirmButton: false, type: "success"});
                                //init_LessonType_count();
                                //init_question_recourd_list();
                                init_search_question_list();
                            }else{
                                swal({title: "提示", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
                            }
                        })
                    }
                })
            } else if(state == 5){
                swal({
                    title: "",
                    showCancelButton: true,
                    closeOnConfirm: false,
                    confirmButtonColor: "#fe5b56",
                    animation: "slide-from-top",
                    text:'<div class="sweetalert-choose-watchReconfrim">' +
                    '<div>' +
                    '<div class="title"><span class="ui-form-required">*</span>请选择处理结果：</div>' +
                    secondResultType_html +
                    '</div>' +
                    '<div>' +
                    '<div class="title">问题及跟进情况说明：</div>' +
                    '<textarea rows="5" id="remark" ></textarea>'+
                    '</div>'+
                    '</div>',
                    html: true
                },(isConfirm)=>{
                    if(isConfirm){
                        if(!$('input[name="reresultType"]:checked').val()) return;

                        //zm.API.onelogin('http://192.168.8.213:8080/api/feedback/resolveByTicketId', {
                        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/resolveByTicketId'), {
                            ticketId:orderid,
                            employeeId:zm.user.userId,
                            answer:$('#remark').val(),
                            resultId:$('input[name="reresultType"]:checked').val(),
                        }).then(function(msg:any){
                            if(msg.code==1){
                                swal({title: "提示", text: "提交成功", timer: 2000, showConfirmButton: false, type: "success"});
                                init_search_question_list();
                            }else{
                                swal({title: "提示", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
                            }
                        })
                    }
                })

            }else{
                get_session_record_by_orderid(orderid);
                lesson_list.find('.question_list').hide();
                if($('.session_record').length>0){
                    $('.session_record').show();
                }else{
                    var session_record = '<div class="session_record">' +
                        '<div class="session_record_header">' +
                        '<div class="return left"><i class="iconfont icon-arrow-left">返回</i></div>处理工单' +
                        '</div>' +
                        '<div class="session_record_list">' +
                        '</div>' +
                        '<div class="page-box">' +
                        '<span>每页显示&nbsp;<i class="pageSize"></i>&nbsp;行,共&nbsp;<i class="totalCount"></i>&nbsp;条记录</span>'+
                        '<div id="sessionListPaging" class="zm-theme simple-pagination pagenav"></div>' +
                        '</div>' +
                        '<div class="question_reply">' +
                        '<div>回复问题</div>' +
                        '<input type="text" class="input-question-reply">' +
                        '<button class="button" id="solve-question">提交</button>' +
                        '</div>' +
                        '</div>';
                    lesson_list.append(session_record);

                    return_question_event();

                    $('.session_record').find('#solve-question').unbind('click');
                    $('.session_record').find('#solve-question').click(function(){
                        solve_question_by_orderid();
                    })
                }
            }

        });
        //查看会话
        $('.question_list').find('.J-click-session').unbind('click');
        $('.question_list').find('.J-click-session').click(function(){
            var state:any = $(this).data('state');
            if(state == 6)return;
            var orderid = $(this).parent().data('orderid');
            startNo = 1;
            get_session_record_by_orderid(orderid);
            lesson_list.find('.question_list').hide();
            if($('.session_record').length>0){
                $('.session_record').show();
            }else{
                var session_record = '<div class="session_record">' +
                    '<div class="session_record_header">' +
                    '<div class="return left"><i class="iconfont icon-arrow-left">返回</i></div>处理工单' +
                    '</div>' +
                    '<div class="session_record_list">' +
                    '</div>' +
                    '<div class="page-box">' +
                    '<span>每页显示&nbsp;<i class="pageSize"></i>&nbsp;行,共&nbsp;<i class="totalCount"></i>&nbsp;条记录</span>'+
                    '<div id="sessionListPaging" class="zm-theme simple-pagination pagenav"></div>' +
                    '</div>' +
                    '</div>';
                lesson_list.append(session_record);

                return_question_event();

                $('.session_record').find('#solve-question').unbind('click');
                $('.session_record').find('#solve-question').click(function(){
                    solve_question_by_orderid();
                })
            }
        })
        //查看图片
        $('.question_list').find('.J-img-show').unbind('click');
        $('.question_list').find('.J-img-show').click(function(){
            var imgurl = $(this).data('imgurl');
            question_img_show(imgurl);
        })
    }


    function get_session_record_by_orderid(orderid:any){

        //zm.API.onelogin('http://192.168.8.213:8080/api/feedback/getSessionPage', {
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/getSessionPage'), {
            ticketId:orderid,
            pageNo:startNo,
            pageSize:pagelimit
        }).then(function(msg:any){
            if(msg.code == 1){
                //$('.session_record').find('.session_record_header').attr('orderid',orderid) ;
                $('.session_record').find('.session_record_list').html('');
                $('.session_record').find('.input-question-reply').val('');
                draw_session_recored_list(msg.data);
                init_session_page_event(startNo,orderid);

            }else{
                swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
            }

        })
    }

    function draw_session_recored_list(data:any){
        totalNo = data.messagePage.totalCount||0;
        var page_box:any = $('.session_record').find('.page-box');
        page_box.find('.totalCount').html(totalNo);
        page_box.find('.pageSize').html(pagelimit);
        if(!data || !data.messagePage || !data.messagePage.data || data.messagePage.data.length == 0 ){
            $('.session_record').find('.session_record_list').append('<div class="no-content">暂无信息</div>');return;
        }
            var session_record_data = data.messagePage.data;
        $('.session_record').find('.session_record_header').attr('orderid',data.ticketId) ;
        var html = '<div class="order-header">工单当前状态：<span class="zm-red">'+stateList[data.state]+'</span></div>';

        for(var i=0;i<session_record_data.length;i++){

            html +='<div class="session_item" data-orderid="'+data.ticketId+'">' +
                '<div class="role left">'+roleMap[session_record_data[i].roule]+'</div>' +
                '<ul class="left session-content"><li class="username">'+session_record_data[i].nickname+'</li><li class="session-record-content">'+session_record_data[i].text+'</li></ul>' +
                '<div class="right">'+moment(session_record_data[i].timestamp).format("YYYY-MM-DD HH:mm")+'</div>' +
                '</div>' ;
        }


        $('.session_record').find('.session_record_list').append(html);

        
        

       
    }

    function init_session_page_event(page:any,orderid:any){
        requirejs(["simplePagination/jquery.simplePagination"], function () {
            $(function () {
                lesson_list.find('.session_record').find('#sessionListPaging').pagination({
                    items: totalNo,
                    itemsOnPage: pagelimit,
                    currentPage: page,
                    prevText: '上一页',
                    nextText: '下一页',
                    onPageClick: function (i:any, e:any) {
                        startNo = i;
                        get_session_record_by_orderid(orderid);
                    },
                    cssStyle: 'zm-theme'
                });
            });

        })
    }

    function init_user_info(orderid:any){
        //zm.API.onelogin('http://192.168.8.213:8080/api/feedback/getUserGroupDetail', {
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/getUserGroupDetail'), {
            ticketId:orderid
        }).then(function(msg:any){
            if(msg.code == 1){

                var list = msg.data.detailList;
                var html_str = '';
                list.map((item:any,index:any)=>{
                    var qq = JSON.parse(item.contact).qq||'';
                    var weixin = JSON.parse(item.contact).weixin ||'';
                    var mobile = item.mobile ||'';
                    var netState = item.netState||'';
                    var platformInfo = item.platformInfo?item.platformInfo.split(" ").slice(1, 7).join(" "):'';
                    var versionInfo = item.versionInfo ||'';
                    var voice = JSON.parse(item.deviceStateInfo).voice.currentname ||'';
                    var video = JSON.parse(item.deviceStateInfo).video.currentname||'';
                    var speaker = JSON.parse(item.deviceStateInfo).speaker&&JSON.parse(item.deviceStateInfo).speaker.currentname?JSON.parse(item.deviceStateInfo).speaker.currentname:'';
                    var categoryName = item.categoryName||'';
                    var questionDesc = item.questionDesc||'';
                    var imageUrls = item.imageUrls && item.imageUrls.length>0 ?"查看图片":"";
                    var channel = msg.data.channel?msg.data.channel:'';

                   return  html_str += '<tr><td>'+item.name+'<span>('+roleMap[item.role]+')</span></td><td>'+mobile+'</td>' +
                       '<td>'+qq+'</td><td>'+weixin+'</td>' +
                       '<td>'+netState+'</td><td>'+platformInfo+'</td><td>'+versionInfo+'</td>' +
                       '<td><span>麦克风：'+voice+'</span><br/>' +
                       '<span>摄像头：'+video+'</span><br/>' +
                       '<span>扬声器：'+speaker+'</span>' +
                       '</td>' +
                       '<td>'+categoryName+'</td><td>'+questionDesc+'</td>' +
                       '<td data-imgurl="'+item.imageUrls+'" class="J-img-show">'+imageUrls+'</td>' +
                       '<td rowspan="'+list.length+'" style="'+(index==0?"word-break:break-all;":"display:none;word-break:break-all;")+'"><span>lessonUid:'+msg.data.lessonUid+'</span><br/>' +
                       '<span>通道：'+channel+'</span></td>'+
                       '</tr>';

                })

                //var html_str = '<tr><td>姓名</td><td>'+teacherInfo.name+'</td><td>'+studentInfo.name+'</td></tr>'+
                //'<tr><td>联系电话</td><td>'+teacherInfo.mobile+'</td><td>'+studentInfo.mobile+'</td></tr>' +
                //'<tr><td>QQ</td><td>'+tea_qq+'</td><td>'+stu_qq+'</td></tr>' +
                //'<tr><td>微信</td><td>'+tea_weixin+'</td><td>'+stu_weixin+'</td></tr>' +
                //'<tr class="device-info"><td>设备信息</td><td colspan="2"></td></tr>' +
                //'<tr><td>网络状态</td><td>'+tea_netState+'</td><td>'+stu_netState+'</td></tr>' +
                //'<tr><td>信息平台</td><td>'+tea_platformInfo+'</td><td>'+stu_platformInfo+'</td></tr>' +
                //'<tr><td>版本</td><td>'+tea_versionInfo+'</td><td>'+stu_versionInfo+'</td></tr>' +
                //'<tr><td>设备状态</td><td><span>麦克风（'+tea_voice+'）</span></br><span>摄像头（'+tea_video+'）</span></span></br><span>扬声器（'+tea_speaker +'）</span></td>' +
                //    '<td><span>麦克风（'+stu_voice+'）</span></br><span>摄像头（'+stu_video+'）</span></br><span>扬声器（'+stu_speaker +'）</span></td></tr>' +
                //'<tr class="question-info"><td >问题信息</td><td colspan="2"></td></tr>' +
                //'<tr><td>问题</td><td>'+tea_category+'</td><td>'+stu_category+'</td></tr>' +
                //'<tr><td>问题描述</td><td>'+tea_questionDesc+'</td><td>'+stu_questionDesc+'</td></tr>' +
                //'<tr><td>问题图片</td><td data-imgurl="'+tea_imgurl+'" class="'+(tea_imgurl.length>0?"J-img-show":"")+'">'+(tea_imgurl.length>0?"查看图片":"")+'</td>' +
                //    '<td data-imgurl="'+stu_imgurl+'" class="'+(stu_imgurl.length>0?"J-img-show":"")+'">'+(stu_imgurl.length>0?"查看图片":"")+'</td></tr>';

                $('.info_list').find('.J-userInfo-table tbody').html(html_str);

                $('.info_list').find('.J-img-show').unbind('click');
                $('.info_list').find('.J-img-show').click(function(){
                    question_img_show($(this).data('imgurl'));
                })
            }

        })
    }


    function return_question_event() {
        $('.info_list').find('.return').unbind('click');
        $('.info_list').find('.return').click(function () {
            lesson_list.find('.info_list').hide();
            lesson_list.find('.question_list').show();
        })

        $('.session_record').find('.return').unbind('click');
        $('.session_record').find('.return').click(function(){
            // init_LessonType_count();
            // init_question_recourd_list();
            lesson_list.find('.session_record').hide();
            lesson_list.find('.question_list').show();
        })
    }

    function question_img_show(imgurl:any){

        let win:any = window;
        let i = 0;
        var imgUrl = imgurl.split(',');
        requirejs(["artDialog/dialog"], function (content:string) {
            
                var d = new win.dialog({
                    content: '<div style="width:900px;height:640px; background: #fff; border-radius: 6px; ">' +
                    '<div class="icon-close d-close" style=" width:18px;height:18px;top:18px;right:18px;z-index:1"></div>' +
                    '<div style="width:100%;height:100%;padding:30px;text-align: center;position: relative;">'+
                    '<img src="'+(imgUrl[i] + "?m=" + Date.now())+'" alt="" class="questionImg" style="width:100%;height:100%;" >' +
                    '<div class="prev" style="position: absolute;width: 40px;height: 60px;background:rgba(0,0,0,0.5);left: 30px;top: 50%;margin-top: -30px;border-radius: 0 4px 4px 0;line-height: 60px;cursor: pointer;color:#fff"><i class="iconfont icon-arrow-left"></i></div>'+
                    '<div class="next" style="position: absolute;width: 40px;height: 60px;background:rgba(0,0,0,0.5);right: 30px;top: 50%;margin-top: -30px;border-radius: 4px 0 0 4px;line-height: 60px;cursor: pointer;color:#fff"><i class="iconfont icon-arrow-right"></i></div>'+
                    '<div class="page"><span>'+(i+1)+'</span>/<span>'+imgUrl.length+'</span></div>'+
                    '</div></div>',
                        onclose: function () {
                        },
                        
                        onshow: function () {
                           // $('.questionImg').attr('src', teacherImgUrl[i] + "?m=" + Date.now());
                            $('.d-close').click(function () {
                                d.close();
                                //console.info('返回图片：',teacherImgUrl)
                            });
                        }
                    })
                    d.addEventListener('show',function(){
                        $('.next').click(function(){
                            if(i === imgUrl.length - 1)return;
                            i++;
                            console.log('chahhahahah',i);
                            $('.questionImg').attr('src', imgUrl[i] + "?m=" + Date.now());
                            $('.page').html('<span>'+(i+1)+'</span>/<span>'+imgUrl.length+'</span>')
                        })
                        $('.prev').click(function(){
                            if(i === 0)return;
                            i--;
                            $('.questionImg').attr('src', imgUrl[i] + "?m=" + Date.now());
                            $('.page').html('<span>'+(i+1)+'</span>/<span>'+imgUrl.length+'</span>')
                        })
                       
                    })
                d.showModal();
            })

           

    }

    function solve_question_by_orderid(){
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/solveAbnormalDeviceWithAnswer'), {
            qorderId:$('.session_record').find('.session_record_header').attr('orderid'),
            workerId:zm.user.userId,
            answer:$('.session_record').find('.input-question-reply').val()
        }).then(function(msg:any){
            if(msg.code==1){
                swal({title: "", text: '问题回复提交成功', timer: 2000, showConfirmButton: false, type: "success"});
                var orderid = $('.session_record').find('.session_record_header').attr('orderid');
                get_session_record_by_orderid(orderid);

            }else{
                swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
            }
        })
    }

    function download_search_data_excel(){
        var username = $('#userName').val();
        var categoryId = $('#questionType').val();
        var platformInfo = $('#platform').val();
        var versionInfo = $('#version').val();
        var employeeId = $('#watcherList').is(":visible")?$('#watcherList').val():'';
        var lessonStart = moment($('#J-date-start').val()).toDate().getTime();
        var lessonEnd = moment($('#J-date-end').val()).add(1,'days').toDate().getTime();
        var resultId = $('.question_list').find('#watchResultType').is(":visible")?$('.question_list').find('#watchResultType').val():'';
        var answerId = $('#confirmResultType').is(":visible")?$('.question_list').find('#confirmResultType').val():'';
        var reResultId = $('#rewatchResultType').is(":visible")?$('#rewatchResultType').val():'';
        var reAnswerId = $('#reconfirmResultType').is(":visible")?$('#reconfirmResultType').val():'';
        var pageNo = 1;
        var pageSize = 20;
        var state = $('.question-state.selected').attr('state');
        var lessonType = $('.lesson-type.selected').data('lessontype');
        var channel = $('#channelList').val();
        var score = $('#rateList').val();

        //导出数量
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/getTicketCount'), {
            username, categoryId, platformInfo, employeeId, lessonStart, lessonEnd, resultId, answerId, 
            reResultId, reAnswerId, pageNo, pageSize, state, lessonType, channel, score
        }).then(function(msg:any){
            if(msg.code==1){
                
                var url = zm.API.resolve('zm-watcher:/api/feedback/exportCSV?username='+username+'&categoryId='+categoryId+
                '&platformInfo='+platformInfo+'&versionInfo='+versionInfo+'&employeeId='+employeeId+'&lessonStart='+lessonStart+
                '&lessonEnd='+lessonEnd+'&resultId='+resultId+'&answerId='+answerId+'&reResultId='+reResultId+'&reAnswerId='+reAnswerId+
                '&pageNo=1&pageSize=20&state='+state+'&lessonType='+lessonType+'&channel='+channel+'&score='+score);
        
                var elemIF = document.createElement("iframe");   
                elemIF.src = url;
                elemIF.style.display = "none";
                document.body.appendChild(elemIF);
                setTimeout(()=>{
                    lesson_list.find('.question_list').find('#downloadExcel').removeAttr('disabled').text('导出Excel');
                },msg.data/2.5)

            }else{
                swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
                lesson_list.find('.question_list').find('#downloadExcel').removeAttr('disabled').text('导出Excel');
            }
        })


    }
    //关闭超时未确认工单
    function  close_order_event(orderid:any){
        swal({
            title: "确定要关闭该工单吗?",
            showCancelButton: true,
            closeOnConfirm: false,
            confirmButtonColor: "#fe5b56",
            animation: "slide-from-top",
            type: "warning"
        },(isConfirm) => {
            if(isConfirm){

                zm.API.onelogin(zm.API.resolve('zm-watcher:/api/feedback/closeReconfirmExpiredTicket'), {
                    ticketId:orderid,
                    employeeId:zm.user.userId
                }).then(function(msg:any){
                    if(msg.code==1){
                         swal({title: "", text: '工单关闭成功', timer: 2000, showConfirmButton: false, type: "success"});
                         init_search_question_list();
        
                    }else{
                        swal({title: "", text: msg.message, timer: 2000, showConfirmButton: false, type: "error"});
                    }
                })
                
            }
        })




        

    }

    function switch_tab(type: string){
        switch(type){
            case '0':
                hideAllPage();
                lesson_list.find('.content_list').show();
                break;
            case '1':
                hideAllPage();
                lesson_list.find('.session_list').show();
                break;
            case '2':
                hideAllPage();
                lesson_list.find('.record_list').show();
                break;
            case '3':
                hideAllPage();
                lesson_list.find('.question_list').show();
                break;
            case '4':
                hideAllPage();
                lesson_list.find('.member-list').show();
                break;
            case '5':
                //不做处理
                // 切换角色弹窗
                break;
            default:
                console.log('页面不存在')
        }
        function hideAllPage(){
            lesson_list.find('.content_list').hide();
            lesson_list.find('.session_list').hide();
            lesson_list.find('.record_list').hide();
            lesson_list.find('.question_list').hide();
            lesson_list.find('.member-list').hide();
        }
    }

    // 切换角色
    function init_role_switch() {
        $switchRoleWrapper.find('.close-btn').on('tap', function () {
            $switchRoleWrapper.hide();
        });
        $switchRoleWrapper.find('.role-wrap').map((index, element) => {
            let lastRoles = localStorage.getItem('user.lastRoles') ? JSON.parse(localStorage.getItem('user.lastRoles')) : {};
            let role = lastRoles[localStorage.getItem('user.mobile')];
            if($(element).attr('role') === role){
                $(element).hide();
            }
        })
    }
    function init_role_event() {
        $switchRoleWrapper.show();
    }
    // 人员列表
    interface optionInfo {
        label: string;
        value: string;
    }
    interface memberInfo {
        id?: number;
        name?: string;
        mobile?: string;
        employeeRole?: string | number;
        buType?: string;
        createdAt?: string;
        employeeRoleLabel?: string;
        buTypeLabel?: string;
        unactivedState?: boolean;
        notify?: number;
        employeeId?: number;
    }
    let allBuList: optionInfo[];
    let selfBuList: optionInfo[];
    let employeeRoleList: optionInfo[];
    let member_list_pageNo: number = 1;
    function init_member_page() {
        if(!lesson_list.find('.member-list').length){
            let member_html = `
                <div class= "member-list">
                    <div class="query-bar">
                        <select id="member-query-bu" class="ui-input" name="member-bu" required></select>
                        <input  id="member-query-name" class="ui-input" name="exam-score" type="text" placeholder="请输入技术支持姓名">
                        <input  id="member-query-account" class="ui-input" name="exam-score" type="text" placeholder="请输入技术支持账号">
                        <button class="ui-button member-query-btn">查询</button>
                        <button class="ui-button member-add-btn">新增人员</button>
                    </div>
                    <div class="table-wrap">
                        <table class="member-table table table-striped">
                        <thead>
                            <th>姓名</th>
                            <th>帐号</th>
                            <th>角色</th>
                            <th>BU权限</th>
                            <th>加入时间</th>
                            <th>操作</th>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                    </div>
                    <div class="member-list-empty">
                        搜索结果为空
                    </div>
                    <div id="member-pagination"></div>
                </div>
            `;
            lesson_list.append(member_html);
            // 技术支持BU下拉列表
            zm.API.onelogin(zm.API.resolve('zm-watcher:/api/employeeManage/getBuType'), {employeeId: zm.user.userId}).then((msg: any) => {
                if(msg.code == '1'){
                    selfBuList = msg.data || [];
                    $('#member-query-bu').html(renderOption(selfBuList));
                } else {
                    console.log('getBuType', msg);
                }
                query_member_list();
            });
            zm.API.onelogin(zm.API.resolve('zm-watcher:/api/employeeManage/getBuType')).then((msg: any) => {
                if(msg.code == '1'){
                    allBuList = msg.data || [];
                } else {
                    allBuList = selfBuList;
                }
            });
            // 技术支持角色下拉列表
            // zm.API.onelogin(zm.API.resolve('zm-watcher:/api/employeeManage/getEmployeeRole')).then((msg: any) => {
            //     console.log(msg);
            //     if(msg.code == '1'){
            //         employeeRoleList = msg.data || [];
            //         $('#member-query-role').html(renderOption(employeeRoleList));
            //     } else {
            //         console.log('getBuType', msg);
            //     }
            // });
            init_member_event();
        }
        lesson_list.find('.member-list').show();
    }
    function init_member_event(){
        let $member = lesson_list.find('.member-list');
        $member.find('.query-bar').on('click', '.member-query-btn', () => query_member_list.call(this));
        $member.on('click', '.edit_btn', function(){
            let sMember = $(this).parent().attr('member');
            let member = JSON.parse(sMember);
            add_or_edit_member.call(this, member)
        });
        $member.on('click', '.member-add-btn', () => add_or_edit_member.call(this));
        $member.on('click', '.reset_btn', function(){
            let sMember = $(this).parent().attr('member');
            let member = JSON.parse(sMember);
            ensureAlign.call(this, '确认重置密码吗？', (cb: () => void) => {
                console.log('member', member);
                cb();
            })
        });
        $member.on('click', '.delete_btn', function (){
            let sMember = $(this).parent().attr('member');
            let member = JSON.parse(sMember);
            ensureAlign.call(this, '确认删除此人吗？', (cb: () => void) => {
                console.log('member', member);
                cb();
            })
        });
    }
    function query_member_list(pageNo: number = 1){
        let buType: string = $('#member-query-bu').val();
        let sBuType: string[] = [];
        member_list_pageNo = pageNo;
        if(!buType){ // 如果为空 则查全部
            (selfBuList || []).map((item: optionInfo) => {
                buType += (',' + item.value);
                sBuType.push(item.value);
            });
            buType = sBuType.join(',');
        }
        zm.API.onelogin(zm.API.resolve('zm-watcher:/api/employeeManage/getEmployeeList'), {
            pageNo, pageSize: 10,
            buType,
            // employeeRole: $('#member-query-role').val(),
            username: $('#member-query-name').val(),
            mobile: $('#member-query-account').val()
        }).then((result: any) => {
            if(result && result.code == '1'){
                if((!result.data) || (result.data && (!result.data.data || result.data.data.length === 0))){
                    $('.member-list-empty').show()
                }else{
                    $('.member-list-empty').hide()
                }
                result.data = result.data || {data: []};
                result.data.data = result.data.data || [];
                let row_html = '';
                result.data.data.map((item: memberInfo): void => {
                    row_html += `
                <tr>
                    <td>${item.name || ''}</td>
                    <td>${item.mobile || ''}</td>
                    <td>${item.employeeRoleLabel || ''}</td>
                    <td>${item.buTypeLabel || ''}</td>
                    <td>${item.createdAt || ''}</td>
                    <td>
                        <div member='${JSON.stringify(item)}'>
                            <span class="edit_btn">编辑</span>
                            <!--<span class="reset_btn">重置密码</span>-->
                            <!--<span class="delete_btn">删除</span>-->
                        </div>
                    </td>
                </tr>
            `;
                });
                lesson_list.find('.member-list').find('tbody').html(row_html);

                requirejs(["simplePagination/jquery.simplePagination"], function() {
                    let member_pagination = $('#member-pagination');
                    (function(member_pagination: any){
                        member_pagination.pagination({
                            items: result.data.totalCount,//用来计算页数的项目总数。
                            itemsOnPage: 10,//每个页面显示的项目数。
                            currentPage: pageNo,
                            cssStyle: 'zm-theme',
                            onPageClick: query_member_list,
                            prevText: '上一页',
                            nextText: '下一页',
                        });
                    })(member_pagination)
                })
            }
        });
    }
    function add_or_edit_member(member: memberInfo = {}) {
        let win: any = window;
        let editMember: any;
        let aSelfBu = selfBuList || [{value: member.buType, label: member.buTypeLabel}];
        let aAllBu = allBuList.length ? allBuList : selfBuList;
        let aRole = employeeRoleList || [{value: member.employeeRole, label: member.employeeRoleLabel}];
        let isNew: boolean = member.id ? false : true;
        let content = `
            <div class="close-edit-member-btn icon-close"></div>
            <div class="edit-member">
                <div class="modal-header">新增/编辑用户信息</div>
                <div class="modal-body">
                    <div>
                        <div class="left"><span class="name required">姓名：</span></div>
                        <div class="right"><input type="text" class="ui-input member-edit-name" value="${member.name || ''}" ${isNew ? '' : 'disabled'}></div>
                    </div>
                    <div>
                        <div class="left"><span class="name required">手机号码：</span></div>
                        <div class="right"><input type="text" class="ui-input member-edit-mobile" value="${member.mobile || ''}" ${isNew ? '' : 'disabled'}></div>
                    </div>
                    <!-- <div>
                        <div class="left"><span class="name required">角色：</span></div>
                        <div class="right">
                            <select id="member-edit-role" class="ui-input" name="member-role" required>
                                ${ //employeeRoleList && renderOption(employeeRoleList)
                                    aRole.map((item: optionInfo) => {
                                        return `<option value='${item.value}' ${item.value === member.employeeRole ? 'selected' : ''}>${item.label}</option>`
                                    }).join('')
                                }
                            </select>
                        </div>
                    </div> -->
                    <div>
                        <div class="left"><span class="name required">BU权限：</span></div>
                        <div class="right" id="member-edit-bu">
                            ${
                                aAllBu.map((item: optionInfo, index: number) => {
                                    return `
                                        <label for="member-edit-bu-input-${index}">
                                            <input id="member-edit-bu-input-${index}" type="checkbox" name="member-bu" value='${item.value}'
                                                    ${isNew && index === 0 ? 'checked' : ''} ${member.buType && member.buType.split(',').indexOf(item.value) + 1 ? 'checked' : ''} ${JSON.stringify(aSelfBu).indexOf(JSON.stringify(item)) + 1 ? '' : 'disabled'}>
                                            <span>${item.label}</span>
                                        </label>
                                    `;
                                }).join('')
                            }
                        </div>
                    </div>
                    <div>
                        <div class="left"><span class="name required">接收短信标识：</span></div>
                        <div class="right" id="member-edit-msg">
                            <label for="member-edit-msg-input-1">
                                <input id="member-edit-msg-input-1" value="1" type="radio" name="member-msg" ${(isNew || member.notify === 1) ? 'checked' : ''}>
                                <span>是</span>
                            </label>
                            <label for="member-edit-msg-input-2">
                                <input id="member-edit-msg-input-2" value="0" type="radio" name="member-msg" ${member.notify === 0 ? 'checked' : ''}>
                                <span>否</span>
                            </label>
                        </div>
                    </div>
                    <button class="ui-button">保存</button>
                </div>
            </div>
        `;
        requirejs(["artDialog/dialog"],function () {
            editMember = new win.dialog({
                content: content,
                onshow: function () {
                    $('.close-edit-member-btn').click(function () {
                        editMember.close().remove();
                    });
                    $('.modal-body').on('click', 'button.ui-button', function () {
                        let url = isNew ? '/api/employeeManage/insertEmployee' : '/api/employeeManage/updateEmployee';
                        let buType: string[] = [];
                        $('#member-edit-bu').find('input:checked').each((index: number, elem: any) => {
                            buType.push($(elem).val())
                        });
                        let data: memberInfo = {
                            name: $('.member-edit-name').val(),
                            mobile: $('.member-edit-mobile').val(),
                            buType: buType.join(','),
                            notify: $('#member-edit-msg').find('input:checked').val()
                        };
                        if(!buType.length){
                            swal({ title:"", text: 'bu权限是必填项', timer: 1000,  showConfirmButton: false,type:"warning" });
                            return
                        }
                        if(!data.name.length || !data.name.replace(/ /g, '').length){
                            console.log(!data.name.length, !data.name.replace(/ /g, '').length)
                            swal({ title:"", text: '名字不能为空', timer: 1000,  showConfirmButton: false,type:"warning" });
                            return
                        }
                        if(!/\d{11}/.test(data.mobile)){
                            swal({ title:"", text: '手机号码不正确', timer: 1000,  showConfirmButton: false,type:"warning" });
                            return
                        }
                        if(!isNew){
                            data.employeeId = member.id;
                        }
                        zm.API.onelogin(zm.API.resolve('zm-watcher:' + url), data).then((msg: any) => {
                            if(msg.code == '1'){
                                swal({ title:"", text: isNew ? '添加成功' : '更新成功', timer: 1000,  showConfirmButton: false,type:"success" });
                                editMember.close().remove();
                                // isNew ? query_member_list() : query_member_list(member_list_pageNo);
                                if(isNew){
                                    console.log('第一页')
                                    query_member_list()
                                }else{
                                    query_member_list(member_list_pageNo);
                                    console.log('当前页')
                                }
                            } else {
                                swal({ title:"", text: msg.message, timer: 1000,  showConfirmButton: false,type:"error" });
                            }
                        });
                    })
                }
            })
            .showModal();
        })
    }
    function ensureAlign(title: string = '这里是title', ensureFn: (x: () => void) => void){
        let ensureAlignModal: any;
        let content = `
            <div class="close-edit-member-btn icon-close"></div>
            <div class="ensure-again">
                <div class="ensure-title">${title}</div>
                <div class="handle-bar">
                    <button class="ui-button cancel">取消</button>
                    <button class="ui-button ensure">确定</button>
                </div>
            </div>
        `;
        requirejs(['artDialog/dialog'], function () {
            ensureAlignModal = new win.dialog({
                content,
                onshow: function () {
                    $('.close-edit-member-btn').click(function () {
                        ensureAlignModal.close().remove();
                    });
                    $('.ensure-again .handle-bar .cancel').click(function () {
                        ensureAlignModal.close().remove();
                    });
                    $('.ensure-again .handle-bar .ensure').click(function () {
                        ensureFn(() => {
                            console.log('close ensure');
                            ensureAlignModal.close().remove();
                        });
                    });
                }
            })
            .showModal();
        })
    }
    function renderOption(arr: optionInfo[]): string{
        let optionHtml = '<option value="">请选择</option>';
        arr.map((item: optionInfo) => optionHtml += `<option value='${item.value}'>${item.label}</option>` );
        return optionHtml;
    }
    function init_new_member_page() {
        if(!lesson_list.find('.member-list').length){
            let query = `?userId=${zm.user.userId}&mobile=${zm.user.mobile}&password=${zm.user.password}&access_token=${localStorage.getItem("accessToken")}`;
            let html = `<div class= "member-list">
            <iframe src=${ZM.config.frameurl}/member${query} width="100%" height="100%" frameborder="no" marginwidth="0" marginheight="0" scrolling="no" allowtransparency="yes" "></iframe>
            </div>
            `;
            lesson_list.append(html);
        }
        lesson_list.find('.member-list').show();
    }
}
