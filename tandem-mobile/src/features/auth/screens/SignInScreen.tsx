import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@app/navigation/types';
import { Screen } from '@shared/components/layout';
import { Button, Input } from '@shared/components/ui';
import { useMockAuth } from '@shared/hooks/useMockAuth';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export const SignInScreen: React.FC<Props> = () => {
  const [email, setEmail] = useState('sarah@example.com');
  const [password, setPassword] = useState('password123');
  const { signIn, isLoading } = useMockAuth();

  const handleSignIn = async () => {
    await signIn(email, password);
  };

  return (
    <Screen scrollable className="px-6 py-8">
      <View className="flex-1">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Welcome Back
        </Text>
        <Text className="text-gray-600 mb-8">
          Sign in to continue managing your household
        </Text>

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        <Button
          title="Sign In"
          onPress={handleSignIn}
          isLoading={isLoading}
          size="lg"
          className="mt-4"
        />

        <Button
          title="Forgot Password?"
          onPress={() => {}}
          variant="ghost"
          size="sm"
          className="mt-4"
        />
      </View>
    </Screen>
  );
};

