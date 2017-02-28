import customAjax from '../middlewares/customAjax';
import config from '../config';
import {trim, html} from '../utils/string';
import nativeEvent from '../utils/nativeEvent';
import store from '../utils/localStorage';
import invitationModel from './service/invitation/invitationModel';

function loginCodeInit(f7, view, page) {
    f7.hideIndicator();
    const {phone} = page.query;
    const {voiceCodeWaitTime} = config;
    const currentPage = $$($$('.view-login .pages>.page')[$$('.view-login .pages>.page').length - 1]);
    const input = currentPage.find('.login-code-write').children('input')[0];
    const vioceBtn = currentPage.find('.login-code-voice')[0];
    const subBtn = currentPage.find('.login-code-submit')[0];
    let isPass = false;
    let isSend = false;
    let isCountDown = false;
    let _voiceCodeWaitTime = voiceCodeWaitTime;
    const weixinData = nativeEvent.getDataToNative('weixinData');
    currentPage.find('.login-code-phone').text(phone);
    let isActiveClick = false;

    const getCodeCallback = (data) => {
        isActiveClick = false;
        if (data.code == 1) {
            nativeEvent.nativeToast(1, '短信验证码发送成功,请您注意查收!');
            setTimeout(() => {
                input.focus();
            }, 500)
        } else {
            isActiveClick = true;
            vioceBtn.click();
        }
    };

    //get code message.
    customAjax.ajax({
        apiCategory: 'phoneCode',
        data: [phone, 1],
        type: 'get',
        noCache: true,
        isMandatory: true
    }, getCodeCallback);

    input.oninput = () => {
        const val = trim(input.value);
        let classes = subBtn.className;
        if (/^\d{4}$/.test(val) && val.length == 4) {
            classes += ' on';
            subBtn.className = classes;
            input.blur();
            isPass = true;
            userLogin();
        } else if (val && val.length >= 4) {
            input.value = val.substr(0, 4);
        } else {
            subBtn.className = classes.replace(' on', '');
            isPass = false;
        }
    }

    const voiceCountDown = () => {
        isCountDown = true;
        const text = `接收语音验证码大概需要${_voiceCodeWaitTime}秒`;
        html(vioceBtn, text, f7);
        _voiceCodeWaitTime--;
    };

    const callback = (data) => {
        isSend = false;
        const {code} = data;
        if (1 == code) {
            nativeEvent.nativeToast(1, isActiveClick ? '当前使用短信服务的人过多，已为你发送语音验证码!' : '语音验证码已拨出，请注意接听！');
            const setIntervalId = setInterval(() => {
                if (_voiceCodeWaitTime < 0) {
                    clearInterval(setIntervalId);
                    isCountDown = false;
                    _voiceCodeWaitTime = voiceCodeWaitTime;
                    html(vioceBtn, '收不到验证码？点击这里', f7);
                    return;
                }
                voiceCountDown();
            }, 1000)
            setTimeout(() => {
                input.focus();
            }, 500)
        } else {
            nativeEvent.nativeToast(0, '当前使用人数过多，请稍后再试!');
            view.router.back();
        }
        f7.hideIndicator();
    }

    /**
     * 获取语音验证码
     * */
    vioceBtn.onclick = () => {
        if (isCountDown) {
            return;
        }
        isSend = true;
        f7.showIndicator();
        customAjax.ajax({
            apiCategory: 'phoneCode',
            data: [phone, 2],
            type: 'get',
            noCache: true,
            isMandatory: true
        }, callback);
    };

    weixinData && currentPage.find('.login-code-submit').text('绑定手机号');

    const loginCallBack = (result) => {
        const {code, message, data} = result;
        if (1 === code) {
            nativeEvent.setDataToNative("accessToken", data.token);
            store.set("accessToken", data.token);
            getKey(data.token, '', '', 0);
            if (1 == store.get("login-invitation")) {
                invitationModel.f7 = f7;
                invitationModel.acceptInvitation(code, () => {
                    store.set("login-invitation", 0);
                });
            }
        } else {
            f7.alert(message);
        }
    };

    /**
     * 调用native登录接口
     * */
    let userLogin = () => {
        if (!isPass || isSend) {
            return;
        }
        f7.showPreloader(weixinData ? '绑定手机号中...' : '登录中...');
        // nativeEvent.nativeLogin(phone, input.value);
        // 登录
        customAjax.ajax({
            apiCategory: 'auth',
            data: {
                phone: phone,
                code: input.value
            },
            paramsType: 'application/json',
            type: 'post',
            noCache: true,
            isMandatory: true
        }, loginCallBack);

    };
    subBtn.onclick = userLogin;
}

export {
    loginCodeInit
};
