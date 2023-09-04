import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, TextStyle } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  textProps?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({ title, textProps, ...props }) => {
  return (
    <TouchableOpacity {...props}>
      <Text style={textProps}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;
