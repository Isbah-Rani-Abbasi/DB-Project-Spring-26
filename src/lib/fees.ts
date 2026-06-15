export const FEE_PER_CREDIT = 500;
export const ACTIVITY_CHARGES = 100;
export function calcFee(credits: number) {
  return credits * FEE_PER_CREDIT + ACTIVITY_CHARGES;
}