import numeral from 'numeral';
import {keywordRequest} from '../client/naver.js'

export default async (query) => {
    const timestamp = String(new Date().getTime());

    const res = [{}, {}, {}, {}, {}];

    const looker = new Promise(async (re, rej) => {
        var ans;
        try {
            ans = await keywordRequest(query.reduce((prev, cur) => prev + ',' + cur.trim()), timestamp, "1");
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
