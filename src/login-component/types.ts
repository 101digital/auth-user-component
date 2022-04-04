import { ReactNode } from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { ErrorData, InputFieldStyles, InputPhoneNumberStyles } from 'react-native-theme-component';

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
      onLoginSuccess?: (userData: any) => void;
      onLoginFailed?: (error: Error) => void;
      onPressForgotPassword: () => void;
      onPressRegister: () => void;
      formatError?: (error: string) => string;
      genericError?: (error: Error) => ErrorData;
    };
    components?: {
      header?: ReactNode;
      footer?: ReactNode;
      renderForgotPasswordButton?: () => React.ReactElement | null;
      renderRegisterButton?: () => React.ReactElement | null;
    };
  };
  InputForm?: {
    style?: InputFormStyles;
    props?: {
      initialSignInData?: SignInData;
      type?: 'phonenumber' | 'email';
      validationSchema?: any;
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
  logoContainerStyle?: StyleProp<ViewStyle>;
};

export type InputFormStyles = {
  userNameInputFieldStyle?: InputPhoneNumberStyles;
  passwordInputFieldStyle?: InputFieldStyles;
};
