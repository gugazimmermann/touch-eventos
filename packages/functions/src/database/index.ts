export interface IActivitiesRegister {
  registrationId: string;
  activityId: string;
  email: string | null;
  phone: string | null;
  language: string;
  code: string;
  confirmed: string | null;
  gift: string | null;
  deskId: string | null;
  createdAt: string;
  activityRegisterHash: string;
}

export interface  IActivitiesDesk {
  deskId: string;
  activityId: string;
  user: string;
  accessCode: string;
  createdAt: string;
  active: boolean;
}
