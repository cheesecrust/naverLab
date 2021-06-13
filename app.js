import Express from 'express';
import cors from 'cors';
import logger from './utils/winston.js';
import {buildText} from './naver.js'

const app = Express();

const errorHandler = (error,_req,res,_next) => {
  logger.error("error");
  res.status(500).send("server-side error occured");
  return false;
}

app.use(cors());
app.use(Express.json());
app.use(Express.urlencoded({extended: true}));

app.get('/', (_, res) => {
  res.status(200).send("healthcheck");
});


app.post('/utterance', async (req, res) => {

  const keywords = req.body.userRequest.utterance;
  const keyList = keywords.replace(/\s/gi, '').split(',');
  const ans = await buildText(keyList);

  res.status(200).send(ans);
  
  return true;
});

app.use(errorHandler);

app.listen(3000, () => {
  logger.info('server on port 3000');
  logger.error('server on port 3000');
  console.log("server on port 3000");
});

