import config from '../config';
import customAjax from '../middlewares/customAjax';
import store from '../utils/locaStorage';
import { selldetail } from '../utils/template';
import { timeDifference, centerShowTime } from '../utils/time';
import { home } from '../utils/template';
import { html } from '../utils/string';
import nativeEvent from '../utils/nativeEvent';
import { detailClickTip, veiwCert, timeout, detailMoreEvent } from '../utils/domListenEvent';

function buydetailInit(f7, view, page) {
    const $$ = Dom7;
    const { id } = page.query;
    const currentPage = $$($$('.pages>.page')[$$('.pages>.page').length - 1]);
    const shareBtn = $$('.selldetail-footer .icon-share');
    let isReleaseForMe = false;
    let demandInfo_;
    const { shareUrl, cacheUserinfoKey } = config;
    let currentUserId;
    let errorInfo;

    const callback = (data) => {
        if (data.data) {
            const {
                userInfo,
                demandInfo,
            } = data.data;
            const locaUserId = store.get(cacheUserinfoKey) && store.get(cacheUserinfoKey)['id'];
            const {
                specifications,
                stock,
                provinceName,
                describe,
                cityName,
                fishTypeName,
                price,
                checkTime,
                state,
                contactName,
                requirementPhone,
                refuseDescribe,
            } = demandInfo;
            const {
                id,
                enterpriseAuthenticationTime,
                personalAuthenticationState,
                enterpriseAuthenticationState,
                imgUrl,
                level
            } = userInfo;
            demandInfo_ = demandInfo;
            if (state == 0 || state == 2) {
                $$('.page-buydetail .selldetail-footer').addClass('delete');
                const lastHeader = $$($$('.navbar>div')[$$('.navbar>div').length - 1]);
                lastHeader.find('a.detail-more').hide();
            }
            id == locaUserId && $$('.page-buydetail .selldetail-footer').addClass('share-delete')
            errorInfo = refuseDescribe;
            let addClassName = (1 == state && 'active') || (0 == state && 'review') || (2 == state && 'faild') || null;
            addClassName && ($$('.page-buydetail').addClass(addClassName));
            currentUserId = userInfo['id'];
            html($$('.page-buydetail .goods-name'), fishTypeName, f7);
            html($$('.page-buydetail .goods-create-time'), timeDifference(checkTime), f7);
            html($$('.page-buydetail .selldetail-price'), price || '面议', f7);
            specifications ? html($$('.selldetail-spec'), specifications, f7) : $$('.selldetail-spec').parent().remove();
            stock ? html($$('.selldetail-stock'), stock, f7) : $$('.selldetail-stock').parent().remove();
            provinceName ? html($$('.selldetail-address'), `${provinceName} ${cityName}`, f7) : $$('.selldetail-address').parent().remove();
            describe ? html($$('.selldetail-description'), describe, f7) : $$('.selldetail-description').parent().remove();
            html($$('.page-buydetail .user-name>span'), contactName || '匿名用户', f7);
            level && $$('.page-buydetail .user-name>i').addClass(`iconfont icon-v${level}`);
            html($$('.page-buydetail .user-tell>b'), requirementPhone, f7);
            html($$('.page-buydetail .user-time'), centerShowTime(enterpriseAuthenticationTime), f7);
            1 == enterpriseAuthenticationState && $$('.buydetail-cert-info').addClass('company-identity').show();
            1 == personalAuthenticationState && $$('.buydetail-cert-info').addClass('individual-identity').show();

            personalAuthenticationState !== 1 && enterpriseAuthenticationState !== 1 && $$('.user-cert').remove();
            imgUrl && $$('.selldetail-userinfo img').attr('src', imgUrl + config['imgPath'](8));
            html($$('.tabbar-price'), price || '面议', f7);
        }
        f7.hideIndicator(300);
    }

    currentPage.find('.buy-detail-verify-faild ')[0].onclick = () => {
        f7.alert(errorInfo, '查看原因');
    }

    customAjax.ajax({
        apiCategory: 'demandInfo',
        api: 'getDemandInfo',
        data: [id],
        val: {
            id
        },
        type: 'get'
    }, callback);

    //delete release infomation.
    const deleteCallback = (data) => {
        const { code, message } = data;
        f7.hideIndicator();
        f7.alert(message || '删除成功', '提示', () => {
            if (1 == code) {
                const buyNum = parseInt($$('.user-buy-num').text()) - 1;
                $$('.other-list-info>a[href="./views/buydetail.html?id='+id+'"]').remove();
                $$('.user-buy-num').text(buyNum);
                view.router.back()
            }
        })
    }
    currentPage.find('.buydetail-delete-info')[0].onclick = () => {
        const token = store.get(cacheUserinfoKey)['token'];
        f7.confirm('你确定删除求购信息吗？', '删除发布信息', () => {
            f7.showIndicator();
            customAjax.ajax({
                apiCategory: 'demandInfo',
                api: 'deleteDemandInfo',
                data: [id, token],
                val: {
                    id
                },
                type: 'post'
            }, deleteCallback);
        })

    }

    //View more current user information
    currentPage.find('.selldetail-user-title')[0].onclick = () => {
        view.router.load({
            url: 'views/otherIndex.html?id=' + `${id}&currentUserId=${currentUserId}`,
        })
    }

    currentPage.find('.buydetail-call-phone')[0].onclick = () => {
        const { requirementPhone } = demandInfo_;
        requirementPhone && nativeEvent.contactUs(requirementPhone);
    }

    //view cert of new window.
    $$('.selldetail-cert-list').off('click', veiwCert).on('click', veiwCert);

    //share
    shareBtn.on('click', () => {
        let title = '';
        let messageTile = '';
        let html = '';
        const url_ = `${shareUrl}?id=${id}`;
        const {
            specifications,
            stock,
            provinceName,
            describe,
            cityName,
            fishTypeName,
            price,
            createTime,
            contactName,
            requirementPhone
        } = demandInfo_;

        title += `【求购】${fishTypeName}, ${provinceName||''}${cityName||''}`;
        messageTile += `我在鱼大大看到求购信息${fishTypeName||''}，`;
        messageTile += stock ? `${'库存 ' + stock}，` : '';
        messageTile += price ? `${'价格' + price}，` : '';
        messageTile += specifications ? `${'规格' + specifications}，` : '';
        messageTile += `，对你很有用，赶紧看看吧: ${url_}`;
        html += `求购${fishTypeName},`;
        html += stock ? `${'库存 ' + stock}，` : '';
        html += price ? `${'价格' + price}，` : '';
        html += specifications ? `${'规格' + specifications}，` : '';
        html += '点击查看更多信息~';
        nativeEvent.shareInfo(title, html, url_, messageTile);
    })

    $$('.navbar-inner.detail-text .detail-more').off('click', detailClickTip).on('click', detailClickTip);
}

module.exports = {
    buydetailInit,
}
