import {relatedKeywords, blogPosts, simpleLoad} from './ask.js';
import {subMonths} from 'date-fns';
import numeral from 'numeral';
import logger from './utils/winston.js';

const buildText = async (keyList) => {
    var text = "—————————————";
    
    if(keyList.length === 1) {
      const keyword = keyList[0];
      const [cal, blogCnt] = await Promise.all([relatedKeywords(keyword.trim()), blogPosts(keyword.trim())]);
  
      var text;
    
      logger.info(`${keyword.trim()}: ${cal[0]}`);
      
      if(!cal[0]) {
        text += `\n[ ${keyword} ] 검색 결과를 찾지 못했습니다.\n—————————————`;
      }
      text += `\n[ ${keyword} ] 검색 결과 입니다.\n\n# PC 검색량 : ${cal[1].pcCount}\n# MOBILE 검색량 : ${cal[1].mobileCount}\n# TOTAL 검색량 : ${cal[1].total}\n# 문서량 : ${numeral(blogCnt).format('0,0')}\n\n# 연관 검색어 : ${cal[2]}\n—————————————`;
    }
    else {
      if(keyList.length > 10) {
        const look1 = keyList.slice(0, 5);
        const look2 = keyList.slice(5, 10);
        const res = await simpleLoad(look1);
        const res2 = await simpleLoad(look2);
  
        for(var idx=0; idx < 5; idx += 1) {
          text += `\n[ ${keyList[idx]} ] 검색 결과 입니다.\n\n# PC 검색량 : ${res[idx].pc}\n# MOBILE 검색량 : ${res[idx].mobile}\n# TOTAL 검색량 : ${res[idx].total}\n# 문서량 : ${res[idx].blog}\n—————————————`;
        }
  
        for(var idx=0; idx < 5; idx += 1) {
          text += `\n[ ${keyList[idx+5]} ] 검색 결과 입니다.\n\n# PC 검색량 : ${res2[idx].pc}\n# MOBILE 검색량 : ${res2[idx].mobile}\n# TOTAL 검색량 : ${res2[idx].total}\n# 문서량 : ${res2[idx].blog}\n—————————————`;
        } 
      }
      else if(keyList.length > 5) {
        const look1 = keyList.slice(0, 5);
        const look2 = keyList.slice(5);
        const res = await simpleLoad(look1);
        const res2 = await simpleLoad(look2);
  
        for(var idx=0; idx < 5; idx += 1) {
          text += `\n[ ${keyList[idx]} ] 검색 결과 입니다.\n\n# PC 검색량 : ${res[idx].pc}\n# MOBILE 검색량 : ${res[idx].mobile}\n# TOTAL 검색량 : ${res[idx].total}\n# 문서량 : ${res[idx].blog}\n—————————————`;
        }
  
        for(var idx=0; idx < keyList.length - 5; idx += 1) {
          text += `\n[ ${keyList[idx+5]} ] 검색 결과 입니다.\n\n# PC 검색량 : ${res2[idx].pc}\n# MOBILE 검색량 : ${res2[idx].mobile}\n# TOTAL 검색량 : ${res2[idx].total}\n# 문서량 : ${res2[idx].blog}\n—————————————`;
        }
      }
      else {
        const look1 = keyList;
        const res = await simpleLoad(look1);
        
        for(var idx=0; idx < keyList.length; idx += 1) {
          text += `\n[ ${keyList[idx]} ] 검색 결과 입니다.\n\n# PC 검색량 : ${res[idx].pc}\n# MOBILE 검색량 : ${res[idx].mobile}\n# TOTAL 검색량 : ${res[idx].total}\n# 문서량 : ${res[idx].blog}\n—————————————`;
        }
      }
    }
    const today = new Date();
    const lastM = subMonths(today, 1);
  
    text += `\n# 데이터 통계 기간
  ${lastM.getFullYear()}.${lastM.getMonth()+1}.${lastM.getDate()} ~ ${today.getFullYear()}.${today.getMonth()+1}.${today.getDate()}`;
  
    if(keyList.length === 1) {
      return({
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "basicCard": {
                        "description": text,
                        "buttons": [
                            {
                                "action": "webLink",
                                "label": "네이버 링크",
                                "webLinkUrl": `https://search.naver.com/search.naver?query=${keyList[0]}`
                            }
                        ]
                    }
                }
            ]
        }
      })
    }
    else {
      return({
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "simpleText": {
                        "text": text
                    }
                }
            ]
        },
      });  
    }  
  }
  
export {buildText};
