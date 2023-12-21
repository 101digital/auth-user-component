import React from 'react';
import {
  StyleProp,
  ViewStyle,
  TouchableOpacityProps,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { EyesClosedIcon, EyesIcon, useThemeColors } from 'react-native-theme-component';

interface ComponentProps {
  isVisible: boolean;
  style?: StyleProp<ViewStyle>;
}

export type PasswordMaskProps = ComponentProps & TouchableOpacityProps;

export const PasswordMask = ({ isVisible, style, ...restProps }: PasswordMaskProps) => {
  const themeColors = useThemeColors();

  return (
    <TouchableOpacity activeOpacity={0.8} style={[styles.container, style]} {...restProps}>
      {isVisible ? (
        <EyesClosedIcon color={themeColors.primaryColor} size={24} />
      ) : (
        <EyesIcon color={themeColors.primaryColor} size={24} />
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
