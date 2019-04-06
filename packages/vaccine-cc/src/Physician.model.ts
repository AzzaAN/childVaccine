import * as yup from 'yup';
import {
  ConvectorModel,
  Default,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core-model';

export class Physician extends ConvectorModel<Physician> {
  @ReadOnly()
  @Required()
  public readonly type = 'Physician';

  @Required()
  @Validate(yup.string())
  public username: string;

  @Validate(yup.string())
  public hospital: string;
  
  @Required()
  @Validate(yup.string())
  public fullname: string;
  
  @Required()
  @Validate(yup.string())
  public participantId: string;
  
  @Required()
  @Validate(yup.boolean())
  public status: boolean;
}