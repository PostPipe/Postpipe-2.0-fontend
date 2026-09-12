export const PLAN_LIMITS = {
  starter: {
    connectors: 2,
    submissions: 1000,
  },
  builder: {
    connectors: 10,
    submissions: 50000,
  },
  enterprise: {
    connectors: Infinity,
    submissions: Infinity,
  }
};
