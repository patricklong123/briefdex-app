import { useEffect, useState } from 'react';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

export type PlanKey = 'monthly' | 'annual';

export type PurchaseOutcome =
  | { status: 'purchased' }
  | { status: 'cancelled' };

export type SubscriptionInfo =
  | { status: 'active'; expirationDate: Date | null }
  | { status: 'none' };

export type SubscriptionInfoState =
  | { state: 'loading' }
  | { state: 'loaded'; info: SubscriptionInfo }
  | { state: 'error'; error: string };

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatRenewalDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export async function checkEntitlement(): Promise<boolean> {
  const customerInfo = await Purchases.getCustomerInfo();
  return customerInfo.entitlements.active['premium'] !== undefined;
}

export async function getSubscriptionInfo(): Promise<SubscriptionInfo> {
  const customerInfo = await Purchases.getCustomerInfo();
  const premium = customerInfo.entitlements.active['premium'];
  if (!premium) return { status: 'none' };
  const expirationDate = premium.expirationDate ? new Date(premium.expirationDate) : null;
  return { status: 'active', expirationDate };
}

export function useSubscriptionInfo(): SubscriptionInfoState {
  const [state, setState] = useState<SubscriptionInfoState>({ state: 'loading' });
  useEffect(() => {
    let cancelled = false;
    getSubscriptionInfo()
      .then((info) => { if (!cancelled) setState({ state: 'loaded', info }); })
      .catch((e: any) => {
        if (!cancelled) setState({ state: 'error', error: e?.message ?? 'Failed to load subscription' });
      });
    return () => { cancelled = true; };
  }, []);
  return state;
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
