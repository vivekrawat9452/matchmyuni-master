export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  /** token param arrives via deep-link; omitted = token input shown on screen */
  ResetPassword: {token?: string} | undefined;
  RoleSelect: undefined;
  SignupMethod: undefined;
  PhoneEntry: undefined;
  EmailEntry: undefined;
  PasswordCreate: undefined;
  AccountDetails: undefined;
  AgentPersonalDetails: undefined;
  AgentCountrySelect: undefined;
  AgentQueue: undefined;
  StudyInterests: undefined;
  LocationSelect: undefined;
  StartTimeline: undefined;
  BudgetSelect: undefined;
  Preparing: undefined;
  AgentPreparing: undefined;
  BrandSplash: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends AuthStackParamList {}
  }
}
