import * as Yup from 'yup';
import { i18n } from '@/translations/translation-config';

export class ChangePasswordData {
  constructor(readonly password: string, readonly confirmPassword: string) {}

  static empty(): ChangePasswordData {
    return new ChangePasswordData('', '', '');
  }
}
/* eslint-disable no-useless-escape */
export const ChangePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().trim(),
  confirmPassword: Yup.string()
    .trim()
    .oneOf([Yup.ref('password')], i18n.t('change_password.val_enter_valid_password'))
    .required(i18n.t('change_password.val_enter_valid_password')),
});
