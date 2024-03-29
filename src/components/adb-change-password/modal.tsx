import * as Yup from 'yup';

export class ADBChangePasswordData {
  constructor(
    readonly oldPassword: string,
    readonly createNew: string,
    readonly confirmNew: string
  ) {}

  static empty(): ADBChangePasswordData {
    return new ADBChangePasswordData('', '', '');
  }
}
const reg = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[a-zA-Z!#$%&? "])[a-zA-Z0-9!#$%&?]{8}$/;
export const ADBChangePasswordSchema = (i18n: any) =>
  Yup.object().shape({
    oldPassword: Yup.string()
      .trim()
      .required(i18n.t('common.lbl_required_error' ?? 'This field is required'))
      .matches(/^[0-9a-zA-Z!@#$%&*_+?-]+$/,i18n.t('common.invalid_value') ?? 'Invalid value'),
    createNew: Yup.string()
      .trim()
      .required(i18n.t('common.lbl_required_error' ?? 'This field is required'))
      .matches(/^[0-9a-zA-Z!@#$%&*_+?-]+$/,i18n.t('common.invalid_value') ?? 'Invalid value'),
    confirmNew: Yup.string()
      .trim()
      .required(i18n.t('common.lbl_required_error' ?? 'This field is required'))
      .matches(/^[0-9a-zA-Z!@#$%&*_+?-]+$/,i18n.t('common.invalid_value') ?? 'Invalid value'),
  });
