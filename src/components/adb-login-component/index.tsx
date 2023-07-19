import React, { useContext, useState, useEffect } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../assets';
import { fonts } from '../../assets/fonts';
import { AuthContext } from '../../auth-context';
import { Formik } from 'formik';
import BottomSheetModal from 'react-native-theme-component/src/bottom-sheet';
import { AlertCircleIcon } from '../../assets/icons';
import {
  ADBAlertModal,
  ADBButton,
  ADBInputField,
  EyesClosedIcon,
  EyesIcon,
  ThemeContext,
  defaultColors,
} from 'react-native-theme-component';
import { OTP_REQUIRED, PASSWORD_LOCKED_OUT, SINGLE_FACTOR_COMPLETED } from '../../utils/index';
import { RegistrationContext } from 'react-native-register-component';
import { InputTypeEnum } from 'react-native-theme-component/src/adb-input-field';

export class SignInData {
  constructor(readonly username: string, readonly password: string) {}

  static empty(): SignInData {
    return new SignInData('', '');
  }
}

export interface ILogin {
  onLoginSuccess: () => void;
  onLoginFailed: () => void;
  onForgotPassword: () => void;
  onLoginRestrict: (status: string) => void;
  isSkipOTPMode?: boolean;
}

const ADBLoginComponent: React.FC<ILogin> = (props: ILogin) => {
  const { onLoginSuccess, onLoginFailed, onForgotPassword, onLoginRestrict, isSkipOTPMode } = props;
  const { i18n } = useContext(ThemeContext);
  const [errorModal, setErrorModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { adbLoginSingleFactor, adbLogin, errorSignIn } = useContext(AuthContext);
  const { verifyExistedUserByEmail } = useContext(RegistrationContext);
  const [isVisiblePassword, setIsVisiblePassword] = React.useState(false);
  
  useEffect(() => {
    if (errorSignIn) {
      onLoginFailed();
    }
  }, [errorSignIn]);

  const handleOnSignIn = async (values: SignInData) => {
    Keyboard.dismiss();
    setIsLoading(true);
    const { username, password } = values;
    const _username = username.trim();
    const _password = password.trim();
    if (isSkipOTPMode) {
      try {
        const response = await adbLoginSingleFactor(_username, _password, true);
        setIsLoading(false);
        if (response) {
          if (response.status && response.status === SINGLE_FACTOR_COMPLETED) {
            onLoginSuccess();
          } else if (response.error?.code === PASSWORD_LOCKED_OUT) {
            setErrorModal(true);
          }
        }
      } catch {
        setIsLoading(false);
      }
      return;
    }
    const responseVerified = await verifyExistedUserByEmail(_username);
    if (
      responseVerified?.status === 'Onboarded' ||
      responseVerified?.status === 'Active' ||
      responseVerified?.status === 'Verified'
    ) {
      const response = await adbLogin(_username, _password);
      if (response) {
        if (response.status && response.status === OTP_REQUIRED) {
          onLoginSuccess();
          setIsLoading(false);
          return;
        } else if (response.error?.code === PASSWORD_LOCKED_OUT) {
          setErrorModal(true);
          setIsLoading(false);
          return;
        }
      }
    }
    setIsLoading(false);
    onLoginRestrict(responseVerified?.status);
    return;
  };

  const onToggleVisiblePassword = () => {
    setIsVisiblePassword(!isVisiblePassword);
  };

  return (
    <View style={styles.container}>
      <Formik initialValues={SignInData.empty()} onSubmit={handleOnSignIn}>
        {({ submitForm, values }) => (
          <>
            <View style={styles.content}>
              <View>
                <ADBInputField
                  name="username"
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  returnKeyType="done"
                  placeholder={'Email'}
                  placeholderTextColor={defaultColors.black500}
                  placeHolderHintTextColor={defaultColors.gray400}
                  autoCapitalize="none"
                  testID="login-user-name-input"
                  placeholderHint={i18n.t('login_component.example_email') ?? 'example@email.com'}
                />
              </View>
              <View style={styles.rowInput}>
                <ADBInputField
                  name="password"
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  returnKeyType="done"
                  secureTextEntry={!isVisiblePassword}
                  placeholderTextColor={defaultColors.black500}
                  placeHolderHintTextColor={defaultColors.gray400}
                  placeholder={'Password'}
                  autoCapitalize="none"
                  placeholderHint={i18n.t('login_component.enter_password') ?? 'Enter password'}
                  suffixIcon={
                    <TouchableOpacity onPress={onToggleVisiblePassword} style={styles.iconBtn}>
                      {!isVisiblePassword ? <EyesClosedIcon /> : <EyesIcon />}
                    </TouchableOpacity>
                  }
                  testID="login-password-input"
                />
              </View>
              <View style={styles.rowBetween}>
                <TouchableOpacity
                  onPress={onForgotPassword}
                  style={styles.flex}
                  testID="login-forgot-password-button"
                >
                  <Text style={styles.forgotPasswordTitle}>{i18n.t('login_component.btn_forgot_password') ?? 'Forgot password'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View
            >
              <ADBButton
                isLoading={isLoading}
                label={i18n.t('common.lbl_continue') ?? 'Continue'}
                onPress={submitForm}
                disabled={values.password.length < 8 || values.username.length === 0}
                testId="login-continue-button"
              />
            </View>
          </>
        )}
      </Formik>
      <ADBAlertModal
        title={
          i18n.t('login_component.lbl_account_locked') ?? `Oops! Your account is temporarily locked`
        }
        message={
          i18n.t('login_component.lbl_entered_wrong_password') ??
          `You’ve entered the wrong credentials too many times. Please try again after 1 hour.`
        }
        btnLabel={i18n.t('common.lbl_done') ?? 'Done'}
        isVisible={errorModal}
        onConfirmBtnPress={() => {
          setErrorModal(false);
        }}
        onBackdropPress={() => setErrorModal(false)}
      />
    </View>
  );
};

export default ADBLoginComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 25,
    marginBottom: 15,
  },
  rowInput: {
    marginTop: 15,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#C2C2C2',
    width: 300,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 15,
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  lowerContainer: {
    flexDirection: 'row',
  },
  title: {
    color: '#1B1B1B',
    fontSize: 24,
    marginTop: 29,
    fontFamily: fonts.semiBold,
  },
  forgotPasswordTitle: {
    fontSize: 12,
    fontFamily: fonts.OutfitSemiBold,
  },
  helpTitle: {
    fontSize: 14,
  },
  flex: { flex: 1 },
  cameraDisableContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  gap16: {
    height: 16,
  },
  gap40: {
    height: 40,
  },
  gap8: {
    height: 8,
  },
  subTitle: {
    fontSize: 14,
    color: colors.primaryBlack,
    fontFamily: fonts.regular,
    marginTop: 8,
  },
  loginTitle: {
    fontSize: 24,
    color: colors.primaryBlack,
    fontFamily: fonts.semiBold,
  },
  iconBtn: {
    marginRight: 10,
  },
});
