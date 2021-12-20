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
