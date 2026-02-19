import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@app/navigation/types';
import { useMockAuth } from '@shared/hooks/useMockAuth';
import { Text } from '@shared/components/ui/Text';
import { TextInput } from '@shared/components/ui/TextInput';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading } = useMockAuth();

  const handleSignIn = async () => {
    await signIn(email, password);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface-dim"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1 flex-grow px-6 pt-[60px] pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-10">
          <Text className="text-[32px] font-bold text-text mb-2">
            Welcome Back
          </Text>
          <Text className="text-base text-text-secondary leading-6">
            Sign in to continue managing your household
          </Text>
        </View>

        <View className="mb-8">
          <View className="mb-5">
            <Text className="text-sm font-semibold text-text mb-2">Email</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-base text-text"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View className="mb-5">
            <Text className="text-sm font-semibold text-text mb-2">Password</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-base text-text"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity className="items-end mb-6">
            <Text className="text-sm text-primary-600 font-medium">
              Forgot password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`bg-primary-600 rounded-lg py-3.5 items-center ${isLoading ? 'opacity-60' : ''}`}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            <Text className="text-base font-semibold text-white">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="items-center">
          <Text className="text-sm text-text-secondary text-center">
            Don't have an account?{' '}
            <Text
              className="text-primary-600 font-semibold"
              onPress={() => navigation.navigate('SignUp')}
            >
              Create Account
            </Text>
          </Text>

          <TouchableOpacity
            className="mt-4 py-2"
            onPress={() => navigation.navigate('Welcome')}
          >
            <Text className="text-sm text-text-secondary text-center">
              ← Back to Welcome
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
