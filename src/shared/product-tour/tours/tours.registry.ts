import { DriveStep } from 'driver.js';
import {
  DASHBOARD_ADD_BUDGET_TOUR,
  DASHBOARD_ADD_TRANSACTION_TOUR,
  DASHBOARD_ONBOARDING_TOUR,
} from './dashboard.tours';
import { PLAN_ADD_TRANSACTION_TOUR, PLAN_BADGE_TOUR, PLAN_RULES_TOUR, PLAN_ONBOARDING_TOUR } from './plan.tours';

// Add each new feature's tours here as: 'tour-id': STEPS_CONST
export const TOURS: Record<string, DriveStep[]> = {
  'dashboard-add-transaction': DASHBOARD_ADD_TRANSACTION_TOUR,
  'dashboard-add-budget': DASHBOARD_ADD_BUDGET_TOUR,
  'dashboard-onboarding': DASHBOARD_ONBOARDING_TOUR,
  'plan-add-transaction': PLAN_ADD_TRANSACTION_TOUR,
  'plan-badge': PLAN_BADGE_TOUR,
  'plan-rules': PLAN_RULES_TOUR,
  'plan-onboarding': PLAN_ONBOARDING_TOUR,
};
