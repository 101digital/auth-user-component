export interface Address {
  id: string;
  addressType?: string;
  line1?: string;
  line2?: string;
  line3?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  accountEmploymentId?: string;
}

export interface ContactDetails {
  id: string;
  accountEmploymentId?: string;
  contactType?: string;
}

export interface CreditDetails {
  accountId: string;
  creditType?: string;
  sourceOfFund?: string;
  accountPurpose?: string;
  numberCreditCard?: number;
  numberLoan?: number;
  annualIncome?: number;
}

export interface EmploymentDetails {
  id: string;
  accountId?: string;
  companyName?: string;
  companyType?: string;
  employmentType?: string;
  occupation?: string;
  sector?: string;
  startDate?: string;
  addresses?: Address[];
  contactDetails?: ContactDetails[];
}

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
  religion: string;
  maritalStatus: string;
  addresses: Address[];
  employmentDetails: EmploymentDetails[];
  creditDetails: CreditDetails[];
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
  accessToken?: string;
  loginHintToken?: string;
  paringCode?: string;
  sessionId?: string;
  locale?: string;
  deviceId?: string;
  idToken?: string;
  jwtPushNotification?: string;
  notificationAppId?: string;
  notificationEntityId?: string;
  ott?: string;
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

export type DeviceType = 'MOBILE' | 'SMS' | 'EMAIL';

export type Devices = {
  id: string;
  type: DeviceType;
  status: string;
  email: string;
  phone: string;
};

export type PKCE = {
  codeChallenge: string;
  codeVerifier: string;
};

export enum ResponseStatus {
  BAD_REQUEST = '400',
  UNAUTHORIZED = '401',
  TOO_MANY_REQUEST = '000.01.429.00',
  INTERNAL_SERVER_ERROR = '500',
}

export enum AccountStatus {
  Prospect = 'Prospect',
}


export const ONE_TIME_TOKEN_KEY = 'original-token';
export const IAM_ID_TOKEN_KEY = 'iam-id-token';
export const CONTEXT_DATA_VALUES_KEY = 'step-up-token';
