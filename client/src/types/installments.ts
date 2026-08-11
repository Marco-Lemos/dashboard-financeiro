export interface Installment {
  id: string;
  name: string;
  totalValue: number;
  monthlyValue: number;
  startMonth: number;
  startYear: number;
  endMonth: number;
  endYear: number;
  paidUntilMonth: number;
  paidUntilYear: number;
}
