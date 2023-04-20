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
import { ADBButton, OTPField, TriangelDangerIcon, ImageIcon } from 'react-native-theme-component';
import { OTPFieldRef } from 'react-native-theme-component/src/otp-field';
import authComponentStore from '../../services/local-store';
import { fonts } from '../../assets';
import { AuthContext } from '../../auth-context/context';

type ADBLoginWithPINProps = {
  onFailedVerified: () => void;
  onSuccessVerified: () => void;
  onError: (err: Error) => void;
  isSkipSMSOTP?: boolean;
};

const ADBLoginWithPINComponent = (prop: ADBLoginWithPINProps) => {
  const { onFailedVerified, onSuccessVerified, isSkipSMSOTP = false, onError } = prop;
  const { saveResumeURL } = useContext(AuthContext);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const marginKeyboard = keyboardHeight > 0 && Platform.OS === 'ios' ? keyboardHeight : 15;
  const otpRef = useRef<OTPFieldRef>();
  const [value, setValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNotMatched, setIsNotMatched] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const { PingOnesdkModule } = NativeModules;

  const validatePINNumber = async () => {
    setIsLoading(true);
    const resp = await authComponentStore.validatePin(value);
    if (!resp) {
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
      if (resp?.error) {
        setIsLoading(false);
        if (isSkipSMSOTP) {
          onSuccessVerified();
        } else {
          setIsLoading(false);
          onError && onError(resp.error);
          setIsNotMatched(false);
          setRetryCount(0);
        }
      } else if (resp.authSession) {
        console.log('setCurrentSessionId => id', resp.authSession.id);
        PingOnesdkModule.setCurrentSessionId(resp.authSession.id);
        saveResumeURL(resp?.resumeUrl);
        onSuccessVerified();
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
      console.log('event', e);
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
});

export default ADBLoginWithPINComponent;
