import { ReactNode } from 'react';
import { ErrorData, InputFieldStyles } from 'react-native-theme-component';
import { CheckBoxStyles } from 'react-native-theme-component/src/checkbox';

export type ChangePasswordRef = {
  updateCountryCode: (code: string) => void;
};
export class ChangePasswordData {
  constructor(
    readonly oldPassword: string,
    readonly newPassword: string,
    readonly confirmNewPassword: string
  ) {}

  static empty(): ChangePasswordData {
    return new ChangePasswordData('', '', '');
  }
}

export type ChangePasswordProps = {
  Root: {
    props: {
      formatError?: (error: string) => string;
      genericError?: (error: Error) => ErrorData;
      onPress: (data?: any) => void;
      onPressBack: () => void;
      onRequestResetSuccess: () => void;
      onRequestResetFailed: () => void;
      title?: string;
      subTitle?: string;
      isRecoveryMode?: boolean;
    };
    components?: {
      header?: ReactNode;
      footer?: ReactNode;
      renderRegisterButton?: () => React.ReactElement | null;
    };
  };
  InputForm?: {
    style?: InputFormStyles;
    props?: {
      initialChangePasswordData?: ChangePasswordData;
      validationSchema?: any;
      isVisiblePassword?: boolean;
      isNewVisiblePassword?: boolean;
      isConfirmVisiblePassword?: boolean;
    };
    component?: {
      usernameIcon?: ReactNode;
      newSuffixIcon?: ReactNode;
      confirmSuffixIcon?: ReactNode;
      suffixIcon?: ReactNode;
    };
  };
};

export type InputFormStyles = {
  passwordInputFieldStyle?: InputFieldStyles;
  checkBoxInputFieldStyle?: CheckBoxStyles;
};
