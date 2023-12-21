import React from 'react';
import {
  StyleProp,
  ViewStyle,
  TouchableOpacityProps,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from 'react-native-auth-component/src/assets';
import { EyesClosedIcon, EyesIcon, defaultColors } from 'react-native-theme-component';

interface ComponentProps {
  isVisible: boolean;
  style?: StyleProp<ViewStyle>;
  isError?: boolean;
}

export type PasswordMaskProps = ComponentProps & TouchableOpacityProps;

export const PasswordMask = ({ isVisible, style, isError = false, ...restProps }: PasswordMaskProps) => {
  return (
    <TouchableOpacity activeOpacity={0.8} style={[styles.container, style]} {...restProps}>
      {isVisible ? (
        <EyesClosedIcon color={isError ? defaultColors.errorColor : undefined} />
      ) : (
        <EyesIcon  color={isError ? defaultColors.errorColor : undefined} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    alignSelf: 'center',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
