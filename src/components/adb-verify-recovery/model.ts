import * as Yup from 'yup';

export class InputIdData {
  constructor(readonly recoveryCode: string) {}

  static empty(): InputIdData {
    return new InputIdData('');
  }
}
export const InputIdSchema = Yup.object().shape({
  recoveryCode: Yup.string().trim().required('Please input recovery code'),
});
