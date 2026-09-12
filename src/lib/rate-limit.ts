import User from './auth/User';

import { sendQuotaWarningEmail } from './auth/email';
import dbConnect from './auth/mongodb';
import { ObjectId } from 'mongodb';

import { PLAN_LIMITS } from '@/config/plans';

/**
 * Checks if the user has reached their connector limit based on their plan.
 */
export async function checkConnectorLimit(userId: string, connectorsCount: number): Promise<boolean> {
  await dbConnect();
  // Use raw collection to bypass Mongoose schema cache
  const userDoc = await User.collection.findOne({ _id: new ObjectId(userId) });
  if (!userDoc) return false;

  const plan = (userDoc.plan as string) || 'starter';
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS].connectors;

  return connectorsCount < limit;
}

/**
 * Lazily rolls over the monthly submission count if the reset date has passed.
 */
async function rolloverIfNeeded(userDoc: any): Promise<any> {
  const now = new Date();
  const resetDate = userDoc.usageResetDate ? new Date(userDoc.usageResetDate) : null;

  if (!resetDate || now >= resetDate) {
    const nextReset = new Date();
    nextReset.setMonth(nextReset.getMonth() + 1);

    await User.collection.updateOne(
      { _id: userDoc._id },
      { $set: { monthlySubmissions: 0, usageResetDate: nextReset } }
    );
    userDoc.monthlySubmissions = 0;
    userDoc.usageResetDate = nextReset;
  }
  return userDoc;
}

/**
 * Atomically checks and increments the user's monthly submission count.
 * Returns true if the submission is allowed, false if limit exceeded.
 */
export async function incrementAndCheckSubmissionLimit(userId: string): Promise<boolean> {
  await dbConnect();

  // Read raw document directly — bypasses Mongoose schema filtering/caching
  let userDoc = await User.collection.findOne({ _id: new ObjectId(userId) });
  console.log(`[RateLimit] raw findOne => ${userDoc ? `plan=${userDoc.plan}, monthly=${userDoc.monthlySubmissions}` : 'NOT FOUND'}`);
  if (!userDoc) return false;

  // 1. Rollover check
  await rolloverIfNeeded(userDoc);

  // 2. Check limits
  const plan = (userDoc.plan as string) || 'starter';
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS].submissions;
  const currentCount = (userDoc.monthlySubmissions as number) || 0;

  if (currentCount >= limit) {
    console.log(`[RateLimit] BLOCKED: ${currentCount} >= ${limit}`);
    return false;
  }

  // 3. Atomic increment on raw collection
  await User.collection.updateOne(
    { _id: new ObjectId(userId) },
    { $inc: { monthlySubmissions: 1 } }
  );
  console.log(`[RateLimit] Incremented to ${currentCount + 1} / ${limit}`);

  // 4. Trigger email warning at Limit - 50
  if (currentCount + 1 === limit - 50) {
    const email = userDoc.email as string;
    sendQuotaWarningEmail(email, plan, 50).catch(console.error);
  }

  return true;
}
