import * as yup from 'yup';
import {
  ConvectorModel,
  Default,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core-model';

export class Insurance extends ConvectorModel<Insurance> {
  @ReadOnly()
  @Required()
  public readonly type = 'Insurance';

  @Required()
  @Validate(yup.string())
  public username: string;

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