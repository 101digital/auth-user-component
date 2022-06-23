import React, { useEffect, useRef, useContext, useState, forwardRef } from 'react';
import { BackIcon } from '../assets/icons';
import { colors } from '../assets';
import { Platform, SafeAreaView, Text, TouchableOpacity, View, Keyboard } from 'react-native';

import { Button, OTPField, CountdownTimer } from 'react-native-theme-component';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { i18n } from '@/translations/translation-config';
import { CountDownTimerRef } from 'react-native-theme-component/src/countdown-timer';
import useMergeStyles from './styles';
import { OtpVerificationComponentStyles, OtpVerificationScreenProps } from './types';
import { AuthContext } from '../auth-context/context';
import SuccessModel from './success-model';
import AlertModal from '../change-password-component/alert-modal';
import { OTPFieldRef } from 'react-native-theme-component/src/otp-field';

const OtpVerification = forwardRef((props: OtpVerificationScreenProps) => {
  const { Root } = props;
  const countdownRef = useRef<CountDownTimerRef>();
  const otpRef = useRef<OTPFieldRef>();
  const styles: OtpVerificationComponentStyles = useMergeStyles(Root.styles);
  const {
    userMobileNumber,
    isVerifying,
    isChangePasswordSuccess,
    requestRecoveryPassword,
    errorUserVerify,
    recoveryUserPassword,
    errorRequestResetPassword,
    requestResetUserPassword,
    clearUserVerificationData,
    clearRecoveryUserPasswordError,
  } = useContext(AuthContext);

  const [value, setValue] = useState('');
  const [isSentOtp, setIsSentOtp] = useState(false);
  const [isShowErrorPasswordModal, setIsShowErrorPasswordModal] = useState(false);
  const [isShowErrorPhoneNumberModal, setIsShowErrorPhoneNumberModal] = useState(false);

  const passwordErrorCode = '011.01.412.05';
  const errorOTPMessage = errorUserVerify
    ? errorUserVerify.response?.data?.errors[0]?.message
    : errorRequestResetPassword
    ? errorRequestResetPassword?.response?.data?.errors[0]?.message
    : '';

  const handleOnValidateAndResetPassword = async () => {
    Keyboard.dismiss();
    clearUserVerificationData();
    await requestRecoveryPassword(value);
  };

  useEffect(() => {
    resendOtp();
  }, []);

  useEffect(() => {
    if (value && value.length === 6) {
      handleOnValidateAndResetPassword();
    }
  }, [value]);

  const resendOtp = async () => {
    setIsSentOtp(true);
    otpRef.current?.clearInput();
    otpRef.current?.focus();
    clearUserVerificationData();
    const response = await recoveryUserPassword();
    if (response?.data[0]) {
      await requestResetUserPassword(response?.data[0]);
    } else {
      setIsShowErrorPhoneNumberModal(true);
    }

    setIsSentOtp(false);
  };

  useEffect(() => {
    if (errorUserVerify?.response?.data?.errors[0]?.code === passwordErrorCode) {
      setIsShowErrorPasswordModal(true);
    }
  }, [errorUserVerify]);

  useEffect(() => {
    if (isSentOtp) {
      countdownRef.current?.restart();
    }
  }, [isSentOtp]);

  const onSuccess = () => {
    clearUserVerificationData();
    Root.props.onVerifyOTPSuccess();
  };

  if (isChangePasswordSuccess) {
    return (
      <View style={styles.successContainer}>
        <SuccessModel onNext={onSuccess} />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <SafeAreaView>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              clearUserVerificationData();
              Root.props.onPressBack();
            }}
            style={styles.backButtonContainerStyle}
          >
            {<BackIcon width={17} height={12} />}
          </TouchableOpacity>
          <Text style={styles.title}>{i18n?.t('otp_verify_phone_number.lbl_title')}</Text>
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              {i18n?.t('otp_verify_phone_number.lbl_description') +
                `${userMobileNumber ? userMobileNumber.slice(-4) : '**********'}`}
            </Text>
          </View>
        </SafeAreaView>
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.mainContainer}
            keyboardOpeningTime={Number.MAX_SAFE_INTEGER}
            showsVerticalScrollIndicator={false}
            extraScrollHeight={50}
          >
            <OTPField
              ref={otpRef}
              style={
                errorUserVerify || errorRequestResetPassword
                  ? styles.otpErrorFieldStyle
                  : styles.otpFieldStyle
              }
              cellCount={6}
              onChanged={setValue}
            />
            {(errorUserVerify || errorRequestResetPassword) && (
              <View style={styles.mainErrorContainer}>
                <Text style={styles.errorCodeTextStyle}>{errorOTPMessage}</Text>
              </View>
            )}
            <View style={styles.countdownContainerStyle}>
              <Text style={styles.notReceivedCodeTextStyle}>
                {i18n?.t('authorize_transfer_component.lbl_didnt_receive_otp') ??
                  "Didn't receive a code? "}
              </Text>
              <CountdownTimer
                ref={countdownRef}
                duration={60}
                formatTime={(sec) =>
                  i18n
                    ?.t('authorize_transfer_component.lbl_duration_format')
                    ?.replace('%s', sec.toString()) ?? `Send another (in ${sec} sec)`
                }
                endText={i18n?.t('authorize_transfer_component.btn_send_another') ?? 'Send another'}
                style={{
                  endTextStyle: styles.sendAnotherTextStyle,
                  runningTextStyle: styles.durationTextStyle,
                }}
                onResend={() => resendOtp()}
              />
            </View>
          </KeyboardAwareScrollView>
          <Button
            onPress={() => {
              handleOnValidateAndResetPassword();
            }}
            label="Proceed"
            isLoading={isVerifying}
            disabled={value.length < 6}
            disableColor={colors.secondaryButton}
            style={{
              primaryContainerStyle: {
                marginHorizontal: 24,
                marginBottom: Platform.OS === 'android' ? 24 : 0,
              },
            }}
          />
          <AlertModal
            isVisible={isShowErrorPasswordModal}
            title={i18n?.t('reset_password.lbl_password_invalid_title') ?? 'Oops!'}
            message={
              i18n?.t('reset_password.lbl_password_invalid_message') ??
              'New password is too similar to your current password. Please try another password.'
            }
            onConfirmed={() => {
              setIsShowErrorPasswordModal(false);
              clearUserVerificationData();
              Root.props.onConfirmPasswordError();
            }}
          />
          <AlertModal
            isVisible={isShowErrorPhoneNumberModal}
            title={i18n?.t('input_phone_number_component.lbl_error_title') ?? 'Oops!'}
            message={
              i18n?.t('input_phone_number_component.lbl_error_message') ??
              'Looks like the mobile number you entered is not linked to a UnionDigital Bank account. Please try another mobile number or login to your account.'
            }
            onConfirmed={() => {
              setIsShowErrorPhoneNumberModal(false);
              clearRecoveryUserPasswordError();
              Root.props.onVerifyPhoneNumberError();
            }}
          />
        </SafeAreaView>
      </View>
    );
  }
});

export default OtpVerification;
