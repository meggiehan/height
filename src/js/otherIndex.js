import config from '../config';
import { html } from '../utils/string';
import { home } from '../utils/template';
import nativeEvent from '../utils/nativeEvent';
import { getCertInfo } from '../utils/string';
import customAjax from '../middlewares/customAjax';
import { otherIndexClickTip, veiwCert } from '../utils/domListenEvent';
import Vue from 'vue';
import store from '../utils/localStorage';

function otherIndexInit(f7, view, page) {
    const { id, currentUserId } = page.query;
    const currentPage = $$($$('.view-main .pages>.page')[$$('.view-main .pages>.page').length - 1]);
    const { imgPath, cacheUserInfoKey } = config;
    const weixinData = store.get('weixinData');
    let level;
    let nameAuthentication;
    let userCache = store.get(cacheUserInfoKey);

    /**
     * 页面content模块管理
     * 由于头部有f7的事件绑定，跟vue有冲突，所以不能交给vue管理。
     * */
    const shopVue = new Vue({
        el: currentPage.find('.page-content')[0],
        data: {
            userInfo: {},
            saleDemands: {},
            buyDemands: {},
            fishCertificateList: {},
            recentScanTimes: 0,
            buyDemandsCount: 0,
            saleDemandsCount: 0,
            currentUserId: currentUserId,
            isMyShop: false
        },
        methods: {
            imgPath: imgPath,
            veiwCert: veiwCert,
            getCertInfo: getCertInfo
        }
    });

    /**
     * 页面footer模块管理
     * */
    const shopFooterVue = new Vue({
        el: currentPage.find('.toolbar')[0],
        data: {
            phone: '',
            isMyShop: false
        },
        methods: {
            callPhone(phone){
                apiCount('btn_profile_call');
                nativeEvent.contactUs(phone);
            },
            goMyShop(){
                mainView.router.loadPage('views/myShop.html');
            }
        }
    });

    function renderList(buyList, sellList){
        f7.hideIndicator();
        if(!buyList.length && !sellList.length){
            currentPage.find('.other-index-empty-info').show();
            currentPage.find('.other-index-list').removeClass('show-buy-list');
            currentPage.find('.other-index-list').removeClass('show-sell-list');
            f7.pullToRefreshDone();
            return;
        }

        if(buyList.length){
            let buyHtml = '';
            $$.each(buyList, (index, item) => {
                buyHtml += home.buy(item, level);
            })
            html($$('.other-buy-list .list'), buyHtml, f7);
            currentPage.find('.other-index-list').addClass('show-buy-list');
        }

        if(sellList.length){
            let sellHtml = '';
            $$.each(sellList, (index, item) => {
                sellHtml += home.cat(item, level, nameAuthentication);
            })
            html($$('.other-sell-list .list'), sellHtml, f7);
            currentPage.find('.other-index-list').addClass('show-sell-list');
        }

        $$('img.lazy').trigger('lazy');
        f7.pullToRefreshDone();
    }

    const callback = (data) => {
        const {
            userInfo,
            saleDemands,
            buyDemands,
            fishCertificateList,
            buyDemandsCount,
            saleDemandsCount,
            recentScanTimes
        } = data.data;
        shopVue.userInfo = userInfo;
        shopVue.saleDemands = saleDemands;
        shopVue.buyDemands = buyDemands;
        shopVue.fishCertificateList = fishCertificateList;
        shopVue.buyDemandsCount = buyDemandsCount;
        shopVue.saleDemandsCount = saleDemandsCount;
        shopVue.recentScanTimes = recentScanTimes;

        shopFooterVue.phone = userInfo.phone;
        if(userCache && userCache.id){
            if(currentUserId == userCache.id){
                shopFooterVue.isMyShop = true;
                shopVue.isMyShop = true;
                $$('.navbar>div').eq($$('.navbar>div').length - 1).find('.center').text('我的店铺');
                $$('.navbar>div').eq($$('.navbar>div').length - 1).find('.right').children().hide();
            }
        }

        renderList(buyDemands, saleDemands);
    };

    function getInfo(){
        customAjax.ajax({
            apiCategory: 'userInformation',
            data: [currentUserId],
            val:{
                id: currentUserId
            },
            type: 'get',
            isMandatory: nativeEvent.getNetworkStatus()
        }, callback);
    }

    /*
    * 获取/刷新个人信息
    * */
    const ptrContent = currentPage.find('.other-index-refresh');
    getInfo();
    ptrContent.on('refresh', getInfo);

    $$('.navbar-inner.other-index .icon-more').off('click', otherIndexClickTip).on('click', otherIndexClickTip);
}

export {
    otherIndexInit
}
