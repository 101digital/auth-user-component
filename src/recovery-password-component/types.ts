import { ReactNode } from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { ErrorData, InputPhoneNumberStyles } from 'react-native-theme-component';

export type RecoveryPasswordComponentRef = {
  updateCountryCode: (code: string) => void;
};

export class RecoveryData {
  constructor(readonly phoneNumber: string) {}

  static empty(): RecoveryData {
    return new RecoveryData('');
  }
}

export type RecoveryPasswordComponentProps = {
  Root: {
    style?: RecoveryPasswordComponentStyles;
    props: {
      onRecoveryPasswordSuccess?: (userData: any) => void;
      onRecoveryPasswordFailed?: (error: Error) => void;
      onPressBack: () => void;
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
      type?: 'phoneNumber';
      validationSchema?: any;
    };
  };
};

export type RecoveryPasswordComponentStyles = {
  containerStyle?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  formTitleStyle?: StyleProp<TextStyle>;
  backButtonContainerStyle?: StyleProp<ViewStyle>;
  logoContainerStyle?: StyleProp<ViewStyle>;
};

export type InputFormStyles = {
  phoneNumberInputFieldStyle?: InputPhoneNumberStyles;
};
