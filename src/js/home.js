import customAjax from '../middlewares/customAjax';
import {home} from '../utils/template';
import {html} from '../utils/string';
import config from '../config';
import {goUser} from '../utils/domListenEvent';
import nativeEvent from '../utils/nativeEvent';
import {getAll, get} from '../utils/localStorage';
import {isLogin, loginViewShow} from '../middlewares/loginMiddle';

function homeInit(f7, view, page) {
    f7.hideIndicator();
    const currentPage = $$($$('.view-main .pages>.page')[$$('.view-main .pages>.page').length - 1]);
    const weixinData = nativeEvent.getDataToNative('weixinData');
    const {fishCacheObj} = config;
    /*
     * 判断是否有数据缓存，如果有就直接显示
     * */
    if (getAll().length) {
        currentPage.find('.ajax-content').show();
        currentPage.find('.home-loading').hide();
    }

    /*
     * 成交列表 render
     * 鱼种标签 render
     * 成交记录 render
     * */
    const renderDealList = (data) => {
        let dealHtml = '';
        $$.each(data, (index, item) => {
            dealHtml += home.dealInfo(item);
        })
        html(currentPage.find('.home-deal-info-list'), dealHtml);
    }
    const renderBanners = (data) => {
        let bannerHtml = '';
        $$.each(data, (index, item) => {
            bannerHtml += home.banner(item);
        })
        bannerHtml && html(currentPage.find('.swiper-wrapper'), bannerHtml, f7);
        bannerHtml && currentPage.find('.home-slider').show();
        /*
         * 开始注销掉swiper实例（场景： 在用户中心跟首页切换的时候不注销可能产生多个实例互相影响）
         * */
        if(window.yudadaSwiper){
            window.yudadaSwiper.destroy && window.yudadaSwiper.destroy(false, false);
        }
        if (data.length > 1) {
            window.yudadaSwiper = f7.swiper('.swiper-slow', {
                pagination: currentPage.find('.swiper-pagination'),
                lazyLoading: true,
                paginationClickable: true,
                initialSlide: 0,
                speed: 400,
                autoplay: 4000,
                centeredSlides: true,
                loop: true,
                autoplayDisableOnInteraction: true,
                onTouchStart: (swiper, e) => {
                    if($$.isArray(window.yudadaSwiper)){
                        window.yudadaSwiper[window.yudadaSwiper.length - 1].stopAutoplay();
                    }else{
                        window.yudadaSwiper.stopAutoplay();
                    }
                },
                onTouchEnd: (swiper, e) => {
                    /*
                     * 为了解决手动滑动后，焦点选择错误以及自动滚动关闭的bug
                     * */
                    setTimeout(() => {
                        const index = currentPage.find('.swiper-slide-active').attr('data-swiper-slide-index');
                        currentPage.find('.swiper-pagination').children('span').removeClass('swiper-pagination-bullet-active').eq(index).addClass('swiper-pagination-bullet-active');
                        currentPage.find('.swiper-pagination').children('span').removeClass('hide');
                        if($$.isArray(window.yudadaSwiper)){
                            window.yudadaSwiper[window.yudadaSwiper.length - 1].startAutoplay();
                        }else{
                            window.yudadaSwiper.startAutoplay();
                        }
                    }, 80)
                }
            })
        }else{
            currentPage.find('.swiper-pagination').children('span').addClass('hide');
        }
    }

    const renderFishTags = (tagList) => {
        console.log('render tag list!')
    }
    const initDataCallback = (data) => {
        const {banners, trades, fishTags} = data.data;
        if (1 == data.code) {
            banners && banners.length && renderBanners(banners);
            trades && trades.length && renderDealList(trades);
            fishTags && fishTags.length && renderFishTags(fishTags);
            return;
        }
    }
    customAjax.ajax({
        apiCategory: 'initPage',
        data: ['2'],
        type: 'get'
    }, initDataCallback);


    /**
     * render 最近使用鱼种
     * */
    setTimeout(() => {
        const fishCacheData = nativeEvent.getDataToNative(fishCacheObj.fishCacheKey);
        if(fishCacheData && fishCacheData.length){
            let str = '';
            $$.each(fishCacheData.reverse(), (index, item) => {
                if(index <= 2){
                    str += home.renderFishList(item, index);
                }
            })
            currentPage.find('.fish-cache-list').html(str);
            str ? currentPage.find('.home-fish-cache-list').show() : currentPage.find('.home-fish-cache-list').hide();
        }
    }, 400);

    /**
     * render 首页的信息列表
     * */
    const callback = (data, err, type) => {
        const {buyDemands, saleDemands} = data.data;
        if (saleDemands.length) {
            let catListHtml = '';
            $$.each(saleDemands, (index, item) => {
                catListHtml += home.cat(item);
            })
            html(currentPage.find('.cat-list-foreach'), catListHtml, f7);
        }

        if (buyDemands.length) {
            let buyListHtml = '';
            $$.each(buyDemands, (index, item) => {
                buyListHtml += home.buy(item);
            })
            html(currentPage.find('.buy-list-foreach'), buyListHtml, f7);
        }
        currentPage.find('.ajax-content').show(200);
        currentPage.find('.home-loading').hide(100);

        //pull to refresh done.
        f7.pullToRefreshDone();
        currentPage.find('img.lazy').trigger('lazy');
    }
    /*
     * 获取首页信息
     * */
    function getHomeListInfo(bool, onlyUseCache) {
        customAjax.ajax({
            apiCategory: 'demandInfo',
            api: 'list',
            data: ['true'],
            val: {
                index: 'index'
            },
            type: 'get',
            isMandatory: bool,
            onlyUseCache
        }, callback);
    }
    getHomeListInfo(false, true);

    /*
     * 刷新首页列表数据
     * */
    const ptrContent = currentPage.find('.pull-to-refresh-content');
    ptrContent.on('refresh', () => {
        getHomeListInfo(nativeEvent.getNetworkStatus());
    });
    setTimeout(() => {
        f7.pullToRefreshTrigger(ptrContent);
    }, 50);

    /*
     * 跳转页面
     * */
    $$('.href-go-user').off('click', goUser).on('click', goUser);
    $$('.home-search-mask').on('click', () => {
        view.router.load({
            url: 'views/search.html'
        })
    })

    /*
     * 点击活动banner，打开第三方webview.
     * */
    currentPage.find('.home-slider')[0].onclick = (e) => {
        const ele = e.target || window.event.target;
        if ($$(ele).hasClass('swiper-slide-active') || ele.tagName == 'IMG') {
            const isNeedLogin = $$(ele).attr('data-login') || $(ele).parent().attr('data-login');
            if (!!Number(isNeedLogin) && !isLogin()) {
                f7.alert('此活动需要登录才能参加，请您先去登录！', '提示', loginViewShow)
                return;
            }
            const access_token = nativeEvent.getUserValue();
            let openUrl = $(ele).attr('data-href') || $(ele).parent().attr('data-href');
            isNeedLogin && (openUrl += `/${access_token}`);
            nativeEvent.goNewWindow(openUrl);
        }
    }

    /*
     * 调用微信登录
     * */
    if ($$('.weixin-login-btn').length) {
        $$('.weixin-login-btn')[0].onclick = nativeEvent.callWeixinLogin;
    }

    /*
     * 前往发布信息页面
     * */
    currentPage.find('.to-release-page')[0].onclick = () => {
        apiCount('btn_tabbar_post');
        if (!isLogin() && weixinData) {
            f7.alert('绑定手机号后，可以使用全部功能!', '温馨提示', loginViewShow);
            return;
        }
        view.router.load({
            url: 'views/release.html'
        })
    }

    /**
     * 担保交易提示
     * */
    currentPage.find('.home-nav-list').children('a')[1].onclick = () => {
        f7.alert('担保交易功能即将上线，敬请期待！');
        return;
    }

    // //存储数据
    // $$('#shareToWeixin').children().eq(0)[0].onclick = () => {
    //     const a = {
    //         sk:123,
    //         jj: 'qwe',
    //         ok: 'klk'
    //     };
    //     // nativeEvent.setDataToNative('sk', a);
    //     nativeEvent.setUerInfoToNative(a);
    // }

    // $$('#shareToWeixin').children().eq(1)[0].onclick = () => {
    //     console.log(nativeEvent.getDataToNative('sk'));
    // }

    // //分享
    // $$('#shareToWeixin').children().eq(2)[0].onclick = () => {
    //     // '//www.baidu.com/img/baidu_jgylogo3.gif'
    //     nativeEvent.shareInfoToWeixin(0, 'http://img.yudada.com/fileUpload/img/demand_img/20161128/1480322100_9070.png');
    // }

    // $$('#shareToWeixin').children().eq(3)[0].onclick = () => {
    //     // '//www.baidu.com/img/baidu_jgylogo3.gif'
    //     nativeEvent.shareInfoToWeixin(1, 'http://img.yudada.com/fileUpload/img/demand_img/20161128/1480322100_9070.png');
    // }

    // $$('#shareToWeixin').children().eq(4)[0].onclick = () => {
    //     // '//www.baidu.com/img/baidu_jgylogo3.gif'
    //     nativeEvent.shareInfoToWeixin(2, 'http://baidu.com', 'http://img.yudada.com/fileUpload/img/demand_img/20161128/1480322100_9070.png', '测试', '我是分享测试');
    // }

    // $$('#shareToWeixin').children().eq(5)[0].onclick = () => {
    //     // '//www.baidu.com/img/baidu_jgylogo3.gif'
    //     nativeEvent.shareInfoToWeixin(3, 'http://baidu.com', 'http://img.yudada.com/fileUpload/img/demand_img/20161128/1480322100_9070.png', '测试', '我是分享测试');
    // }

    // $$('#wei-xin-login')[0].onclick = () => {
    //     nativeEvent.callWeixinLogin();
    // }
}

export {
    homeInit
}
