import { Formik, FormikProps } from 'formik';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Text,
  Keyboard,
} from 'react-native';
import { Button, InputField, InputPhoneNumber } from 'react-native-theme-component';
import { LoginComponentProps, LoginComponentRef, SignInData } from './types';
import useMergeStyles from './styles';
import { AuthServices } from '../services/auth-services';

const LoginComponent = forwardRef((props: LoginComponentProps, ref) => {
  const { Root, InputForm } = props;
  const [dialCode, setDialCode] = useState('');
  const rootStyles = useMergeStyles(Root?.style);
  const [isSigning, setIsSigning] = useState(false);
  const _type = InputForm?.props?.type ?? 'phonenumber';

  useImperativeHandle(
    ref,
    (): LoginComponentRef => ({
      updateCountryCode,
    })
  );

  const updateCountryCode = (code: string) => {
    setDialCode(code);
  };

  const handleOnSignIn = async (values: SignInData) => {
    Keyboard.dismiss();
    try {
      setIsSigning(true);
      const { username, password } = values;
      if (_type === 'phonenumber') {
        const sanitizedMobileNumber = username.replace(/\D+/g, '');
        await AuthServices.instance().login(sanitizedMobileNumber, password);
      } else {
        await AuthServices.instance().login(username, password);
      }
      const { data } = await AuthServices.instance().fetchProfile();
      Root?.props?.onLoginSuccess?.(data);
      setIsSigning(false);
    } catch (error) {
      setIsSigning(false);
      Root?.props?.onLoginFailed?.(error);
    }
  };

  const renderForm = (formProps: FormikProps<SignInData>) => (
    <View>
      {_type === 'email' ? (
        <InputField
          prefixIcon={InputForm?.component?.passwordIcon}
          name="username"
          returnKeyType="done"
          placeholder={InputForm?.props?.usernameHint ?? 'Email'}
          keyboardType="email-address"
          autoCapitalize="none"
          formatError={Root?.props?.formatError}
          style={InputForm?.style?.userNameInputFieldStyle}
        />
      ) : (
        <InputPhoneNumber
          dialCode={dialCode}
          onPressDialCode={InputForm?.props?.onPressDialCode}
          prefixIcon={<View>{InputForm?.component?.usernameIcon}</View>}
          name="username"
          returnKeyType="done"
          placeholder={InputForm?.props?.usernameHint ?? 'Mobile number'}
          autoCapitalize="none"
          formatError={Root?.props?.formatError}
          style={InputForm?.style?.userNameInputFieldStyle}
        />
      )}
      <InputField
        prefixIcon={InputForm?.component?.passwordIcon}
        name="password"
        returnKeyType="done"
        secureTextEntry
        placeholder={InputForm?.props?.passwordHint ?? 'Password'}
        autoCapitalize="none"
        formatError={Root?.props?.formatError}
        style={InputForm?.style?.passwordInputFieldStyle}
      />
      {Root.components?.renderForgotPasswordButton?.() ?? (
        <TouchableOpacity
          activeOpacity={0.8}
          style={rootStyles.forgotPasswordContainerStyle}
          onPress={Root.props.onPressForgotPassword}
        >
          <Text style={rootStyles.forgotPasswordLabelStyle}>
            {Root?.props?.forgotPasswordLabel ?? 'Forgot password'}
          </Text>
        </TouchableOpacity>
      )}
      <Button
        isLoading={isSigning}
        style={{
          primaryContainerStyle: {
            marginTop: 32,
          },
        }}
        label={Root?.props?.loginButtonLabel ?? 'LOGIN'}
        onPress={formProps.handleSubmit}
      />
    </View>
  );
  return (
    <KeyboardAvoidingView style={rootStyles.containerStyle} behavior="padding" enabled>
      <ScrollView keyboardShouldPersistTaps="handled">
        {Root?.components?.header}
        <Text style={rootStyles.formTitleStyle}>{Root?.props?.formTitle ?? 'Sign In'}</Text>
        <Formik
          initialValues={InputForm?.props?.initialSignInData ?? SignInData.empty()}
          validationSchema={InputForm?.props?.validationSchema}
          onSubmit={handleOnSignIn}
        >
          {renderForm}
        </Formik>
        {Root.components?.renderRegisterButton?.() ?? (
          <View style={rootStyles.signUpContainerStyle}>
            <Text style={rootStyles.noneAccountLabelStyle}>
              {Root?.props?.notAccountLabel ?? 'Not a user yet?'}
            </Text>
            <TouchableOpacity activeOpacity={0.8} onPress={Root.props.onPressRegister}>
              <Text style={rootStyles.signUpLabelStyle}>
                {Root?.props?.signUpLabel ?? 'Sign up here'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {Root?.components?.footer}
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

export default LoginComponent;
