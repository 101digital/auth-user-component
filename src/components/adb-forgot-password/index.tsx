import React, { useContext, useState, useEffect, useRef } from 'react';
import { Keyboard, Platform, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../assets';
import { fonts } from '../../assets/fonts';
import { AuthContext } from '../../auth-context';
import { Formik, FormikProps, isObject } from 'formik';
import BottomSheetModal from 'react-native-theme-component/src/bottom-sheet';
import { AlertCircleIcon } from '../../assets/icons';
import { ADBButton, ADBInputField, ThemeContext } from 'react-native-theme-component';
import { InputIdData, InputIdSchema } from './model';
import moment from 'moment';

export interface IForgotPassword {
  onValidationSuccess: (flowId: string) => void;
  onErrorValidateID: (msg: string) => void;
}

const ADBForgotPasswordComponent: React.FC<IForgotPassword> = (props: IForgotPassword) => {
  const { onValidationSuccess, onErrorValidateID } = props;
  const { i18n } = useContext(ThemeContext);
  const [errorModal, setErrorModal] = useState(false);
  const { validateUserForgotPassword, isRecoveringUserPassword } = useContext(AuthContext);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const formikRef = useRef<FormikProps<InputIdData>>(null);
  const marginKeyboard = keyboardHeight ? keyboardHeight - 20 : Platform.OS === 'ios' ? 0 : 20;

  const onShowInvalidIDNumber = () => {
    onErrorValidateID(i18n.t('id_number.error_invalid_id') ?? 'Invalid ID number.');
  };

  const onShowInvalidAge = () => {
    onErrorValidateID(
      i18n.t('id_number.error_invalid_age_id') ?? 'You must be 18 years old and above.'
    );
  };

  const handleOnValidation = async (values: InputIdData) => {
    Keyboard.dismiss();
    const { email, nric } = values;
    const _email = email.trim();
    const _nric = nric.trim();
    try {
      if(_nric.match(/^[^0-9a-zA-Z]+$/)) {
        onShowInvalidIDNumber();
        return;
      }
    } catch {
      onShowInvalidIDNumber();
      return;
    }

    const response = await validateUserForgotPassword(_email, _nric);
    if (response && isObject(response) && response.resendCode) {
      onValidationSuccess(response.resendCode);
    } else {
      setErrorModal(true);
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
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
      <Formik
        innerRef={formikRef}
        enableReinitialize={true}
        initialValues={InputIdData.empty()}
        onSubmit={handleOnValidation}
        validationSchema={InputIdSchema(i18n)}
      >
        {({ submitForm, values }) => {
          return (
            <>
              <View style={styles.content}>
                <View style={styles.rowInput}>
                  <ADBInputField
                    type='custom'
                    name="email"
                    returnKeyType="done"
                    placeholder={'Email'}
                    autoCapitalize="none"
                    keyboardType={'email-address'}
                  />
                </View>
                <View style={styles.rowInput}>
                  <ADBInputField
                    type='custom'
                    name={'nric'}
                    placeholder={
                      i18n.t('id_number.title') ?? 'ID number'
                    }
                    maxLength={12}
                    returnKeyType="done"
                    keyboardType={'ascii-capable'}
                  />
                </View>
              </View>
              <View
                style={{
                  marginBottom: marginKeyboard,
                }}
              >
                <ADBButton
                  isLoading={isRecoveringUserPassword}
                  label={i18n.t('common.lbl_continue') ?? 'Continue'}
                  onPress={submitForm}
                />
              </View>
            </>
          );
        }}
      </Formik>
      <BottomSheetModal isVisible={errorModal}>
        <View style={styles.cameraDisableContainer}>
          <AlertCircleIcon size={72} />
          <View style={styles.gap40} />
          <Text style={[styles.loginTitle, { textAlign: 'center' }]}>
            {i18n.t('login_component.invalid_creds') ?? `Invalid credentials!`}
          </Text>
          <View style={styles.gap8} />
          <Text style={[styles.subTitle, { textAlign: 'center' }]}>
            {i18n.t('login_component.please_try_again') ?? `Please try again.`}
          </Text>
          <View style={{ height: 32 }} />
          <ADBButton
            label={i18n.t('common.lbl_done') ?? 'Done'}
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
