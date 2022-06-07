import React, { useRef, useContext, useState, forwardRef, useEffect } from 'react';
import { BackIcon, HelpIcon } from '../assets/icons';
import { colors } from '../assets';
import AlertModal from './alert-modal';
import {
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  TouchableHighlight,
} from 'react-native';
import { ChangePasswordData, ChangePasswordSchema } from './model';
import { Formik } from 'formik';

import { ChangePasswordProps } from './types';
import { AuthContext } from '../auth-context';

import SuccessModel from './success-model';

import { Button, InputField, CheckBox } from 'react-native-theme-component';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// import { RegistrationContext } from '../../context/registration-context';
import { i18n } from '@/translations/translation-config';
import Tooltip from 'react-native-walkthrough-tooltip';
import { styles } from './styles';
/* eslint-disable no-useless-escape */
const ChangePassword = forwardRef((props: ChangePasswordProps) => {
  const { Root, InputForm } = props;
  const {
    isRecoveringUserPassword,
    recoveryUserPassword,
    changeUserPassword,
    saveUserNewPassword,
    requestResetUserPassword,
    isChangingPassword,
    isChangePassword,
    errorChangePassword,
    isRequestingResetUserPassword,
  } = useContext(AuthContext);

  const isResetPasswordMode = Root?.props?.isReset;

  const [isSelected1, setSelected1] = useState(false);
  const [isSelected2, setSelected2] = useState(false);
  const [isSelected3, setSelected3] = useState(false);
  const [isSelected4, setSelected4] = useState(false);
  const [toolTipVisible, setToolTipVisible] = useState(false);
  const [isShowErrorModal, setShowErrorModal] = useState(false);
  const [isChangeSuccess, setIsChangeSuccess] = useState(false);

  const formikRef: any = useRef(null);

  const handleOnSubmitForm = async (data: any) => {
    Keyboard.dismiss();
    try {
      if (isResetPasswordMode) {
        const respone = await recoveryUserPassword();
        if (respone?.data[0]) {
          const validInvitation = await requestResetUserPassword(respone?.data[0]);
          if (validInvitation) {
            saveUserNewPassword && saveUserNewPassword(data.password);
            Root?.props.onRequestResetSuccess();
          }
        }
      } else {
        await changeUserPassword(data.currentPassword, data.password, data.confirmPassword);
      }
    } catch (error) {
      console.log('error ', error);
    }
  };

  useEffect(() => {
    if (errorChangePassword) {
      setShowErrorModal(true);
    }
  }, [errorChangePassword]);

  useEffect(() => {
    if (isChangePassword) {
      setIsChangeSuccess(true);
    }
  }, [isChangePassword]);

  const onValidatePassword = (password: string) => {
    const purifiedPassword = password.replace(/\s/g, '');
    const hasNumber = /\d/;
    const isUpperCase = /^(?=.*?[A-Z])/;
    const isSpecialCharacter = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    // check password length is graterthan 7
    if (purifiedPassword.length > 7) {
      setSelected1(true);
    } else {
      setSelected1(false);
    }
    // check password contain at least 1 number
    if (purifiedPassword.length > 0 && hasNumber.test(purifiedPassword)) {
      setSelected2(true);
    } else {
      setSelected2(false);
    }
    // check password contain at least 1 upper case
    if (purifiedPassword.length > 0 && isUpperCase.test(purifiedPassword)) {
      setSelected3(true);
    } else {
      setSelected3(false);
    }
    // check password contain at least 1 special character
    if (purifiedPassword.length > 0 && isSpecialCharacter.test(purifiedPassword)) {
      setSelected4(true);
    } else {
      setSelected4(false);
    }
  };

  if (isChangeSuccess) {
    return (
      <View style={styles.successContainer}>
        <SuccessModel
          onNext={() => {
            Root.props.onPress();
          }}
        />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        {
          <>
            <SafeAreaView>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  Root.props.onPressBack();
                }}
                style={styles.backButtonContainerStyle}
              >
                {<BackIcon width={17} height={12} />}
              </TouchableOpacity>
              <Text style={styles.title}>
                {Root.props.title
                  ? Root.props.title
                  : i18n?.t('change_password.lbl_change_password')}
              </Text>
              <View style={styles.noteContainer}>
                <Text style={styles.noteText}>
                  {Root.props.subTitle
                    ? Root.props.subTitle
                    : i18n?.t('change_password.lbl_sub_title')}
                </Text>
              </View>
            </SafeAreaView>
            <Formik
              innerRef={formikRef}
              enableReinitialize={true}
              initialValues={ChangePasswordData.empty()}
              validationSchema={ChangePasswordSchema}
              onSubmit={(values) => {
                handleOnSubmitForm(values);
              }}
            >
              {({ handleChange, isValid, submitForm }) => {
                return (
                  <SafeAreaView style={styles.container}>
                    <KeyboardAwareScrollView
                      keyboardShouldPersistTaps="handled"
                      style={styles.mainContainer}
                      keyboardOpeningTime={Number.MAX_SAFE_INTEGER}
                      showsVerticalScrollIndicator={false}
                      extraScrollHeight={50}
                    >
                      {!isResetPasswordMode && (
                        <>
                          <Text style={styles.inputTitle}>
                            {i18n?.t('change_password.lbl_current_password') ?? 'Current Password'}
                          </Text>
                          <InputField
                            name="currentPassword"
                            returnKeyType="done"
                            secureTextEntry={InputForm?.props?.isVisiblePassword}
                            placeholder={
                              i18n?.t('change_password.plh_current_password') ??
                              'Enter current password'
                            }
                            autoCapitalize="none"
                            formatError={Root?.props?.formatError}
                            style={InputForm?.style?.passwordInputFieldStyle}
                            suffixIcon={InputForm?.component?.suffixIcon ?? <></>}
                            onChange={(e) => {
                              // onValidatePassword(e.nativeEvent.text);
                              handleChange('currentPassword');
                              // this.handleOffence( );
                            }}
                          />
                        </>
                      )}
                      <View style={styles.inputContainer}>
                        <Text style={styles.inputTitle}>
                          {i18n?.t('change_password.lbl_new_password') ?? 'New Password'}
                        </Text>
                        <InputField
                          name="password"
                          returnKeyType="done"
                          secureTextEntry={InputForm?.props?.isNewVisiblePassword}
                          placeholder={
                            i18n?.t('change_password.plh_new_password') ?? 'Enter new password'
                          }
                          autoCapitalize="none"
                          formatError={Root?.props?.formatError}
                          style={InputForm?.style?.passwordInputFieldStyle}
                          suffixIcon={InputForm?.component?.newSuffixIcon ?? <></>}
                          onChange={(e) => {
                            onValidatePassword(e.nativeEvent.text);
                            handleChange('password');
                            // this.handleOffence( );
                          }}
                        />
                      </View>
                      <View style={styles.inputBottemContainer}>
                        <Text style={styles.inputTitle}>
                          {i18n?.t('change_password.lbl_confirm_password') ??
                            'Confirm New Password'}
                        </Text>
                        <InputField
                          name="confirmPassword"
                          returnKeyType="done"
                          secureTextEntry={InputForm?.props?.isConfirmVisiblePassword}
                          placeholder={
                            i18n?.t('change_password.plh_confirm_password') ??
                            'plh_confirm_password'
                          }
                          autoCapitalize="none"
                          formatError={Root?.props?.confirmFormatError}
                          style={InputForm?.style?.passwordInputFieldStyle}
                          suffixIcon={InputForm?.component?.confirmSuffixIcon ?? <></>}
                        />
                      </View>
                      <View style={styles.checkBoxWrapper}>
                        <CheckBox
                          title={
                            i18n?.t('change_password.msg_rule_1') ?? 'Must be at least 8 characters'
                          }
                          isSelected={isSelected1}
                          onChanged={(value) => {
                            console.log('value ', value);
                          }}
                          style={InputForm?.style?.checkBoxInputFieldStyle}
                          // disabled
                        />
                      </View>
                      <View style={styles.checkBoxWrapper}>
                        <CheckBox
                          title={
                            i18n?.t('change_password.msg_rule_2') ??
                            'Must contain at least 1 number'
                          }
                          isSelected={isSelected2}
                          onChanged={(value) => {
                            console.log('value ', value);
                          }}
                          style={InputForm?.style?.checkBoxInputFieldStyle}
                        />
                      </View>
                      <View style={styles.checkBoxWrapper}>
                        <CheckBox
                          title={
                            i18n?.t('change_password.msg_rule_3') ??
                            'Must contain at least 1 upper case'
                          }
                          isSelected={isSelected3}
                          onChanged={(value) => {
                            console.log('value ', value);
                          }}
                          style={InputForm?.style?.checkBoxInputFieldStyle}
                        />
                      </View>
                      <View style={styles.checkBoxWrapperWithTooltip}>
                        <CheckBox
                          title={
                            i18n?.t('change_password.msg_rule_4') ??
                            'Must contain at least 1 special character '
                          }
                          isSelected={isSelected4}
                          onChanged={(value) => {
                            console.log('value ', value);
                          }}
                          style={InputForm?.style?.checkBoxInputFieldStyle}
                        />
                        {
                          <Tooltip
                            isVisible={toolTipVisible}
                            content={<Text>(ex. @!.,$/%^)</Text>}
                            onClose={() => setToolTipVisible(false)}
                            backgroundColor={'rgba(0,0,0,0.0)'}
                            placement={'bottom'}
                            tooltipStyle={styles.tooltip}
                            contentStyle={styles.tooltipContent}
                            arrowStyle={styles.tooltipArrow}
                          >
                            <TouchableHighlight onPress={() => setToolTipVisible(true)}>
                              <HelpIcon width={18} height={18} />
                            </TouchableHighlight>
                          </Tooltip>
                        }
                      </View>
                    </KeyboardAwareScrollView>
                    <Button
                      onPress={submitForm}
                      label={
                        isResetPasswordMode
                          ? i18n?.t('reset_password.lbl_btn_save')
                          : i18n?.t('common.btn_next')
                      }
                      isLoading={
                        isChangingPassword ||
                        isRequestingResetUserPassword ||
                        isRecoveringUserPassword
                      }
                      disabled={
                        !isSelected1 || !isSelected2 || !isSelected3 || !isSelected4 || !isValid
                      }
                      disableColor={colors.secondaryButton}
                      style={{
                        primaryContainerStyle: {
                          marginHorizontal: 24,
                          marginBottom: Platform.OS === 'android' ? 24 : 0,
                        },
                      }}
                    />
                  </SafeAreaView>
                );
              }}
            </Formik>
            <AlertModal
              isVisible={isShowErrorModal}
              title={i18n?.t('change_password.lbl_error_title') ?? 'Oops!'}
              message={
                i18n?.t('change_password.lbl_error_message') ??
                'The current password you entered is invalid. Please try again.'
              }
              onConfirmed={() => {
                setShowErrorModal(false);
              }}
            />
          </>
        }
      </View>
    );
  }
});

export default ChangePassword;
