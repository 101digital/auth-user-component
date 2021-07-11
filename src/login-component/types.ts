import { ReactNode } from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { InputFieldStyles, InputPhoneNumberStyles } from 'react-native-theme-component';

export type LoginComponentRef = {
  updateCountryCode: (code: string) => void;
};
export class SignInData {
  constructor(readonly username: string, readonly password: string) {}

  static empty(): SignInData {
    return new SignInData('', '');
  }
}

export type LoginComponentProps = {
  Root: {
    style?: LoginComponentStyles;
    props: {
      isSigning?: boolean;
      onLogin: (username: string, password: string) => void;
      onPressForgetPassword: () => void;
      onPressRegister: () => void;
      formatError?: (error: string) => string;
      formTitle?: string;
      loginButtonLabel?: string;
      notAccountLabel?: string;
      signUpLabel?: string;
      forgotPasswordLabel?: string;
    };
    components?: {
      header?: ReactNode;
      footer?: ReactNode;
    };
  };
  InputForm?: {
    style?: InputFormStyles;
    props?: {
      initialSignInData?: SignInData;
      type?: 'phonenumber' | 'email';
      validationSchema?: any;
      passwordHint?: string;
      usernameHint?: string;
      onPressDialCode?: () => void;
    };
    component?: {
      passwordIcon?: ReactNode;
      usernameIcon?: ReactNode;
    };
  };
};

export type LoginComponentStyles = {
  containerStyle?: StyleProp<ViewStyle>;
  formTitleStyle?: StyleProp<TextStyle>;
  forgotPasswordContainerStyle?: StyleProp<ViewStyle>;
  forgotPasswordLabelStyle?: StyleProp<TextStyle>;
  noneAccountLabelStyle?: StyleProp<TextStyle>;
  signUpLabelStyle?: StyleProp<TextStyle>;
  signUpContainerStyle?: StyleProp<TextStyle>;
};

export type InputFormStyles = {
  userNameInputFieldStyle?: InputPhoneNumberStyles;
  passwordInputFieldStyle?: InputFieldStyles;
};
