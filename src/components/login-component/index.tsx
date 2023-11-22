import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { colors as defaultColors } from '@/assets/Colors';
import { useAuth } from 'react-native-auth-component';
import { loginSchema } from './ValidationSchema';
import { Button,Input } from 'react-native-theme-component';

type LoginComponentProps = {
  loginSuccess: () => void;
  colors?: typeof defaultColors;
  title: string;
};

const LoginComponent: React.FC<LoginComponentProps> = ({ loginSuccess, colors = defaultColors, title }) => {
  const { login } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  const { control, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async ({ email, password }: { email: string; password: string }) => {
    try {
      const response = await login(email, password);
      if (response === true) {
        loginSuccess();
      } else {
        setLoginError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.log('error', error);
      setLoginError('An error occurred during login. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title? title :`Welcome to App studio`}</Text>
      <Controller
        name="email"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Input
            {...field}
            style={styles.input}
            inputWrapper={styles.inputWrapper}
            placeholder="Email"
            onChangeText={field.onChange}
            value={field.value}
            error={errors.email?.message}
            testID="email-input"
            colors={colors}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Input
            {...field}
            style={styles.input}
            inputWrapper={styles.inputWrapper}
            placeholder="Password"
            secureTextEntry
            onChangeText={field.onChange}
            value={field.value}
            error={errors.password?.message}
            colors={colors}
          />
        )}
      />
      {/*<Button
        title="Login"
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
        textProps={styles.buttonText}
        colors={colors}
      />*/}

      <View style={{ width:'100%'}}>
        <Button
          label="Login"
          onPress={handleSubmit(onSubmit)}
          variant= 'primary'
        />
      </View>

      {loginError && <Text style={styles.errorText}>{loginError}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: '50%',
    color: defaultColors.Blue,
  },
  input: {
    width: '100%',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    padding: 15,
    borderRadius: 5,
    width: '100%',
    backgroundColor: defaultColors.Blue,
  },
  buttonText: {
    color: defaultColors.White,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: defaultColors.Red,
    textAlign: 'left',
  },
});

export default LoginComponent;
