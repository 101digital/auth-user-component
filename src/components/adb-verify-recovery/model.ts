import * as Yup from 'yup';

export class InputIdData {
  constructor(readonly recoveryCode: string) {}

  static empty(): InputIdData {
    return new InputIdData('');
  }
}
export const InputIdSchema = (i18n: any) =>
  Yup.object().shape({
    recoveryCode: Yup.string()
      .trim()
      .matches(/^[0-9a-zA-Z]+$/,i18n.t('errors.forgot_password.invalid_recovery_code') ?? 'Invalid recovery code')
      .required(
        i18n.t('login_component.please_input_recovery_code') ?? 'Please input recovery code'
      ),
  });
