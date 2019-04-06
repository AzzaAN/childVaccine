// tslint:disable:no-unused-expression
import { join } from 'path';
import { expect } from 'chai';
import * as uuid from 'uuid/v4';
import { MockControllerAdapter } from '@worldsibu/convector-adapter-mock';
import { ClientFactory, ConvectorControllerClient } from '@worldsibu/convector-core';
import 'mocha';

import { Vaccine, VaccineController } from '../src';

describe('Vaccine', () => {
  let adapter: MockControllerAdapter;
  let vaccineCtrl: ConvectorControllerClient<VaccineController>;
  
  before(async () => {
    // Mocks the blockchain execution environment
    adapter = new MockControllerAdapter();
    vaccineCtrl = ClientFactory(VaccineController, adapter);

    await adapter.init([
      {
        version: '*',
        controller: 'VaccineController',
        name: join(__dirname, '..')
      }
    ]);
  });
  
  it('should create a default model', async () => {
    const modelSample = new Vaccine({
      id: uuid(),
      name: 'Test',
      created: Date.now(),
      modified: Date.now()
    });

    await vaccineCtrl.create(modelSample);
  
    const justSavedModel = await adapter.getById<Vaccine>(modelSample.id);
  
    expect(justSavedModel.id).to.exist;
  });
});