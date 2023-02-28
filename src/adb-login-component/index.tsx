import React, { useContext } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../assets';
import { fonts } from '../assets/fonts';
import Button from './components/button';
import ImageIcon from '../assets/icons/image.icon';
import { AuthContext } from '../auth-context';
import { Formik } from 'formik';
import { InputField, ThemeContext } from 'react-native-theme-component';

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
  const { i18n, deviceCountryCode, countries } = useContext(ThemeContext);
  const { adbLogin} = useContext(AuthContext);

  const handleOnSignIn = async (values: SignInData) => {
    Keyboard.dismiss();
    const { username, password } = values;
    const _username = username.replace(/\D+/g, '');
    const _country = countries.find((country) => country.attributes.idd === deviceCountryCode);
    const response = await adbLogin(_username, password, _country);
    console.log('handleOnSignIn -> response', response);
    // const profile = await login(_username, password, _country);
    // if (profile) {
    //   onLoginSuccess();
    // } else {
    //   onLoginFailed();
    // }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
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
            </View>
            <Button label="Login" onPress={submitForm} />
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
});
