import { Formik, FormikProps } from 'formik';
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useState } from 'react';
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
import { AuthContext } from '../auth-context';
import { DefaultLogoIcon, EmailIcon, PasswordIcon, PhoneIcon } from '../assets';

const LoginComponent = forwardRef((props: LoginComponentProps, ref) => {
  const { Root, InputForm } = props;
  const [dialCode, setDialCode] = useState('');
  const rootStyles = useMergeStyles(Root?.style);
  const _type = InputForm?.props?.type ?? 'phonenumber';
  const { login, isSignedIn, errorSignIn, isSigning } = useContext(AuthContext);

  useEffect(() => {
    if (isSignedIn) {
    }
  }, [isSignedIn]);

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
    const { username, password } = values;
    const _username = _type === 'phonenumber' ? username.replace(/\D+/g, '') : username;
    const profile = await login(_username, password);
    if (profile) {
      Root?.props?.onLoginSuccess?.(profile);
    } else if (errorSignIn) {
      Root?.props?.onLoginFailed?.(errorSignIn);
    }
  };

  const renderForm = (formProps: FormikProps<SignInData>) => (
    <View>
      {_type === 'email' ? (
        <InputField
          prefixIcon={
            InputForm?.component?.usernameIcon ?? <EmailIcon width={30} height={30} color="grey" />
          }
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
          prefixIcon={
            <View>
              {InputForm?.component?.usernameIcon ?? (
                <PhoneIcon width={30} height={30} color="grey" />
              )}
            </View>
          }
          name="username"
          returnKeyType="done"
          placeholder={InputForm?.props?.usernameHint ?? 'Mobile number'}
          autoCapitalize="none"
          formatError={Root?.props?.formatError}
          style={InputForm?.style?.userNameInputFieldStyle}
        />
      )}
      <InputField
        prefixIcon={
          InputForm?.component?.passwordIcon ?? <PasswordIcon width={30} height={30} color="grey" />
        }
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
        <View style={rootStyles.logoContainerStyle}>
          {Root?.components?.header ?? <DefaultLogoIcon width={120} height={120} />}
        </View>
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
