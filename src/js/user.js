import { isLogin } from '../middlewares/loginMiddle';
import store from '../utils/locaStorage';
import customAjax from '../middlewares/customAjax';
import config from '../config';
import { loginSucc } from '../middlewares/loginMiddle';
import nativeEvent from '../utils/nativeEvent';
import userUtils from '../utils/viewsUtil/userUtils';
import { goHome, goMyCenter, myListBuy, myListSell } from '../utils/domListenEvent';

function userInit(f7, view, page) {
    let loginStatus = isLogin();
    const { cacheUserinfoKey, servicePhoneNumber } = config;
    let userInfomation = store.get(cacheUserinfoKey);
    const emptyFun = () => {
        return;
    }

    const getBussesInfo = () => {
        customAjax.ajax({
            apiCategory: 'userInfo',
            api: 'getUserCertificate',
            data: [userInfomation.token],
            type: 'get',
            val: {
                token: userInfomation['id']
            }
        }, userUtils.getBussesInfoCallback);
    }

    const loginCallback = (data) => {
        const { code, message } = data;
        if (code == 1) {
            let _userInfo = data.data;
            _userInfo['token'] = userInfomation['token'];
            store.set(cacheUserinfoKey, _userInfo);
            userInfomation = _userInfo;
            loginStatus = isLogin();
            loginSucc(userInfomation, getBussesInfo);
        } else {
            f7.alert(message);
        }
    }
    if (loginStatus) {
        loginSucc(userInfomation, emptyFun);
        customAjax.ajax({
            apiCategory: 'userInfo',
            api: 'getUserInfo',
            data: [userInfomation.token],
            type: 'get',
            noCache: true,
        }, loginCallback);
    }

    //if login succ, replace to change user info page, else replace to login page.
    $$('.user-header').off('click', goMyCenter).on('click', goMyCenter);

    //cilck identity authentication.
    $$('.user-cert-type>div').eq(0).click(() => {
        let personalAuthenticationState, enterpriseAuthenticationState;
        if (userInfomation) {
            personalAuthenticationState = userInfomation['personalAuthenticationState'];
            enterpriseAuthenticationState = userInfomation['enterpriseAuthenticationState'];
        }
        if (!loginStatus) {
            f7.alert('您还没登录，请先登录。', '温馨提示', () => {
                view.router.load({
                    url: 'views/login.html',
                })
            })
        } else {
            if (-1 == personalAuthenticationState && -1 == enterpriseAuthenticationState) {
                view.router.load({
                    url: 'views/identityAuthentication.html'
                })

            } else {
                f7.popup('.popup-individual-authentication');
            }

        }
    })

    //cilck upload fish cert.
    $$('.user-cert-type>div').eq(1).click(() => {
        if (!loginStatus) {
            f7.alert('您还没登录，请先登录。', '温馨提示', () => {
                view.router.load({
                    url: 'views/login.html',
                })
            })
        } else {
            view.router.load({
                url: 'views/fishCert.html',
            })
        }
    })

    //click contact us button.
    $$('.user-help-list .first').click(() => {
        // nativeEvent.apiCount();
        nativeEvent.contactUs(servicePhoneNumber);
    })

    //view my release list.
    $$('.user-info-list>a.my-buy-list').off('click', myListBuy).on('click', myListBuy);
    $$('.user-info-list>a.my-sell-list').off('click', myListSell).on('click', myListSell);

    //to identity authentication re submit audit information
    $$('.individual-faild>a.button').once('click', () => {
        // f7.closeModal('.popup-individual-authentication', function() {
        view.router.load({
                url: 'views/identityAuthentication.html',
            })
            // });
    })

    //cancle authentication.
    const cancleIndividualCallback = (data) => {
        const { code, message } = data;
        f7.alert(message, '提示', () => {
            f7.closeModal('.popup-individual-authentication');
            view.router.load({
                url: 'views/user.html'
            })
        })
    }
    $$('.cancel-individual-verify-buuton').once('click',() => {
        customAjax.ajax({
            apiCategory: 'userInfo',
            api: 'cancelPersonalAuthentication',
            data: [userInfomation['token']],
            type: 'post',
            noCache: true,
        }, cancleIndividualCallback);
    })

    const cancleCompanyCallback = (data) => {
        const { code, message } = data;
        f7.alert(message, '提示', () => {
            f7.closeModal('.popup-individual-authentication');
            view.router.load({
                url: 'views/user.html'
            })
        })
    }
    $$('.cancel-company-verify-buuton').once('click',() => {
        customAjax.ajax({
            apiCategory: 'userInfo',
            api: 'cancelEnterpriseAuthentication',
            data: [userInfomation['token']],
            type: 'post',
            noCache: true,
        }, cancleCompanyCallback);
    })

    //go home page;
    $$('.href-go-home').off('click', goHome).on('click', goHome);
}

module.exports = {
    userInit,
}
