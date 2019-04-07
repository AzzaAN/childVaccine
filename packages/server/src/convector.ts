import { join, resolve } from "path";
import { keyStore, identityName, channel, chaincode, networkProfile, identityId } from './env';
import * as fs from 'fs';
import { FabricControllerAdapter } from '@worldsibu/convector-adapter-fabric';
import { ClientFactory } from '@worldsibu/convector-core';

import { VaccineController, Healthadmin } from 'vaccine-cc';

export async function getClientFactory(USERCERT) {
    //await setUserContext(USERCERT);
    console.log(USERCERT);
    const adapter = fabricAdapter(USERCERT);
    await adapter.init();
    return ClientFactory(VaccineController, adapter);
}

export async function setUserContext(USERCERT) {
    const contextPath = join(keyStore + '/' + USERCERT);
    fs.readFile(contextPath, 'utf8', async function (err, data) {
        if (err) {
            throw new Error(`Context in ${contextPath} doesn't exist. Make sure that path resolves to your key stores folder`);
        } else {
            console.log('Context path with cryptographic materials exists');
        }
    });
}

function fabricAdapter(USERCERT) {
    return new FabricControllerAdapter({
        txTimeout: 300000,
        user: USERCERT,
        channel,
        chaincode,
        keyStore: resolve(__dirname, '/Users/azza/hyperledger-fabric-network/.hfc-org1'),
        networkProfile: resolve(__dirname, '/Users/azza/hyperledger-fabric-network/network-profiles/org1.network-profile.yaml'),
        userMspPath: resolve(__dirname, '/Users/azza/hyperledger-fabric-network/.hfc-org1')
    });
}