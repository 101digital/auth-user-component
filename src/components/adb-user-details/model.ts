import { useADBCurrencyFormat } from 'react-native-theme-component';
import { Profile } from '../../types';
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
    readonly annualIncome: string
  ) {}


  static empty(profile?: Profile): UserDetailsData {

    const newAnnualIncome = profile && profile.creditDetails && profile.creditDetails.length > 0 ?  useADBCurrencyFormat(`${profile.creditDetails[0].annualIncome}`, 'blur') : '';
    
    const profileAddress =
            profile?.addresses && profile?.addresses.length > 0 && profile.addresses.find(
              (a: any) => a.addressType === 'Mailing Address'
            );

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
      newAnnualIncome?.currencyFormated ? newAnnualIncome?.currencyFormated === '0.00' ? '' : newAnnualIncome?.currencyFormated : '',
    );
  }
}
  

export const validationSchema = (isUnEmployed: boolean, i18n: any) => {
  if(!isUnEmployed) {
    return Yup.object().shape({
      nickName: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required')
        .matches(/^[0-9a-zA-Z_ .-]+$/,i18n.t('common.invalid_value') ?? 'Invalid value'),
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
        .matches(/^[0-9a-zA-Z_ .-]+$/,i18n.t('user_name.invalid_name') ?? 'Invalid name'),
      occupation: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
      annualIncome: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required')
        .matches(/^[0-9,.]+$/,i18n.t('common.invalid_value') ?? 'Invalid value'),
    });
  } else {
    return Yup.object().shape({
      nickName: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required')
        .matches(/^[0-9a-zA-Z_ .-]+$/,i18n.t('common.invalid_value') ?? 'Invalid value'),
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
      annualIncome: Yup.string()
        .trim()
        .required(i18n.t('common.lbl_required_error') ?? 'this field is required')
        .matches(/^[0-9,.]+$/,i18n.t('common.invalid_value') ?? 'Invalid value'),
    });
  }
  
}


  export const personalDetailsSchema = validationSchema;
