import * as yup from 'yup';
import {
  ConvectorModel,
  Default,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core-model';

export class Vaccinedetail extends ConvectorModel<Vaccinedetail> {
  @ReadOnly()
  @Required()
  public readonly type = 'VaccineDetail';

  @Required()
  @Validate(yup.string())
  public vaccineName: string;

  @Required()
  @Validate(yup.string())
  public childAge: string;

  @Required()
  @Validate(yup.string())
  public childTemperature: string;

  @Required()
  @Validate(yup.string())
  public childWeight: string;

  @Required()
  @Validate(yup.string())
  public childHeight: string;

  @Required()
  @Validate(yup.string())
  public doc: string;

  @Required()
  @Validate(yup.string())
  public physician: string;

  @Validate(yup.string())
  public note: string;

  @Validate(yup.boolean())
  public signed: boolean;  

  @Validate(yup.string())
  public nextVisit: string;
  
  @Validate(yup.string())
  public remainingVaccines: string;
}