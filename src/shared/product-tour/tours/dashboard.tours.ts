import { DriveStep } from 'driver.js';

export const DASHBOARD_ADD_TRANSACTION_TOUR: DriveStep[] = [
  {
    element: '[data-tour="add-transaction"]',
    popover: {
      title: 'Add a Transaction',
      description: 'You can add transactions directly from here without navigating to the Transaction page.',
      side: 'bottom',
      align: 'start',
    },
  },
];

export const DASHBOARD_ADD_BUDGET_TOUR: DriveStep[] = [
  {
    element: '[data-tour="add-budget"]',
    popover: {
      title: 'Add a budget',
      description: 'You can add a buget directly from here without navigating to the Budget page',
      side: 'bottom',
      align: 'start',
    },
  },
];

// Runs the dashboard's tours in sequence as one guided walkthrough.
export const DASHBOARD_ONBOARDING_TOUR: DriveStep[] = [
  ...DASHBOARD_ADD_TRANSACTION_TOUR,
  ...DASHBOARD_ADD_BUDGET_TOUR,
];
