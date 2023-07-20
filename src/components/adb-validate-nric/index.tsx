import { InputIdData, InputIdSchema } from './model';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Keyboard, Platform } from 'react-native';
import { ADBButton, ADBInputField, ThemeContext, defaultColors } from 'react-native-theme-component';
import { Formik, FormikProps } from 'formik';
import { AuthContext } from '../../auth-context';
import { InputTypeEnum } from 'react-native-theme-component/src/adb-input-field';

type ADBInputIdProps = {
  onVerifyNRICSuccess: () => void;
  onError: () => void;
  isLoading: boolean;
};

const ADBValidateUserNRICComponent = (prop: ADBInputIdProps) => {
  const { i18n } = useContext(ThemeContext);
  const { profile } = useContext(AuthContext);
  const formikRef = useRef<FormikProps<InputIdData>>(null);

  const { onVerifyNRICSuccess, onError, isLoading } = prop;

  const onShowInvalidIDNumber = () => {
    onError();
  };

  const validateIdNumber = async (id: string) => {
    Keyboard.dismiss();
    try {
      if (id.match(/^[^0-9a-zA-Z]+$/)) {
        onShowInvalidIDNumber();
        return;
      }
    } catch {
      onShowInvalidIDNumber();
      return;
    }

    if (
      profile?.kycDetails?.idNumber?.toLowerCase() === id.toLowerCase() ||
      profile?.kycDetails?.altIdNumber?.toLowerCase() === id.toLowerCase()
    ) {
      onVerifyNRICSuccess();
    } else {
      onError();
    }
  };

  return (
    <View style={styles.container}>
      <Formik
        innerRef={formikRef}
        enableReinitialize={true}
        initialValues={InputIdData.empty()}
        validationSchema={InputIdSchema(i18n)}
        onSubmit={(values) => validateIdNumber(values.userId)}
      >
        {({ submitForm, values, errors, touched }) => {
          return (
            <>
              <View style={styles.content}>
                <ADBInputField
                  type={'custom'}
                  inputType={InputTypeEnum.MATERIAL}
                  name={'userId'}
                  placeholder={i18n.t('id_number.login_id_placeholder') ?? 'ID number'}
                  maxLength={12}
                  testID="validate-id-input"
                  placeholderHint={
                    i18n.t('id_number.enter_your_id_number') ?? 'Enter your ID number'
                  }
                  placeholderTextColor={defaultColors.black500}
                  placeHolderHintTextColor={defaultColors.gray400}
                  errors={errors}
                  touched={touched}
                />
              </View>
              <View style={styles.bottomSection}>
              <ADBButton
                label={i18n.t('common.lbl_continue')}
                onPress={submitForm}
                isLoading={isLoading}
                disabled={values.userId.length === 0}
                testId="validate-id-continue-button"
              />
              </View>
            </>
          );
        }}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
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
  buttonAction: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 15,
  },
  content: {
    flex: 1,
  },
});

export default ADBValidateUserNRICComponent;
