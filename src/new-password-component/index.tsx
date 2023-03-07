import React, { useContext, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts } from 'react-native-auth-component/src/assets/fonts';
import { Formik } from 'formik';
import { ADBInputField, ThemeContext } from 'react-native-theme-component';
import Button from '../forgot-password-component/components/button';
import { NewPasswordData, NewPasswordSchema } from './modal';
import { colors } from '../assets/colors';
import { PasswordMask } from 'react-native-auth-component/src/change-password-component/password-mask';
import { ArrowRightIcon } from 'react-native-auth-component/src/assets';
import { TickIcon } from 'react-native-auth-component/src/assets/icons';
import { CloseIcon } from 'react-native-theme-component/src/assets';
import BottomSheetModal from 'react-native-theme-component/src/bottom-sheet';
import { AlertCircleIcon } from 'react-native-auth-component/src/assets/alert-circle.icon';
import { SuccessIcon } from 'react-native-theme-component/src/assets/success.icon';

export interface INewPasswordComponent {
    onPressContinue: () => void;
}

const NewPasswordComponent: React.FC<INewPasswordComponent> = (props: INewPasswordComponent) => {
    const { i18n } = useContext(ThemeContext);
    const [showNewPass, setShowNewPass] = useState(true);
    const [showConfirmPass, setShowConfirmPass] = useState(true);
    const [errorModal, setErrorModal] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const formikRef = useRef(null);
    const { onPressContinue } = props;
    const tickIcon = <TickIcon height={11} width={17} />;
    const closeIcon = <CloseIcon height={11} width={17} />;

    function checkIs8Character(text: string) {
        return /^.{8,}$/.test(text)
    }

    function checkAtLeast1digit(text: string) {
        return /^(?=.*?[0-9])$/.test(text)
    }

    function checkAtLeast1upperandLower(text: string) {
        return /^(?=.*?[A-Z])(?=.*?[a-z])$/.test(text)
    }

    function checkSpecialCharacter(text: string) {
        return /^(?=.*?[#?!@$%^&*-])$/.test(text)
    }


    return (
        <View style={styles.container}>
            <Formik
                innerRef={formikRef}
                enableReinitialize={true}
                initialValues={NewPasswordData.empty()}
                validationSchema={NewPasswordSchema}
                onSubmit={(values) => {
                }}
            >
                {({ setFieldValue, handleChange, setFieldError, setFieldTouched, errors, touched, isValid, submitForm, values }) => {
                    return (
                        <>
                            <View style={styles.inputContainer}>
                                <ADBInputField
                                    name={'createNew'}
                                    onBlur={() => {
                                        setFieldTouched('createNew')
                                    }}
                                    placeholder={'Create new password'}
                                    secureTextEntry={showNewPass}
                                    suffixIcon={<PasswordMask onPress={() => { setShowNewPass(!showNewPass) }} isVisible={showNewPass} />}
                                />
                                <View style={{ height: 16 }} />
                                <ADBInputField
                                    name={'confirmNew'}
                                    onBlur={() => {
                                        setFieldTouched('confirmNew')
                                    }}
                                    placeholder={'Confirm new password'}
                                    secureTextEntry={showConfirmPass}
                                    suffixIcon={<PasswordMask onPress={() => { setShowConfirmPass(!showConfirmPass) }} isVisible={showConfirmPass} />}
                                />
                                <View>
                                    <View style={styles.row}>
                                        {checkSpecialCharacter(values.createNew) ? tickIcon : closeIcon}
                                        <View style={styles.width} />
                                        <Text style={styles.subTitle12}>At least one special character</Text>
                                    </View>
                                    <View style={styles.row}>
                                        {checkAtLeast1upperandLower(values.createNew) ? tickIcon : closeIcon}
                                        <View style={styles.width} />
                                        <Text style={styles.subTitle12}>At least one uppercase and lowercase letter</Text>
                                    </View>
                                    <View style={styles.row}>
                                        {checkAtLeast1digit(values.createNew) ? tickIcon : closeIcon}
                                        <View style={styles.width} />
                                        <Text style={styles.subTitle12}>At least one number</Text>
                                    </View>
                                    <View style={styles.row}>
                                        {checkIs8Character(values.createNew) ? tickIcon : closeIcon}
                                        <View style={styles.width} />
                                        <Text style={styles.subTitle12}>Be at least 8 characters</Text>
                                    </View>
                                    <View style={styles.row}>
                                        {values.confirmNew !== values.createNew ? closeIcon : tickIcon}
                                        <View style={styles.width} />
                                        <Text style={styles.subTitle12}>Both passwords match</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.bottomSection, styles.absolute]}>
                                <Button
                                    label={'Continue'}
                                    background={Object.keys(errors).length !== 0 || values.confirmNew !== values.createNew ? colors.secondaryButton : colors.primaryBlack}
                                    disabled={Object.keys(errors).length !== 0 || values.confirmNew !== values.createNew} onPress={() => setSuccessModal(true)} />
                            </View>
                        </>
                    )
                }}
            </Formik>

            <BottomSheetModal isVisible={errorModal}>
                <View style={styles.errorContainer}>
                    <AlertCircleIcon size={55.5} />
                    <View style={{ height: 30 }} />
                    <Text style={[styles.title, { textAlign: 'center' }]}>Sorry, there was a problem</Text>
                    <Text style={[styles.subTitle, { textAlign: 'center' }]}>Please try again.</Text>
                    <View style={{ height: 8 }} />
                    <Button label={'Done'} onPress={() => { setErrorModal(false) }} />
                </View>
            </BottomSheetModal>

            <BottomSheetModal isVisible={successModal}>
                <View style={styles.errorContainer}>
                    <SuccessIcon size={72} />
                    <View style={{ height: 30 }} />
                    <Text style={[styles.title, { textAlign: 'center' }]}>Password has been updated!</Text>
                    <Text style={[styles.subTitle, { textAlign: 'center' }]}>Now, let’s login to your account.</Text>
                    <View style={{ height: 8 }} />
                    <Button label={'Login'} onPress={onPressContinue} />
                </View>
            </BottomSheetModal>
        </View>
    );
};

export default NewPasswordComponent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    title: {
        color: colors.primaryBlack,
        fontSize: 24,
        fontFamily: fonts.semiBold,
    },
    subTitle: {
        color: colors.primaryBlack,
        fontSize: 14,
        fontFamily: fonts.regular,
        marginTop: 8
    },
    subTitle12: {
        color: colors.primaryBlack,
        fontSize: 12,
        fontFamily: fonts.regular,
    },
    inputContainer: {
        paddingTop: 20
    },
    bottomSection: {
        marginBottom: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    absolute: { position: 'absolute', bottom: 0, width: '100%', marginHorizontal: 24 },
    errorContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 24
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12
    },
    width: {
        width: 11.5
    }
});
