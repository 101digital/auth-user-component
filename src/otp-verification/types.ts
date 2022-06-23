import { ReactNode } from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { ErrorData } from 'react-native-theme-component';
import { OTPFieldStyles } from 'react-native-theme-component/src/otp-field';

export type OtpVerificationComponentRef = {};

export type OtpVerificationScreenProps = {
  Root: {
    styles: OtpVerificationComponentStyles;
    props: {
      formatError?: (error: string) => string;
      genericError?: (error: Error) => ErrorData;
      onVerifyOTPSuccess: () => void;
      onVerifyOTPFailed: () => void;
      onPressBack: () => void;
      onConfirmPasswordError: () => void;
      onVerifyPhoneNumberError: () => void;
    };
    components?: {
      header?: ReactNode;
      footer?: ReactNode;
    };
  };
};

export type OtpVerificationComponentStyles = {
  container?: StyleProp<ViewStyle>;
  backButtonContainerStyle?: StyleProp<ViewStyle>;
  countdownContainerStyle?: StyleProp<ViewStyle>;
  notReceivedCodeTextStyle?: StyleProp<TextStyle>;
  sendAnotherTextStyle?: StyleProp<TextStyle>;
  durationTextStyle?: StyleProp<TextStyle>;
  otpFieldStyle?: OTPFieldStyles;
  title?: StyleProp<TextStyle>;
  noteText?: StyleProp<TextStyle>;
  errorCodeTextStyle?: StyleProp<TextStyle>;
  noteContainer?: StyleProp<ViewStyle>;
  mainContainer?: StyleProp<ViewStyle>;
  mainErrorContainer?: StyleProp<ViewStyle>;
  successContainer?: StyleProp<ViewStyle>;
  otpErrorFieldStyle?: OTPFieldStyles;
};
