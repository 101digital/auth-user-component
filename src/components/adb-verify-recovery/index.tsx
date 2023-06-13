import React, { useContext, useState, useEffect, useRef } from 'react';
import { Keyboard, Platform, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../assets';
import { fonts } from '../../assets/fonts';
import { Formik, FormikProps } from 'formik';
import { ADBButton, ADBInputField, ThemeContext } from 'react-native-theme-component';
import { InputIdData, InputIdSchema } from './model';
import { InputTypeEnum } from 'react-native-theme-component/src/adb-input-field';

export interface IRecovery {
  onContinue: (recoveryCode: string) => void;
  onError: () => void;
}

const ADVerifyRecoveryCodeComponent: React.FC<IRecovery> = (props: IRecovery) => {
  const { onContinue, onError } = props;
  const { i18n } = useContext(ThemeContext);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const formikRef = useRef<FormikProps<InputIdData>>(null);
  const marginKeyboard = keyboardHeight ? keyboardHeight - 20 : Platform.OS === 'ios' ? 0 : 20;

  const handleOnContinue = async (values: InputIdData) => {
    Keyboard.dismiss();
    const { recoveryCode } = values;
    const _recoveryCode = recoveryCode.trim();
    if(_recoveryCode.match(/^[^0-9a-zA-Z]+$/)) {
      onError();
      return;
    }
    onContinue(_recoveryCode);
  };

  useEffect(() => {
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
    <View style={styles.container}>
      <Formik
        innerRef={formikRef}
        enableReinitialize={true}
        initialValues={InputIdData.empty()}
        onSubmit={handleOnContinue}
        validationSchema={InputIdSchema(i18n)}
      >
        {({ submitForm, values }) => {
          return (
            <>
              <View style={styles.content}>
                <View style={styles.rowInput}>
                  <ADBInputField
                    type='custom'
                    inputType={InputTypeEnum.MATERIAL}
                    name="recoveryCode"
                    maxLength={8}
                    returnKeyType="done"
                    placeholder={i18n.t('login_component.recovery_code') ?? 'Recovery code'}
                    autoCapitalize="none"
                    keyboardType={'default'}
                  />
                </View>
              </View>
              <View
                style={{
                  marginBottom: marginKeyboard,
                }}
              >
                <ADBButton
                  label={i18n.t('common.lbl_continue') ?? 'Continue'}
                  onPress={submitForm}
                  disabled={values.recoveryCode.length == 0}
                />
              </View>
            </>
          );
        }}
      </Formik>
    </View>
  );
};

export default ADVerifyRecoveryCodeComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 25,
    paddingTop: 20,
  },
  rowInput: {
    marginTop: 15,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#C2C2C2',
    width: 300,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 15,
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  lowerContainer: {
    flexDirection: 'row',
  },
  title: {
    color: '#1B1B1B',
    fontSize: 24,
    marginTop: 29,
    fontFamily: fonts.semiBold,
  },
  forgotPasswordTitle: {
    fontSize: 14,
  },
  helpTitle: {
    fontSize: 14,
  },
  flex: { flex: 1 },
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
  iconBtn: {
    marginRight: 10,
  },
});
