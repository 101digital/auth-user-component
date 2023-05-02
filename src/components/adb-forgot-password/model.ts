import * as Yup from 'yup';

export class InputIdData {
  constructor(readonly email: string, readonly nric: string) {}

  static empty(): InputIdData {
    return new InputIdData('','');
  }
}
export const InputIdSchema = Yup.object().shape({
  nric: Yup.string().trim().required('Please input your id number'),
  email: Yup.string().trim().required('Please input your email address.').email('Invalid email.'),
});
