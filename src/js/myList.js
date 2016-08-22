import store from '../utils/locaStorage';
import config from '../config';
import { selldetail, home } from '../utils/template';
import nativeEvent from '../utils/nativeEvent';
import {html} from '../utils/string';
import { trim } from '../utils/string';
import customAjax from '../middlewares/customAjax';

function myListInit(f7, view, page) {
    const $$ = Dom7;
    const { type } = page.query;
    const {pageSize, cacheUserinfoKey} = config;
    const {id} = store.get(cacheUserinfoKey);
    let pageNo = 1;
    $$('.my-list-title')[0].innerText = 2 == type ? '我的出售' : '我的求购';

    const callback = (data) => {
    	const {code, message} = data;
    	if(code !== 1){
    		f7.alert(message, '提示');
    		return;
    	}
    	let otehrHtml = '';
    	$$.each(data.data.list, (index, item) => {
    		if(2 == type){
    			otehrHtml += home.cat(item);
    		}else{
    			otehrHtml += home.buy(item);
    		}
    	})
    	html($$('.other-list-info'), otehrHtml, f7);
    	setTimeout(() => {
    		$$('img.lazy').trigger('lazy');
    	},400)
    }

    customAjax.ajax({
        apiCategory: 'demandInfo',
        api: 'getMyDemandInfoList',
        data: [id, pageSize, pageNo],
        type: 'get',
        val: { type }
    }, callback);
}

module.exports = {
    myListInit,
}