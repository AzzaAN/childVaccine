import * as yup from 'yup';
import {
  ConvectorModel,
  Default,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core-model';

export class Vaccinerecord extends ConvectorModel<Vaccinerecord> {
  @ReadOnly()
  @Required()
  public readonly type = 'VaccineRecord';

  @Required()
  @Validate(yup.string())
  public family: string;

  @Required()
  @Validate(yup.string())
  public childName: string;

  @Required()
  @Validate(yup.string())
  public childBirthDate: string;

  @Required()
  @Validate(yup.string())
  public childFileNumber: string;

  @Required()
  @Validate(yup.string())
  public childGender: string;

  @Validate(yup.string())
  public hospital: string;

  @Validate(yup.string())
  public school: string;

  @Validate(yup.string())
  public insurance: string;

  @Validate(yup.array(yup.string()))
  public vaccineDetails: Array<string>;
}