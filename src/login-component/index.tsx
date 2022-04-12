import { Formik, FormikProps } from 'formik';
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Text,
  Keyboard
} from 'react-native';
import {
  Button,
  ErrorModal,
  InputField,
  InputPhoneNumber,
  ThemeContext
} from 'react-native-theme-component';
import { LoginComponentProps, LoginComponentRef, SignInData } from './types';
import useMergeStyles from './styles';
import { AuthContext } from '../auth-context';
import { DefaultLogoIcon, EmailIcon, PasswordIcon, PhoneIcon } from '../assets';

const LoginComponent = forwardRef((props: LoginComponentProps, ref) => {
  const { Root, InputForm } = props;
  const { i18n, deviceCountryCode, countries } = useContext(ThemeContext);
  const [dialCode, setDialCode] = useState(deviceCountryCode);
  const rootStyles = useMergeStyles(Root?.style);
  const _type = InputForm?.props?.type ?? 'phonenumber';
  const { login, isSignedIn, errorSignIn, isSigning, clearSignInError } = useContext(AuthContext);

  useEffect(() => {
    if (isSignedIn) {
    }
  }, [isSignedIn]);

  useImperativeHandle(
    ref,
    (): LoginComponentRef => ({
      updateCountryCode
    })
  );

  const updateCountryCode = (code: string) => {
    setDialCode(code);
  };

  const handleOnSignIn = async (values: SignInData) => {
    Keyboard.dismiss();
    const { username, password } = values;
    const _username = _type === 'phonenumber' ? username.replace(/\D+/g, '') : username;
    const _country = countries.find(country => country.attributes.idd === dialCode);
    const profile = await login(_username, password, _country);
    if (profile) {
      Root?.props?.onLoginSuccess?.(profile);
    } else if (errorSignIn) {
      Root?.props?.onLoginFailed?.(errorSignIn);
    }
  };

  const renderForm = (formProps: FormikProps<SignInData>) => (
    <View>
      {InputForm?.props?.withLabel && (
        <Text>
          {' '}
          {_type === 'email'
            ? i18n?.t('login_component.lbl_email')
            : i18n?.t('login_component.lbl_mobile_number') ?? _type}{' '}
        </Text>
      )}

      {_type === 'email' ? (
        <InputField
          prefixIcon={
            InputForm?.component?.usernameIcon ?? <EmailIcon width={30} height={30} color="grey" />
          }
          name="username"
          returnKeyType="done"
          placeholder={i18n?.t('login_component.lbl_email') ?? 'Email'}
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
          placeholder={i18n?.t('login_component.lbl_mobile_number') ?? 'Mobile number'}
          autoCapitalize="none"
          formatError={Root?.props?.formatError}
          style={InputForm?.style?.userNameInputFieldStyle}
          withDialCode={InputForm?.props?.withDialCode}
        />
      )}

      {InputForm?.props?.withLabel && (
        <Text> {i18n?.t('login_component.lbl_password') ?? 'password'} </Text>
      )}
      <InputField
        prefixIcon={
          InputForm?.component?.passwordIcon ?? <PasswordIcon width={30} height={30} color="grey" />
        }
        name="password"
        returnKeyType="done"
        secureTextEntry={InputForm?.props?.isVisiblePassword}
        placeholder={i18n?.t('login_component.lbl_password') ?? 'Password'}
        autoCapitalize="none"
        formatError={Root?.props?.formatError}
        style={InputForm?.style?.passwordInputFieldStyle}
        suffixIcon={InputForm?.component?.suffixIcon ?? <></>}
      />

      {Root.components?.renderForgotPasswordButton?.() ?? (
        <TouchableOpacity
          activeOpacity={0.8}
          style={rootStyles.forgotPasswordContainerStyle}
          onPress={Root.props.onPressForgotPassword}
        >
          <Text style={rootStyles.forgotPasswordLabelStyle}>
            {i18n?.t('login_component.btn_forgot_password') ?? 'Forgot password'}
          </Text>
        </TouchableOpacity>
      )}
      <Button
        isLoading={isSigning}
        style={rootStyles.loginButtonStyle}
        label={i18n?.t('login_component.btn_login') ?? 'LOGIN'}
        onPress={formProps.handleSubmit}
      />
    </View>
  );

  return (
    <>
      <KeyboardAvoidingView style={rootStyles.containerStyle} behavior="padding" enabled>
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={rootStyles.logoContainerStyle}>
            {Root?.components?.header ?? <DefaultLogoIcon width={120} height={120} />}
          </View>
          <Text style={rootStyles.formTitleStyle}>
            {i18n?.t('login_component.lbl_sign_in') ?? 'Sign In'}
          </Text>
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
                {i18n?.t('login_component.lbl_not_an_account') ?? 'Not a user yet?'}
              </Text>
              <TouchableOpacity activeOpacity={0.8} onPress={Root.props.onPressRegister}>
                <Text style={rootStyles.signUpLabelStyle}>
                  {i18n?.t('login_component.btn_sign_up') ?? 'Sign up here'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {Root?.components?.footer}
        </ScrollView>
      </KeyboardAvoidingView>
      <ErrorModal
        error={
          errorSignIn
            ? Root.props?.genericError?.(errorSignIn) ?? {
                title: i18n?.t('common.lbl_error') ?? 'Something went wrong',
                message:
                  i18n?.t('common.msg_error') ??
                  'We are experiencing some temporary difficulties. Please try again later or contact our support team.'
              }
            : undefined
        }
        isShowClose={false}
        onClose={clearSignInError}
      />
    </>
  );
});

export default LoginComponent;
