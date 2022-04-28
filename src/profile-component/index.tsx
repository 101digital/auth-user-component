import { AuthContext } from '../auth-context/context';
import React, { ReactNode, useContext } from 'react';
import { SafeAreaView, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import useMergeStyles from './styles';

export type ProfileComponentProps = {
  style?: ProfileComponentStyles;
  appIcon?: ReactNode;
};

export type ProfileComponentStyles = {
  containerStyle?: StyleProp<ViewStyle>;
  headerContainerStyle?: StyleProp<ViewStyle>;
  avatarContainerStyle?: StyleProp<ViewStyle>;
  avatarTextStyle?: StyleProp<TextStyle>;
  userNameTextStyle?: StyleProp<TextStyle>;
};

const ProfileComponent = ({ style, appIcon }: ProfileComponentProps) => {
  const styles: ProfileComponentStyles = useMergeStyles(style);
  const { profile } = useContext(AuthContext);

  const fullName = `${profile?.firstName} ${profile?.lastName}`.trim();
  const shortName = () => {
    const parts = fullName.split(' ');
    return parts.length > 1 ? `${parts[0].charAt(0)}${parts[1].charAt(0)}` : fullName.charAt(0);
  };

  return (
    <SafeAreaView style={styles.containerStyle}>
      <View style={styles.headerContainerStyle}>
        {appIcon ?? <View />}
        <View style={styles.avatarContainerStyle}>
          <Text style={styles.avatarTextStyle}>{shortName()}</Text>
        </View>
      </View>
      <Text style={styles.userNameTextStyle}>{fullName}</Text>
    </SafeAreaView>
  );
};

export default ProfileComponent;
