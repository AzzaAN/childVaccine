import { Router, Request, Response } from 'express';
import { getClientFactory } from '../convector';
import { Vaccinerecord, Vaccinedetail } from 'vaccine-cc';
const x509 = require('x509');

const router: Router = Router();
let USERCERT: string;
// Check if the server identity has been enrolled successfully
//InitServerIdentity();

router.post('/login', async (req: Request, res: Response) => {
    console.log(req.body);
    let password = req.body.userId;
    let cntrl = await getClientFactory("admin");
    let user;
    if (req.body.username == "admin")
        if (password == "123") {
            try {
                user = await cntrl.isAuthinticated(req.body.username, password);
                console.log(user);
                USERCERT = req.body.username;
                res.status(200).send(user);
            } catch (ex) {
                console.log(ex.message, ex.stack);
                res.status(500).send(ex);
            }
        }
        else res.sendStatus(401);
    else {
        try {
            user = await cntrl.isAuthinticated(req.body.username, password);
            console.log(user);
            USERCERT = req.body.username;
            res.status(200).send(user[0]._type);
        } catch (ex) {
            console.log(ex.message, ex.stack);
            res.status(500).send(ex);
        }
    }
});

router.post('/create-record', async (req: Request, res: Response) => {
    try {
        let cntrl = await getClientFactory(USERCERT);
        let modelRaw = req.body;
        let model = new Vaccinerecord(modelRaw);
        let result = await cntrl.createRecord(model);
        res.json(result);
      } catch (ex) {
        console.log(ex.message, ex.stack);
        res.status(500).send(ex.stack);
      }
});

router.post('/create-detail', async (req: Request, res: Response) => {
    try {
        let cntrl = await getClientFactory(USERCERT);
        let params = req.query;
        console.log(params);
        let modelRaw = req.body;
        console.log(modelRaw);
        let model = new Vaccinedetail(modelRaw);
        let result = await cntrl.createDetail(model, params.recordId);
        res.json(result);
      } catch (ex) {
        console.log(ex.message, ex.stack);
        res.status(500).send(ex.stack);
      }
});

router.post('/register', async (req: Request, res: Response) => {
    console.log(USERCERT);

    if (USERCERT != 'admin') {
      console.log("USERCERT != 'admin'");
      return res.sendStatus(401);
    }
    try {
      let cntrl = await getClientFactory(USERCERT);
      let d = await getClientFactory(USERCERT);
      let adapter = d.adapter;

      const client: any = adapter['client'];

      // Name of the new user
      const enrollmentID = req.body.username;

      // Admin with permissions to create an user in the CA
      const adminUsername = USERCERT;
      const mspid = 'org1MSP';

      const admin =
        await client.getUserContext(adminUsername, true);

      if (!admin || !admin.isEnrolled()) {
        throw new Error(`Admin ${adminUsername} user is not enrolled ` +
          `when trying to register user ${enrollmentID}`);
      }

      const ca = client.getCertificateAuthority();

      const enrollmentSecret = await ca.register({
        enrollmentID,
        affiliation: 'org1'
      }, admin);

      const { key, certificate } = await ca.enroll({
        enrollmentSecret,
        enrollmentID: enrollmentID 
      });

      let newUser = await client.createUser({
        mspid,
        skipPersistence: false,
        username: enrollmentID,
        cryptoContent: {
          privateKeyPEM: key.toBytes(),
          signedCertPEM: certificate
        }
      });
      var fingerprint = x509.parseCert(certificate).fingerPrint;
      console.log(fingerprint);

      let ctrl = await getClientFactory(USERCERT);
      await ctrl.register(fingerprint, req.body.type, req.body.username, req.body.fullname, req.body.participantId, req.body.hospital);
      
      res.sendStatus(201);
    } catch (ex) {
      console.log(ex.message, ex.stack);
      res.status(500).send(ex.stack);
    }
});

router.get('/get-records', async (req: Request, res: Response) => {
    try {
        console.log("USERCERT: ",USERCERT);
        let cntrl = await getClientFactory(USERCERT);
        let params = req.query;
        
        let returnObject = await cntrl.getAllRecords(params.username, params.type);
        if (returnObject === undefined) {
          return res.status(404);
        }
        res.json(returnObject);
      } catch (ex) {
        console.log(ex.message, ex.stack);
        res.status(500).send(ex.stack);
      }
});

router.get('/get-details', async (req: Request, res: Response) => {
    try {
        console.log("USERCERT: ",USERCERT);
        let cntrl = await getClientFactory(USERCERT);
        let params = req.query;
        
        let returnObject = await cntrl.getAllDetails(params.recordId);
        if (returnObject === undefined) {
          return res.status(404);
        }
        res.json(returnObject);
      } catch (ex) {
        console.log(ex.message, ex.stack);
        res.status(500).send(ex.stack);
      }
});

router.post('/record-permission', async (req: Request, res: Response) => {
    try {
        console.log("USERCERT: ",USERCERT);
        let cntrl = await getClientFactory(USERCERT);
        let params = req.body;
        
        let returnObject = await cntrl.recordPermission(params.recordId, params.participantId, params.type);
        if (returnObject === undefined) {
          return res.status(404);
        }
        res.json(returnObject);
      } catch (ex) {
        console.log(ex.message, ex.stack);
        res.status(500).send(ex.stack);
      }
});

router.post('/doctor-note', async (req: Request, res: Response) => {
    try {
        console.log("USERCERT: ",USERCERT);
        let cntrl = await getClientFactory(USERCERT);
        let params = req.body;
        
        let returnObject = await cntrl.doctorNote(params.detailId, params.note);
        if (returnObject === undefined) {
          return res.status(404);
        }
        res.json(returnObject);
      } catch (ex) {
        console.log(ex.message, ex.stack);
        res.status(500).send(ex.stack);
      }
});

router.post('/physician-sign', async (req: Request, res: Response) => {
    try {
        console.log("USERCERT: ",USERCERT);
        let cntrl = await getClientFactory(USERCERT);
        let params = req.body;
        
        let returnObject = await cntrl.physicianSign(params.detailId, params.signed, params.nextVisit, params.remainingVaccines);
        if (returnObject === undefined) {
          return res.status(404);
        }
        res.json(returnObject);
      } catch (ex) {
        console.log(ex.message, ex.stack);
        res.status(500).send(ex.stack);
      }
});

router.get('/detail-history', async (req: Request, res: Response) => {
    try {
        console.log("USERCERT: ",USERCERT);
        let cntrl = await getClientFactory(USERCERT);
        let params = req.query;
        
        let returnObject = await cntrl.getDetailHistory(params.detailId);
        if (returnObject === undefined) {
          return res.status(404);
        }
        res.json(returnObject);
      } catch (ex) {
        console.log(ex.message, ex.stack);
        res.status(500).send(ex.stack);
      }
});

export const VaccineExpressController: Router = router;
