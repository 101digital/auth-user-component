import { VerifyOTPComponentProps } from './types';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Text, View, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import useMergeStyles from './styles';
import {
  ADBButton,
  OTPField,
  TriangelDangerIcon,
  ThemeContext,
} from 'react-native-theme-component';
import { OTPFieldRef } from 'react-native-theme-component/src/otp-field';
import CountdownTimer, {
  CountDownTimerRef,
} from 'react-native-theme-component/src/countdown-timer';
import { AuthContext } from '../../auth-context/context';
import { ResponseStatus } from '../../types';

const VerifyOTPComponent = ({ props, style }: VerifyOTPComponentProps) => {
  const styles = useMergeStyles(style);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const otpRef = useRef<OTPFieldRef>();
  const countdownRef = useRef<CountDownTimerRef>();
  const {
    onVerifySuccess,
    onVerifyFailed,
    verifyOTP,
    generateOTP,
    isSkipInitGenerateOtp = false,
    resendOTP,
    clearError,
  } = props || {};
  const { errorVerifySignIn, isVerifyLogin } = useContext(AuthContext);
  const { i18n } = useContext(ThemeContext);
  const [value, setValue] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [isShowingResendButton, setIsShowingResendButton] = useState<boolean>(false);

  const marginKeyboard = keyboardHeight > 0 && Platform.OS === 'ios' ? keyboardHeight : 15;

  useEffect(() => {
    if (!isSkipInitGenerateOtp) {
      generateOTP();
    }
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

  useEffect(() => {
    setIsValid(value.length === 6);
  }, [value]);

  useEffect(() => {
    if (attemptCount === 3) {
      countdownRef.current?.onForceFinish();
      setAttemptCount(0);
    }
  }, [attemptCount]);

  const onValidateOTP = async () => {
    clearError && clearError();
    const isSuccess = await verifyOTP(value);
    if (isSuccess) {
      otpRef.current?.clearInput();
      otpRef.current?.setValue('');
      onVerifySuccess && onVerifySuccess();
    } else {
      setAttemptCount(attemptCount + 1);
      otpRef.current?.clearInput();
      otpRef.current?.focus();
      onVerifyFailed && onVerifyFailed();
    }
  };

  const onResendOTP = () => {
    countdownRef.current?.restart();
    setIsShowingResendButton(false);
    clearError && clearError();
    if (resendOTP) {
      resendOTP();
    } else {
      generateOTP();
    }
    otpRef.current?.clearInput();
    otpRef.current?.focus();
  };

  const getErrorMessage = () => {
    const errorCode = errorVerifySignIn?.response?.status;
    switch (errorCode.toString()) {
      case ResponseStatus.BAD_REQUEST:
      case ResponseStatus.UNAUTHORIZED:
        return i18n.t('errors.login.otp_not_matched') ?? 'Your OTP does not match.';
      case ResponseStatus.TOO_MANY_REQUEST:
        return i18n.t('errors.login.too_many_request') ?? 'Too many request.';
      default:
        return i18n.t('errors.common.server') ?? 'Internal Server Error';
    }
  };

  const fancyTimeFormat = (duration: number) => {
    // Hours, minutes and seconds
    var hrs = ~~(duration / 3600);
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = '';

    if (hrs > 0) {
      ret += '' + (hrs < 10 ? `0${hrs}` : hrs) + ':' + (mins < 10 ? '00' : '');
    }

    ret += '' + (mins < 10 ? `0${mins}` : mins) + ':' + (secs < 10 ? '0' : '');
    ret += '' + secs;
    return ret;
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.safeArea}>
        <View style={styles.content}>
          <OTPField
            ref={otpRef}
            cellCount={6}
            isUnMasked={true}
            onChanged={setValue}
            style={{
              focusCellContainerStyle: { borderBottomColor: '#1EBCE8' },
            }}
          />
          {errorVerifySignIn && (
            <View style={styles.errorWrapper}>
              <View style={styles.rowCenter}>
                <TriangelDangerIcon size={12} />
                <Text style={styles.errorText}>{getErrorMessage()}</Text>
              </View>
            </View>
          )}
          <View style={styles.countdownWrapper}>
            <CountdownTimer
              ref={countdownRef}
              duration={120}
              onDone={() => {
                setIsShowingResendButton(true);
              }}
              formatTime={(sec: number) => `${fancyTimeFormat(sec)}s`}
              endText={'Resend'}
              style={{
                endTextStyle: styles.sendAnotherLabel,
                runningTextStyle: styles.durationLabel,
              }}
              onResend={onResendOTP}
            />
          </View>
        </View>
      </View>
      <View style={{ marginBottom: marginKeyboard }}>
        <ADBButton
          label={'Continue'}
          onPress={onValidateOTP}
          isLoading={isVerifyLogin}
          disabled={!isValid || isShowingResendButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default VerifyOTPComponent;
