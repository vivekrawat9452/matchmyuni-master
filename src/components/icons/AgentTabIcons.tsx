/**
 * Agent bottom-tab icons — Home + My Students (Figma agent flow).
 */
import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {colors} from '../../utils/colors';

type P = {size?: number; focused?: boolean};

export function AgentTabHomeIcon({size = 24, focused = false}: P) {
  const c = focused ? colors.primary : colors.navy;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z"
        stroke={c}
        strokeWidth={focused ? 2.2 : 1.8}
        fill={focused ? c : 'none'}
        fillOpacity={focused ? 0.12 : 0}
      />
    </Svg>
  );
}

export function AgentTabStudentsIcon({size = 24, focused = false}: P) {
  const c = focused ? colors.primary : colors.navy;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
        fill={c}
      />
    </Svg>
  );
}

export function AgentTabApplicationsIcon({size = 24, focused = false}: P) {
  const c = focused ? colors.primary : colors.navy;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm0 4v2h10V7H7zm0 4v2h6v-2H7z"
        fill={c}
        fillOpacity={focused ? 1 : 0.85}
      />
    </Svg>
  );
}

export function AgentTabMatchesIcon({size = 24, focused = false}: P) {
  const c = focused ? colors.primary : colors.navy;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6L12 2z"
        stroke={c}
        strokeWidth={focused ? 2 : 1.6}
        fill={focused ? c : 'none'}
        fillOpacity={focused ? 0.15 : 0}
      />
    </Svg>
  );
}

export function AgentTabProfileIcon({size = 24, focused = false}: P) {
  const c = focused ? colors.primary : colors.navy;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0H5z"
        fill={c}
        fillOpacity={focused ? 1 : 0.85}
      />
    </Svg>
  );
}
