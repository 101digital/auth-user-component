import { ReactNode } from 'react';
import { ErrorData, InputFieldStyles, CheckBoxStyles } from 'react-native-theme-component';

export type ChangePasswordRef = {
  updateCountryCode: (code: string) => void;
};

export type ChangePasswordProps = {
  Root: {
    style?: LoginComponentStyles;
    props: {
      formatError?: (error: string) => string;
      genericError?: (error: Error) => ErrorData;
      onPress: (data: any) => void;
      onPressBack: () => void;
      title?: string;
      subTitle?: string;
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
    };
    component?: {
      usernameIcon?: ReactNode;
    };
  };
};

export type InputFormStyles = {
  passwordInputFieldStyle?: InputFieldStyles;
  checkBoxInputFieldStyle?: CheckBoxStyles;
};
