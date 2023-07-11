import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  ADBInputField,
  ThemeContext,
  ADBButton,
  EyesClosedIcon,
  EyesIcon,
  useThemeColors,
} from 'react-native-theme-component';
import { Formik } from 'formik';
import { colors, fonts } from '../../assets';
import { AuthContext } from '../../auth-context/context';
import authComponentStore from '../../services/local-store';
import CookieManager from '@react-native-cookies/cookies';
import { useIsFocused } from '@react-navigation/native';
import { PASSWORD_LOCKED_OUT } from '../../utils/index';
import { InputTypeEnum } from 'react-native-theme-component/src/adb-input-field';

type ADBLoginWithPasswordProps = {
  onSuccessVerified: () => void;
  onFailedVerified: () => void;
  onInvalidPassword: () => void;
  onResetPassword: () => void;
  onShowLockDownModal: () => void;
};
const ADBLoginWithPasswordComponent = ({
  onSuccessVerified,
  onFailedVerified,
  onInvalidPassword,
  onResetPassword,
  onShowLockDownModal,
}: ADBLoginWithPasswordProps) => {
  const { i18n } = useContext(ThemeContext);
  const isFocused = useIsFocused();
  const { adbLoginSingleFactor, errorSignIn, isSigning, setIsSignedIn } = useContext(AuthContext);
  const [isVisiblePassword, setIsVisiblePassword] = React.useState(false);
  const themeColors = useThemeColors();
  const formikRef = useRef(null);
  const [showIncorrectPassword, setShowIncorrectPassword] = useState<boolean>(false);

  useEffect(() => {
    if (errorSignIn) {
      onInvalidPassword();
      onFailedVerified();
    }
  }, [errorSignIn]);

  const onSubmit = async (password: string) => {
    const userName = await authComponentStore.getUserName();
    if (userName && password) {
      try {
        const response = await adbLoginSingleFactor(userName, password);
        if (response) {
          if (response?.error?.code === PASSWORD_LOCKED_OUT) {
            formikRef.current?.setFieldError(
              'password',
              i18n.t('login_component.incorrect_password') ?? 'Forgot password'
            );
            onShowLockDownModal();
            setShowIncorrectPassword(true);
            return;
          } else {
            onSuccessVerified();
          }
          onError();
        }
      } catch {
        onError();
      }
    } else {
      onError();
    }
  };

  const onError = () => {
    formikRef.current?.setFieldError(
      'password',
      i18n.t('login_component.incorrect_password') ?? 'Forgot password'
    );
    onInvalidPassword();
    onFailedVerified();
  }

  useEffect(() => {
    if (isFocused) {
      CookieManager.clearAll().then(() => {});
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <Formik innerRef={formikRef} initialValues={{ password: '' }} onSubmit={() => {}}>
        {({ values }) => {
          return (
            <>
              <View style={styles.content}>
                <ADBInputField
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  name={'password'}
                  secureTextEntry={!isVisiblePassword}
                  placeholder={'Password'}
                  onChange={() => setShowIncorrectPassword(false)}
                  suffixIcon={
                    <TouchableOpacity
                      onPress={() => setIsVisiblePassword(!isVisiblePassword)}
                      style={styles.iconBtn}
                    >
                      {!isVisiblePassword ? (
                        <EyesClosedIcon
                          color={showIncorrectPassword ? themeColors.errorColor : undefined}
                        />
                      ) : (
                        <EyesIcon
                          color={showIncorrectPassword ? themeColors.errorColor : undefined}
                        />
                      )}
                    </TouchableOpacity>
                  }
                  testID="password-input"
                />
                <TouchableOpacity onPress={onResetPassword} testID="forgot-password-button">
                  <Text style={styles.forgetPasswordLabel}>{`${
                    i18n.t('login_component.btn_forgot_password') ?? 'Forgot password'
                  }?`}</Text>
                </TouchableOpacity>
              </View>
              <ADBButton
                isLoading={isSigning}
                disabled={values?.password.length < 8}
                label={'Continue'}
                onPress={() => onSubmit(values?.password)}
                testId="continue-button"
              />
            </>
          );
        }}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  errorSection: {
    marginTop: 8,
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginTop: 30,
  },
  validContainer: {
    marginTop: 10,
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
  remainingLabel: {
    textAlign: 'right',
  },
  verticalSpacing: {
    height: 15,
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
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    color: colors.primaryBlack,
    fontFamily: fonts.OutfitSemiBold,
  },
  subtitle: {
    color: colors.primaryBlack,
    marginTop: 10,
  },
  subTitle: {
    fontSize: 14,
    color: colors.primaryBlack,
    fontFamily: fonts.OutfitRegular,
    marginTop: 14,
  },
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
  modalsubTitle: {
    fontSize: 14,
    color: colors.primaryBlack,
    fontFamily: fonts.OutfitRegular,
    marginTop: 8,
  },
  loginTitle: {
    fontSize: 24,
    color: colors.primaryBlack,
    fontFamily: fonts.OutfitSemiBold,
  },
  forgetPasswordLabel: {
    fontSize: 12,
    color: colors.boldText,
    fontFamily: fonts.OutfitSemiBold,
    marginTop: 8,
  },
});

export default ADBLoginWithPasswordComponent;
