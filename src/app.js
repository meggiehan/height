import Framework7 from './js/lib/framework7';
import version from './config/version.json';
import config from './config';
import {searchInit} from './js/search';
import {homeInit} from './js/home';
import {filterInit} from './js/filter';
import {selldetailInit} from './js/selldetail';
import {buydetailInit} from './js/buydetail';
import {releaseInit} from './js/release';
import {releaseInfoInit} from './js/releaseInfo';
import {loginInit} from './js/login';
import {loginCodeInit} from './js/loginCode';
import {userInit} from './js/user';
import {myCenterInit} from './js/myCenter';
import {identityAuthenticationInit} from './js/identityAuthentication';
import globalEvent from './utils/global';
import {otherIndexInit} from './js/otherIndex';
import {otherInfoInit} from './js/otherInfo';
import {otherListInit} from './js/otherList';
import {myListInit} from './js/myList';
import {fishCertInit} from './js/fishCert';
import {releaseSuccInit} from './js/releaseSucc';
import nativeEvent from './utils/nativeEvent';
import {getQuery} from './utils/string';
import {catIdentityStatusInit} from './js/catIdentityStatus';
import {editNameInit} from './js/editName';
import {inviteCodeInit} from './js/inviteCode';
import {inviteFriendsInit} from './js/inviteFriends';
import {inviteFriendsListInit} from './js/inviteFriendsList';
import {myCollectionInit} from './js/myCollection';
import {dealListInit} from './js/dealList';
import {releaseSelectTagInit} from './js/releaseSelectTag';
import {notFoundInit} from './js/notFound';
import {bindAccountInit} from './js/bindAccount';
import {fishCarInit} from './js/fishCar';
import {releaseFishCarDemandInit} from './js/releaseFishCarDemand'
import {postDriverAuthInit} from './js/postDriverAuth';
import {postDriverInfoInit} from './js/postDriverInfo';
import {fishCar, home} from './utils/template';
import {driverDemandInfoInit} from  './js/driverDemandInfo';
import {updateCtrl, updateClickEvent} from './js/service/updateVersion/updateVersionCtrl';
import {invitationAction} from './js/service/invitation/invitationCtrl';
import {JsBridge} from './middlewares/JsBridge';
import {releaseFishCarDemandSuccessInit} from './js/releaseFishCarDemandSuccess';
import {releaseFishCarTripInit} from './js/releaseFishCarTrip';
import {weixinModalEvent} from './js/modal/weixinModal';
import {
    fishCarModalJumpEvent
} from './js/modal/fishCarDriverSelectAddressModal';
import {fishCarTripListInit} from './js/fishCarTripList';
import {myFishCarDemandListInit} from './js/myFishCarDemandList';
import RefreshOldTokenModel from './js/model/RefreshOldTokenModel';
import store from './utils/localStorage';
import {shareMyTripInit} from './js/shareMyTrip';

import {aquaticClassInit} from './js/aquaticClass';

const deviceF7 = new Framework7();
const {device} = deviceF7;
const {android, androidChrome} = device;
const {timeout, fishCacheObj} = config;
console.log(`current app update time: ${version.date}!${store.get('versionNumber')}`);
let animatStatus = true;
android && (animatStatus = androidChrome);
window.isTipBack = false;
window.shraeInfo = {};
let isBack = false;

/*
 * 初始化f7的参数
 * */
let initAppConfig = {
    activeState: false,
    imagesLazyLoadThreshold: 50,
    pushState: true,
    animateNavBackIcon: true,
    animatePages: animatStatus,
    preloadPreviousPage: true,
    modalButtonOk: '确定',
    modalButtonCancel: '取消',
    fastClicks: true,
    modalTitle: '温馨提示',
    preprocess: (content, url, next) => {
        next(content);
        $$('.fish-car-modal').removeClass('on');
        const query = getQuery(url);
        if (url.indexOf('search.html') > -1) {
            searchInit(f7, mainView, {query})
        }
    },
    /*
     * 返回上个页面的一些路由拦截操作
     * */
    preroute: (view, options) => {
        const {history} = view;
        const currentPage = options && options['url'];
        const len = history.length;
        const _currentPage = history[len - 1];
        var btns = document.getElementsByClassName('modal-button');
        if (!isTipBack && _currentPage && _currentPage.indexOf('releaseInfo.html') > -1 && btns.length && btns[0].innerText.indexOf("放弃发布") > -1) {
            return false;
        }
        if (!currentPage && len >= 1) {
            const backPage = history[len - 2];

            if (_currentPage.indexOf('home.html') > -1 || _currentPage.indexOf('user.html') > -1 || _currentPage.indexOf('releaseSucc.html') > -1) {
                return false;
            }

            if ($$('.modal-overlay-visible').length) {
                $$('.modal-overlay-visible').trigger('click');
                $$('.modal-button').length && $$('.modal-button')[0].click();
            }
            $$('div.footer').length && $$('div.footer').click();

            if (_currentPage.indexOf('filter.html') > -1 && backPage && backPage.indexOf('filter.html') > -1) {
                mainView.router.load({
                    url: 'views/home.html',
                    reload: true
                });
                return false;
            }
            $$('.release-select-model').removeClass('on');
            if (_currentPage.indexOf('releaseInfo.html') > -1 && !isTipBack && f7) {
                f7.modal({
                    title: '确定放弃这次发布吗？',
                    text: '亲，您已经填写了信息，还没发布呢，确定直接离开？发布一条信息，就有更大几率完成交易噢~',
                    buttons: [
                        {
                            text: '放弃发布',
                            onClick: () => {
                                window.isTipBack = true;
                                mainView.router.back();
                            }
                        },
                        {
                            text: '继续填写',
                            onClick: () => {
                            }
                        }
                    ]
                });
                return false;
            }

            /***避免低版本的安卓手机返回触发两次***/
            if (android && !androidChrome) {
                if (isBack) {
                    return false;
                }
                isBack = true;
                setTimeout(() => {
                    isBack = false;
                }, 400);
            }
        }
    }
};

/*
 * 在低端安卓机中切换页面动画效果不流畅，所以判断在4.4以下的安卓机禁止启用动画
 * */
android && !androidChrome && (initAppConfig['swipeBackPage'] = false);
var f7 = new Framework7(initAppConfig);
window.mainView = f7.addView('.view-main', {
    dynamicNavbar: true,
    domCache: true
});

/*
 * 抽离出登录视图
 * */
window.loginView = f7.addView('.view-login', {
    dynamicNavbar: true,
    domCache: true
});

/**
 * 鱼车相关发布需求
 * */
window.releaseView = f7.addView('.view-release-fish', {
    dynamicNavbar: true,
    domCache: true
});

/*
 * 主视图初始化加载首页
 * */
mainView.router.load({
    url: 'views/home.html',
    animatePages: false,
    reload: true
});

window.$$ = Dom7;
window.jQuery = Dom7;
window.$ = Dom7;
globalEvent.init(f7);
window.currentDevice = f7.device;
nativeEvent['searchHistoryActions'](2, '');

if(android && !androidChrome){
    $$('html').addClass('android-4-min');
}else{
    /**
     * 初始化jsBrige
     * */
    JsBridge('JS_SaveInfomation', {jsBrigeTest: 123}, f7);
}

/*
 * Trigger lazy load img.
 */
$$('img.lazy').trigger('lazy');
/*
 * some kinds of loading style.
 * 1: app.showIndicator()
 * 2: app.showPreloader()
 * 3: app.showPreloader('My text...')
 * hide: app.hide*
 */

/*
 * 页面加载完成后根据name执行相应的controller
 * */
const initApp = f7.onPageInit("*", (page) => {
    if (page.name !== 'home' && page.name) {
        f7.showIndicator();
    } else {
        f7.hideIndicator();
    }

    if(page.name == 'pageMvp' || page.name == 'myMember'){
        f7.hideIndicator();
    }

    setTimeout(f7.hideIndicator, timeout);
    page.name === 'editName' && editNameInit(f7, mainView, page);
    page.name === 'catIdentityStatus' && catIdentityStatusInit(f7, mainView, page);
    page.name === 'login' && loginInit(f7, mainView, page);
    page.name === 'bindPhone' && loginInit(f7, mainView, page);
    page.name === 'loginCode' && loginCodeInit(f7, mainView, page);
    page.name === 'search' && searchInit(f7, mainView, page);
    page.name === 'filter' && filterInit(f7, mainView, page);
    page.name === 'selldetail' && selldetailInit(f7, mainView, page);
    page.name === 'buydetail' && buydetailInit(f7, mainView, page);
    page.name === 'release' && releaseInit(f7, mainView, page);
    page.name === 'releaseInfo' && releaseInfoInit(f7, mainView, page);
    page.name === 'myCenter' && myCenterInit(f7, mainView, page);
    page.name === 'identityAuthentication' && identityAuthenticationInit(f7, mainView, page);
    page.name === 'otherIndex' && otherIndexInit(f7, mainView, page);
    page.name === 'otherInfo' && otherInfoInit(f7, mainView, page);
    page.name === 'otherList' && otherListInit(f7, mainView, page);
    page.name === 'myList' && myListInit(f7, mainView, page);
    page.name === 'fishCert' && fishCertInit(f7, mainView, page);
    page.name === 'releaseSucc' && releaseSuccInit(f7, mainView, page);
    page.name === 'home' && homeInit(f7, mainView, page);
    page.name === 'user' && userInit(f7, mainView, page);
    page.name === 'inviteCode' && inviteCodeInit(f7, mainView, page);
    page.name === 'inviteFriendsList' && inviteFriendsListInit(f7, mainView, page);
    (page.name === 'inviteFriends' || page.name === 'myShop') && inviteFriendsInit(f7, mainView, page);

    page.name === 'myCollection' && myCollectionInit(f7, mainView, page);
    page.name === 'dealList' && dealListInit(f7, mainView, page);
    page.name === 'releaseSelectTag' && releaseSelectTagInit(f7, mainView, page);
    page.name === 'notFound' && notFoundInit(f7, mainView, page);
    page.name === 'bindAccount' && bindAccountInit(f7, mainView, page);

    /**
     * 鱼车相关
     * */
    page.name === 'fishCar' && fishCarInit(f7, mainView, page);
    page.name === 'releaseFishCarDemand' && releaseFishCarDemandInit(f7, mainView, page);
    page.name === 'releaseFishCarTrip' && releaseFishCarTripInit(f7, mainView);
    page.name === 'driverDemandInfo' && driverDemandInfoInit(f7, mainView, page);
    page.name === 'releaseFishCarDemandSuccess' && releaseFishCarDemandSuccessInit(f7, mainView, page);
    page.name === 'fishCarTripList' && fishCarTripListInit(f7, mainView, page);
    page.name === 'myFishCarDemandList' && myFishCarDemandListInit(f7, mainView, page);
    page.name === 'shareMyTrip' && shareMyTripInit(f7, mainView, page);

    /**
     * 上传司机信息页面
     * */
    page.name === 'postDriverAuth' && postDriverAuthInit(f7, mainView, page);
    page.name === 'postDriverInfo' && postDriverInfoInit(f7, mainView, page);
    page.name === 'recruitDriverSuccess' && f7.hideIndicator();

    /**
     * 水产课堂相关页面
     * */
     page.name === 'aquaticClass' && aquaticClassInit(f7, mainView, page);
});

/**
 * 返回动画完成之后调用
 * */
f7.onPageAfterBack('*', (page) => {
    const {name} = mainView.activePage;
    setTimeout(() => {
        const currentPage = $$($$('.view-main .pages>.page')[$$('.view-main .pages>.page').length - 1]);
        if ('home' == name) {
            const fishCacheData = nativeEvent.getDataToNative(fishCacheObj.fishCacheKey);
            if (fishCacheData && fishCacheData.length) {
                let str = '';
                $$.each(fishCacheData.reverse(), (index, item) => {
                    if (index <= 5) {
                        str += home.renderFishList(item, index);
                    }
                })
                currentPage.find('.fish-cache-list').html(str);
                str ? currentPage.find('.home-fish-cache-list').show() : currentPage.find('.home-fish-cache-list').hide();
            }
        }
    }, 250)
});

/*
 * 关闭登录视图/发布需求信息视图
 * */
$$('.view-login>.navbar').click((e) => {
    const ele = e.target || window.event.target;
    if ($$(ele).hasClass('login-view-close')) {
        $$('.view-login').removeClass('show');
    }
    return;
});

$$('.view-release-fish>.navbar').click((e) => {
    const ele = e.target || window.event.target;
    if($$(ele).hasClass('release-view-close')){
        $$('.view-release-fish').removeClass('show');
    }
    return;
})

/**
 * 调用native定位，获取当前定位信息
 * 1.8升级1.9 登录token兼容刷新
 * */
let interTime = 0;
if (!store.get('versionNumber')) {
    const intervalId = setInterval(() => {
        interTime += 200;

        const versionNumber = store.get('versionNumber');
        if(versionNumber == 'V01_09_01_01' &&
            !store.get('isUpdateLarge') &&
            nativeEvent.getUserValue()){
            RefreshOldTokenModel.post((res) => {
                const {code, data, message} = res;
                if(1 == code){
                    nativeEvent.setNativeUserInfo();
                    store.set('accessToken', data);
                    store.set('isUpdateLarge', 1)
                }else{
                    console.log(message);
                }
            });
            clearInterval(intervalId);
        }

        if(interTime >= 20000 || !!versionNumber){
            clearInterval(intervalId);
        }

    }, 500);
}

/**
 * 一开始执行检查版本更新操作
 * 更新版本按钮操作事件
 * 初始化邀请model类
 * 邀请modal按钮操作
 * 微信modal操作
 * 鱼车选择地区modal操作
 * */
const interId = setInterval(() => {
    if(window.JS_GetObjectWithKey ||
        (window.yudada && window.yudada.JS_GetObjectWithKey)){
        updateCtrl(f7);
        nativeEvent.getAddress();
        clearInterval(interId);
    }
}, 100);
updateClickEvent(f7);
invitationAction();
weixinModalEvent();
// fishCarDriverSelectAddressModalEvent(f7);
fishCarModalJumpEvent(f7);
