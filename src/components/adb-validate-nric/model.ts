import * as Yup from 'yup';

export class InputIdData {
  constructor(readonly userId: string) {}

  static empty(): InputIdData {
    return new InputIdData('');
  }
}
export const InputIdSchema = (i18n: any) =>
  Yup.object().shape({
    userId: Yup.string()
      .trim()
      .required(i18n.t('errors.forgot_password.nric_required') ?? 'Please input your id number'),
  });
