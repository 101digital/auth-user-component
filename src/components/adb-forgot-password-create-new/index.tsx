import React, { useContext, useRef, useState } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
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
  defaultColors,
} from 'react-native-theme-component';
import { ADBChangePasswordData, ADBChangePasswordSchema } from './modal';
import { PasswordMask } from './password-mask';
import BottomSheetModal from 'react-native-theme-component/src/bottom-sheet';
import { colors } from '../../assets';
import { AuthContext } from '../../auth-context/context';
import {
  DEFAULT_ERROR_MESSAGE_NEW_PASSWORD_DID_NOT_SATISFY_PASSWORD_POLICY,
  OTP_REQUIRED,
} from '../../utils';
import { InputTypeEnum } from 'react-native-theme-component/src/adb-input-field';

export interface IADBForgotPasswordCreateNewComponent {
  forgotPasswordObj: object;
  onPressContinue: (newPassword: string) => void;
  onPasswordSameHistory: () => void;
  onError: () => void;
}
const ADBForgotPasswordCreateNewComponent = (prop: IADBForgotPasswordCreateNewComponent) => {
  const { i18n } = useContext(ThemeContext);
  const [showNewPass, setShowNewPass] = useState(true);
  const [showConfirmPass, setShowConfirmPass] = useState(true);
  const [errorModal, setErrorModal] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark'
  const formikRef = useRef(null);
  const { onPressContinue, onPasswordSameHistory, forgotPasswordObj, onError } = prop;
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
    const response = await changeUserPasswordUsingRecoveryCode(
      forgotPasswordObj.recoveryCode,
      val.createNew,
      forgotPasswordObj.flowId
    );
    setLoading(false);
    if (response) {
      if (response.status && response.status === OTP_REQUIRED) {
        onPressContinue(val.createNew);
        return;
      } else if (
        response.details &&
        `${response.details[0].message}`.includes(
          DEFAULT_ERROR_MESSAGE_NEW_PASSWORD_DID_NOT_SATISFY_PASSWORD_POLICY
        )
      ) {
        onPasswordSameHistory();
        return;
      }
    }
    onError();
  };

  return (
    <>
      <Formik
        innerRef={formikRef}
        enableReinitialize={true}
        initialValues={ADBChangePasswordData.empty()}
        validateOnMount={true}
        onSubmit={(values) => {}}
      >
        {({ setFieldTouched, errors, values, dirty, touched }) => {
          const isDisabledSubmit =
            Object.keys(errors).length !== 0 ||
            values.confirmNew !== values.createNew ||
            values.confirmNew == '' ||
            !validationCheck(values.confirmNew) ||
            !validationCheck(values.createNew);

          return (
            <>
              <View style={[styles.container]}>
                <ADBInputField
                  name={'createNew'}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  isFocusError={dirty && !validationCheck(values.createNew)}
                  onBlur={() => {
                    setFieldTouched('createNew');
                  }}
                  placeholderTextColor={isDarkMode ? defaultColors.black500 : defaultColors.black500}
                  placeHolderHintTextColor={isDarkMode ? defaultColors.gray400 : defaultColors.gray400}
                  placeholder={
                    i18n.t('password.createPassword') ?? 'Create password'
                  }
                  placeholderHint={i18n.t('password.password_hint') ?? 'Enter password'}
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
                  errorSuffixIcon={
                    <PasswordMask
                      onPress={() => {
                        setShowNewPass(!showNewPass);
                      }}
                      isVisible={showNewPass}
                      isError={true}
                    />
                  }
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.height16} />
                <ADBInputField
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  isFocusError={dirty && isDisabledSubmit}
                  name={'confirmNew'}
                  placeholderTextColor={isDarkMode ? defaultColors.black500 : defaultColors.black500}
                  placeHolderHintTextColor={isDarkMode ? defaultColors.gray400 : defaultColors.gray400}
                  placeholderHint={
                    i18n.t('password.confirm_password_hint') ?? 'Enter same password'
                  }
                  onBlur={() => {
                    setFieldTouched('confirmNew');
                  }}
                  placeholder={
                    i18n.t('password.confirmPassword') ?? 'Confirm password'
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
                  errorSuffixIcon={
                    <PasswordMask
                      onPress={() => {
                        setShowConfirmPass(!showConfirmPass);
                      }}
                      isVisible={showConfirmPass}
                      isError={true}
                    />
                  }
                  errors={errors}
                  touched={touched}
                />
                <View>
                  <View style={styles.row}>
                    {!dirty ? (
                      <View style={styles.checkIconStyle}><CheckIcon size={16} color={colors.lightSubtitle} /></View>
                    ) : checkSpecialCharacter(values.createNew) ? (
                      <View style={styles.checkIconStyle}><CheckIcon size={16} /></View>
                    ) : (
                      <View style={styles.crossIconStyle}><NonCheckIcon size={16} /></View>
                    )}
                    <View style={styles.width} />
                    <Text style={styles.subTitle12}>
                      {i18n.t('change_password.lbl_at_least_one_special_char') ??
                        'At least one special character'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    {!dirty ? (
                      <View style={styles.checkIconStyle}><CheckIcon size={16} color={colors.lightSubtitle} /></View>
                    ) : checkAtLeast1upperandLower(values.createNew) ? (
                      <View style={styles.checkIconStyle}><CheckIcon size={16} /></View>
                    ) : (
                      <View style={styles.crossIconStyle}><NonCheckIcon size={16} /></View>
                    )}
                    <View style={styles.width} />
                    <Text style={styles.subTitle12}>
                      {i18n.t('change_password.lbl_at_least_one_lower_uper') ??
                        'At least one uppercase and lowercase letter'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    {!dirty ? (
                      <View style={styles.checkIconStyle}><CheckIcon size={16} color={colors.lightSubtitle} /></View>
                    ) : checkAtLeast1digit(values.createNew) ? (
                      <View style={styles.checkIconStyle}><CheckIcon size={16} /></View>
                    ) : (
                      <View style={styles.crossIconStyle}><NonCheckIcon size={16} /></View>
                    )}
                    <View style={styles.width} />
                    <Text style={styles.subTitle12}>
                      {i18n.t('change_password.lbl_at_least_one_number') ?? 'At least one number'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    {!dirty ? (
                      <View style={styles.checkIconStyle}><CheckIcon size={16} color={colors.lightSubtitle} /></View>
                    ) : checkIs8Character(values.createNew) ? (
                      <View style={styles.checkIconStyle}><CheckIcon size={16} /></View>
                    ) : (
                      <View style={styles.crossIconStyle}><NonCheckIcon size={16} /></View>
                    )}
                    <View style={styles.width} />
                    <Text style={styles.subTitle12}>
                      {i18n.t('change_password.lbl_be_at_least_8_char') ??
                        'Be at least 8 characters'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    {!dirty ? (
                      <View style={styles.checkIconStyle}><CheckIcon size={16} color={colors.lightSubtitle} /></View>
                    ) : values.confirmNew !== values.createNew ||
                      values.confirmNew.trim() === '' ||
                      values.createNew.trim() === '' ? (
                      <View style={styles.crossIconStyle}><NonCheckIcon size={16} /></View>
                    ) : (
                      <View style={styles.checkIconStyle}><CheckIcon size={16} /></View>
                    )}
                    <View style={styles.width} />
                    <Text style={styles.subTitle12}>
                      {i18n.t('change_password.lbl_both_password_match') ?? 'Both password matches'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.bottomSection]}>
                <ADBButton
                  label={i18n.t('change_password.btn_continue') ?? 'Continue'}
                  isLoading={loading}
                  disabled={isDisabledSubmit}
                  onPress={() => changePassword(values)}
                />
              </View>
            </>
          );
        }}
      </Formik>
    </>
  );
};

export default ADBForgotPasswordCreateNewComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
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
    color: colors.lightSubtitle,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    fontFamily: fonts.OutfitRegular,
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
    marginTop: 6,
  },
  width: {
    width: 6,
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
  checkIconStyle: {
    paddingTop:3,
  },
  crossIconStyle: {
    paddingTop:2,
  },
});
