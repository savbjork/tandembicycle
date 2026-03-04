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
  TaskDetail: { taskId: string };
};

// Auth Stack Navigator
export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

// Main Stack Navigator (primary app stack, accessed from RosterTab)
export type MainStackParamList = {
  CardsList: undefined;
  CardDetail: { cardName: string };
  Tasks: undefined;
  Inbox: undefined;
  Profile: undefined;
};

// Main Bottom Tab Navigator
export type MainTabParamList = {
  RosterTab: NavigatorScreenParams<MainStackParamList>;
  InboxTab: undefined;
  HomeTab: undefined;
};

// Home Stack (repurposed from Profile)
export type HomeStackParamList = {
  HomeOverview: undefined;
  EditProfile: undefined;
  Settings: undefined;
  About: undefined;
};

// Household Stack (inside Household Tab/Section)
export type HouseholdStackParamList = {
  HouseholdOverview: undefined;
  HouseholdSettings: undefined;
  InviteMembers: undefined;
  MemberProfile: { userId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

