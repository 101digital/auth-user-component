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
    return new UserDetailsData(
      profile?.nickName ?? '',
      profile?.religion ?? '',
      profile?.maritalStatus ?? '',
      profile?.addresses?.[0]?.line1 ?? '',
      profile?.addresses?.[0]?.line2 ?? '',
      profile?.addresses?.[0]?.postcode ?? '',
      profile?.addresses?.[0]?.city ?? '',
      profile?.addresses?.[0]?.state ?? '',
      profile?.employmentDetails?.[0]?.employmentType ?? '',
      profile?.employmentDetails?.[0]?.sector ?? '',
      profile?.employmentDetails?.[0]?.companyName ?? '',
      profile?.employmentDetails?.[0]?.occupation ?? '',
      profile?.creditDetails?.[0]?.annualIncome + '' ?? ''
    );
  }
}

export const UserDetailsSchema = (i18n: any) =>
  Yup.object().shape({
    nickName: Yup.string()
      .trim()
      .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
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
      .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
    occupation: Yup.string()
      .trim()
      .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
    annualIncome: Yup.string()
      .trim()
      .required(i18n.t('common.lbl_required_error') ?? 'this field is required'),
  });
