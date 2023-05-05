import React, { useContext, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts } from '../../assets/fonts';
import { Formik } from 'formik';
import {
  ADBInputField,
  ThemeContext,
  AlertCircleIcon,
  CheckIcon,
  CrossIcon,
  ADBButton,
} from 'react-native-theme-component';
import { ADBChangePasswordData, ADBChangePasswordSchema } from './modal';
import { PasswordMask } from './password-mask';
import BottomSheetModal from 'react-native-theme-component/src/bottom-sheet';
import { SuccessIcon } from 'react-native-theme-component/src/assets/success.icon';
import { colors } from '../../assets';
import { AuthContext } from '../../auth-context/context';

export interface IADBForgotPasswordCreateNewComponent {
  forgotPasswordObj: object;
  onPressContinue: (newPassword: string) => void;
  onPasswordSameHistory: () => void;
}
const ADBForgotPasswordCreateNewComponent = (prop: IADBForgotPasswordCreateNewComponent) => {
  const { i18n } = useContext(ThemeContext);
  const [showNewPass, setShowNewPass] = useState(true);
  const [showConfirmPass, setShowConfirmPass] = useState(true);
  const [errorModal, setErrorModal] = useState(false);
  const formikRef = useRef(null);
  const { onPressContinue, onPasswordSameHistory, forgotPasswordObj } = prop;
  const tickIcon = <CheckIcon size={17} />;
  const closeIcon = <CrossIcon size={17} />;
  const { changeUserPasswordUsingRecoveryCode } = useContext(AuthContext);
  const [errorTitle, setErrorTitle] = useState(
    i18n.t('change_password.lbl_sorry_there_was_problem') ?? 'Sorry, there was a problem'
  );
  const [loading, setLoading] = useState(false);
  const checkIs8Character = (text: string) => {
    return /^.{8,}$/.test(text.trim());
  };

  const checkAtLeast1digit = (text: string) => {
    return /(?=.*\d)/.test(text.trim());
  };

  const checkAtLeast1upperandLower = (text: string) => {
    return /(?=.*[A-Z])(?=.*[a-z])/.test(text.trim());
  };

  const checkSpecialCharacter = (text: string) => {
    return /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(text.trim());
  };

  const validationCheck = (val: string) => {
    if (
      checkIs8Character(val) &&
      checkAtLeast1upperandLower(val) &&
      checkAtLeast1digit(val) &&
      checkSpecialCharacter(val)
    ) {
      return true;
    } else {
      return false;
    }
  };

  const returnColor = (errors: any, values: any) => {
    return Object.keys(errors).length !== 0 ||
      values.confirmNew !== values.createNew ||
      values.confirmNew === '' ||
      !validationCheck(values.confirmNew) ||
      !validationCheck(values.createNew)
      ? colors.secondaryButton
      : colors.primaryBlack;
  };

  const changePassword = async (val: any) => {
    setLoading(true);
    const response = await changeUserPasswordUsingRecoveryCode(forgotPasswordObj.recoveryCode, val.createNew, forgotPasswordObj.flowId);
    setLoading(false);
    if ( response ) {
      if(response.status && response.status === 'OTP_REQUIRED') {
        onPressContinue(val.createNew);
        return;
      } else if (
        response.details && `${response.details[0].message}`.includes('New password did not satisfy password policy requirements')
      ) {
        onPasswordSameHistory();
        return;
      } 
    }
    setErrorModal(true);
    setErrorTitle(i18n.t('change_password.lbl_sorry_there_was_problem') ?? 'Sorry, there was a problem');
  };
  return (
    <>
      <Formik
        innerRef={formikRef}
        enableReinitialize={true}
        initialValues={ADBChangePasswordData.empty()}
        validationSchema={ADBChangePasswordSchema}
        onSubmit={(values) => {}}
      >
        {({ setFieldTouched, errors, values }) => {
          return (
            <>
              <View style={[styles.container]}>
                <ADBInputField
                  name={'createNew'}
                  onBlur={() => {
                    setFieldTouched('createNew');
                  }}
                  placeholder={
                    i18n.t('change_password.lbl_title_create_new_password') ?? 'Create new password'
                  }
                  secureTextEntry={showNewPass}
                  autoCapitalize="none"
                  suffixIcon={
                    <PasswordMask
                      onPress={() => {
                        setShowNewPass(!showNewPass);
                      }}
                      isVisible={showNewPass}
                    />
                  }
                />
                <View style={styles.height16} />
                <ADBInputField
                  name={'confirmNew'}
                  onBlur={() => {
                    setFieldTouched('confirmNew');
                  }}
                  placeholder={
                    i18n.t('change_password.lbl_title_confirm_password') ?? 'Confirm new password'
                  }
                  secureTextEntry={showConfirmPass}
                  autoCapitalize="none"
                  suffixIcon={
                    <PasswordMask
                      onPress={() => {
                        setShowConfirmPass(!showConfirmPass);
                      }}
                      isVisible={showConfirmPass}
                    />
                  }
                />
                <View>
                  <View style={styles.row}>
                    {checkSpecialCharacter(values.createNew) ? tickIcon : closeIcon}
                    <View style={styles.width} />
                    <Text style={styles.subTitle12}>
                      {i18n.t('change_password.lbl_at_least_one_special_char') ??
                        'At least one special character'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    {checkAtLeast1upperandLower(values.createNew) ? tickIcon : closeIcon}
                    <View style={styles.width} />
                    <Text style={styles.subTitle12}>
                      {i18n.t('change_password.lbl_at_least_one_lower_uper') ??
                        'At least one uppercase and lowercase letter'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    {checkAtLeast1digit(values.createNew) ? tickIcon : closeIcon}
                    <View style={styles.width} />
                    <Text style={styles.subTitle12}>
                      {i18n.t('change_password.lbl_at_least_one_number') ?? 'At least one number'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    {checkIs8Character(values.createNew) ? tickIcon : closeIcon}
                    <View style={styles.width} />
                    <Text style={styles.subTitle12}>
                      {i18n.t('change_password.lbl_be_at_least_8_char') ??
                        'Be at least 8 characters'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    {values.confirmNew !== values.createNew ||
                    values.confirmNew.trim() === '' ||
                    values.createNew.trim() === ''
                      ? closeIcon
                      : tickIcon}
                    <View style={styles.width} />
                    <Text style={styles.subTitle12}>
                      {i18n.t('change_password.lbl_both_password_match') ?? 'Both passwords match'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.bottomSection]}>
                <ADBButton
                  label={i18n.t('change_password.btn_continue') ?? 'Continue'}
                  containerStyles={{
                    borderColor: returnColor(errors, values),
                    backgroundColor: returnColor(errors, values),
                  }}
                  isLoading={loading}
                  disabled={
                    Object.keys(errors).length !== 0 ||
                    values.confirmNew !== values.createNew ||
                    values.confirmNew == '' ||
                    !validationCheck(values.confirmNew) ||
                    !validationCheck(values.createNew)
                  }
                  onPress={() => changePassword(values)}
                />
              </View>
            </>
          );
        }}
      </Formik>
      <BottomSheetModal isVisible={errorModal}>
        <View style={styles.errorContainer}>
          <AlertCircleIcon size={55.5} />
          <View style={styles.height30} />
          <Text style={[styles.title, styles.alignCenter]}>{errorTitle}</Text>
          <View style={styles.height16} />
          <Text style={[styles.subTitle, styles.alignCenter]}>
            {i18n.t('change_password.lbl_please_try_again') ?? 'Please try again.'}
          </Text>
          <View style={styles.height32} />
          <ADBButton
            label={i18n.t('change_password.btn_done') ?? 'Done'}
            onPress={() => {
              setErrorModal(false);
            }}
          />
        </View>
      </BottomSheetModal>
    </>
  );
};

export default ADBForgotPasswordCreateNewComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    color: colors.primaryBlack,
    fontSize: 24,
    fontFamily: fonts.semiBold,
  },
  subTitle: {
    color: colors.primaryBlack,
    fontSize: 14,
    fontFamily: fonts.regular,
    marginTop: 8,
  },
  subTitle12: {
    color: colors.primaryBlack,
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  subTitle16: {
    color: colors.primaryBlack,
    fontSize: 16,
    fontFamily: fonts.semiBold,
    fontWeight: '500',
  },
  inputContainer: {
    paddingTop: 20,
  },
  bottomSection: {
    // marginBottom: 15,
    marginHorizontal: 24,
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  absolute: { position: 'absolute', bottom: 0, width: '100%', marginHorizontal: 24 },
  errorContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  width: {
    width: 11.5,
  },
  height16: {
    height: 16,
  },
  height32: {
    height: 32,
  },
  height30: {
    height: 30,
  },
  height8: {
    height: 8,
  },
  alignCenter: {
    textAlign: 'center',
  },
});
