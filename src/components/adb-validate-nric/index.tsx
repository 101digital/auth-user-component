import { InputIdData, InputIdSchema } from './model';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Keyboard, Platform } from 'react-native';
import { ADBButton, ADBInputField, ThemeContext } from 'react-native-theme-component';
import { Formik, FormikProps } from 'formik';
import { AuthContext } from '../../auth-context';

type ADBInputIdProps = {
  onVerifyNRICSuccess: () => void;
  onError: () => void;
};

const ADBValidateUserNRICComponent = (prop: ADBInputIdProps) => {
  const { i18n } = useContext(ThemeContext);
  const { profile } = useContext(AuthContext);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isLoadingVerifyUserId, setIsLoadingVerifyUserId] = useState<boolean>(false);
  const formikRef = useRef<FormikProps<InputIdData>>(null);
  const marginKeyboard = keyboardHeight > 0 && Platform.OS === 'ios' ? keyboardHeight : 15;

  console.log('profile?.kycDetails', profile?.kycDetails);
  const { onVerifyNRICSuccess, onError } = prop;

  const validateIdNumber = async (id: string) => {
    setIsLoadingVerifyUserId(true);
    const formatedId = id.replace(/[-]+/g, '');
    if (
      profile?.kycDetails?.idNumber === formatedId ||
      profile?.kycDetails?.altIdNumber === formatedId
    ) {
      onVerifyNRICSuccess();
    } else {
      onError();
    }

    console.log('profile', profile?.kycDetails);
    setIsLoadingVerifyUserId(false);
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      console.log('event', e);
      setKeyboardHeight(e.endCoordinates.height);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Formik
        innerRef={formikRef}
        enableReinitialize={true}
        initialValues={InputIdData.empty()}
        validationSchema={InputIdSchema}
        onSubmit={(values) => validateIdNumber(values.userId)}
      >
        {({ submitForm, setFieldValue, values }) => {
          if (
            (values.userId.length === 7 || values.userId.length === 10) &&
            values.userId[values.userId.length - 1] !== '-'
          ) {
            setFieldValue(
              'userId',
              `${values.userId.slice(0, values.userId.length - 1)}-${values.userId.slice(
                values.userId.length - 1
              )}`
            );
          }

          return (
            <>
              <View style={styles.content}>
                <ADBInputField
                  name={'userId'}
                  placeholder={i18n.t('id_number.placeholder') ?? 'ID number (according to MyKAD)'}
                />
              </View>
              <View style={{ marginBottom: marginKeyboard }}>
                <ADBButton
                  label={'Continue'}
                  onPress={submitForm}
                  isLoading={isLoadingVerifyUserId}
                  disabled={values.userId.length === 0}
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
    paddingTop: 25,
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
    marginTop: 15,
  },
});

export default ADBValidateUserNRICComponent;