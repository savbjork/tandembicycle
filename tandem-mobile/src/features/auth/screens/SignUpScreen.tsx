import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@app/navigation/types';
import { useAuth } from '@shared/hooks/useAuth';
import { Text } from '@shared/components/ui/Text';
import { TextInput } from '@shared/components/ui/TextInput';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, isLoading, error } = useAuth();

  const handleSignUp = async () => {
    await signUp(name, email, password);
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
        <View className="mb-8">
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="flex-row items-center gap-1 mb-8 -ml-1"
            >
                <Ionicons name="chevron-back" size={28} color="#374151" />
            </TouchableOpacity>
            <Text className="text-[32px] font-bold text-text tracking-tight mb-1">
                Create Account
            </Text>
            <Text className="text-base text-text-secondary">
                Join Tandem to start balancing household responsibilities
            </Text>
        </View>

        <View className="mb-6">
          <View className="mb-5">
            <Text className="text-sm font-semibold text-text mb-2">Name</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-text"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />
          </View>

          <View className="mb-5">
            <Text className="text-sm font-semibold text-text mb-2">Email</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-text"
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
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-text"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password-new"
            />
            <Text className="text-[13px] text-text-secondary mt-1.5">
              Must be at least 8 characters
            </Text>
          </View>

          {error && (
            <Text className="text-sm text-red-600 mb-3">{error}</Text>
          )}

          <TouchableOpacity
            className={`bg-primary-600 rounded-xl py-3.5 items-center mt-2 ${isLoading ? 'opacity-60' : ''}`}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text className="text-base font-semibold text-white">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-[13px] text-text-secondary text-center leading-[18px] mb-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </Text>

        <View className="items-center">
          <Text className="text-sm text-text-secondary">
            Already have an account?{' '}
            <Text
              className="text-primary-600 font-semibold"
              onPress={() => navigation.navigate('SignIn')}
            >
              Sign In
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
