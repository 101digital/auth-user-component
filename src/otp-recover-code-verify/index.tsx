import React, { useContext, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BackIcon, colors } from 'react-native-auth-component/src/assets';
import { fonts } from 'react-native-auth-component/src/assets/fonts';
import { Formik } from 'formik';
import { ADBInputField, ThemeContext } from 'react-native-theme-component';
import Button from 'react-native-auth-component/src/forgot-password-component/components/button';
import { RecoverCodeData, RecoverCodeSchema } from './model';
import BottomSheetModal from 'react-native-theme-component/src/bottom-sheet';
import { AlertCircleIcon } from '../assets/alert-circle.icon';

export interface IVerifyOTPRecover {
  onPressContinue: (recoverCode: string) => void;
}

const ADBVerifyOTPRecoverComponent: React.FC<IVerifyOTPRecover> = (props: IVerifyOTPRecover) => {
  const { i18n } = useContext(ThemeContext);
  const formikRef = useRef(null);
  const { onPressContinue } = props;
  const [errorModal, setErrorModal] = useState(false);
  return (
    <View style={styles.container}>
      <Formik
        innerRef={formikRef}
        enableReinitialize={true}
        initialValues={RecoverCodeData.empty()}
        validationSchema={RecoverCodeSchema}
        onSubmit={(values) => {
        }}
      >
        {({ setFieldTouched, errors, values }) => {
          return (
            <>
              <View style={styles.inputContainer}>
                <ADBInputField
                  name={'recoverCode'}
                  onBlur={() => {
                    setFieldTouched('recoverCode')
                  }}
                  placeholder={'Recovery code'}
                />
              </View>
              <View style={[styles.bottomSection, styles.absolute]}>
                <Button label={i18n.t('reset_password.btn_continue') ?? 'Continue'}
                  disabled={Object.keys(errors).length !== 0 || values.recoverCode === ''}
                  background={Object.keys(errors).length !== 0 || values.recoverCode === '' ? colors.secondaryButton : colors.primaryBlack}
                  onPress={() => onPressContinue(values?.recoverCode)} />
              </View>
            </>
          )
        }}
      </Formik>
      <BottomSheetModal isVisible={errorModal}>
        <View style={styles.errorContainer}>
          <AlertCircleIcon size={72} />
          <View style={styles.gap30} />
          <Text style={[styles.title, { textAlign: 'center' }]}>Invalid code!</Text>
          <Text style={[styles.subTitle, { textAlign: 'center' }]}>Please try again.</Text>
          <View style={styles.gap30} />
          <Button label={'Done'} onPress={() => { setErrorModal(false) }} />
        </View>
      </BottomSheetModal>
    </View>
  );
};

export default ADBVerifyOTPRecoverComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
    marginTop: 8
  },
  inputContainer: {
    paddingTop: 20
  },
  bottomSection: {
    marginBottom: 15,
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
    paddingHorizontal: 24
  },
  gap30: {
    height: 30
  }
});
