import * as yup from 'yup';
import { ChaincodeTx } from '@worldsibu/convector-platform-fabric';
import {
  Controller,
  ConvectorController,
  Invokable,
  Param
} from '@worldsibu/convector-core';
import { History } from '@worldsibu/convector-core-model';
import { Vaccinerecord } from './VaccineRecord.model';
import { Vaccinedetail } from './VaccineDetail.model';
import { Family } from './Family.model';
import { Healthadmin } from './HealthAdmin.model';
import { Hospital } from './Hospital.model';
import { Physician } from './Physician.model';
import { School } from './School.model';
import { Insurance } from './Insurance.model';
import { Doctor } from './Doctor.model';

export enum Participants {
  Doctor = "Doctor",
  Family = "Family",
  Hospital = "Hospital",
  Insurance = "Insurance",
  School = "School",
  Physician = "Physician",
  Healthadmin = "Healthadmin"
}

@Controller('vaccine')
export class VaccineController extends ConvectorController<ChaincodeTx> {

  @Invokable()
  public async isAuthinticated(
    @Param(yup.string())
    username: string,
    @Param(yup.string())
    userId: string,
    @Param(yup.string())
    type: Participants
  ) {
    console.log(userId);
    console.log(type);
    if (username == "admin") {
      const existing: any = await Healthadmin.query(Healthadmin, { selector: { username: username, participantId: userId } });
      if (!existing || !existing.length) {
        let healthAdmin = new Healthadmin();
        healthAdmin.id = this.sender;
        healthAdmin.username = username;
        healthAdmin.participantId = userId;
        healthAdmin.status = true;

        console.log(healthAdmin);
        await healthAdmin.save();
      }
      return new Healthadmin().type;
    }
    const participant: any = this.findParticipant(type, true);
    const existing = await participant.query(participant, { selector: { username: username, participantId: userId } });
    console.log(participant);
    console.log(existing);
    if (!existing || !existing.length) {
      throw new Error(`!existing`);
    }
    return existing;
  }

  @Invokable()
  public async createRecord(
    @Param(Vaccinerecord)
    vaccinerecord: Vaccinerecord
  ) {
    this.isAuth(Participants.Healthadmin);

    const exists = await Vaccinerecord.getOne(vaccinerecord.id);
    if (exists.id) {
      throw new Error('There is already one Vaccinerecord with that unique id');
    }

    vaccinerecord.id = this.tx.stub.generateUUID("record");
    console.log(vaccinerecord);
    await vaccinerecord.save();
  }

  @Invokable()
  public async createDetail(
    @Param(Vaccinedetail)
    vaccinedetail: Vaccinedetail,
    @Param(Vaccinerecord)
    vaccinerecord: Vaccinerecord
  ) {

    this.isAuth(Participants.Hospital);

    const exists = await Vaccinedetail.getOne(vaccinedetail.id);
    if (exists.id === vaccinedetail.id) {
      throw new Error('There is already one Vaccinedetail with that unique id');
    }

    vaccinedetail.id = this.tx.stub.generateUUID("detail");
    console.log(vaccinedetail);
    await vaccinedetail.save();

    vaccinerecord.vaccineDetails.push(vaccinedetail.id);
    console.log(vaccinerecord);
    await vaccinerecord.save();
  }

  @Invokable()
  public async getAllRecords(
    @Param(yup.string())
    type: Participants
  ) {
    switch (type) {
      case Participants.Family:
        return await Vaccinerecord.query(Vaccinerecord, { selector: { family: this.sender } });

      case Participants.Hospital:
        return await Vaccinerecord.query(Vaccinerecord, { selector: { hospital: this.sender } });

      case Participants.Insurance:
        return await Vaccinerecord.query(Vaccinerecord, { selector: { insurance: this.sender } });

      case Participants.School:
        return await Vaccinerecord.query(Vaccinerecord, { selector: { school: this.sender } });

      case Participants.Doctor:
        {
          const existing = await Doctor.getOne(this.sender);
          if (!existing.id) {
            throw new Error('!existing');
          }
          return await Vaccinerecord.query(Vaccinerecord, { selector: { hospital: existing.hospital } });
        }

      case Participants.Physician:
        {
          const existing = await Physician.getOne(this.sender);
          if (!existing.id) {
            throw new Error('!existing');
          }
          return await Vaccinerecord.query(Vaccinerecord, { selector: { hospital: existing.hospital } });
        }

      default:
        throw new Error(`type ${type} is not one of the Participants`);
    }
  }

  @Invokable()
  public async getAllDetails(
    @Param(yup.string())
    recordId: string
  ) {
    const vaccinerecord = await Vaccinerecord.getOne(recordId);
    let detail: Vaccinedetail[];
    for (let detailId in vaccinerecord.vaccineDetails) {
      detail.push(await Vaccinedetail.getOne(detailId))
    }
    return await detail;
  }

  @Invokable()
  public async getRecordById(
    @Param(yup.string())
    recordId: string,
    @Param(yup.string())
    type: Participants
  ) {
    const vaccinerecord = await Vaccinerecord.getOne(recordId);
    switch (type) {
      case Participants.Family:
        if (vaccinerecord.family != this.sender) throw new Error(`Unauthorized`);
        else break;

      case Participants.Hospital:
        if (vaccinerecord.hospital != this.sender) throw new Error(`Unauthorized`);
        else break;

      case Participants.Insurance:
        if (vaccinerecord.insurance != this.sender) throw new Error(`Unauthorized`);
        else break;

      case Participants.School:
        if (vaccinerecord.school != this.sender) throw new Error(`Unauthorized`);
        else break;

      default:
        throw new Error(`type ${type} is not one of the Participants`);
    }
    return vaccinerecord;
  }

  @Invokable()
  public async getRecordHistory(
    @Param(yup.string())
    id: string
  ): Promise<History<Vaccinerecord>[]> {
    let item = await Vaccinerecord.getOne(id);
    return await item.history();
  }

  @Invokable()
  public async getDetailHistory(
    @Param(yup.string())
    id: string
  ): Promise<History<Vaccinedetail>[]> {
    let item = await Vaccinedetail.getOne(id);
    return await item.history();
  }

  //////////////////////////

  @Invokable()
  public async register(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    type: Participants,
    @Param(yup.string())
    username: string,
    @Param(yup.string())
    fullname: string,
    @Param(yup.string())
    participantId: string,
    @Param(yup.string())
    hospital: string
  ) {
    this.isAuth(Participants.Healthadmin);
    console.log(id);
    console.log(type);
    let participantInstance = this.findParticipant(type, true);
    let participant = this.findParticipant(type, false)
    console.log(participantInstance);
    let existing = await participantInstance.getOne(id);
    if (!existing || !existing.id) {

      participant.id = id;
      participant.username = username;
      participant.fullname = fullname;
      participant.participantId = participantId;
      participant.status = true;

      if (type == Participants.Doctor || type == Participants.Physician)
        participant.hospital = hospital;

      console.log(participant);
      await participant.save();
    } else {
      throw new Error(`Identity ${id} already exists`);
    }
  }

  @Invokable()
  public async getFamilyById(
    @Param(yup.string())
    username: string
  ) {
    this.isAuth(Participants.Healthadmin);
    return Family.query(Family, { selector: { username: username } });
  }

  @Invokable()
  public async getHospitalById(
    @Param(yup.string())
    username: string
  ) {
    this.isAuth(Participants.Family);
    return Hospital.query(Hospital, { selector: { username: username } });
  }

  @Invokable()
  public async getInsuranceById(
    @Param(yup.string())
    username: string
  ) {
    this.isAuth(Participants.Family);
    return Insurance.query(Insurance, { selector: { username: username } });
  }

  @Invokable()
  public async getSchoolById(
    @Param(yup.string())
    username: string
  ) {
    this.isAuth(Participants.Family);
    return School.query(School, { selector: { username: username } });
  }

  @Invokable()
  public async getDocById(
    @Param(yup.string())
    username: string
  ) {
    this.isAuth(Participants.Hospital);
    return Doctor.query(Doctor, { selector: { username: username } });
  }

  @Invokable()
  public async getPhysicianById(
    @Param(yup.string())
    username: string
  ) {
    this.isAuth(Participants.Hospital);
    return Physician.query(Physician, { selector: { username: username } });
  }

  private async isAuth(type: Participants) {
    const participant: any = this.findParticipant(type, true);
    const existing = await participant.getOne(this.sender);
    if (!existing.id) {
      throw new Error('Unauthorized');
    }
  }

  private findParticipant(type: Participants, isInstance: boolean): any {
    console.log(type);
    console.log(isInstance);

    switch (type) {
      case Participants.Doctor:
        return isInstance ? Doctor : new Doctor();

      case Participants.Family:
        return isInstance ? Family : new Family();

      case Participants.Hospital:
        return isInstance ? Hospital : new Hospital();

      case Participants.Physician:
        return isInstance ? Physician : new Physician();

      case Participants.Insurance:
        return isInstance ? Insurance : new Insurance();

      case Participants.School:
        return isInstance ? School : new School();

      case Participants.Healthadmin:
        return isInstance ? Healthadmin : new Healthadmin();

      default:
        throw new Error(`type ${type} is not one of the Participants`);
    }
  }
}