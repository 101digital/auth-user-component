import { useASCurrencyFormat } from 'react-native-theme-component';
import { Profile, TaxDetail } from '../../types';
import * as Yup from 'yup';

export const OTHER_OPTION = 'Others';

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
    readonly otherSourceOfWealth: string,
    readonly taxDetails: TaxDetail[],
    readonly listSelectedTaxCountry: string[]
  ) {}

  static empty(
    profile?: Profile,
    sourceOfFunds?: {},
    sourceOfWealth?: {},
    selectedAccountPurpose?: {}
  ): UserDetailsData {
    const newAnnualIncome =
      profile && profile.creditDetails && profile.creditDetails.length > 0
        ? useASCurrencyFormat(`${profile.creditDetails[0].annualIncome}`, 'blur')
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
      '',
      '',
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
      sourceOfWealth.otherSourceOfWealth,
      profile?.taxDetails,
      []
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
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required')
        .test('valid', 'Invalid postcode number', (value, data) => {
          return data.parent.city !== undefined
        }),
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
      taxDetails: Yup.array()
        .of(generateAccounTaxSchema(i18n))
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      accountOpeningPurpose: oddReviewCycle
        ? Yup.object().test('require', 'This field is required', (value) => {
            return Object.keys(value).length > 0;
          })
        : Yup.object().notRequired(),
      accountSourceOfFunds: oddReviewCycle
        ? Yup.object().test('require', 'This field is required', (value) => {
            return Object.keys(value).length > 0;
          })
        : Yup.object().notRequired(),
      accountSourceOfWealth: oddReviewCycle
        ? Yup.object().test('require', 'This field is required', (value) => {
            return Object.keys(value).length > 0;
          })
        : Yup.object().notRequired(),
      otherAccountOpeningPurpose: oddReviewCycle
        ? Yup.string().when('accountOpeningPurpose', {
            is: (val: any) => val && val[OTHER_OPTION],
            then: () => Yup.string().required('This field is required'),
            otherwise: () => Yup.string(),
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
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required')
        .test('valid', 'Invalid postcode number', (value, data) => {
          return data.parent.city !== undefined
        }),
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
      taxDetails: Yup.array()
        .of(generateAccounTaxSchema(i18n))
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      accountOpeningPurpose: oddReviewCycle
        ? Yup.object().test('require', 'This field is required', (value) => {
            return Object.keys(value).length > 0;
          })
        : Yup.object().notRequired(),
      accountSourceOfFunds: oddReviewCycle
        ? Yup.object().test('require', 'This field is required', (value) => {
            return Object.keys(value).length > 0;
          })
        : Yup.object().notRequired(),
      accountSourceOfWealth: oddReviewCycle
        ? Yup.object().test('require', 'This field is required', (value) => {
            return Object.keys(value).length > 0;
          })
        : Yup.object().notRequired(),
      otherAccountOpeningPurpose: oddReviewCycle
        ? Yup.string().when('accountOpeningPurpose', {
            is: (val: any) => val && val[OTHER_OPTION],
            then: () => Yup.string().required('This field is required'),
            otherwise: () => Yup.string(),
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
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required')
        .test('valid', 'Invalid postcode number', (value, data) => {
          return data.parent.city !== undefined
        }),
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
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      occupation: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      annualIncome: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required')
        .matches(/^[0-9,.]+$/, i18n.t('common.invalid_value') ?? 'Invalid value'),
      taxDetails: Yup.array()
        .of(generateAccounTaxSchema(i18n))
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      accountOpeningPurpose: oddReviewCycle
        ? Yup.object().test('require', 'This field is required', (value) => {
            return Object.keys(value).length > 0;
          })
        : Yup.object().notRequired(),
      accountSourceOfFunds: oddReviewCycle
        ? Yup.object().test('require', 'This field is required', (value) => {
            return Object.keys(value).length > 0;
          })
        : Yup.object().notRequired(),
      accountSourceOfWealth: oddReviewCycle
        ? Yup.object().test('require', 'This field is required', (value) => {
            return Object.keys(value).length > 0;
          })
        : Yup.object().notRequired(),
      otherAccountOpeningPurpose: oddReviewCycle
        ? Yup.string().when('accountOpeningPurpose', {
            is: (val: any) => val && val[OTHER_OPTION],
            then: () => Yup.string().required('This field is required'),
            otherwise: () => Yup.string(),
          })
        : Yup.string().trim(),
      
    });
  }
};

export const generateAccounTaxSchema = (i18n: any) => {
  const schema: any = {};
  schema.id = Yup.string().trim().nullable(true);

  schema.taxCountry = Yup.string()
    .trim()
    .required(i18n?.t('purpose_account_opening.required_error'));

  schema.taxCountry = Yup.string()
    .trim()
    .required(i18n.t('common.lbl_required_error' ?? 'This field is required'));

  (schema.haveTaxNumberHandy = Yup.bool()),
    (schema.reason = Yup.string()
      .trim()
      .when('haveTaxNumberHandy', {
        is: (haveTaxNumberHandy: boolean) => haveTaxNumberHandy === false,
        then: () =>
          Yup.string().required(i18n.t('common.lbl_required_error' ?? 'This field is required')),
      }));
  (schema.haveTaxNumberHandy = Yup.bool()),
    (schema.reason = Yup.string()
      .trim()
      .when('haveTaxNumberHandy', {
        is: (haveTaxNumberHandy: boolean) => haveTaxNumberHandy === false,
        then: () =>
          Yup.string().required(i18n.t('common.lbl_required_error' ?? 'This field is required')),
      }));
  (schema.haveTaxNumberHandy = Yup.bool()),
    (schema.reasonDetails = Yup.string()
      .trim()
      .when('haveTaxNumberHandy', {
        is: () => false,
        then: () =>
          Yup.string().required(i18n.t('common.lbl_required_error' ?? 'This field is required')),
      })
      .when(['reason', 'haveTaxNumberHandy'], {
        is: (reason: string, haveTaxNumberHandy: boolean) =>
          reason === 'The account holder is unable to obtain a TIN' && haveTaxNumberHandy === false,
        then: () =>
          Yup.string().required(i18n.t('common.lbl_required_error' ?? 'This field is required')),
      })
      .matches(/^[0-9a-zA-Z_ .#&*()+,-]+$/, i18n.t('common.invalid_value') ?? 'Invalid value'));
  (schema.haveTaxNumberHandy = Yup.bool()),
    (schema.taxNumber = Yup.string()
      .trim()
      .when('haveTaxNumberHandy', {
        is: (haveTaxNumberHandy: boolean) => haveTaxNumberHandy === true,
        then: () =>
          Yup.string().required(i18n.t('common.lbl_required_error' ?? 'This field is required')),
      })
      .matches(/^[0-9a-zA-Z_ .#&*()+,-]+$/, i18n.t('common.invalid_value') ?? 'Invalid value'));
  return Yup.object().shape(schema);
};

export const personalDetailsSchema = validationSchema;
