import { ReactNode } from 'react';
import { ErrorData, InputFieldStyles } from 'react-native-theme-component';
import { CheckBoxStyles } from 'react-native-theme-component/src/checkbox';

export type ChangePasswordRef = {
  updateCountryCode: (code: string) => void;
};

export type ChangePasswordProps = {
  Root: {
    props: {
      formatError?: (error: string) => string;
      genericError?: (error: Error) => ErrorData;
      onPress: (data?: any) => void;
      onPressBack: () => void;
      onRequestResetSuccess: () => void;
      title?: string;
      subTitle?: string;
      isReset?: boolean;
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
      initialSignInData?: SignInData;
      type?: 'phonenumber' | 'email';
      validationSchema?: any;
      onPressDialCode?: () => void;
      withDialCode?: boolean;
      withLabel?: boolean;
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
