import { DriveStep } from 'driver.js';
import {
  DASHBOARD_ADD_BUDGET_TOUR,
  DASHBOARD_ADD_TRANSACTION_TOUR,
  DASHBOARD_ONBOARDING_TOUR,
} from './dashboard.tours';

// Add each new feature's tours here as: 'tour-id': STEPS_CONST
export const TOURS: Record<string, DriveStep[]> = {
  'dashboard-add-transaction': DASHBOARD_ADD_TRANSACTION_TOUR,
  'dashboard-add-budget': DASHBOARD_ADD_BUDGET_TOUR,
  'dashboard-onboarding': DASHBOARD_ONBOARDING_TOUR,
};
