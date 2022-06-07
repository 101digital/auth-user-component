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

const OtpVerification = forwardRef((props: OtpVerificationScreenProps) => {
  const { Root } = props;
  const countdownRef = useRef<CountDownTimerRef>();
  const styles: OtpVerificationComponentStyles = useMergeStyles(Root.styles);
  const {
    userMobileNumber,
    isVerifying,
    isChangePasswordSuccess,
    requestRecoveryPassword,
    errorUserVerify,
    errorRequestResetPassword,
    requestResetUserPassword,
    clearUserVerificationData,
  } = useContext(AuthContext);

  const [value, setValue] = useState('');
  const [isSentOtp, setIsSentOtp] = useState(false);
  const [isShowErrorModal, setShowErrorModal] = useState(false);

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

  const resendOtp = async () => {
    setIsSentOtp(true);
    clearUserVerificationData();
    await requestResetUserPassword();
    setIsSentOtp(false);
  };

  useEffect(() => {
    if (errorUserVerify?.response?.data?.errors[0]?.code === passwordErrorCode) {
      setShowErrorModal(true);
    }
  }, [errorUserVerify]);

  useEffect(() => {
    if (isSentOtp) {
      countdownRef.current?.restart();
    }
  }, [isSentOtp]);

  const onSuccess = () => {
    clearUserVerificationData();
    Root.props.onSuccess();
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
            isVisible={isShowErrorModal}
            title={i18n?.t('reset_password.lbl_password_invalid_title') ?? 'Oops!'}
            message={
              i18n?.t('reset_password.lbl_password_invalid_message') ??
              'New password is too similar to your current password. Please try another password.'
            }
            onConfirmed={() => {
              setShowErrorModal(false);
              clearUserVerificationData();
              Root.props.onConfirmPasswordError();
            }}
          />
        </SafeAreaView>
      </View>
    );
  }
});

export default OtpVerification;
