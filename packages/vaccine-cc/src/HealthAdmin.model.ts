import * as yup from 'yup';
import {
  ConvectorModel,
  Default,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core-model';

export class Healthadmin extends ConvectorModel<Healthadmin> {
  @ReadOnly()
  @Required()
  public readonly type = 'HealthAdmin';

  @Required()
  @Validate(yup.string())
  public username: string;

  @Required()
  @Validate(yup.string())
  public participantId: string;

  @Required()
  @Validate(yup.boolean())
  public status: boolean;
}