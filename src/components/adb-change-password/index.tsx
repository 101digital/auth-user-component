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
import {
  DEFAULT_ERROR_MESSAGE_INVALID_PROVIDED_PASSWORD,
  DEFAULT_ERROR_MESSAGE_NEW_PASSWORD_DID_NOT_SATISFY_PASSWORD_POLICY,
} from '../../utils';

export interface IADBChangePasswordComponent {
  onPressContinue: () => void;
  onPasswordSameHistory: () => void;
}
const ADBChangePasswordComponent = (prop: IADBChangePasswordComponent) => {
  const { i18n } = useContext(ThemeContext);
  const [showOldPass, setShowOldPass] = useState(true);
  const [showNewPass, setShowNewPass] = useState(true);
  const [showConfirmPass, setShowConfirmPass] = useState(true);
  const [errorModal, setErrorModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [invalidCredModal, setInvalidCredModal] = useState(false);
  const formikRef = useRef(null);
  const { onPressContinue, onPasswordSameHistory } = prop;
  const tickIcon = <CheckIcon size={17} />;
  const closeIcon = <CrossIcon size={17} />;
  const { changeUserPassword } = useContext(AuthContext);
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
      values.oldPassword === '' ||
      !validationCheck(values.confirmNew) ||
      !validationCheck(values.createNew)
      ? colors.secondaryButton
      : colors.primaryBlack;
  };

  const changePassword = (val: any) => {
    setLoading(true);
    changeUserPassword(val.oldPassword, val.createNew, val.confirmNew, (resp: any) => {
      if (resp === '') {
        setSuccessModal(true);
        setLoading(false);
      } else if (
        `${resp[0].message}`.includes(
          DEFAULT_ERROR_MESSAGE_NEW_PASSWORD_DID_NOT_SATISFY_PASSWORD_POLICY
        )
      ) {
        onPasswordSameHistory();
        setLoading(false);
      } else if (`${resp[0].message}`.includes(DEFAULT_ERROR_MESSAGE_INVALID_PROVIDED_PASSWORD)) {
        setInvalidCredModal(true);
        setLoading(false);
      } else {
        setErrorModal(true);
        setErrorTitle(
          `${resp[0].message}`.includes('..')
            ? `${resp[0].message.substring(resp[0].message.indexOf('..') + 2)}`
            : `${resp[0].message}`
        );
        setLoading(false);
      }
    });
  };
  return (
    <>
      <Formik
        innerRef={formikRef}
        enableReinitialize={true}
        initialValues={ADBChangePasswordData.empty()}
        validationSchema={ADBChangePasswordSchema(i18n)}
        onSubmit={(values) => {}}
      >
        {({ setFieldTouched, errors, values }) => {
          return (
            <>
              <View style={[styles.container]}>
                <Text style={styles.subTitle16}>
                  {i18n.t('change_password.lbl_current_password') ?? 'Current password'}
                </Text>
                <View style={styles.height16} />
                <ADBInputField
                  name={'oldPassword'}
                  onBlur={() => {
                    setFieldTouched('oldPassword');
                  }}
                  placeholder={'Enter password'}
                  secureTextEntry={showOldPass}
                  autoCapitalize="none"
                  suffixIcon={
                    <PasswordMask
                      onPress={() => {
                        setShowOldPass(!showOldPass);
                      }}
                      isVisible={showOldPass}
                    />
                  }
                />
                <View style={styles.height32} />
                <Text style={styles.subTitle16}>
                  {i18n.t('change_password.lbl_new_password') ?? 'New Password'}
                </Text>
                <View style={styles.height16} />
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
                    values.oldPassword === '' ||
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
            label={i18n.t('common.lbl_done') ?? 'Done'}
            onPress={() => {
              setErrorModal(false);
            }}
          />
        </View>
      </BottomSheetModal>

      <BottomSheetModal isVisible={successModal}>
        <View style={styles.errorContainer}>
          <SuccessIcon size={72} />
          <View style={styles.height30} />
          <Text style={[styles.title, styles.alignCenter]}>
            {i18n.t('change_password.lbl_password_updated') ?? 'Password has been updated!'}
          </Text>
          <View style={styles.height8} />
          <ADBButton
            label={i18n.t('common.lbl_done') ?? 'Done'}
            onPress={() => {
              setSuccessModal(false), onPressContinue();
            }}
          />
        </View>
      </BottomSheetModal>

      <BottomSheetModal isVisible={invalidCredModal}>
        <View style={styles.errorContainer}>
          <AlertCircleIcon size={55.5} />
          <View style={styles.height30} />
          <Text style={[styles.title, styles.alignCenter]}>
            {i18n.t('change_password.lbl_invalid_credentials') ?? 'Invalid credentials'}
          </Text>
          <View style={styles.height16} />
          <Text style={[styles.subTitle, styles.alignCenter]}>
            {i18n.t('change_password.lbl_please_try_again') ?? 'Please try again.'}
          </Text>
          <View style={styles.height32} />
          <ADBButton
            label={i18n.t('common.lbl_done') ?? 'Done'}
            onPress={() => {
              setInvalidCredModal(false);
            }}
          />
        </View>
      </BottomSheetModal>
    </>
  );
};

export default ADBChangePasswordComponent;

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
