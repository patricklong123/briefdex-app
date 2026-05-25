import Purchases, { PurchasesPackage } from 'react-native-purchases';

export type PlanKey = 'monthly' | 'annual';

export type PurchaseOutcome =
  | { status: 'purchased' }
  | { status: 'cancelled' };

export async function checkEntitlement(): Promise<boolean> {
  const customerInfo = await Purchases.getCustomerInfo();
  return customerInfo.entitlements.active['premium'] !== undefined;
}

async function getPackage(plan: PlanKey): Promise<PurchasesPackage> {
  const offerings = await Purchases.getOfferings();
  const current = offerings.current;
  if (!current) {
    throw new Error('No active offering configured in RevenueCat.');
  }
  const pkg = plan === 'monthly' ? current.monthly : current.annual;
  if (!pkg) {
    throw new Error(`The current offering has no ${plan} package.`);
  }
  return pkg;
}

export async function purchasePlan(plan: PlanKey): Promise<PurchaseOutcome> {
  const pkg = await getPackage(plan);
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    if (customerInfo.entitlements.active['premium'] === undefined) {
      throw new Error('Purchase completed but premium entitlement is not active.');
    }
    return { status: 'purchased' };
  } catch (e: any) {
    if (e?.userCancelled) {
      return { status: 'cancelled' };
    }
    throw e;
  }
}
