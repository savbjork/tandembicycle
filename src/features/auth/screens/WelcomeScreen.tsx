import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@app/navigation/types';
import { Screen } from '@shared/components/layout';
import { Button } from '@shared/components/ui';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Fair Play</Text>
          <Text style={styles.subtitle}>
            Achieve equitable division of household responsibilities
          </Text>
        </View>

        <View style={styles.buttons}>
          <Button
            title="Sign In"
            onPress={() => navigation.navigate('SignIn')}
            variant="primary"
            size="lg"
            style={styles.button}
          />
          <Button
            title="Create Account"
            onPress={() => navigation.navigate('SignUp')}
            variant="outline"
            size="lg"
            style={styles.button}
          />
        </View>

        <Text style={styles.footer}>
          Fair Play helps couples visualize and distribute household labor equitably
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  buttons: {
    gap: 16,
  },
  button: {
    width: '100%',
  },
  footer: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 32,
  },
});
