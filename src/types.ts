export interface Profile {
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  status: string;
  lastLoginAt: string;
  fullName: string;
  nickName: string;
  listCustomFields: ProfileCustomField[];
  memberships: MemberShip[];
  createdAt: string;
  passwordExpired: boolean;
  country?: CountryInformation;
}

export interface Recovery {
  channelId: string;
  channelName: string;
  recoveryCode: string;
  recoveryHint: string;
}

export interface MemberShip {
  membershipId: string;
  organisationName: string;
  organisationId: string;
  roleName: string;
  token: string;
}

export interface ProfileCustomField {
  customFieldId: string;
  customKey: string;
  customValue: string;
}

export interface CountryInformation {
  id: number;
  type: string;
  attributes: {
    code3: string;
    code2: string;
    name: string;
    capitalCity: string;
    flagUrlRect: string;
    flagUrlRound: string;
    idd: string;
    active: boolean;
    region: string;
    currencyInfo: {
      listCurrency: Currency[];
    };
  };
}

export interface Currency {
  name: string;
  code: string;
  symbol: string;
  decimals: number;
  displaySymbol: string;
  displayFormat: string;
  displaySymbolFirst: boolean;
  isoCode: string;
  displaySpace: number;
  logo: string;
}

export type AuthComponentConfig = {
  clientId: string;
  ternantDomain: string;
  authBaseUrl: string;
  membershipBaseUrl: string;
  appGrantType?: string; // using for get app token
  appScope?: string; // using for get app token
  authGrantType?: string; // using for login
  authScope?: string; // using for login,
  redirectUrl?: string; // required for oauth2
  authorizationBaseUrl?: string; // required for oauth2
  revocationBaseUrl?: string; // required for oauth2
  endSessionBaseUrl?: string; // required for oauth2
  notificationBaseUrl?: string; //required for  notification
  appPublicId?: string;
  appPublicSecret?: string;
  identityBaseUrl?: string;
  identityPingUrl?: string;
  responseType?: string;
  responseMode?: string;
};

export enum VerificationMethod {
  PENDING = 'PENDING',
  BIO = 'BIOMETRIC',
  PIN = 'PIN',
  PASSWORD = 'PASSWORD',
}

export enum BiometricMethod {
  DISABLED = 'DISABLED',
  FACEID = 'FACEID',
  TOUCHID = 'TOUCHID',
  BIOMETRICS = 'BIOMETRICS',
}

export const PASSPORT = 'Passport';
