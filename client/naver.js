import * as crypto from 'crypto';
import Axios from 'axios';

const KWD_API_CUSTOMER_ID_ID = "2149621"
const KWD_API_ACCESS_LICENSE = "0100000000ba455067b11a0ee26c6bbbc1d0eff2e45281a0ca71cf57814d33cb14418b3999"
const KWD_API_SECRET_KEY = "AQAAAAC6RVBnsRoO4mxru8HQ7/LkJRWtG9fMQoWj4k5THeScCA=="

const open_CLI_ID = "9_DQrJsydLFTkdbgNSbw"
const open_KEY = "6LOf92MXPu"

const generate_signature = (timestamp, method, path) => {
    var sign =  `${timestamp}.${method}.${path}`;
    return crypto.createHmac('sha256', KWD_API_SECRET_KEY).update(sign).digest("base64");
}

export async function keywordRequest(query, timestamp, showDetail) {
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

export async function blogPostRequest(query) {
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