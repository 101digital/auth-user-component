export interface Profile {
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  status: string;
  lastLoginAt: string;
  listCustomFields: ProfileCustomField[];
  memberships: MemberShip[];
  createdAt: string;
  passwordExpired: boolean;
  country?: CountryInformation;
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
