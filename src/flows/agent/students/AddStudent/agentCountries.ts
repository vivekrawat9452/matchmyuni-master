/** Country list for agent add-student flow (dial codes + flags). */
export type AgentCountryItem = {
  name: string;
  dialCode: string;
  flag: string;
};

export const AGENT_COUNTRIES: AgentCountryItem[] = [
  {name: 'United States', dialCode: '+1', flag: '🇺🇸'},
  {name: 'Canada', dialCode: '+1', flag: '🇨🇦'},
  {name: 'Mexico', dialCode: '+52', flag: '🇲🇽'},
  {name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧'},
  {name: 'Germany', dialCode: '+49', flag: '🇩🇪'},
  {name: 'France', dialCode: '+33', flag: '🇫🇷'},
  {name: 'Italy', dialCode: '+39', flag: '🇮🇹'},
  {name: 'Spain', dialCode: '+34', flag: '🇪🇸'},
  {name: 'Australia', dialCode: '+61', flag: '🇦🇺'},
  {name: 'Japan', dialCode: '+81', flag: '🇯🇵'},
  {name: 'South Korea', dialCode: '+82', flag: '🇰🇷'},
  {name: 'Brazil', dialCode: '+55', flag: '🇧🇷'},
  {name: 'Nigeria', dialCode: '+234', flag: '🇳🇬'},
  {name: 'Ghana', dialCode: '+233', flag: '🇬🇭'},
  {name: 'Kenya', dialCode: '+254', flag: '🇰🇪'},
  {name: 'South Africa', dialCode: '+27', flag: '🇿🇦'},
  {name: 'India', dialCode: '+91', flag: '🇮🇳'},
  {name: 'Pakistan', dialCode: '+92', flag: '🇵🇰'},
  {name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩'},
  {name: 'UAE', dialCode: '+971', flag: '🇦🇪'},
  {name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦'},
  {name: 'Malaysia', dialCode: '+60', flag: '🇲🇾'},
  {name: 'Singapore', dialCode: '+65', flag: '🇸🇬'},
  {name: 'Philippines', dialCode: '+63', flag: '🇵🇭'},
  {name: 'Indonesia', dialCode: '+62', flag: '🇮🇩'},
];

export const DEFAULT_AGENT_COUNTRY = AGENT_COUNTRIES.find(c => c.name === 'Nigeria') ?? AGENT_COUNTRIES[0];
