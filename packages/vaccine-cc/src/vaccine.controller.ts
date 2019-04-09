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

export enum Errors {
  Login = "Username or Password incorrect",
  Unauthorized = "Unauthorized for this action",
  Username = "Username already exists",
  ParticipantId = "Participant ID already exists",
  Hospital = "Hospital username incorrect",
  School = "School username incorrect",
  Insurance = "Physician username incorrect",
  RecordsAuth = "Unauthorized to any records by this family"
}

@Controller('vaccine')
export class VaccineController extends ConvectorController<ChaincodeTx> {

  @Invokable()
  public async isAuthinticated(
    @Param(yup.string())
    username: string,
    @Param(yup.string())
    userId: string
  ) {
    console.log(userId);
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
    const existing:any = await Doctor.query(Doctor, { selector: { username: username, participantId: userId } });
    console.log(existing);
    if (!existing || !existing.length) {
      throw new Error(Errors.Login);
    }
    return existing;
  }

  @Invokable()
  public async checkUsernameAndID(
    @Param(yup.string())
    username: string,
    @Param(yup.string())
    userId: string
  ) {
    await this.isAuth(Participants.Healthadmin);
    let isUsername: any = await Doctor.query(Doctor, { selector: { username: username } });

    let isParticipantId: any = await Doctor.query(Doctor, { selector: { participantId: userId } });
    if (isUsername.id || isUsername.length) {
      throw new Error(Errors.Username);
    }
    if (isParticipantId.id || isParticipantId.length) {
      throw new Error(Errors.ParticipantId);
    }
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
    @Param(yup.string())
    recordId: string
  ) {

    await this.isAuth(Participants.Hospital);

    const exists = await Vaccinedetail.getOne(vaccinedetail.id);
    if (exists.id === vaccinedetail.id) {
      throw new Error('There is already one Vaccinedetail with that unique id');
    }

    let vaccinerecord = await Vaccinerecord.getOne(recordId);

    vaccinedetail.id = this.tx.stub.generateUUID("detail");
    console.log(vaccinedetail);
    await vaccinedetail.save();

    if (vaccinerecord.vaccineDetails)
      vaccinerecord.vaccineDetails.push(vaccinedetail.id);
    else
      vaccinerecord.vaccineDetails = [vaccinedetail.id];
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
      throw new Error(Errors.Unauthorized);
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
  public async getParticipantByUsername(
    @Param(yup.string())
    username: string,
    @Param(yup.string())
    type: string
  ) {
    // const isAdmin:any = await Healthadmin.query(Healthadmin, { selector: { id: this.sender, type: Participants.Healthadmin } });
    // const isHospital:any = await Hospital.query(Hospital, { selector: { id: this.sender, type: Participants.Hospital } });
    // const isFamily:any = await Family.query(Family, { selector: { id: this.sender, type: Participants.Family } });

    // console.log("isAdmin: ", isAdmin);
    // console.log("isHospital: ", isHospital);
    // console.log("isFamily: ", isFamily);
    // if (!isAdmin.length && !isHospital.length && !isFamily.length) {
    //   throw new Error(Errors.Unauthorized);
    // }

    return await Family.query(Family, { selector: { username: username, type: type } });
  }

  @Invokable()
  public async doctorNote(
    @Param(yup.string())
    detailId: string,
    @Param(yup.string())
    note: string
  ) {

    await this.isAuth(Participants.Doctor);

    const exists = await Vaccinedetail.getOne(detailId);
    if (exists.doc != this.sender) {
      throw new Error('exists.doc != this.sender');
    }
    exists.note = note;
    console.log(exists);
    await exists.save();
    console.log(exists);
    return true;
  }

  @Invokable()
  public async physicianSign(
    @Param(yup.string())
    detailId: string,
    @Param(yup.boolean())
    signed: boolean,
    @Param(yup.string())
    nextVisit: string,
    @Param(yup.string())
    remainingVaccines: string
  ) {

    await this.isAuth(Participants.Physician);

    const exists = await Vaccinedetail.getOne(detailId);
    if (exists.physician != this.sender) {
      throw new Error('exists.physician != this.sender');
    }
    exists.signed = signed;
    exists.nextVisit = nextVisit;
    exists.remainingVaccines = remainingVaccines;
    console.log(exists);
    await exists.save();
    console.log(exists);
    return true;
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
      case Participants.Healthadmin: {
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
    let detail: Vaccinedetail[] = [];
    for (let i in vaccinerecord.vaccineDetails) {
      console.log(vaccinerecord.vaccineDetails[i]);
      await detail.push(await Vaccinedetail.getOne(vaccinerecord.vaccineDetails[i]))
    }
    return await detail;
  }

  @Invokable()
  public async getDetailHistory(
    @Param(yup.string())
    id: string
  ) {
    await this.isHistoryAuth();
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
    let isUsername: any = await Doctor.query(Doctor, { selector: { username: username } });

    let isParticipantId: any = await Doctor.query(Doctor, { selector: { participantId: participantId } });
    if (isUsername.id || isUsername.length) {
      throw new Error(Errors.Username);
    }
    if (isParticipantId.id || isParticipantId.length) {
      throw new Error(Errors.ParticipantId);
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

  private async isHistoryAuth() {
    
    const isAdmin:any = await Healthadmin.query(Healthadmin, { selector: { id: this.sender, type: Participants.Healthadmin } });
    const isHospital:any = await Hospital.query(Hospital, { selector: { id: this.sender, type: Participants.Hospital } });

    console.log("isAdmin: ", isAdmin);
    console.log("isHospital: ", isHospital);
    if (!isAdmin.length && !isHospital.length) {
      throw new Error(Errors.Unauthorized);
    }
  }

  private async isAuth(type: Participants) {
    const participant: any = this.findParticipant(type, true);
    const existing = await participant.query(participant, { selector: { id: this.sender, type: type } });

    console.log("isAuth: ", existing);
    if (!existing.length) {
      throw new Error(Errors.Unauthorized);
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