import numeral from 'numeral';
import logger from '../utils/winston.js';
import {keywordRequest} from '../client/naver.js';

export default async (query) => {
    const timestamp = String(new Date().getTime());

    var ans;
    try {
        ans = await keywordRequest(query, timestamp, "1");
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
