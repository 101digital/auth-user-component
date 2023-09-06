import { useADBCurrencyFormat } from 'react-native-theme-component';
import { Profile } from '../../types';
import { OTHER_OPTION } from './';
import * as Yup from 'yup';

export class UserDetailsData {
  constructor(
    readonly nickName: string,
    readonly religion: string,
    readonly maritalStatus: string,
    readonly line1: string,
    readonly line2: string,
    readonly postcode: string,
    readonly city: string,
    readonly state: string,
    readonly employmentType: string,
    readonly employmentSector: string,
    readonly employerName: string,
    readonly occupation: string,
    readonly annualIncome: string,
    readonly fullName: string,
    readonly idNumber: string,
    readonly mobileNumber: string,
    readonly email: string,
    readonly residentialAddress: string,
    readonly accountOpeningPurpose: { [key: string]: boolean },
    readonly accountSourceOfFunds: { [key: string]: boolean },
    readonly accountSourceOfWealth: { [key: string]: boolean },
    readonly otherAccountOpeningPurpose: string,
    readonly otherSourceOfFunds: string,
    readonly otherSourceOfWealth: string
  ) {}

  static empty(
    profile?: Profile,
    sourceOfFunds: {},
    sourceOfWealth: {},
    selectedAccountPurpose: {}
  ): UserDetailsData {
    const newAnnualIncome =
      profile && profile.creditDetails && profile.creditDetails.length > 0
        ? useADBCurrencyFormat(`${profile.creditDetails[0].annualIncome}`, 'blur')
        : '';

    const profileAddress =
      profile?.addresses &&
      profile?.addresses.length > 0 &&
      profile.addresses.find((a: any) => a.addressType === 'Mailing Address');

    let personalContactNo = profile?.contacts?.find(
      (contacts: any) => contacts.contactType === 'MOBILE_PHONE'
    );
    if (!personalContactNo?.contactValue) {
      personalContactNo = {
        contactValue: profile?.mobileNumber || '',
        contactType: 'MOBILE_PHONE',
      };
    }

    let personalEmail = profile?.contacts?.find(
      (contacts: any) => contacts.contactType === 'EMAIL'
    );
    if (!personalEmail?.contactValue) {
      personalEmail = { contactValue: profile?.email || '', contactType: 'EMAIL' };
    }

    const residentialAddress = profile?.addresses?.find(
      (addresses: any) => addresses.addressType === 'Residential'
    );
    const fullAddress = residentialAddress
      ? residentialAddress?.line1 ||
        '' + ', ' + residentialAddress?.line2 ||
        '' +
          ', ' +
          residentialAddress?.postcode +
          ', ' +
          residentialAddress?.city +
          ', ' +
          residentialAddress?.state
      : profileAddress?.line1 +
        ', ' +
        profileAddress?.line2 +
        ', ' +
        profileAddress?.postcode +
        ', ' +
        profileAddress?.city +
        ', ' +
        profileAddress?.state;

    return new UserDetailsData(
      profile?.nickName ?? '',
      profile?.religion ?? '',
      profile?.maritalStatus ?? '',
      profileAddress?.line1 ?? '',
      profileAddress?.line2 ?? '',
      profileAddress?.postcode ?? '',
      profileAddress?.city ?? '',
      profileAddress?.state ?? '',
      profile?.employmentDetails?.[0]?.employmentType ?? '',
      profile?.employmentDetails?.[0]?.sector ?? '',
      profile?.employmentDetails?.[0]?.companyName ?? '',
      profile?.employmentDetails?.[0]?.occupation ?? '',
      newAnnualIncome?.currencyFormated ?? '',
      profile?.fullName ?? '',
      profile?.kycDetails?.idNumber ?? '',
      personalContactNo?.contactValue ?? '',
      personalEmail?.contactValue ?? '',
      fullAddress ?? '',
      selectedAccountPurpose.accountPurposesObject,
      sourceOfFunds?.sourceOfFundObject,
      sourceOfWealth?.sourceOfWealthObject,
      selectedAccountPurpose.otherAccountPurposes,
      sourceOfFunds.otherSourceOfFunds,
      sourceOfWealth.otherSourceOfWealth
    );
  }
}

export const validationSchema = (
  isUnEmployed: boolean,
  isOutsideLabourForce: boolean,
  i18n: any,
  oddReviewCycle?: boolean
) => {
  if (isUnEmployed) {
    return Yup.object().shape({
      nickName: Yup.string()
        .trim()
        .matches(/^[a-zA-Z ]+$/, i18n.t('user_name.invalid_preferredname')),
      religion: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      maritalStatus: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      line1: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      postcode: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      city: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      state: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      employmentType: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      annualIncome: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required')
        .matches(/^[0-9,.]+$/, i18n.t('common.invalid_value') ?? 'Invalid value'),
      accountOpeningPurpose: oddReviewCycle
        ? Yup.object().test('require', 'This field is required', (value) => {
            return Object.keys(value).length > 0;
          })
        : Yup.string().trim(),
      accountSourceOfFunds: oddReviewCycle
        ? Yup.object().test('require', 'This field is required', (value) => {
            return Object.keys(value).length > 0;
          })
        : Yup.string().trim(),
      accountSourceOfWealth: oddReviewCycle
        ? Yup.object().test('require', 'This field is required', (value) => {
            return Object.keys(value).length > 0;
          })
        : Yup.string().trim(),
      otherAccountOpeningPurpose: oddReviewCycle
        ? Yup.string().when('accountOpeningPurpose', {
            is: (val: any) => val && val[OTHER_OPTION],
            then: Yup.string().required('This field is required'),
            otherwise: Yup.string(),
          })
        : Yup.string().trim(),
      otherSourceOfFunds: oddReviewCycle
        ? Yup.string().when('accountSourceOfFunds', {
            is: (val: any) => val && val[OTHER_OPTION],
            then: Yup.string().required('This field is required'),
            otherwise: Yup.string(),
          })
        : Yup.string().trim(),
      otherSourceOfWealth: oddReviewCycle
        ? Yup.string().when('accountSourceOfWealth', {
            is: (val: any) => val && val[OTHER_OPTION],
            then: Yup.string().required('This field is required'),
            otherwise: Yup.string(),
          })
        : Yup.string().trim(),
    });
  } else if (isOutsideLabourForce) {
    return Yup.object().shape({
      nickName: Yup.string()
        .trim()
        .matches(/^[a-zA-Z ]+$/, i18n.t('user_name.invalid_preferredname')),
      religion: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      maritalStatus: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      line1: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      postcode: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      city: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      state: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      employmentType: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      annualIncome: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required')
        .matches(/^[0-9,.]+$/, i18n.t('common.invalid_value') ?? 'Invalid value'),
      occupation: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      accountOpeningPurpose: oddReviewCycle
        ? Yup.object().test('require', 'This field is required', (value) => {
            return Object.keys(value).length > 0;
          })
        : Yup.string().trim(),
      accountSourceOfFunds: oddReviewCycle
        ? Yup.object().test('require', 'This field is required', (value) => {
            return Object.keys(value).length > 0;
          })
        : Yup.string().trim(),
      accountSourceOfWealth: oddReviewCycle
        ? Yup.object().test('require', 'This field is required', (value) => {
            return Object.keys(value).length > 0;
          })
        : Yup.string().trim(),
      otherAccountOpeningPurpose: oddReviewCycle
        ? Yup.string().when('accountOpeningPurpose', {
            is: (val: any) => val && val[OTHER_OPTION],
            then: Yup.string().required('This field is required'),
            otherwise: Yup.string(),
          })
        : Yup.string().trim(),
      otherSourceOfFunds: oddReviewCycle
        ? Yup.string().when('accountSourceOfFunds', {
            is: (val: any) => val && val[OTHER_OPTION],
            then: Yup.string().required('This field is required'),
            otherwise: Yup.string(),
          })
        : Yup.string().trim(),
      otherSourceOfWealth: oddReviewCycle
        ? Yup.string().when('accountSourceOfWealth', {
            is: (val: any) => val && val[OTHER_OPTION],
            then: Yup.string().required('This field is required'),
            otherwise: Yup.string(),
          })
        : Yup.string().trim(),
    });
  } else {
    return Yup.object().shape({
      nickName: Yup.string()
        .trim()
        .matches(/^[a-zA-Z ]+$/, i18n.t('user_name.invalid_preferredname')),
      religion: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      maritalStatus: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      line1: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      postcode: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      city: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      state: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      employmentType: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      employmentSector: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      employerName: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required')
        .matches(/^[0-9a-zA-Z_ .-]+$/, i18n.t('user_name.invalid_name') ?? 'Invalid name'),
      occupation: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      annualIncome: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required')
        .matches(/^[0-9,.]+$/, i18n.t('common.invalid_value') ?? 'Invalid value'),
      accountOpeningPurpose: oddReviewCycle
        ? Yup.object().test('require', 'This field is required', (value) => {
            return Object.keys(value).length > 0;
          })
        : Yup.string().trim(),
      accountSourceOfFunds: oddReviewCycle
        ? Yup.object().test('require', 'This field is required', (value) => {
            return Object.keys(value).length > 0;
          })
        : Yup.string().trim(),
      accountSourceOfWealth: oddReviewCycle
        ? Yup.object().test('require', 'This field is required', (value) => {
            return Object.keys(value).length > 0;
          })
        : Yup.string().trim(),
      otherAccountOpeningPurpose: oddReviewCycle
        ? Yup.string().when('accountOpeningPurpose', {
            is: (val: any) => val && val[OTHER_OPTION],
            then: Yup.string().required('This field is required'),
            otherwise: Yup.string(),
          })
        : Yup.string().trim(),
      otherSourceOfFunds: oddReviewCycle
        ? Yup.string().when('accountSourceOfFunds', {
            is: (val: any) => val && val[OTHER_OPTION],
            then: Yup.string().required('This field is required'),
            otherwise: Yup.string(),
          })
        : Yup.string().trim(),
      otherSourceOfWealth: oddReviewCycle
        ? Yup.string().when('accountSourceOfWealth', {
            is: (val: any) => val && val[OTHER_OPTION],
            then: Yup.string().required('This field is required'),
            otherwise: Yup.string(),
          })
        : Yup.string().trim(),
    });
  }
};

export const personalDetailsSchema = validationSchema;
