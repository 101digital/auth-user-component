import React, { useContext, useRef } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BackIcon, colors } from 'react-native-auth-component/src/assets';
import { fonts } from 'react-native-auth-component/src/assets/fonts';
import { Formik } from 'formik';
import { ADBInputField, ThemeContext } from 'react-native-theme-component';
import { ForgotPasswordData, ForgotPasswordSchema } from 'react-native-auth-component/src/forgot-password-component/model';
import Button from './components/button';

export interface IForgotPassword {
  onPressContinue: () => void;
}

const ADBForgotPasswordComponent: React.FC<IForgotPassword> = (props: IForgotPassword) => {
  const { i18n } = useContext(ThemeContext);
  const formikRef = useRef(null);
  const { onPressContinue } = props;
  return (
    <View style={styles.container}>
      <Formik
        innerRef={formikRef}
        enableReinitialize={true}
        initialValues={ForgotPasswordData.empty()}
        validationSchema={ForgotPasswordSchema}
        onSubmit={(values) => {
        }}
      >
        {({ setFieldTouched, errors, values }) => {
          return (
            <>
              <View style={styles.inputContainer}>
                <ADBInputField
                  name={'email'}
                  onBlur={() => {
                    setFieldTouched('email')
                  }}
                  placeholder={'Email'}
                />
                <View style={{ height: 16 }} />
                <ADBInputField
                  name={'nric'}
                  onBlur={() => {
                    setFieldTouched('nric')
                  }}
                  placeholder={'NRIC number'}
                />
              </View>
              <View style={[styles.bottomSection, styles.absolute]}>
                <Button label={i18n.t('reset_password.btn_continue') ?? 'Continue'} disabled={Object.keys(errors).length !== 0 || values.email === '' || values.nric === ''} background={Object.keys(errors).length !== 0 || values.email === '' || values.nric === '' ? colors.secondaryButton : colors.primaryBlack} onPress={onPressContinue} />
              </View>
            </>
          )
        }}
      </Formik>
    </View>
  );
};

export default ADBForgotPasswordComponent;

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
  absolute: { position: 'absolute', bottom: 10, width: '100%', marginHorizontal: 24 }
});
