import { View, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@app/navigation/types';
import { Text } from '@shared/components/ui/Text';
import { Button } from '@shared/components/ui/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

/**
 * Welcome Screen - The entry point for unauthenticated users
 * Introduces the app and its value proposition
 */
export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-8 justify-between pt-20 pb-12">
        {/* Top Section: Branding */}
        <View className="items-center">
          <View className="w-20 h-20 bg-primary-600 rounded-[22px] items-center justify-center shadow-lg mb-8 rotate-3">
            <View className="w-12 h-1 bg-white rounded-full absolute top-6 rotate-[30deg]" />
            <View className="w-12 h-1 bg-white rounded-full absolute bottom-6 -rotate-[30deg]" />
          </View>

          <Text className="text-5xl font-bold text-text mb-4 tracking-tighter">Tandem</Text>
          <View className="h-1 w-12 bg-primary-600 rounded-full mb-6" />

          <Text className="text-xl text-text-secondary text-center leading-8 font-medium">
            Achieve equitable division of household responsibilities
          </Text>
        </View>

        {/* Middle Section: Value Props */}
        <View className="space-y-6">
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 bg-primary-50 rounded-full items-center justify-center">
              <Text className="text-primary-600 text-lg">⚖️</Text>
            </View>
            <View className="flex-1">
              <Text className="text-text font-bold text-base">Rebalance the Load</Text>
              <Text className="text-text-secondary text-sm">
                Quantify and redistribute domestic labor fairly.
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-4 mt-6">
            <View className="w-10 h-10 bg-secondary-50 rounded-full items-center justify-center">
              <Text className="text-secondary-600 text-lg">🤝</Text>
            </View>
            <View className="flex-1">
              <Text className="text-text font-bold text-base">Shared Ownership</Text>
              <Text className="text-text-secondary text-sm">
                Move from "helping" to true partnership.
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Section: Actions */}
        <View className="gap-4">
          <Button
            title="Get Started"
            onPress={() => navigation.navigate('SignUp')}
            variant="primary"
            className="w-full h-14 rounded-2xl shadow-sm"
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('SignIn')}
            className="py-4 items-center"
          >
            <Text className="text-text-secondary font-semibold">
              Already have an account? <Text className="text-primary-600">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
