import * as yup from 'yup';
import {
  ConvectorModel,
  Default,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core-model';

export class School extends ConvectorModel<School> {
  @ReadOnly()
  @Required()
  public readonly type = 'School';

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