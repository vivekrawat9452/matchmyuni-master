/**
 * Application-screen icons (course details, application flow).
 * Star path extracted from Figma node 560:1441.
 * Other icons are standard stroke-based SVGs matching the Figma style.
 */
import React from 'react';
import Svg, {Path} from 'react-native-svg';

type P = {size?: number; color?: string};

export function StarIcon({size = 20, color = '#1B2A4A'}: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 13 13">
      <Path d="M12.7867 5.79132L10.15 8.06652L10.9533 11.4691C10.9977 11.6538 10.9862 11.8475 10.9205 12.0257C10.8548 12.2039 10.7378 12.3587 10.5842 12.4704C10.4305 12.5821 10.2473 12.6458 10.0575 12.6534C9.86766 12.6611 9.67986 12.6123 9.51779 12.5132L6.5588 10.6921L3.59806 12.5132C3.43601 12.6117 3.24843 12.66 3.05896 12.6521C2.86949 12.6442 2.68659 12.5805 2.53329 12.4688C2.38 12.3572 2.26316 12.2027 2.1975 12.0248C2.13183 11.8469 2.12027 11.6535 2.16427 11.4691L2.97052 8.06652L0.333801 5.79132C0.190421 5.66741 0.0867262 5.50399 0.0356661 5.32149C-0.0153939 5.13899 -0.0115559 4.94549 0.0467008 4.76515C0.104958 4.58482 0.215051 4.42565 0.363232 4.30751C0.511414 4.18937 0.691115 4.11751 0.879895 4.10089L4.33693 3.82199L5.67052 0.594645C5.7427 0.418757 5.86556 0.268306 6.02347 0.162421C6.18138 0.0565364 6.36721 0 6.55734 0C6.74746 0 6.93329 0.0565364 7.0912 0.162421C7.24911 0.268306 7.37197 0.418757 7.44415 0.594645L8.77716 3.82199L12.2342 4.10089C12.4233 4.11689 12.6036 4.18835 12.7523 4.30633C12.901 4.4243 13.0116 4.58354 13.0702 4.76409C13.1289 4.94464 13.1329 5.13848 13.0818 5.32131C13.0308 5.50415 12.9269 5.66785 12.7832 5.79191L12.7867 5.79132Z" fill={color} />
    </Svg>
  );
}

export function CalendarIcon({size = 20, color = '#1B2A4A'}: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M16 2V6M8 2V6M3 10H21"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function GlobeIcon({size = 20, color = '#1B2A4A'}: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M2 12H22M12 2C9.84276 4.24892 8.6 7.61486 8.6 12C8.6 16.3851 9.84276 19.7511 12 22C14.1572 19.7511 15.4 16.3851 15.4 12C15.4 7.61486 14.1572 4.24892 12 2Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function GraduationIcon({size = 20, color = '#1B2A4A'}: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22 10L12 5L2 10L12 15L22 10ZM2 10V16"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M6 12.2V17C6 17 8.5 19.5 12 19.5C15.5 19.5 18 17 18 17V12.2"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function LocationIcon({size = 20, color = '#1B2A4A'}: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function CheckCircleIcon({size = 20, color = '#22C55E'}: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86356 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M22 4L12 14.01L9 11.01"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function ArrowUpCircleIcon({size = 20, color = '#E8613A'}: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        fill={color}
      />
      <Path
        d="M12 8V16M8 12L12 8L16 12"
        stroke="#FFFFFF"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function DocumentIcon({size = 20, color = '#1B2A4A'}: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M14 2V8H20M16 13H8M16 17H8M10 9H8"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function UploadIcon({size = 20, color = '#1B2A4A'}: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3L7 8M12 3V15"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function ChevronLeftIcon({size = 24, color = '#1B2A4A'}: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M15 18L9 12L15 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function SparkleIcon({size = 20, color = '#1B2A4A'}: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function ShieldCheckIcon({size = 20, color = '#1B2A4A'}: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M9 12L11 14L15 10"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
