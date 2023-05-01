import React, { useContext, useState, useEffect } from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../../assets';
import { fonts } from '../../assets/fonts';
import { AuthContext } from '../../auth-context';
import { Formik } from 'formik';
import BottomSheetModal from 'react-native-theme-component/src/bottom-sheet';
import { AlertCircleIcon } from '../../assets/icons';
import { ADBButton, ADBInputField, ThemeContext } from 'react-native-theme-component';
import { PASSWORD_LOCKED_OUT } from '../../utils/index';
export class ForgotPasswordData {
  constructor(readonly email: string, readonly nric: string) {}

  static empty(): ForgotPasswordData {
    return new ForgotPasswordData('', '');
  }
}

export interface ILogin {
  onValidationSuccess: () => void;
}

const ADBForgotPasswordComponent: React.FC<ILogin> = (props: ILogin) => {
  const { onValidationSuccess, } = props;
  const { i18n } = useContext(ThemeContext);
  const [errorModal, setErrorModal] = useState(false);
  const { adbLogin, isSigning, errorSignIn } = useContext(AuthContext);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isVisiblePassword, setIsVisiblePassword] = React.useState(false);
  const marginKeyboard = keyboardHeight ? keyboardHeight - 20 : Platform.OS === 'ios' ? 0 : 20;

  const handleOnValidation = async (values: ForgotPasswordData) => {
    Keyboard.dismiss();
    const { email, nric } = values;
    const _email = email.trim();
    const _nric = nric.trim();
    const isSuccess = await adbLogin(_email, _nric);
    if (isSuccess) {
      if (isSuccess?.error?.code === PASSWORD_LOCKED_OUT) {
        setErrorModal(true);
      } else {
        onValidationSuccess();
      }
    } else {
      setErrorModal(true);
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      console.log('event', e);
      setKeyboardHeight(e.endCoordinates.height);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Formik initialValues={ForgotPasswordData.empty()} onSubmit={handleOnValidation}>
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
                  name={'userId'}
                  placeholder={i18n.t('id_number.placeholder') ?? 'ID number (according to MyKAD)'}
                  maxLength={14}
                />
              </View>
            </View>
            <View
              style={{
                marginBottom: marginKeyboard,
              }}
            >
              <ADBButton
                isLoading={isSigning}
                label={i18n.t('common.lbl_continue') ?? 'Continue'}
                onPress={submitForm}
                disabled={values.nric.length < 14 || values.email.length === 0}
              />
            </View>
          </>
        )}
      </Formik>
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

export default ADBForgotPasswordComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    marginHorizontal: 25,
    paddingTop: 20,
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
