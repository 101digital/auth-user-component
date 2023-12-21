import * as Yup from 'yup';

export class ASChangePasswordData {
  constructor(readonly createNew: string, readonly confirmNew: string) {}

  static empty(): ASChangePasswordData {
    return new ASChangePasswordData('', '');
  }
}
const reg = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[a-zA-Z!#$%&? "])[a-zA-Z0-9!#$%&?]{8}$/;
export const ASChangePasswordSchema = (i18n: any) =>
  Yup.object().shape({
    createNew: Yup.string()
      .trim()
      .required('')
      .matches(/^[0-9a-zA-Z!@#$%&*_+?-]+$/, i18n.t('common.invalid_value') ?? 'Invalid value'),
    confirmNew: Yup.string()
      .trim()
      .required('')
      .matches(/^[0-9a-zA-Z!@#$%&*_+?-]+$/, i18n.t('common.invalid_value') ?? 'Invalid value'),
  });
