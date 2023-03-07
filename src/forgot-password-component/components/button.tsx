import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, fonts } from '../../assets';

interface IButton {
    background?: string;
    label: string;
    onPress?: () => void;
    labelColor?: string;
    disabled?: boolean;

}
const Button: React.FC<IButton> = (props: IButton) => {
    return (
        <TouchableOpacity
            onPress={props.onPress}
            style={[styles.container, { backgroundColor: props.background ?? colors.primaryBlack, borderColor: props.disabled ? colors.secondaryButton : colors.primaryBlack, }]}
            disabled={props.disabled}
        >
            <Text style={[styles.label, { color: props.labelColor ?? colors.white }]}>{props.label}</Text>
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
