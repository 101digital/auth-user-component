import React, { useContext, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts } from 'react-native-auth-component/src/assets/fonts';
import { Formik } from 'formik';
import { ADBInputField, ThemeContext } from 'react-native-theme-component';
import Button from '../forgot-password-component/components/button';
import { NricverifyData, NricverifySchema } from './modal';
import { colors } from '../assets/colors';
import BottomSheetModal from 'react-native-theme-component/src/bottom-sheet';
import { AlertCircleIcon } from '../assets/alert-circle.icon';

export interface INricverify {
    onPressContinue: () => void;
}

const NricverifyComponent: React.FC<INricverify> = (props: INricverify) => {
    const { i18n } = useContext(ThemeContext);
    const formikRef = useRef(null);
    const [errorModal, setErrorModal] = useState(false);
    const { onPressContinue } = props;
    return (
        <View style={styles.container}>
            <Formik
                innerRef={formikRef}
                enableReinitialize={true}
                initialValues={NricverifyData.empty()}
                validationSchema={NricverifySchema}
                onSubmit={(values) => {
                }}
            >
                {({ setFieldValue, handleChange, setFieldError, setFieldTouched, errors, touched, isValid, submitForm, values }) => {
                    return (
                        <>
                            <View style={styles.inputContainer}>
                                <ADBInputField
                                    name={'nric'}
                                    onBlur={() => {
                                        setFieldTouched('nric')
                                    }}
                                    placeholder={'NRIC number'}
                                />
                            </View>
                            <View style={[styles.bottomSection, styles.absolute]}>
                                <Button label={'Continue'} background={Object.keys(errors).length !== 0 || values.nric === '' ? colors.secondaryButton : colors.primaryBlack} disabled={Object.keys(errors).length !== 0 || values.nric === ''} onPress={onPressContinue} />
                            </View>
                        </>
                    )
                }}
            </Formik>
            <BottomSheetModal isVisible={errorModal}>
                <View style={styles.errorContainer}>
                    <AlertCircleIcon size={55.5} />
                    <View style={{ height: 30 }} />
                    <Text style={[styles.title, { textAlign: 'center' }]}>Invalid credentials</Text>
                    <Text style={[styles.subTitle, { textAlign: 'center' }]}>Please try again.</Text>
                    <View style={{ height: 8 }} />
                    <Button label={'Done'} onPress={() => { setErrorModal(false) }} />
                </View>
            </BottomSheetModal>
        </View>
    );
};

export default NricverifyComponent;

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
});
