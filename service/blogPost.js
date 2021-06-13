import {blogPostRequest} from '../client/naver.js'

export default async (query) => {
    var ans;
    try {
        ans = await blogPostRequest(query)
    } catch(err) {
        console.log(err);
        return 0;
    }
    return ans.data.total;
}
