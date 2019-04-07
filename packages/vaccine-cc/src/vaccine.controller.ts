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
    let isUsername = await Doctor.query(Doctor, { selector: { username: "hospital1" } });
    console.log("isUsername: ", isUsername);

    let ids = await Doctor.query(Doctor, { selector: { participantId: "1078081351" } });
    console.log("ids: ", ids);
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
    await this.isAuth(Participants.Healthadmin);

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

    await this.isAuth(Participants.Hospital);

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
  public async recordPermission(
    @Param(yup.string())
    recordId: string,
    @Param(yup.string())
    participantId: string,
    @Param(yup.string())
    type: Participants
  ) {
    
    await this.isAuth(Participants.Family);

    const family = await Family.getOne(this.sender);
    const exists = await Vaccinerecord.getOne(recordId);
    if (exists.family != family.id) {
      throw new Error('exists.family != family.id');
    }

    switch (type) {
      case Participants.Hospital:
        exists.hospital = participantId;
        break;
      case Participants.School:
        exists.school = participantId;
        break;
      case Participants.Insurance:
        exists.insurance = participantId;
        break;
      default:
        throw new Error(`type ${type} is not one of the Participants`);
    }

    console.log(exists);
    await exists.save();
    console.log(exists);
    return true;
  }

  @Invokable()
  public async getRecordByID(
    @Param(yup.string())
    id: string
  ) {
    let record = await Vaccinerecord.getOne<Vaccinerecord>(id);
    console.log(record);
    return record;
  }
  @Invokable()
  public async getAllRecords(
    @Param(yup.string())
    username: string,
    @Param(yup.string())
    type: Participants
  ) {
    console.log(this.sender);
    console.log(type);
    let family: any = await Family.query(Family, { selector: { username: username } });
    console.log(family);
    console.log(family[0].id);
    let r = await Vaccinerecord.query(Vaccinerecord, { selector: { family: family[0].id, hospital: this.sender } });
    console.log(r);
    switch (type) {
      case Participants.Healthadmin:{
        await this.isAuth(Participants.Healthadmin);
        return await Vaccinerecord.query(Vaccinerecord, { selector: { family: family[0].id } });
      }

      case Participants.Family:
        return await Vaccinerecord.query(Vaccinerecord, { selector: { family: this.sender } });

      case Participants.Hospital:
        return await Vaccinerecord.query(Vaccinerecord, { selector: { family: family[0].id, hospital: this.sender } });

      case Participants.Insurance:
        return await Vaccinerecord.query(Vaccinerecord, { selector: { family: family[0].id, insurance: this.sender } });

      case Participants.School:
        return await Vaccinerecord.query(Vaccinerecord, { selector: { family: family[0].id, school: this.sender } });

      case Participants.Doctor:
        {
          const existing = await Doctor.getOne(this.sender);
          if (!existing.id) {
            throw new Error('!existing');
          }
          return await Vaccinerecord.query(Vaccinerecord, { selector: { family: family[0].id, hospital: existing.hospital } });
        }

      case Participants.Physician:
        {
          const existing = await Physician.getOne(this.sender);
          if (!existing.id) {
            throw new Error('!existing');
          }
          return await Vaccinerecord.query(Vaccinerecord, { selector: { family: family[0].id, hospital: existing.hospital } });
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
    await this.isAuth(Participants.Healthadmin);
    let isUsername:any = await Doctor.query(Doctor, { selector: { username: username } });

    let isParticipantId:any = await Doctor.query(Doctor, { selector: { participantId: participantId } });
    if(isUsername.id || isUsername.length){
      throw new Error(`username ${id} already exists`);
    }
    if(isParticipantId.id || isParticipantId.length){
      throw new Error(`ParticipantId ${id} already exists`);
    }
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
    await this.isAuth(Participants.Healthadmin);
    return Family.query(Family, { selector: { username: username } });
  }

  @Invokable()
  public async getHospitalById(
    @Param(yup.string())
    username: string
  ) {
    await this.isAuth(Participants.Family);
    return Hospital.query(Hospital, { selector: { username: username } });
  }

  @Invokable()
  public async getInsuranceById(
    @Param(yup.string())
    username: string
  ) {
    await this.isAuth(Participants.Family);
    return Insurance.query(Insurance, { selector: { username: username } });
  }

  @Invokable()
  public async getSchoolById(
    @Param(yup.string())
    username: string
  ) {
    await this.isAuth(Participants.Family);
    return School.query(School, { selector: { username: username } });
  }

  @Invokable()
  public async getDocById(
    @Param(yup.string())
    username: string
  ) {
    await this.isAuth(Participants.Hospital);
    return Doctor.query(Doctor, { selector: { username: username } });
  }

  @Invokable()
  public async getPhysicianById(
    @Param(yup.string())
    username: string
  ) {
    await this.isAuth(Participants.Hospital);
    return Physician.query(Physician, { selector: { username: username } });
  }

  private async isAuth(type: Participants) {
    const participant: any = this.findParticipant(type, true);
    const existing = await participant.query(participant, { selector: { id: this.sender, type: type } });
    
    console.log("isAuth: ", existing);
    if (!existing.length) {
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