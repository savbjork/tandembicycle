import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@app/navigation/types';
import { Text } from '@shared/components/ui/Text';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View className="flex-1 bg-surface-dim">
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-text mb-4">
            Fair Play
          </Text>
          <Text className="text-lg text-text-secondary text-center leading-[26px]">
            Achieve equitable division of household responsibilities
          </Text>
        </View>

        <View className="gap-4">
          <TouchableOpacity
            className="bg-primary-600 rounded-lg py-3.5 items-center"
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text className="text-base font-semibold text-white">
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-surface border-2 border-border rounded-lg py-3.5 items-center"
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text className="text-base font-semibold text-text">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-sm text-text-muted text-center mt-8 leading-5">
          Fair Play helps couples visualize and distribute household labor equitably
        </Text>
      </View>
    </View>
  );
};
