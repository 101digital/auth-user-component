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
  NonCheckIcon,
  NonCheckCrossIcon,
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
import { InputTypeEnum } from 'react-native-theme-component/src/adb-input-field';

export interface IADBChangePasswordComponent {
  onPressContinue: () => void;
}
const ADBChangePasswordComponent = (prop: IADBChangePasswordComponent) => {
  const { i18n } = useContext(ThemeContext);
  const [showOldPass, setShowOldPass] = useState(true);
  const [showNewPass, setShowNewPass] = useState(true);
  const [showConfirmPass, setShowConfirmPass] = useState(true);
  const [errorModal, setErrorModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [invalidCredModal, setInvalidCredModal] = useState(false);
  const [check, setCheck] = useState(false);
  const formikRef = useRef(null);
  const { onPressContinue } = prop;
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
        setErrorTitle(i18n.t('change_password.lbl_create_new_which_not_used') ??
        'Create a new password that you have never used')
        setErrorModal(true);
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
                  type='custom'
                  inputType={InputTypeEnum.MATERIAL}
                  name={'oldPassword'}
                  onCheck = {() => setCheck(false)}
                  onBlur={() => {
                    setFieldTouched('oldPassword');
                  }}
                  placeholder={i18n.t('change_password.pl_current_password') ?? 'Current password'}
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
                  placeholderHint={i18n.t('change_password.plh_current_password') ?? 'Enter password'}
                />
                <View style={styles.height32} />
                <Text style={styles.subTitle16}>
                  {i18n.t('change_password.lbl_new_password') ?? 'New Password'}
                </Text>
                <View style={styles.height16} />
                <ADBInputField
                  type='custom'
                  inputType={InputTypeEnum.MATERIAL}
                  name={'createNew'}
                  onCheck = {() => setCheck(true)}
                  onBlur={() => {
                    setFieldTouched('createNew');
                  }}
                  placeholder={
                    i18n.t('change_password.lbl_title_create_new_password') ?? 'Create new password'
                  }
                  placeholderHint={i18n.t('change_password.plh_new_password') ?? 'Enter new password'}
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
                  type='custom'
                  inputType={InputTypeEnum.MATERIAL}
                  name={'confirmNew'}
                  onCheck={() => setCheck(true)}
                  onBlur={() => {
                    setFieldTouched('confirmNew');
                  }}
                  placeholder={
                    i18n.t('change_password.lbl_title_confirm_password') ?? 'Confirm new password'
                  }
                  placeholderHint={i18n.t('change_password.plh_confirm_password') ?? 'Re-enter new password'}
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
                    {checkSpecialCharacter(values.createNew) ?  
                      <CheckIcon size={18} /> : check ? <NonCheckCrossIcon size={18} /> : <NonCheckIcon size={18} color={colors.lightSubtitle} />}
                    <View style={styles.width} />
                    <Text style={styles.subTitle12}>
                      {i18n.t('change_password.lbl_at_least_one_special_char') ??
                        'At least one special character.'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    {checkAtLeast1upperandLower(values.createNew) ?  
                      <CheckIcon size={18} /> : check ? <NonCheckCrossIcon size={18} /> : <NonCheckIcon size={18} color={colors.lightSubtitle} />}
                    <View style={styles.width} />
                    <Text style={styles.subTitle12}>
                      {i18n.t('change_password.lbl_at_least_one_lower_uper') ??
                        'At least one uppercase and lowercase letter.'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    {checkAtLeast1digit(values.createNew) ?  
                      <CheckIcon size={18} /> : check ? <NonCheckCrossIcon size={18} /> : <NonCheckIcon size={18} color={colors.lightSubtitle} />}
                    <View style={styles.width} />
                    <Text style={styles.subTitle12}>
                      {i18n.t('change_password.lbl_at_least_one_number') ?? 'At least one number.'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    {checkIs8Character(values.createNew) ?  
                      <CheckIcon size={18} /> : check ? <NonCheckCrossIcon size={18} /> : <NonCheckIcon size={18} color={colors.lightSubtitle} />}
                    <View style={styles.width} />
                    <Text style={styles.subTitle12}>
                      {i18n.t('change_password.lbl_be_at_least_8_char') ??
                        'Be at least 8 characters.'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    {values.confirmNew !== values.createNew ||
                    values.confirmNew.trim() === '' ||
                    values.createNew.trim() === '' 
                    ? (check ? <NonCheckCrossIcon size={18} /> : <NonCheckIcon size={18} color={colors.lightSubtitle} />) : <CheckIcon size={18} /> }
                    <View style={styles.width} />
                    <Text style={styles.subTitle12}>
                      {i18n.t('change_password.lbl_both_password_match') ?? 'Both passwords match.'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.bottomSection]}>
                <ADBButton
                  label={i18n.t('change_password.btn_continue') ?? 'Continue'}
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
          <AlertCircleIcon width={178} height={165} />
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
          <SuccessIcon width={178} height={165} />
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
          <AlertCircleIcon width={178} height={165} />
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
    marginTop: 56,
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
