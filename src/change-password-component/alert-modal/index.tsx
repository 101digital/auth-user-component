import { InformationIcon } from '../../assets/icons';
import React, { ReactNode, useEffect, useState } from 'react';
import { Dimensions, Platform, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import Modal from 'react-native-modal';
import Button, { ButtonStyles } from 'react-native-theme-component/src/button';
import useMergeStyles from './styles';

const deviceHeight =
  Platform.OS === 'ios'
    ? Dimensions.get('window').height
    : require('react-native-extra-dimensions-android').get('REAL_WINDOW_HEIGHT');

export type AlertModalStyles = {
  modalStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  titleTextStyle?: StyleProp<TextStyle>;
  messageTextStyle?: StyleProp<TextStyle>;
  footerStyle?: StyleProp<ViewStyle>;
  confirmButtonStyle?: ButtonStyles;
};

export type AlertModalProps = {
  title: string;
  message: string;
  isVisible?: boolean;
  headerIcon?: ReactNode;
  children?: ReactNode;
  confirmTitle?: string;
  backdropOpacity?: number;
  timeOut?: boolean;
  timeLimit?: number;
  style?: AlertModalStyles;
  animationIn?: 'fadeIn' | 'slideInUp' | 'zoomIn' | 'slideInRight';
  animationOut?: 'fadeOut' | 'slideOutDown' | 'zoomOut' | 'slideOutRight';
  animationInTiming?: number;
  animationOutTiming?: number;
  onConfirmed?: () => void;
  onBackButtonPress?: () => void;
  onBackdropPress?: () => void;
  onModalHide?: () => void;
  avoidKeyboard?: boolean;
};

const AlertModal = (props: AlertModalProps) => {
  const {
    title,
    children,
    onConfirmed,
    headerIcon,
    message,
    confirmTitle,
    backdropOpacity,
    style,
    isVisible,
    timeLimit,
    timeOut,
    ...restProps
  } = props;
  const [_isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      if (timeOut) {
        setTimeout(() => {
          setIsVisible(true);
        }, timeLimit ?? 100);
      } else {
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);
    }
  }, [isVisible]);

  const styles: AlertModalStyles = useMergeStyles(style);

  return (
    <Modal
      isVisible={_isVisible}
      deviceHeight={deviceHeight}
      backdropTransitionInTiming={50}
      backdropTransitionOutTiming={50}
      hideModalContentWhileAnimating
      useNativeDriverForBackdrop
      useNativeDriver
      backdropOpacity={backdropOpacity}
      statusBarTranslucent
      style={styles.modalStyle}
      {...restProps}
    >
      <View style={styles.containerStyle}>
        <View style={styles.headerStyle}>
          {headerIcon ?? <InformationIcon width={60} height={60} color={'#D32F2F'} />}
        </View>
        <Text style={styles.titleTextStyle}>{title}</Text>
        <Text style={styles.messageTextStyle}>{message}</Text>
        {children}
        <Button label={confirmTitle ?? 'Ok'} onPress={onConfirmed} />
      </View>
    </Modal>
  );
};

AlertModal.defaultProps = {
  isVisible: false,
  backdropOpacity: 0.5,
  animationIn: 'fadeIn',
  animationOut: 'fadeOut'
};

export default AlertModal;
