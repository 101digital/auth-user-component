import { OncompletedIcon } from '../../assets/icons';
import React, { useContext } from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Button, ThemeContext } from 'react-native-theme-component';
import useMergeStyles from './styles';

export type SuccessModelProps = {
  style?: SuccessModelStyles;
  onNext: () => void;
};

export type SuccessModelStyles = {
  containerStyle?: StyleProp<ViewStyle>;
  mainContainerStyle?: StyleProp<ViewStyle>;
  footerContainerStyle?: StyleProp<ViewStyle>;
  titleTextStyle?: StyleProp<TextStyle>;
  messageTextStyle?: StyleProp<TextStyle>;
};

const SuccessModel = ({ style, onNext }: SuccessModelProps) => {
  const styles: SuccessModelStyles = useMergeStyles(style);
  const { i18n } = useContext(ThemeContext);

  return (
    <View style={styles.containerStyle}>
      <View style={styles.mainContainerStyle}>
        <OncompletedIcon width={94} height={94} />
        <Text style={styles.titleTextStyle}>
          {i18n?.t('reset_password.lbl_success_title') ?? 'Success!'}
        </Text>
        <Text style={styles.messageTextStyle}>
          {i18n?.t('reset_password.lbl_success_message') ?? 'Your password was successfully updated!'}
        </Text>
      </View>
      <View style={styles.footerContainerStyle}>
        <Button
          label={i18n?.t('reset_password.lbl_success_next_btn') ?? 'Proceed to Login'}
          onPress={onNext}
        />
      </View>
    </View>
  );
};

export default SuccessModel;
