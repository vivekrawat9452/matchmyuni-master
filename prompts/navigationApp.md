# Navigation map (current)

**Entry:** `AppRoot` → `NavigationContainer` + root native stack (`src/navigation/AppRoot.tsx`)

**Pre-nav:** until `useAuthHydrated` + 1.5s min → `BrandSplashScreen` (no navigator)

**Root stack** (`RootP`: `Auth` | `App`) — branch on `accessToken` in `authStore`:
- **no token** → `Auth` → `AuthNavigator`
- **token** → `App` → `AppStackNavigator`

Overlay: `GlobalLoader` above tree. `ErrorBoundary` wraps stack.

---

## Auth branch — `AuthNavigator` (`src/navigation/AuthNavigator.tsx`)

Native stack, `initialRouteName: Welcome`. Route order in stack definition:

`Welcome` → `Login` → `ForgotPassword` → `ResetPassword` → `RoleSelect` → `SignupMethod` → `PhoneEntry` → `EmailEntry` → `PasswordCreate` → `AccountDetails` → `StudyInterests` → `LocationSelect` → `StartTimeline` → `BudgetSelect` → `Preparing` → `AgentPreparing` → `BrandSplash`

Types: `AuthStackParamList` (`src/navigation/authTypes.ts`)

---

## App branch — `AppStackNavigator` (`src/navigation/AppStackNavigator.tsx`)

Native stack `AppStackList`:
1. **`Tabs`** → `MainAppNavigator` (default / bottom of stack)
2. **`CourseDetails`** — slide from right
3. **`StartApplication`** — slide from bottom

---

## Tabs — `MainAppNavigator` (`src/navigation/MainAppNavigator.tsx`)

Bottom tabs `TabList`:

| route        | screen component              |
|-------------|-------------------------------|
| `Home`      | `HomeDashboardContainer`      |
| `DiscoverTab` | `DiscoverContainer`       |
| `ApplicationTab` | `ApplicationsContainer` |
| `MessageTab` | `MessagesContainer`        |
| `ProfileTab` | `ProfileContainer`         |

---

## Post-onboarding → Home (structural)

`BudgetSelect` lives on **Auth** stack. When `accessToken` is set, `AppRoot` re-renders and swaps **entire** root screen from `AuthNavigator` to `AppStackNavigator`. First app screen is **`Tabs`**; **`Home`** tab mounts `HomeDashboardContainer` (initial tab is first declared tab = Home).
