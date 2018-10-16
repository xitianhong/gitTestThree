// (function () {
//   if (!window.ZM) {
//       window.ZM = {};
//   }
//
//   ZM.config = {
//       //zmHost : 'http://'+location.hostname+':8080',
//       //zmHost : 'https://'+ location.hostname +':8443',
//       zmHost: 'https://x-chat-test.zmlearn.com',
//       // zmHost: 'http://localhost:3000',
//       //'http://nightly-test.zm1v1.com',
//       zmHostOld: 'https://www.zmlearn.com',
//       //zmChatHost: 'https://'+ location.hostname +':8443',
//       zmChatHost: 'https://x-chat-test.zmlearn.com',
//       zmChatMirrors: ['https://chat1.zmlearn.com:443', 'https://chat2.zmlearn.com:443'],
//       //zmChatUploadApiNew: 'http://120.27.193.190:8080',
//       zmHostTk: 'https://homework-test.zmlearn.com',
//       //zmHostTk:'http://120.26.162.201:8080',
//       //zmChatUploadApiNew: 'https://x-chat-doc-test.zmlearn.com',
//       zmChatUploadApiNew: 'https://x-chat-doc-test.zmlearn.com',
//       zmChatHostPort: '8443',
//       zmChatHostSPort: '8443',
//       zmSignalHost: '/',
//       presentationUploadUrl: 'zm-chat:/api/presentation/upload',
//       debug: false,
//       //loggerHost: 'http://'+window.location.hostname+':1337'
//       lessonUploadedApi: '/api/lesson/uploaded',
//       zmVersionWin7plus: '1.0.1.1',
//       zmVersionMac: '1.0.3.0',
//       zmVersionxp: '1.0.1.1',
//       zmAppDownloadBase: 'http://7tea5g.com2.z0.glb.qiniucdn.com/',
//       zm1v1Test: 'https://v2-test.zm1v1.com',
//       //zmFsHost:'http://fs.zmlearn.com:8080',
//       zmFsHostTest: 'https://fs-test.zmlearn.com',
//       zmWatcherHostTest: 'http://121.43.100.229:8080',
//       zmTencentApi: 'https://x-chat-test.zmlearn.com',
//       zmTr: 'https://tr-test.zmlearn.com',
//       zmQb: 'https://qb-test.zmlearn.com',
//   zmZml: 'https://zml-test.zmlearn.com',
//   };
// })();
(function () {
    if (!window.ZM) {
        window.ZM = {};
    }

    ZM.config = {};
    // 通过命令来决定环境
    const setConfig = window.resetConfig = (type) => {
        if (type === 'prod') {
            ZM.config.zmHost = 'https://chat.zmlearn.com'+':443';
            ZM.config.zmHostOld = 'https://www.zmlearn.com';
            ZM.config.zmChatHost = 'https://chat.zmlearn.com'+':443';
            ZM.config.zmChatMirrors = ['https://chat1.zmlearn.com:443','https://chat2.zmlearn.com:443'];
            ZM.config.zmHostTk = 'https://homework.zmlearn.com';
            ZM.config.zmChatUploadApiNew = 'https://chat-doc.zmlearn.com';
            ZM.config.zmChatHostPort = '443';
            ZM.config.zmChatHostSPort = '443';
            ZM.config.zmSignalHost = '/';
            ZM.config.presentationUploadUrl = 'zm-chat:/api/presentation/upload';
            ZM.config.debug = false;
            ZM.config.lessonUploadedApi = '/api/lesson/uploaded';
            ZM.config.zmVersionWin7plus = '1.0.3.1';
            ZM.config.zmVersionMac = '1.0.3.1';
            ZM.config.zmVersionxp = '1.0.3.1';
            ZM.config.zmAppDownloadBase = 'http://7tea5g.com2.z0.glb.qiniucdn.com/';
            ZM.config.zm1v1Test = 'https://www.zhangmen.com';
            ZM.config.zmFsHostTest = 'https://fs.zmlearn.com';
            ZM.config.zmWatcherHostTest = 'https://workorder.zmlearn.com';
            ZM.config.zmTencentApi = 'https://chat.zmlearn.com';
            ZM.config.zmTr = 'https://tr.zmlearn.com';
            ZM.config.zmZml = 'https://zml.zmlearn.com';
            ZM.config.zmQb = 'https://qb.zmlearn.com';
            ZM.config.frameurl = '';
        } else if (type === 'uat') {
            ZM.config.zmHost = 'https://chat.uat.zmops.cc:443';
            ZM.config.zmHostOld = 'https://www.zmlearn.com';
            ZM.config.zmChatHost = 'https://chat.uat.zmops.cc:443';
            ZM.config.zmChatMirrors = ['https://chat1.zmlearn.com:443','https://chat2.zmlearn.com:443'];
            ZM.config.zmHostTk = 'https://homework.uat.zmops.cc';
            ZM.config.zmChatUploadApiNew = 'https://chat-doc.uat.zmops.cc';
            ZM.config.zmChatHostPort = '443';
            ZM.config.zmChatHostSPort = '443';
            ZM.config.zmSignalHost = '/';
            ZM.config.presentationUploadUrl = 'zm-chat:/api/presentation/upload';
            ZM.config.debug = false;
            ZM.config.lessonUploadedApi = '/api/lesson/uploaded';
            ZM.config.zmVersionWin7plus = '1.0.3.1';
            ZM.config.zmVersionMac = '1.0.3.1';
            ZM.config.zmVersionxp = '1.0.3.1';
            ZM.config.zmAppDownloadBase = 'http://7tea5g.com2.z0.glb.qiniucdn.com/';
            ZM.config.zm1v1Test = 'https://www.zhangmen.com';
            ZM.config.zmFsHostTest = 'https://fs.uat.zmops.cc';
            ZM.config.zmWatcherHostTest = 'https://workorder.uat.zmops.cc';
            ZM.config.zmTencentApi = 'https://chat.uat.zmops.cc';
            ZM.config.zmTr = 'https://tr.uat.zmops.cc';
            ZM.config.zmZml = 'https://zml-test.zmlearn.com';
            ZM.config.zmQb = 'https://qb.uat.zmops.cc';
            ZM.config.frameurl = '';
        } else if (type === 'test') {
            ZM.config.zmHost = 'https://x-chat-test.zmlearn.com';
            ZM.config.zmHostOld = 'https://www.zmlearn.com';
            ZM.config.zmChatHost = 'https://x-chat-test.zmlearn.com';
            ZM.config.zmChatMirrors = ['https://chat1.zmlearn.com:443', 'https://chat2.zmlearn.com:443'];
            ZM.config.zmHostTk = 'https://homework-test.zmlearn.com';
            ZM.config.zmChatUploadApiNew = 'https://x-chat-doc-test.zmlearn.com';
            ZM.config.zmChatHostPort = '8443';
            ZM.config.zmChatHostSPort = '8443';
            ZM.config.zmSignalHost = '/';
            ZM.config.presentationUploadUrl = 'zm-chat:/api/presentation/upload';
            ZM.config.debug = false;
            ZM.config.lessonUploadedApi = '/api/lesson/uploaded';
            ZM.config.zmVersionWin7plus = '1.0.1.1';
            ZM.config.zmVersionMac = '1.0.3.0';
            ZM.config.zmVersionxp = '1.0.1.1';
            ZM.config.zmAppDownloadBase = 'http://7tea5g.com2.z0.glb.qiniucdn.com/';
            ZM.config.zm1v1Test = 'https://v2-test.zm1v1.com';
            ZM.config.zmFsHostTest = 'https://fs-test.zmlearn.com';
            ZM.config.zmWatcherHostTest = 'https://workorder-test.zmlearn.com';
            ZM.config.zmTencentApi = 'https://x-chat-test.zmlearn.com';
            ZM.config.zmTr = 'https://tr-test.zmlearn.com';
            ZM.config.zmQb = 'https://qb-test.zmlearn.com';
            ZM.config.zmZml = 'https://zml-test.zmlearn.com';
            ZM.config.frameurl = 'http://localhost:4000'
        } else {
            ZM.config.zmHost = 'https://x-chat-test.zmlearn.com';
            ZM.config.zmReactReduxUrl = 'https://x-chat-test.zmlearn.com';
            ZM.config.zmHostOld = 'https://www.zmlearn.com';
            ZM.config.zmChatHost = 'https://x-chat-test.zmlearn.com';
            ZM.config.zmChatMirrors = ['https://chat1.zmlearn.com:443', 'https://chat2.zmlearn.com:443'];
            ZM.config.zmHostTk = 'http://homework-test.zmlearn.com';
            ZM.config.zmChatUploadApiNew = 'https://x-chat-doc-test.zmlearn.com';
            ZM.config.zmChatHostPort = '8443';
            ZM.config.zmChatHostSPort = '8443';
            ZM.config.zmSignalHost = '/';
            ZM.config.presentationUploadUrl = 'zm-chat:/api/presentation/upload';
            ZM.config.debug = false;
            ZM.config.lessonUploadedApi = '/api/lesson/uploaded';
            ZM.config.zmVersionWin7plus = '1.0.1.1';
            ZM.config.zmVersionMac = '1.0.3.0';
            ZM.config.zmVersionxp = '1.0.1.1';
            ZM.config.zmAppDownloadBase = 'http://7tea5g.com2.z0.glb.qiniucdn.com/';
            ZM.config.zm1v1Test = 'https://v2-test.zm1v1.com';
            ZM.config.zmFsHostTest = 'https://fs-dev.zmlearn.com';
            ZM.config.zmWatcherHostTest = 'https://workorder-test.zmlearn.com';
            ZM.config.zmTencentApi = 'https://x-chat-dev.zmlearn.com';
            ZM.config.zmTr = 'https://tr-dev.zmlearn.com';
            ZM.config.zmQb = 'https://qb-dev.zmlearn.com';
            ZM.config.zmZml = 'https://zml-test.zmlearn.com';
            ZM.config.frameurl = '';
        }
    };

    const getHost = () => {
        const host = window.location.host;

        switch (host) {
            case 'chat.zmlearn.com':
                return 'prod';
            case 'chat.uat.zmops.cc':
                return 'uat';
            case 'x-chat-test.zmlearn.com':
                return 'test';
            case 'x-chat-dev.zmlearn.com':
                return 'dev';
            default:
                return 'test';
        }
    };

    // 默认根据域名配置地址，可以通过 window.resetConfig 手动切换配置，用于打包后测试不同环境代码的执行结果
    setConfig(getHost());
})();