import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  ADBInputField,
  ThemeContext,
  ADBButton,
  EyesClosedIcon,
  EyesIcon,
} from 'react-native-theme-component';
import { Formik } from 'formik';
import { colors, fonts } from '../../assets';
import { AuthContext } from '../../auth-context/context';
import authComponentStore from '../../services/local-store';
import CookieManager from '@react-native-cookies/cookies';
import { useIsFocused } from '@react-navigation/native';
import BottomSheetModal from 'react-native-theme-component/src/bottom-sheet';
import { AlertCircleIcon } from '../../assets/icons';
import { PASSWORD_LOCKED_OUT } from '../../utils/index';
import { InputTypeEnum } from 'react-native-theme-component/src/adb-input-field';

type ADBLoginWithPasswordProps = {
  onSuccessVerified: () => void;
  onFailedVerified: () => void;
  onInvalidPassword: () => void;
  isEdit: boolean;
  onResetPassword: () => void;
  onExits: () => void;
};
const ADBLoginWithPasswordComponent = ({
  onSuccessVerified,
  onFailedVerified,
  onInvalidPassword,
  isEdit = false,
  onResetPassword,
  onExits
}: ADBLoginWithPasswordProps) => {
  const { i18n } = useContext(ThemeContext);
  const isFocused = useIsFocused();
  const { adbLoginSingleFactor, errorSignIn, isSigning, setIsSignedIn } = useContext(AuthContext);
  const [isVisiblePassword, setIsVisiblePassword] = React.useState(false);
  const formikRef = useRef(null);
  const [errorModal, setErrorModal] = useState(false);
  const [passwordLock, setPasswordLock] = useState('');

  useEffect(() => {
    if (errorSignIn) {
      onInvalidPassword();
      onFailedVerified();
    }
  }, [errorSignIn]);

  const onSubmit = async () => {
    const userName = await authComponentStore.getUserName();
    if (userName && formikRef.current?.values.password) {
      try {
        const response = await adbLoginSingleFactor(userName, formikRef.current?.values.password);
        if (response) {
          if (response?.error?.code === PASSWORD_LOCKED_OUT) {
            setErrorModal(true);
            setPasswordLock(
              i18n.t('login_component.password_lock') ??
                'You have 0 more tries until your account is locked.'
            );
          } else {
            onSuccessVerified();
          }
        } else {
          onInvalidPassword();
          onFailedVerified();
        }
      } catch {
        onInvalidPassword();
        onFailedVerified();
      }
    } else {
      onInvalidPassword();
      onFailedVerified();
    }
  };

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
                  suffixIcon={
                    <TouchableOpacity
                      onPress={() => setIsVisiblePassword(!isVisiblePassword)}
                      style={styles.iconBtn}
                    >
                      {!isVisiblePassword ? <EyesClosedIcon /> : <EyesIcon />}
                    </TouchableOpacity>
                  }
                />
                {passwordLock !== '' && (
                  <View style={styles.errorSection}>
                    <Text>{passwordLock}</Text>
                  </View>
                )}
                <TouchableOpacity onPress={onResetPassword}>
                  <Text style={styles.forgetPasswordLabel}>{`${
                    i18n.t('login_component.btn_forgot_password') ?? 'Forgot password'
                  }?`}</Text>
                </TouchableOpacity>
              </View>
              <ADBButton
                isLoading={isSigning}
                disabled={values?.password.length < 8}
                label={'Continue'}
                onPress={onSubmit}
              />
            </>
          );
        }}
      </Formik>
      <BottomSheetModal isVisible={errorModal}>
        <View style={styles.cameraDisableContainer}>
          <AlertCircleIcon size={72} />
          <View style={styles.gap40} />
          <Text style={[styles.loginTitle, { textAlign: 'center' }]}>
            {i18n.t('login_component.lbl_account_locked') ??
              `Oops! Your account is temporarily locked`}
          </Text>
          <View style={styles.gap8} />
          <Text style={[styles.modalsubTitle, { textAlign: 'center' }]}>
            {i18n.t('login_component.lbl_entered_wrong_password') ??
              `You’ve entered the wrong credentials too many times. Please try again after 1 hour.`}
          </Text>
          <View style={{ height: 32 }} />
          <ADBButton
            label={i18n.t('login_component.btn_done') ?? 'Done'}
            onPress={() => {
              setErrorModal(false);
              onExits();
            }}
          />
        </View>
      </BottomSheetModal>
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
    marginTop: 40,
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
