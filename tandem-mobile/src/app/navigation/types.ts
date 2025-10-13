import { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Navigation type definitions
 * Provides type safety for navigation throughout the app
 */

// Root Stack Navigator
export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  CreateHousehold: undefined;
  JoinHousehold: { inviteCode?: string };
};

// Auth Stack Navigator
export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

// Main Bottom Tab Navigator
export type MainTabParamList = {
  HomeTab: undefined;
  HouseholdTab: undefined;
  ProfileTab: undefined;
};

// Home Stack (inside Home Tab)
export type HomeStackParamList = {
  Dashboard: undefined;
  CardDetail: { cardId: string };
};

// Household Stack (inside Household Tab)
export type HouseholdStackParamList = {
  HouseholdOverview: undefined;
  HouseholdSettings: undefined;
  InviteMembers: undefined;
  MemberProfile: { userId: string };
};

// Profile Stack (inside Profile Tab)
export type ProfileStackParamList = {
  ProfileOverview: undefined;
  EditProfile: undefined;
  Settings: undefined;
  About: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

