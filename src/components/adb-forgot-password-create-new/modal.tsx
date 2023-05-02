import * as Yup from 'yup';

export class ADBChangePasswordData {
  constructor(
    readonly createNew: string,
    readonly confirmNew: string
  ) {}

  static empty(): ADBChangePasswordData {
    return new ADBChangePasswordData( '', '');
  }
}
const reg = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[a-zA-Z!#$%&? "])[a-zA-Z0-9!#$%&?]{8}$/;
export const ADBChangePasswordSchema = Yup.object().shape({
  createNew: Yup.string().trim().required('This field is required'),
  confirmNew: Yup.string().trim().required('This field is required'),
});
