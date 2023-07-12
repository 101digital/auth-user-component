import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  NativeModules,
  Platform,
} from 'react-native';
import {
  ADBButton,
  ImageIcon,
  ThemeContext,
  PinNumberComponent,
} from 'react-native-theme-component';
import { OTPFieldRef } from 'react-native-theme-component/src/otp-field';
import authComponentStore from '../../services/local-store';
import { fonts } from '../../assets';
import { AuthContext } from '../../auth-context/context';
import BottomSheetModal from 'react-native-theme-component/src/bottom-sheet';
import { AlertCircleIcon } from '../../assets/icons';
import { PASSWORD_LOCKED_OUT } from '../../utils/index';
import { colors } from '../../assets';
import { AuthServices } from 'react-native-auth-component';
import { AeonIcon } from "@/assets/icons";

type ADBLoginWithPINProps = {
  onFailedVerified: () => void;
  onSuccessVerified: () => void;
  onError: (err: Error) => void;
  isSkipSMSOTP?: boolean;
  onShowLockDownModal: () => void;
};

const ADBLoginWithPINComponent = (prop: ADBLoginWithPINProps) => {
  const { onFailedVerified, onSuccessVerified, onError, onShowLockDownModal } = prop;
  const { saveResumeURL, setIsSignedIn } = useContext(AuthContext);
  const { i18n } = useContext(ThemeContext);
  const otpRef = useRef<OTPFieldRef>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNotMatched, setIsNotMatched] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const { PingOnesdkModule } = NativeModules;
  const [biometricStatus, setBiometricStatus] = useState(false);
  const [biometricAttempt, setBiometricAttempt] = useState(0);

  const checkBiometricStatus = async () => {
    const isEnabled = await authComponentStore.getIsEnableBiometric();
    if(isEnabled && JSON.parse(isEnabled)) {
      setBiometricStatus(true);
    }else{
      setBiometricStatus(false);
    }
  };

  const onValidatePINNumber = async (value: string) => {
    setIsLoading(true);
    const authorizeResponse = await authComponentStore.validatePin(value);
    if (!authorizeResponse) {
      setIsLoading(false);
      if (retryCount + 1 < 3) {
        setIsNotMatched(true);
        setRetryCount(retryCount + 1);
        otpRef.current?.clearInput();
      } else {
        otpRef.current?.clearInput();
        setIsNotMatched(false);
        setRetryCount(0);
        onFailedVerified();
      }
    } else {
      if (authorizeResponse?.status === 'FAILED') {
        setIsLoading(false);
        setIsNotMatched(false);
        setRetryCount(0);
        if (authorizeResponse.error?.code === PASSWORD_LOCKED_OUT) {
          onShowLockDownModal();
          return;
        } else {
          onError && onError(authorizeResponse.error);
          setIsSignedIn(false);
        }
      } else if (authorizeResponse.authSession && authorizeResponse?.resumeUrl) {
        PingOnesdkModule.setCurrentSessionId(authorizeResponse.authSession.id);
        AuthServices.instance().setSessionId(authorizeResponse.authSession.id);
        saveResumeURL(authorizeResponse?.resumeUrl);
        onSuccessVerified();
      }
    }
  };

  const onValidateBiometric = async () => {
    const authorizeResponse = await authComponentStore.validateBiometric(
            false,
            setIsLoading
          );
    if (authorizeResponse) {
      if (
        authorizeResponse.resumeUrl &&
        authorizeResponse.authSession &&
        authorizeResponse.selectedDevice?.id
      ) {
        PingOnesdkModule.setCurrentSessionId(authorizeResponse.authSession.id);
        saveResumeURL(authorizeResponse.resumeUrl);
      } else if (authorizeResponse.error && authorizeResponse.error.code) {
        setIsLoading(false);
        setBiometricAttempt(biometricAttempt + 1);
        if (authorizeResponse.error.code === 'PASSWORD_LOCKED_OUT') {
          onShowLockDownModal();
        } else if (authorizeResponse.error.code === 'BIOMETRIC_CHANGE') {
          setIsSignedIn(false);
        }
      } else {
        setIsLoading(false);
        setBiometricAttempt(biometricAttempt + 1);
        setIsSignedIn(false);
      }
      return;
    }
  };

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.imagePlaceHolderContainer}>
            <AeonIcon />
          </View>
          <Text style={styles.pinTitle}>
            {i18n.t('login_component.lbl_enter_pin') ?? `Enter your PIN`}
          </Text>
        </View>
        <PinNumberComponent
          key={'PinInput'}
          ref={otpRef}
          onValidatePin={onValidatePINNumber}
          onValidateBiometric={onValidateBiometric}
          isBiometricEnable={biometricAttempt < 3 && biometricStatus}
          showError={isNotMatched}
          errorMessage={(
            i18n?.t('login_component.lbl_incorrect_pin') ??
            'PIN is incorrect. You have %s remaining attempts.'
          ).replace('%s', 3 - retryCount)}
          isProcessing={isLoading}
          clearError={()=>{}}
        />
        <View style={styles.bottomSpacing}/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    backgroundColor:colors.lightWhite
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
    marginTop: 35,
    marginBottom: 32,
  },
  bottomSpacing: {
    height: Platform.OS === 'ios' ? 10 : 20
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
    color: colors.lightSubtitle,
    fontFamily: fonts.OutfitRegular,
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
    marginBottom: 32,
  },
  loginTitle: {
    fontSize: 24,
    color: colors.primaryBlack,
    fontFamily: fonts.semiBold,
  },
});

export default ADBLoginWithPINComponent;
