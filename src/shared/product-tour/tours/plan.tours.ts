import { DriveStep } from 'driver.js';

export const PLAN_ADD_TRANSACTION_TOUR: DriveStep[] = [
  {
    element: '[data-tour="plan-first-date"]',
    popover: {
      title: 'Add an Auto Transaction',
      description: 'Click any date on the calendar to schedule a new auto transaction on that day.',
      side: 'bottom',
      align: 'start',
    },
  },
];

export const PLAN_BADGE_TOUR: DriveStep[] = [
  {
    element: '[data-tour="plan-badge"]',
    popover: {
      title: 'Hold or Resume',
      description: 'Click a badge to hold that scheduled occurrence, or click it again to resume it.',
      side: 'bottom',
      align: 'start',
    },
  },
];

export const PLAN_RULES_TOUR: DriveStep[] = [
  {
    element: '[data-tour="plan-rules"]',
    popover: {
      title: 'Auto Transactions',
      description: 'All your recurring rules live here. Pause, resume, or remove them at any time.',
      side: 'left',
      align: 'start',
    },
  },
];

// Runs the plan page's tours in sequence as one guided walkthrough.
export const PLAN_ONBOARDING_TOUR: DriveStep[] = [
  ...PLAN_ADD_TRANSACTION_TOUR,
  ...PLAN_BADGE_TOUR,
  ...PLAN_RULES_TOUR,
];
