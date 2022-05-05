import React from 'react';
import {
  StyleProp,
  ViewStyle,
  TouchableOpacityProps,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { PasswordHideIcon, PasswordShowIcon } from '@/assets/icons';

interface ComponentProps {
  isVisible: boolean;
  style?: StyleProp<ViewStyle>;
}

export type PasswordMaskProps = ComponentProps & TouchableOpacityProps;

export const PasswordMask = ({ isVisible, style, ...restProps }: PasswordMaskProps) => {
  return (
    <TouchableOpacity activeOpacity={0.8} style={[styles.container, style]} {...restProps}>
      {isVisible ? (
        <PasswordHideIcon color={'black'} size={20} />
      ) : (
        <PasswordShowIcon color={'black'} size={20} />
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
