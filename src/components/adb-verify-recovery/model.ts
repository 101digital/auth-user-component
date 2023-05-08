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
      .required(
        i18n.t('login_component.please_input_recovery_code') ?? 'Please input recovery code'
      ),
  });
