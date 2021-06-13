import * as crypto from 'crypto';
import Axios from 'axios';
import numeral from 'numeral';
import logger from './utils/winston.js';

const KWD_API_CUSTOMER_ID_ID = "2149621"
const KWD_API_ACCESS_LICENSE = "0100000000ba455067b11a0ee26c6bbbc1d0eff2e45281a0ca71cf57814d33cb14418b3999"
const KWD_API_SECRET_KEY = "AQAAAAC6RVBnsRoO4mxru8HQ7/LkJRWtG9fMQoWj4k5THeScCA=="

const open_CLI_ID = "9_DQrJsydLFTkdbgNSbw"
const open_KEY = "6LOf92MXPu"

const generate_signature = (timestamp, method, path) => {
    var sign =  `${timestamp}.${method}.${path}`;
    return crypto.createHmac('sha256', KWD_API_SECRET_KEY).update(sign).digest("base64");
}

export async function keyword(query, timestamp, showDetail) {
    const res = await Axios.request(
        {
            method: 'get',
            url: 'https://api.naver.com/keywordstool',
            params: {
                hintKeywords: query,
                showDetail: showDetail
            },
            headers: {
                "Content-Type": 'application/json; charset=UTF-8',
                "X-Timestamp": timestamp,
                "X-API-KEY": KWD_API_ACCESS_LICENSE,
                "X-Customer": KWD_API_CUSTOMER_ID_ID,
                "X-Signature": generate_signature(timestamp, 'GET', '/keywordstool')        
            }
        }
    );
    return res;
}

export async function blogPost(query) {
    const ans = await Axios.request(
        {
            method: 'get',
            url: 'https://openapi.naver.com/v1/search/blog',
            params: {
                query: query,
                display: 1
            },
            headers: {
                "X-Naver-Client-Id": open_CLI_ID,
                "X-Naver-Client-Secret": open_KEY,
            }
        }
    );
    return ans;
}

export const relatedKeywords = async (query) => {
    const timestamp = String(new Date().getTime());

    var ans;
    try {
        ans = await keyword(query, timestamp, "1");
    } catch(err) {
        console.log(err);
        return [false, false, false];
    }


    if(ans.data.keywordList.length === 0) {
        return [false, false, false];
    }

    const ansPc = (typeof ans.data.keywordList[0].monthlyPcQcCnt === 'number')? Number(ans.data.keywordList[0].monthlyPcQcCnt): 0;
    const ansMobile = (typeof ans.data.keywordList[0].monthlyMobileQcCnt === 'number')? Number(ans.data.keywordList[0].monthlyMobileQcCnt): 0;
    const ansTotal = ansPc + ansMobile;
    

    logger.info(ans.data.keywordList[0], ansPc, ansMobile, ansTotal);

    const selfData = {
        "pcCount": numeral(ansPc).format('0,0'),
        "mobileCount": numeral(ansMobile).format('0,0'),
        "total": numeral(ansTotal).format('0,0'),
    };

    var others;

    if(ans.data.keywordList.length < 11) {
        others = ans.data.keywordList
        .map((it) => it.relKeyword)
        .reduce((acc, cur) => {
            return acc + ', ' + cur;
        });
    }

    else {
        others = ans.data.keywordList
        .splice(1,11)
        .map((it) => it.relKeyword)
        .reduce((acc, cur) => {
            return acc + ', ' + cur;
        });
  
    }

    return [true, selfData, others];
}

export const simpleLoad = async (query) => {
    const timestamp = String(new Date().getTime());

    const res = [{}, {}, {}, {}, {}];

    const looker = new Promise(async (re, rej) => {
        var ans;
        try {
            ans = await keyword(query.reduce((prev, cur) => prev + ',' + cur.trim()), timestamp, "1");
        } catch(err) {
            return re(false);
        }

        
        for(var _it = 0; _it < query.length; _it+=1) {
            const it = query[_it];
            for(var idx = 0; idx < 5; idx+=1) {
                if(it === ans.data.keywordList[idx].relKeyword) {
                    res[_it].pc = numeral(ans.data.keywordList[idx].monthlyPcQcCnt).format('0,0');
                    res[_it].mobile = numeral(ans.data.keywordList[idx].monthlyMobileQcCnt).format('0,0');
                    res[_it].total = numeral(ans.data.keywordList[idx].monthlyPcQcCnt + ans.data.keywordList[idx].monthlyMobileQcCnt).format('0,0');
                }
            }
        }
        re(true);
    })

    await Promise.all([looker, ...query.map(async (it, idx) => {
        res[idx].blog = numeral(await blogPosts(it)).format('0,0');
    })]);

    return res;
}

export const blogPosts = async (query) => {
    var ans;
    try {
        ans = await blogPost(query)
    } catch(err) {
        console.log(err);
        return 0;
    }
    return ans.data.total;
}
