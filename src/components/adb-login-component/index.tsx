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
import { ADBButton, ADBInputField, ThemeContext } from 'react-native-theme-component';
import { EyesClosedIcon, EyesIcon } from '../../assets/icons';
import { PASSWORD_LOCKED_OUT } from '../../utils/index';
export class SignInData {
  constructor(readonly username: string, readonly password: string) {}

  static empty(): SignInData {
    return new SignInData('', '');
  }
}

export interface ILogin {
  onLoginSuccess: () => void;
  onLoginFailed: () => void;
}

const ADBLoginComponent: React.FC<ILogin> = (props: ILogin) => {
  const { onLoginSuccess, onLoginFailed } = props;
  const { i18n } = useContext(ThemeContext);
  const [errorModal, setErrorModal] = useState(false);
  const { adbLoginSingleFactor, isSigning, errorSignIn } = useContext(AuthContext);
  const [isVisiblePassword, setIsVisiblePassword] = React.useState(false);

  useEffect(() => {
    if (errorSignIn) {
      onLoginFailed();
    }
  }, [errorSignIn]);

  const handleOnSignIn = async (values: SignInData) => {
    Keyboard.dismiss();
    const { username, password } = values;
    const _username = username.trim();
    const _password = password.trim();
    const isSuccess = await adbLoginSingleFactor(_username, _password);
    if (isSuccess) {
      if (isSuccess?.error?.code === PASSWORD_LOCKED_OUT) {
        setErrorModal(true);
      } else {
        onLoginSuccess();
      }
    } else {
      onLoginFailed();
    }
    // const profile = await login(_username, password, _country);
    // if (profile) {
    //   onLoginSuccess();
    // } else {
    //   onLoginFailed();
    // }
  };

  const onToggleVisiblePassword = () => {
    setIsVisiblePassword(!isVisiblePassword);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Formik initialValues={SignInData.empty()} onSubmit={handleOnSignIn}>
          {({ submitForm, values }) => (
            <>
              <View style={styles.content}>
                <View style={styles.rowInput}>
                  <ADBInputField
                    name="username"
                    returnKeyType="done"
                    placeholder={'Email'}
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.rowInput}>
                  <ADBInputField
                    name="password"
                    returnKeyType="done"
                    secureTextEntry={!isVisiblePassword}
                    placeholder={'Password'}
                    autoCapitalize="none"
                    suffixIcon={
                      <TouchableOpacity onPress={onToggleVisiblePassword} style={styles.iconBtn}>
                        {isVisiblePassword ? <EyesClosedIcon size={25} /> : <EyesIcon size={25} />}
                      </TouchableOpacity>
                    }
                  />
                </View>
                <View style={styles.rowBetween}>
                  <TouchableOpacity style={styles.flex}>
                    <Text style={styles.forgotPasswordTitle}>{`${
                      i18n.t('login_component.btn_forgot_password') ?? 'Forgot password'
                    }?`}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={styles.helpTitle}>{`${
                      i18n.t('login_component.lbl_help') ?? 'Help'
                    }?`}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <ADBButton
                isLoading={isSigning}
                label="Login"
                onPress={submitForm}
                disabled={values.password.length < 8 || values.username.length === 0}
              />
            </>
          )}
        </Formik>
      </KeyboardAvoidingView>
      <BottomSheetModal isVisible={errorModal}>
        <View style={styles.cameraDisableContainer}>
          <AlertCircleIcon size={72} />
          <View style={styles.gap40} />
          <Text style={[styles.loginTitle, { textAlign: 'center' }]}>
            {i18n.t('login_component.lbl_account_locked') ??
              `Oops! Your account is temporarily locked`}
          </Text>
          <View style={styles.gap8} />
          <Text style={[styles.subTitle, { textAlign: 'center' }]}>
            {i18n.t('login_component.lbl_entered_wrong_password') ??
              `You’ve entered the wrong password 3 times. Please try again after 1 hour.`}
          </Text>
          <View style={{ height: 32 }} />
          <ADBButton
            label={i18n.t('login_component.btn_done') ?? 'Done'}
            onPress={() => {
              setErrorModal(false);
            }}
          />
        </View>
      </BottomSheetModal>
    </View>
  );
};

export default ADBLoginComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingTop: 7,
  },
  rowInput: {
    marginTop: 15,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
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
    fontSize: 14,
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
