import React, { useContext, useEffect, useRef, useState } from 'react';
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
import { AuthContext } from 'react-native-auth-component/src/auth-context';

export interface INewPasswordComponent {
    onPressContinue: () => void;
    recoveryCode: string;
}

const NewPasswordComponent: React.FC<INewPasswordComponent> = (props: INewPasswordComponent) => {
    const { i18n } = useContext(ThemeContext);
    const [showNewPass, setShowNewPass] = useState(true);
    const [showConfirmPass, setShowConfirmPass] = useState(true);
    const [errorModal, setErrorModal] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const formikRef = useRef(null);
    const { onPressContinue, recoveryCode } = props;
    const tickIcon = <TickIcon height={11} width={17} />;
    const closeIcon = <CloseIcon height={11} width={17} />;
    const { resetUserPassword, isResetPassword, isResetPasswordError } = useContext(AuthContext)

    useEffect(() => {
        if (isResetPassword) {
            setSuccessModal(true);
        }
    }, [isResetPassword])

    function checkIs8Character(text: string) {
        return /^.{8,}$/.test(text)
    }

    function checkAtLeast1digit(text: string) {
        return /\d/.test(text)
    }

    function checkAtLeast1upperandLower(text: string) {
        return /[A-Z][a-z]/.test(text)
    }

    function checkSpecialCharacter(text: string) {
        return /[#?!@$%^&*-]/.test(text)
    }

    function validationCheck(val: string) {
        if (checkIs8Character(val) && checkAtLeast1upperandLower(val) && checkAtLeast1digit(val) && checkSpecialCharacter(val)) {
            return true
        } else {
            return false
        }
    }

    const resetPasswordCall = (val: string) => {
        resetUserPassword(recoveryCode, val)
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
                {({ setFieldTouched, errors, values }) => {
                    return (
                        <>
                            <View style={styles.inputContainer}>
                                <ADBInputField
                                    name={'createNew'}
                                    onBlur={() => {
                                        setFieldTouched('createNew')
                                    }}
                                    placeholder={i18n.t('reset_password.lbl_title_create_new_password') ?? 'Create new password'}
                                    secureTextEntry={showNewPass}
                                    autoCapitalize='none'
                                    suffixIcon={<PasswordMask onPress={() => { setShowNewPass(!showNewPass) }} isVisible={showNewPass} />}
                                />
                                <View style={{ height: 16 }} />
                                <ADBInputField
                                    name={'confirmNew'}
                                    onBlur={() => {
                                        setFieldTouched('confirmNew')
                                    }}
                                    placeholder={i18n.t('reset_password.lbl_title_confirm_password') ?? 'Confirm new password'}
                                    secureTextEntry={showConfirmPass}
                                    autoCapitalize='none'
                                    suffixIcon={<PasswordMask onPress={() => { setShowConfirmPass(!showConfirmPass) }} isVisible={showConfirmPass} />}
                                />
                                <View>
                                    <View style={styles.row}>
                                        {checkSpecialCharacter(values.createNew) ? tickIcon : closeIcon}
                                        <View style={styles.width} />
                                        <Text style={styles.subTitle12}>{i18n.t('reset_password.lbl_at_least_one_special_char') ?? 'At least one special character'}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        {checkAtLeast1upperandLower(values.createNew) ? tickIcon : closeIcon}
                                        <View style={styles.width} />
                                        <Text style={styles.subTitle12}>{i18n.t('reset_password.lbl_at_least_one_lower_uper') ?? 'At least one uppercase and lowercase letter'}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        {checkAtLeast1digit(values.createNew) ? tickIcon : closeIcon}
                                        <View style={styles.width} />
                                        <Text style={styles.subTitle12}>{i18n.t('reset_password.lbl_at_least_one_number') ?? 'At least one number'}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        {checkIs8Character(values.createNew) ? tickIcon : closeIcon}
                                        <View style={styles.width} />
                                        <Text style={styles.subTitle12}>{i18n.t('reset_password.lbl_be_at_least_8_char') ?? 'Be at least 8 characters'}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        {values.confirmNew !== values.createNew ? closeIcon : tickIcon}
                                        <View style={styles.width} />
                                        <Text style={styles.subTitle12}>{i18n.t('reset_password.lbl_both_password_match') ?? 'Both passwords match'}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.bottomSection, styles.absolute]}>
                                <Button
                                    label={i18n.t('reset_password.btn_continue') ?? 'Continue'}
                                    background={Object.keys(errors).length !== 0 || values.confirmNew !== values.createNew || values.confirmNew == '' || !validationCheck(values.confirmNew) || !validationCheck(values.createNew) ? colors.secondaryButton : colors.primaryBlack}
                                    disabled={Object.keys(errors).length !== 0 || values.confirmNew !== values.createNew || values.confirmNew == '' || !validationCheck(values.confirmNew) || !validationCheck(values.createNew)}
                                    onPress={() => resetPasswordCall(values.confirmNew)}
                                    loader={isResetPassword} />
                            </View>
                        </>
                    )
                }}
            </Formik>

            <BottomSheetModal isVisible={errorModal}>
                <View style={styles.errorContainer}>
                    <AlertCircleIcon size={55.5} />
                    <View style={{ height: 30 }} />
                    <Text style={[styles.title, { textAlign: 'center' }]}>{i18n.t('reset_password.lbl_sorry_there_was_problem') ?? 'Sorry, there was a problem'}</Text>
                    <Text style={[styles.subTitle, { textAlign: 'center' }]}>{i18n.t('reset_password.lbl_please_try_again') ?? 'Please try again.'}</Text>
                    <View style={{ height: 8 }} />
                    <Button label={i18n.t('reset_password.btn_done') ?? 'Done'} onPress={() => { setErrorModal(false) }} />
                </View>
            </BottomSheetModal>

            <BottomSheetModal isVisible={successModal}>
                <View style={styles.errorContainer}>
                    <SuccessIcon size={72} />
                    <View style={{ height: 30 }} />
                    <Text style={[styles.title, { textAlign: 'center' }]}>{i18n.t('reset_password.lbl_password_updated') ?? 'Password has been updated!'}</Text>
                    <Text style={[styles.subTitle, { textAlign: 'center' }]}>{i18n.t('reset_password.lbl_lets_login') ?? 'Now, let’s login to your account.'}</Text>
                    <View style={{ height: 8 }} />
                    <Button label={i18n.t('reset_password.btn_login') ?? 'Login'} onPress={onPressContinue} />
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
