import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@app/navigation/types';
import { Screen } from '@shared/components/layout';
import { Button, Input } from '@shared/components/ui';
import { useMockAuth } from '@shared/hooks/useMockAuth';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC<Props> = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, isLoading } = useMockAuth();

  const handleSignUp = async () => {
    await signUp(name, email, password);
  };

  return (
    <Screen scrollable className="px-6 py-8">
      <View className="flex-1">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Create Account
        </Text>
        <Text className="text-gray-600 mb-8">
          Join Fair Play to start balancing household responsibilities
        </Text>

        <Input
          label="Name"
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          autoComplete="name"
        />

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
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password-new"
          helper="Must be at least 8 characters"
        />

        <Button
          title="Create Account"
          onPress={handleSignUp}
          isLoading={isLoading}
          size="lg"
          className="mt-4"
        />

        <Text className="text-sm text-gray-500 text-center mt-6">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy
        </Text>
      </View>
    </Screen>
  );
};

