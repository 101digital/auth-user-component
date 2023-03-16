import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, fonts } from '../../assets';

interface IButton {
    background?: string;
    label: string;
    onPress?: () => void;
    labelColor?: string;
    disabled?: boolean;
    loader?: boolean;
}
const Button: React.FC<IButton> = (props: IButton) => {
    const { onPress, background, label, labelColor, disabled, loader } = props;
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.container, { backgroundColor: background ?? colors.primaryBlack, borderColor: disabled ? colors.secondaryButton : colors.primaryBlack, }]}
            disabled={disabled}
        >
            {loader && <ActivityIndicator size={20} color={colors.white} />}
            {!loader && <Text style={[styles.label, { color: labelColor ?? colors.white }]}>{label}</Text>}
        </TouchableOpacity>
    );
};

export default Button;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 100,
        padding: 16,
        borderWidth: 3,
    },
    label: {
        fontFamily: fonts.semiBold,
        fontSize: 16,
        color: colors.secondary,
        textAlign: 'center',
    },
});
