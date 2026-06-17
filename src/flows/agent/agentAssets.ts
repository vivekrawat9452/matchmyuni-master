/** Figma-exported assets — node 776:3650 (Home / New Advisor) */
export const agentFlowAssets = {
  bell: require('../../../assets/agentflow/icons/bell_notification.png'),
  rocket: require('../../../assets/agentflow/icons/rocket_journey.png'),
  checkDone: require('../../../assets/agentflow/icons/check_done.png'),
  clockProgress: require('../../../assets/agentflow/icons/clock_in_progress.png'),
  lockStep: require('../../../assets/agentflow/icons/lock_step.png'),
  whatsapp: require('../../../assets/agentflow/icons/whatsapp.png'),
  webinarBadge: require('../../../assets/agentflow/icons/webinar_badge.png'),
} as const;

/** Static copy from Figma — not yet on partner dashboard API */
export const agentHomeStatic = {
  welcomeBanner: "Welcome to MatchMyUni! Let's get you started 🚀",
  milestoneCta: 'Add your first student to begin the journey',
  journeyTitle: 'Your Advisor journey starts here',
  journeySubtitle: 'Complete these steps to submit your first application',
  accountManager: {
    title: 'Your Dedicated Account Manager',
    name: 'Rahul sharma',
    initials: 'RS',
    role: 'MatchMyUni Advisor Success Team',
    availability: 'Available Mon - Fri, 9am - 6pm IST',
    footer: 'Rahul will help you onboard your first students and answer any questions.',
    email: 'advisor-success@matchmyuni.com',
    whatsapp: '+919876543210',
  },
  skills: {
    title: 'Grow Your Skills',
    seeAll: 'See all →',
    webinars: [
      {
        id: 'uk-counseling',
        title: 'How to counsel students for UK universities',
        date: 'May 12, 2026, 3pm IST',
        registerLabel: 'Register →',
      },
      {
        id: 'uk-counseling-2',
        title: 'How to counsel students for UK universities',
        date: 'May 12, 2026, 3pm IST',
        registerLabel: 'Register →',
      },
    ],
  },
  footerCta: 'Add your first student →',
  footerAlt: '→ Or explore courses first',
} as const;
