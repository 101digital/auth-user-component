import React, { forwardRef, Fragment, useContext, useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemeContext, InputField, Button } from 'react-native-theme-component';
import AlertModal from '../change-password-component/alert-modal/index';
import { RecoveryData, RecoveryPasswordComponentProps } from './types';
import useMergeStyles from './styles';
import { AuthContext } from '../auth-context';
import { Formik, FormikProps } from 'formik';
import { BackIcon } from '../assets/icons';
import { colors } from '../assets/colors';

const RecoveryPasswordComponent = forwardRef((props: RecoveryPasswordComponentProps) => {
  const { Root, InputForm } = props;
  const { i18n } = useContext(ThemeContext);
  const {saveUserPhoneNumber} = useContext(AuthContext);

  const rootStyles = useMergeStyles(Root?.style);
  
  const handleOnRecoverPassword = async (values: RecoveryData) => {
    Keyboard.dismiss();
    saveUserPhoneNumber(values.phoneNumber);
    Root?.props?.onRecoveryPasswordSuccess();
  };

  const renderForm = ({ values, submitForm, isValid }: FormikProps<RecoveryData>) => {
    const { phoneNumber } = values;
    const isInputValid = phoneNumber.length > 0 && isValid;

    return (
      <Fragment>
        <View style={rootStyles.content}>
          <Text style={rootStyles.subTitle}>
            {i18n?.t('recovery_password_component.lbl_enter_phone_number') ?? 'Enter your mobile number to verify your identity.'}
          </Text>
          <InputField
            name="phoneNumber"
            returnKeyType="done"
            placeholder={
              i18n?.t('recovery_password_component.lbl_mobile_number') ?? 'Enter mobile number'
            }
            keyboardType="number-pad"
            autoCapitalize="none"
            formatError={Root?.props?.formatError}
            style={InputForm?.style?.phoneNumberInputFieldStyle}
          />
        </View>

        <Button
          // isLoading={isRecoveringUserPassword}
          style={rootStyles.loginButtonStyle}
          label={i18n?.t('recovery_password_component.lbl_proceed') ?? 'Proceed'}
          onPress={submitForm}
          disabled={!isInputValid}
          disableColor={colors.secondaryButton}
        />
      </Fragment>
    );
  };

  return (
    <>
        <View style={rootStyles.container}>
          <SafeAreaView>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Root.props.onPressBack();
              }}
              style={rootStyles.backButtonContainerStyle}
            >
              {<BackIcon width={17} height={12} />}
            </TouchableOpacity>

            <Text style={rootStyles.formTitleStyle}>
              {i18n?.t('recovery_password_component.lbl_forgot_password') ?? 'Forgot password'}
            </Text>
          </SafeAreaView>
          <Formik
            initialValues={RecoveryData.empty()}
            validationSchema={InputForm?.props?.validationSchema}
            onSubmit={handleOnRecoverPassword}
          >
            {renderForm}
          </Formik>
        </View>
      {/* <AlertModal
        isVisible={isShowErrorModal}
        title={i18n?.t('recovery_password_component.lbl_error_title') ?? 'Oops!'}
        message={
          i18n?.t('recovery_password_component.lbl_error_message') ??
          'Looks like the mobile number you entered is not linked to a UnionDigital Bank account. Please try another mobile number or login to your account.'
        }
        onConfirmed={() => {
          setShowErrorModal(false);
          clearRecoveryUserPasswordError();
        }}
      /> */}
    </>
  );
});

export default RecoveryPasswordComponent;
