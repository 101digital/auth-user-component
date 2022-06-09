import { ReactNode } from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { ErrorData, InputPhoneNumberStyles } from 'react-native-theme-component';

export type InputPhoneNumberComponentRef = {};

export class InputPhoneNumberData {
  constructor(readonly phoneNumber: string) {}

  static empty(): InputPhoneNumberData {
    return new InputPhoneNumberData('');
  }
}

export type InputPhoneNumberComponentProps = {
  Root: {
    style?: InputPhoneNumberComponentStyles;
    props: {
      onVerifyPhoneNumberSuccess: () => void;
      onVerifyPhoneNumberFailed: (error: Error) => void;
      onPressBack: () => void;
      formatError?: (error: string) => string;
      genericError?: (error: Error) => ErrorData;
    };
    components?: {
      header?: ReactNode;
      footer?: ReactNode;
      renderForgotButton?: () => React.ReactElement | null;
      renderRegisterButton?: () => React.ReactElement | null;
    };
  };
  InputForm?: {
    style?: InputFormStyles;
    props?: {
      type?: 'phoneNumber';
      validationSchema?: any;
    };
  };
};

export type InputPhoneNumberComponentStyles = {
  container?: StyleProp<ViewStyle>;
  formTitleStyle?: StyleProp<TextStyle>;
  backButtonContainerStyle?: StyleProp<ViewStyle>;
  logoContainerStyle?: StyleProp<ViewStyle>;
  loginButtonStyle?: any;
  subTitle?: StyleProp<TextStyle>;
  content?: StyleProp<ViewStyle>;
};

export type InputFormStyles = {
  phoneNumberInputFieldStyle?: InputPhoneNumberStyles;
};
