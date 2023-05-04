import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Keyboard,
  Platform,
  Text,
  KeyboardAvoidingView,
  NativeModules,
} from 'react-native';
import { ADBButton, OTPField, TriangelDangerIcon, ImageIcon, ThemeContext } from 'react-native-theme-component';
import { OTPFieldRef } from 'react-native-theme-component/src/otp-field';
import authComponentStore from '../../services/local-store';
import { fonts } from '../../assets';
import { AuthContext } from '../../auth-context/context';
import BottomSheetModal from 'react-native-theme-component/src/bottom-sheet';
import { AlertCircleIcon } from '../../assets/icons';
import { PASSWORD_LOCKED_OUT } from '../../utils/index';
import { colors } from '../../assets';

type ADBLoginWithPINProps = {
  onFailedVerified: () => void;
  onSuccessVerified: () => void;
  onError: (err: Error) => void;
  isSkipSMSOTP?: boolean;
};

const ADBLoginWithPINComponent = (prop: ADBLoginWithPINProps) => {
  const { onFailedVerified, onSuccessVerified, onError } = prop;
  const { saveResumeURL, setIsSignedIn } = useContext(AuthContext);
  const { i18n } = useContext(ThemeContext);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const marginKeyboard = keyboardHeight > 0 && Platform.OS === 'ios' ? keyboardHeight : 15;
  const otpRef = useRef<OTPFieldRef>();
  const [value, setValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNotMatched, setIsNotMatched] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const { PingOnesdkModule } = NativeModules;
  const [errorModal, setErrorModal] = useState(false);

  const validatePINNumber = async () => {
    setIsLoading(true);
    const authorizeResponse = await authComponentStore.validatePin(value);
    if (!authorizeResponse) {
      setIsLoading(false);
      if (retryCount + 1 < 3) {
        setIsNotMatched(true);
        setRetryCount(retryCount + 1);
        otpRef.current?.clearInput();
        otpRef.current?.focus();
      } else {
        onFailedVerified();
      }
    } else {
      if (authorizeResponse?.status === 'FAILED') {
        setIsLoading(false);
        authComponentStore.storeIsUserLogged(false);
        setIsNotMatched(false);
        setRetryCount(0);
        if (authorizeResponse.error?.code === PASSWORD_LOCKED_OUT) {
          setErrorModal(true);
          return;
        }
        else {
          onError && onError(authorizeResponse.error);
          setIsSignedIn(false);
        } 
      } else if (authorizeResponse.authSession && authorizeResponse?.resumeUrl) {
        // const deviceId = await authComponentStore.getDeviceId();
        // const selectedDeviceId = authorizeResponse.selectedDevice?.id;

        // if (deviceId !== selectedDeviceId) {
        //   setIsSignedIn(false);
        //   authComponentStore.storeIsUserLogged(false);
        // } else {
        PingOnesdkModule.setCurrentSessionId(authorizeResponse.authSession.id);
        saveResumeURL(authorizeResponse?.resumeUrl);
        onSuccessVerified();
        // }
      }
    }
  };

  useEffect(() => {
    if (value.length === 6) {
      validatePINNumber();
    }
  }, [value]);

  useEffect(() => {
    otpRef.current?.focus();
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
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Aeon Digital Bank</Text>
          <View style={styles.imagePlaceHolderContainer}>
            <View style={styles.imagePlaceHolderWrapper}>
              <ImageIcon color={'#FFFFFF'} />
            </View>
          </View>
          <Text style={styles.pinTitle}>Enter your PIN</Text>
        </View>
        <OTPField
          ref={otpRef}
          cellCount={6}
          onChanged={setValue}
          style={{
            focusCellContainerStyle: { borderBottomColor: '#1EBCE8' },
          }}
          isUnMasked={false}
        />

        {isNotMatched && (
          <View style={styles.errorWrapper}>
            <View style={styles.rowCenter}>
              <TriangelDangerIcon size={20} />
              <Text style={styles.errorText}>{`PIN is incorrect. You have ${
                3 - retryCount
              } remaining attempts.`}</Text>
            </View>
          </View>
        )}
      </View>
      <View style={{ marginBottom: marginKeyboard }}>
        <ADBButton
          label={'Continue'}
          disabled={value.length < 6}
          onPress={validatePINNumber}
          isLoading={isLoading}
        />
      </View>
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
              `You’ve entered the wrong credentials too many times. Please try again after 1 hour.`}
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
  },
  header: {
    alignItems: 'center',
    paddingTop: 15,
  },
  bottomSection: {
    marginBottom: 15,
  },
  flex: {
    flex: 1,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  validContainer: {
    marginTop: 15,
  },
  validationLabel: {
    marginLeft: 6,
  },
  title: {
    color: '#1B1B1B',
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  rowItemValid: {
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorWrapper: {
    alignItems: 'center',
  },
  errorText: {
    color: '#020000',
    marginLeft: 7,
  },
  imagePlaceHolderContainer: {
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 55,
    marginBottom: 75,
  },
  imagePlaceHolderWrapper: {
    height: 80,
    width: 80,
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#D9D9D9',
    borderRadius: 80,
  },
  iconBtn: {
    marginRight: 10,
  },
  buttonAction: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 15,
  },
  content: {
    flex: 1,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  pinTitle: {
    color: '#858585',
    fontSize: 12,
  },
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
});

export default ADBLoginWithPINComponent;
