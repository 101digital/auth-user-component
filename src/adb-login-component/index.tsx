import React, { useContext } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../assets';
import { fonts } from '../assets/fonts';
import { AuthContext } from '../auth-context';
import { Formik } from 'formik';
import { ADBButton, ADBInputField, ThemeContext } from 'react-native-theme-component';
import { EyesClosedIcon, EyesIcon } from 'account-origination-component/src/assets/icons';

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
  const { adbLoginWithoutOTP, isSigning } = useContext(AuthContext);
  const [isVisiblePassword, setIsVisiblePassword] = React.useState(false);

  const handleOnSignIn = async (values: SignInData) => {
    Keyboard.dismiss();
    const { username, password } = values;
    const _username = username;
    try {
      const isSuccess = await adbLoginWithoutOTP(_username, password);
      console.log('handleOnSignIn -> response', isSuccess);
      if (isSuccess) {
        onLoginSuccess();
      } else {
        onLoginFailed();
      }
    } catch (error) {
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
                disabled={values.password.length === 0 || values.username.length === 0}
              />
            </>
          )}
        </Formik>
      </KeyboardAvoidingView>
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
  iconBtn: {
    marginRight: 10,
  },
});
