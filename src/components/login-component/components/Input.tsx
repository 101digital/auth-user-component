import React, { forwardRef, Ref } from 'react';
import { TextInput, Text, View, StyleSheet, TextInputProps, ViewStyle, TextStyle } from 'react-native';

// Import the colors if not provided as a prop
import { colors as defaultColors } from '../../../assets/colors';

interface InputProps extends TextInputProps {
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  inputWrapper?: ViewStyle;
  textProps?: TextStyle;
  colors?: typeof defaultColors; // Declare a colors prop
}

const Input = forwardRef((props: InputProps, ref: Ref<TextInput>) => {
  const colors = props.colors || defaultColors; // Use the provided colors or import default colors

  return (
    <View style={[styles.inputWrapper, props.inputWrapper]}>
      <TextInput
        style={[styles.input, props.textProps]}
        placeholder={props.placeholder}
        secureTextEntry={props.secureTextEntry}
        ref={ref}
        {...props}
      />
      {props.error && (
        <Text style={[styles.errorText, { color: colors.red }, props.textProps]}>
          {props.error}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  inputWrapper: {
    width: '100%',
    marginVertical: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    padding: 10,
  },
  errorText: {
    textAlign: 'left', // Align error messages to the left
  },
});

export default Input;
