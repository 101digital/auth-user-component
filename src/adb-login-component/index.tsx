import React, { useContext, useState } from 'react';
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
import ImageIcon from '../assets/icons/image.icon';
import { AuthContext } from '../auth-context';
import { Formik } from 'formik';
import { ADBButton, InputField, ThemeContext } from 'react-native-theme-component';
import BottomSheetModal from 'react-native-theme-component/src/bottom-sheet';
import { AlertCircleIcon } from 'react-native-auth-component/src/assets/icons';
import Button from 'react-native-auth-component/src/adb-login-component/components/button';

export class SignInData {
  constructor(readonly username: string, readonly password: string) { }

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
  const { adbLogin, isSigning, isSignInLocked } = useContext(AuthContext);
  const [errorModal, setErrorModal] = useState(false);
  const handleOnSignIn =  async (values: SignInData) => {
    Keyboard.dismiss();
    const { username, password } = values;
    const _username = username;
    const isSuccess = await adbLogin(_username, password);
    console.log('handleOnSignIn -> response', isSuccess);
    if (isSuccess) {
      if (isSuccess?.error?.code === 'PASSWORD_LOCKED_OUT') {
        setErrorModal(true)
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

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Formik initialValues={SignInData.empty()} onSubmit={handleOnSignIn}>
          {({ submitForm }) => (
            <>
              <View style={styles.content}>
                <View style={styles.contentWrapper}>
                  <View style={styles.imageWrapper}>
                    <ImageIcon width={50} height={50} color={'white'} />
                  </View>
                  <Text style={styles.title}>
                    {i18n.t('login_component.lbl_sign_in') ?? 'Hi, Welcome!'}
                  </Text>
                  <View style={styles.fullWidth}>
                    <View style={styles.rowInput}>
                      <InputField
                        name="username"
                        returnKeyType="done"
                        placeholder={'Mobile number'}
                        autoCapitalize="none"
                      />
                    </View>
                    <View style={styles.rowInput}>
                      <InputField
                        name="password"
                        returnKeyType="done"
                        secureTextEntry={true}
                        placeholder={'Password'}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                  <View style={styles.rowBetween}>
                    <TouchableOpacity style={styles.flex}>
                      <Text style={styles.forgotPasswordTitle}>{`${i18n.t('login_component.btn_forgot_password') ?? 'Forgot password'
                        }?`}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={styles.helpTitle}>{`${i18n.t('login_component.lbl_help') ?? 'Help'
                        }?`}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <ADBButton isLoading={isSigning} label="Login" onPress={submitForm} />
            </>
          )}
        </Formik>
      </KeyboardAvoidingView>
      <BottomSheetModal isVisible={errorModal}>
        <View style={styles.cameraDisableContainer}>
          <AlertCircleIcon size={72} />
          <View style={styles.gap40} />
          <Text style={[styles.loginTitle, { textAlign: 'center' }]}>{`Oops! Your account is temporarily locked`}</Text>
          <View style={styles.gap8} />
          <Text style={[styles.subTitle, { textAlign: 'center' }]}>{`You’ve entered the wrong password 3 times. Please try again after 1 hour.`}</Text>
          <View style={{ height: 32 }} />
          <Button label={'Done'} onPress={() => { setErrorModal(false) }} />
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
    paddingTop: 24,
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
  fullWidth: { width: '100%' },
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
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  imageWrapper: {
    backgroundColor: '#A5A5A5',
    borderRadius: 90,
    padding: 35,
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'space-around',
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
    paddingHorizontal: 24
  },
  gap16: {
    height: 16
  },
  gap40: {
    height: 40
  },
  gap8: {
    height: 8
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
});
