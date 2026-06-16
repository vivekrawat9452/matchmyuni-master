You are working inside an existing React Native TypeScript application.

IMPORTANT:

* Reuse existing architecture
* Reuse existing components
* Reuse existing API layer
* Follow current navigation patterns
* Do NOT create duplicate services/components
* Keep code modular
* Use current project folder structure

Use the following Graphify architecture context.

# Navigation Architecture

NODE AuthNavigator.tsx [src=src/navigation/AuthNavigator.tsx loc=L1 community=18]
NODE colors.ts [src=src/utils/colors.ts loc=L1 community=10]
NODE colors [src=src/utils/colors.ts loc=L7 community=10]
NODE DiscoverContainer.tsx [src=src/flows/main/Discover/DiscoverContainer.tsx loc=L1 community=65]
NODE useAuthStore [src=src/stores/authStore.ts loc=L25 community=18]
NODE MainAppNavigator.tsx [src=src/navigation/MainAppNavigator.tsx loc=L1 community=81]
NODE authStore.ts [src=src/stores/authStore.ts loc=L1 community=18]
NODE AgentPreparingContainer.tsx [src=src/flows/onboarding/Preparing/AgentPreparingContainer.tsx loc=L1 community=18]
NODE AppRoot.tsx [src=src/navigation/AppRoot.tsx loc=L1 community=287]
NODE PreparingContainer.tsx [src=src/flows/onboarding/Preparing/PreparingContainer.tsx loc=L1 community=18]
NODE authTypes.ts [src=src/navigation/authTypes.ts loc=L1 community=18]
NODE ResetPasswordContainer.tsx [src=src/flows/auth/ResetPassword/ResetPasswordContainer.tsx loc=L1 community=640]
NODE AuthStackParamList [src=src/navigation/authTypes.ts loc=L1 community=18]
NODE HomeDashboardContainer.tsx [src=src/flows/home/HomeDashboard/HomeDashboardContainer.tsx loc=L1 community=81]
NODE LoginContainer.tsx [src=src/flows/auth/Login/LoginContainer.tsx loc=L1 community=18]
NODE AccountDetailsContainer.tsx [src=src/flows/onboarding/AccountDetails/AccountDetailsContainer.tsx loc=L1 community=18]
NODE StartApplicationContainer.tsx [src=src/flows/main/StartApplication/StartApplicationContainer.tsx loc=L1 community=35]
NODE ForgotPasswordContainer.tsx [src=src/flows/auth/ForgotPassword/ForgotPasswordContainer.tsx loc=L1 community=18]
NODE PhoneEntryContainer.tsx [src=src/flows/onboarding/PhoneEntry/PhoneEntryContainer.tsx loc=L1 community=18]
NODE ErrorBoundary.tsx [src=src/components/ErrorBoundary.tsx loc=L1 community=10]
NODE AppStackNavigator.tsx [src=src/navigation/AppStackNavigator.tsx loc=L1 community=65]
NODE PasswordCreateContainer.tsx [src=src/flows/onboarding/PasswordCreate/PasswordCreateContainer.tsx loc=L1 community=18]
NODE LocationSelectContainer.tsx [src=src/flows/onboarding/LocationSelect/LocationSelectContainer.tsx loc=L1 community=18]
NODE EmailEntryContainer.tsx [src=src/flows/onboarding/EmailEntry/EmailEntryContainer.tsx loc=L1 community=18]
NODE BrandSplashScreen.tsx [src=src/flows/entry/BrandSplash/BrandSplashScreen.tsx loc=L1 community=10]
NODE SearchCoursesContainer.tsx [src=src/flows/main/SearchCourses/SearchCoursesContainer.tsx loc=L1 community=65]
NODE GlobalLoader.tsx [src=src/components/GlobalLoader.tsx loc=L1 community=309]
NODE CourseDetailsContainer.tsx [src=src/flows/main/CourseDetails/CourseDetailsContainer.tsx loc=L1 community=65]
NODE SignupMethodContainer.tsx [src=src/flows/onboarding/SignupMethod/SignupMethodContainer.tsx loc=L1 community=18]
NODE BudgetSelectContainer.tsx [src=src/flows/onboarding/BudgetSelect/BudgetSelectContainer.tsx loc=L1 community=18]
NODE StudyInterestsContainer.tsx [src=src/flows/onboarding/StudyInterests/StudyInterestsContainer.tsx loc=L1 community=18]
NODE StartTimelineContainer.tsx [src=src/flows/onboarding/StartTimeline/StartTimelineContainer.tsx loc=L1 community=18]
NODE App.tsx [src=App.tsx loc=L1 community=287]
NODE RoleSelectContainer.tsx [src=src/flows/onboarding/RoleSelect/RoleSelectContainer.tsx loc=L1 community=18]
NODE ErrorBoundary [src=src/components/ErrorBoundary.tsx loc=L21 community=287]
NODE AppStackList [src=src/navigation/AppStackNavigator.tsx loc=L15 community=65]
NODE WelcomeContainer.tsx [src=src/flows/entry/Welcome/WelcomeContainer.tsx loc=L1 community=18]
NODE useAuthHydrated.ts [src=src/hooks/useAuthHydrated.ts loc=L1 community=18]
NODE AppRoot() [src=src/navigation/AppRoot.tsx loc=L20 community=287]
NODE AccountDetailsContainer() [src=src/flows/onboarding/AccountDetails/AccountDetailsContainer.tsx loc=L13 community=18]
NODE EmailEntryContainer() [src=src/flows/onboarding/EmailEntry/EmailEntryContainer.tsx loc=L13 community=18]
NODE PasswordCreateContainer() [src=src/flows/onboarding/PasswordCreate/PasswordCreateContainer.tsx loc=L23 community=18]
NODE PreparingContainer() [src=src/flows/onboarding/Preparing/PreparingContainer.tsx loc=L17 community=18]
NODE AgentPreparingContainer() [src=src/flows/onboarding/Preparing/AgentPreparingContainer.tsx loc=L14 community=18]
NODE BrandSplashContainer.tsx [src=src/flows/entry/BrandSplash/BrandSplashContainer.tsx loc=L1 community=287]
NODE PhoneEntryContainer() [src=src/flows/onboarding/PhoneEntry/PhoneEntryContainer.tsx loc=L57 community=18]
NODE RoleSelectContainer() [src=src/flows/onboarding/RoleSelect/RoleSelectContainer.tsx loc=L8 community=18]
NODE LoginContainer() [src=src/flows/auth/Login/LoginContainer.tsx loc=L15 community=18]
NODE BrandSplashScreen [src=src/flows/entry/BrandSplash/BrandSplashScreen.tsx loc=L9 community=287]
NODE SignupMethodContainer() [src=src/flows/onboarding/SignupMethod/SignupMethodContainer.tsx loc=L10 community=18]
NODE LocationSelectContainer() [src=src/flows/onboarding/LocationSelect/LocationSelectContainer.tsx loc=L35 community=18]
NODE BudgetSelectContainer() [src=src/flows/onboarding/BudgetSelect/BudgetSelectContainer.tsx loc=L16 community=18]
NODE useAuthHydrated() [src=src/hooks/useAuthHydrated.ts loc=L5 community=287]
NODE StudyInterestsContainer() [src=src/flows/onboarding/StudyInterests/StudyInterestsContainer.tsx loc=L24 community=18]
NODE StartTimelineContainer() [src=src/flows/onboarding/StartTimeline/StartTimelineContainer.tsx loc=L15 community=18]
NODE MainAppNavigator() [src=src/navigation/MainAppNavigator.tsx loc=L46 community=65]
NODE AuthNavigator() [src=src/navigation/AuthNavigator.tsx loc=L28 community=287]
NODE GlobalLoader() [src=src/components/GlobalLoader.tsx loc=L17 community=309]
NODE StartApplicationContainer() [src=src/flows/main/StartApplication/StartApplicationContainer.tsx loc=L25 community=35]
NODE ResetPasswordContainer() [src=src/flows/auth/ResetPassword/ResetPasswordContainer.tsx loc=L27 community=
... (truncated to ~2000 token budget)


# API Architecture

[paste graph-context/api.md]

# Shared Components

[paste graph-context/components.md]

# Existing Screen Patterns

[paste graph-context/screens.md]

# Screen Specifications

[paste screen-specs.md]

# API Snippets

[paste api-snippets.md]

TASKS:

1. Create all listed screens
2. Integrate them into existing navigation stacks
3. Use existing API services/hooks
4. Create typings/interfaces where necessary
5. Reuse existing shared UI components
6. Follow current styling conventions
7. Add loading/error/empty states
8. Avoid duplicate business logic
9. Keep screens production-ready
10. Add navigation params/types correctly

IMPORTANT:

* Minimize creation of new abstractions
* Prefer existing architecture over new patterns
* Keep implementation scalable
* Ensure all imports follow current aliases and conventions
* Do not rewrite existing navigation architecture
