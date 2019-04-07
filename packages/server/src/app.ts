// @ts-check
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { port as serverPort } from './env';
import { VaccineExpressController } from './controllers';
const cors = require('cors')

const app: express.Application = express();
const port = serverPort;

app.use(bodyParser.urlencoded({
  extended: true,
  limit: '40mb'
}));
app.use(bodyParser.json({ limit: '40mb' }));

app.use('/vaccine', VaccineExpressController);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// var corsOptions = {
//   origin: 'http://localhost:4200',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
// }

// app.use(cors(corsOptions));

app.listen(port, () =>
  console.log(`Server started in port ${port}`));

module.exports = app;