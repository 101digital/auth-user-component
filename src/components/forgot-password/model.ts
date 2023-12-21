import * as Yup from 'yup';

export class InputIdData {
  constructor(readonly email: string, readonly nric: string) {}

  static empty(): InputIdData {
    return new InputIdData('', '');
  }
}
export const InputIdSchema = (i18n: any) =>
  Yup.object().shape({
    nric: Yup.string()
      .trim()
      .required(i18n.t('errors.common.id_required') ?? 'Please input your id number')
      .matches(/^[0-9a-zA-Z]+$/,i18n.t('id_number.error_invalid_id') ?? 'Invalid ID number'),
    email: Yup.string()
      .trim()
      .required(
        i18n.t('errors.forgot_password.email_required') ?? 'Please input your email address.'
      )
      .email(i18n.t('errors.forgot_password.email_invalid') ?? 'Invalid email.'),
  });
