import Purchases from 'react-native-purchases';

export async function checkEntitlement(): Promise<boolean> {
  const customerInfo = await Purchases.getCustomerInfo();
  return customerInfo.entitlements.active['premium'] !== undefined;
}
