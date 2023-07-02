import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView } from 'react-native';
import { ADBButton, NumberPadComponent, OTPField } from 'react-native-theme-component';
import { OTPFieldRef } from 'react-native-theme-component/src/otp-field';
import authComponentStore from '../../services/local-store';

type ADBInputPINVerifyProps = {
  onContinue: () => void;
  onFailed: () => void;
};

const ADBInputPINVerifyComponent = (props: ADBInputPINVerifyProps) => {
  const { onContinue, onFailed } = props;
  const otpRef = useRef<OTPFieldRef>();
  const [value, setValue] = useState<string>('');

  const validatePINNumber = async () => {
    const isValid = await authComponentStore.validatePin(value, true);
    if (isValid) {
      otpRef.current?.clearInput();
      onContinue();
    } else {
      onFailed();
    }
  };

  useEffect(() => {
    otpRef.current?.setValue(value);
  }, [value]);

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.content}>
        <OTPField
          ref={otpRef}
          isUnMasked={false}
          cellCount={6}
          onChanged={setValue}
          style={{
            focusCellContainerStyle: { borderBottomColor: '#1EBCE8' },
          }}
        />
      </View>
      <NumberPadComponent
        onPress={(e: string | number) => {
          switch (e) {
            case 'r':
              const newStr = value.substring(0, value.length - 1);
              setValue(newStr);
              break;
            case 'o':
              if (value.length < 6) {
                setValue(value + '0');
              }
              break;
            case 's':
              validatePINNumber();
              break;
            default:
              if (value.length < 6) {
                setValue(value + e);
              }
          }
        }}
        isDisabled={value.length < 6}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
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
    marginTop: 56,
  },
});

export default ADBInputPINVerifyComponent;
