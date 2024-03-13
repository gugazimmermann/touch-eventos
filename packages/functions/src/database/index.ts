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

export interface IActivitiesDesk {
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

export interface IActivitiesDefaultQuestion {
  questionId?: number;
  question: string;
  required: boolean;
  type: string;
  language: string;
  order: number;
  active: boolean;
  createdAt: string;
}

export interface IActivitiesDefaultAnswer {
  answerId?: number;
  questionId: bigint;
  answer?: string;
  language: string;
  order: number;
  active: boolean;
  createdAt: string;
}

export interface IActivitiesVisitors {
  visitorId?: number;
  name: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  document?: string;
  createdAt: string;
}

export interface IActivitiesVisitorsDefaultSurvey {
  visitorAnswerId?: number;
  visitorId: number;
  activityId: string;
  registrationId: string;
  questionId: number;
  answerId: number | null;
  custonAnswer: string | null;
  createdAt: string;
}

export interface IActivitiesVisitorsSurvey {
  visitorAnswerId?: number;
  visitorId: number;
  activityId: string;
  registrationId: string;
  questionId: number;
  answerId: number;
  custonAnswer: string;
  createdAt: string;
}

export interface IActivitiesLobby {
  lobbyId?: number;
  activityId: string;
  user: string;
  accessCode: string;
  createdAt: string;
  active: boolean;
}

export interface IActivitiesTicketsType {
  ticketTypeId?: number;
  activityId: string;
  name: string;
  value: number;
  quantity?: number | null;
  description?: string | null;
  lobbyInstructions?: string | null;
  validAt: string;
  createdAt: string;
  active: boolean;
}

export interface IActivitiesTicketsVisitors {
  ticketId?: number;
  activityId: string;
  visitorId: number;
  ticketTypeId: number;
  validAt: string;
  createdAt: string;
  active: boolean;
}

export interface IActivitiesTicketsVisitorsUsed {
  ticketUsedId?: number;
  activityId: string;
  ticketId: number;
  lobbyId: number;
  createdAt: string;
}
