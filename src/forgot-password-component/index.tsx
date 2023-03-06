import React, { useContext, useRef } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BackIcon, colors } from 'react-native-auth-component/src/assets';
import { fonts } from 'react-native-auth-component/src/assets/fonts';
import { Formik } from 'formik';
import { ADBInputField, ThemeContext } from 'react-native-theme-component';
import { ForgotPasswordData, ForgotPasswordSchema } from 'react-native-auth-component/src/forgot-password-component/model';
import Button from 'react-native-auth-component/src/adb-login-component/components/button';

export interface IForgotPassword {
  onGoBack: () => void;
}

const ADBForgotPasswordComponent: React.FC<IForgotPassword> = (props: IForgotPassword) => {
  const { i18n } = useContext(ThemeContext);
  const formikRef = useRef(null);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {

          }}
        >
          {<BackIcon width={17} height={12} />}
        </TouchableOpacity>
      </View>
      <View style={{ height: 24 }} />
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subTitle}>Enter your email below to reset your password.</Text>
      <Formik
        innerRef={formikRef}
        enableReinitialize={true}
        initialValues={ForgotPasswordData.empty()}
        validationSchema={ForgotPasswordSchema}
        onSubmit={(values) => {
        }}
      >
        {({ setFieldValue, handleChange, setFieldError, setFieldTouched, errors, touched, isValid, submitForm, values }) => {
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
              </View>
            </>
          )
        }}
      </Formik>
      <View style={[styles.bottomSection, { position: 'absolute', bottom: 0, width: '100%', marginHorizontal: 24 }]}>
        <Button label={'Continue'} onPress={() => { }} />
      </View>
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
    color: colors.primaryTextBlack,
    fontSize: 24,
    fontFamily: fonts.semiBold,
  },
  subTitle: {
    color: colors.primaryTextBlack,
    fontSize: 14,
    fontFamily: fonts.regular,
    marginTop: 8
  },
  backButtonContainerStyle: {
    padding: 15,
    marginLeft: 12,
    marginBottom: 8,
    width: 100
  },
  actionButton: {
    height: 60,
    borderRadius: 8,
    backgroundColor: 'white',
    shadowOffset: {
      width: 0,
      height: 1
    }
  },
  inputContainer: {
    paddingTop: 20
  },
  inputBottemContainer: {
    paddingVertical: 20
  },
  labelTextStyle: {
    fontSize: 12,
    lineHeight: 21,
    fontFamily: fonts.medium,
    color: colors.primaryText,
    marginBottom: 3,
    marginTop: 20
  },
  noteContainer: {
    borderRadius: 8,
    // backgroundColor: '#E7DBF5',
    // width: 327,
    padding: 15,
    paddingTop: 0,
    paddingHorizontal: 24
  },
  noteText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#4E4B50',
    lineHeight: 24
  },
  checkBoxWrapper: { marginBottom: 19 },
  checkBoxWrapperWithTooltip: {
    justifyContent: 'flex-start',
    flexDirection: 'row'
  },
  tooltip: { marginLeft: -5 },
  tooltipContent: { marginLeft: -1, borderRadius: 2 },
  tooltipArrow: { marginLeft: 4 },
  inputTitle: {
    marginBottom: 7
  },
  bottomSection: {
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
