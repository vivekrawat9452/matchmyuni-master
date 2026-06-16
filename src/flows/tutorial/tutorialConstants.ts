/** AsyncStorage flag — set after first student signup, cleared when tutorial finishes. */
export const SIGNUP_TUTORIAL_PENDING_KEY = 'mm_pending_signup_tutorial_v1';

export const SIGNUP_TUTORIAL_SEEN_KEY = 'mm_signup_tutorial_seen_v1';

export type TutorialStepId = 0 | 1 | 2 | 3;

export type TutorialStep = {
  id: TutorialStepId;
  /** Full Figma frame export (390×844 @2x) */
  image: number;
  figmaNodeId: string;
};

/** Figma nodes 645:3705 → 645:4064 → 645:4423 → 645:3349 */
export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 0,
    image: require('../../../assets/profile/tutorial_step1_right_swipe.png'),
    figmaNodeId: '645:3705',
  },
  {
    id: 1,
    image: require('../../../assets/profile/tutorial_step2_left_swipe.png'),
    figmaNodeId: '645:4064',
  },
  {
    id: 2,
    image: require('../../../assets/profile/tutorial_step3_tap_detail.png'),
    figmaNodeId: '645:4423',
  },
  {
    id: 3,
    image: require('../../../assets/profile/tutorial_step4_go_home.png'),
    figmaNodeId: '645:3349',
  },
];
