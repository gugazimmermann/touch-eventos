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

export interface IActivitiesQuestion {
  questionId?: number;
  activityId: string;
  question: string;
  required: boolean;
  type: string;
  language: string;
  order: number;
  active: boolean;
  createdAt: string;
}

export interface IActivitiesAnswer {
  answerId?: number;
  questionId: bigint;
  activityId: string;
  answer?: string;
  language: string;
  order: number;
  active: boolean;
  createdAt: string;
}
