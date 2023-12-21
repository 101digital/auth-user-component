import { useASCurrencyFormat } from 'react-native-theme-component';
import { Profile } from 'react-native-auth-component/src/types';
import * as Yup from 'yup';

export interface TaxDetail {
  id?: string | null;
  haveTaxNumberHandy?: boolean;
  taxNumber?: string;
  taxCountry?: string;
  taxCountryCode?: string;
  reason?: string;
  reasonDetails?: string;
}

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
    readonly taxDetails: TaxDetail[]
  ) {}

  static empty(profile?: Profile): UserDetailsData {
    // const newAnnualIncome =
    //   profile && profile.creditDetails && profile.creditDetails.length > 0
    //     ? useASCurrencyFormat(`${profile.creditDetails[0].annualIncome}`, 'blur')
    //     : '';

    // const profileAddress =
    //   profile?.addresses &&
    //   profile?.addresses.length > 0 &&
    //   profile.addresses.find((a: any) => a.addressType === 'Mailing Address');

    return new UserDetailsData(
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      profile?.taxDetails
    );
    // return new UserDetailsData(
    //   profile?.nickName ?? '',
    //   profile?.religion ?? '',
    //   profile?.maritalStatus ?? '',
    //   profileAddress?.line1 ?? '',
    //   profileAddress?.line2 ?? '',
    //   profileAddress?.postcode ?? '',
    //   profileAddress?.city ?? '',
    //   profileAddress?.state ?? '',
    //   profile?.employmentDetails?.[0]?.employmentType ?? '',
    //   profile?.employmentDetails?.[0]?.sector ?? '',
    //   profile?.employmentDetails?.[0]?.companyName ?? '',
    //   profile?.employmentDetails?.[0]?.occupation ?? '',
    //   newAnnualIncome?.currencyFormated ?? ''
    // );
  }
}

export const validationSchema = (
  isUnEmployed: boolean,
  isOutsideLabourForce: boolean,
  i18n: any
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
      taxDetails: Yup.array()
        .of(generateAccounTaxSchema(i18n))
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
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
