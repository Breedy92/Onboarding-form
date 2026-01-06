
export interface Entity {
  id: string;
  type: 'company' | 'trust' | 'smsf' | 'partnership';
  name: string;
  abn: string;
  activity: string;
}

export interface FormData {
  // Identity
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  phone: string;
  address: string;

  // Spouse
  hasSpouse: boolean;
  spouseName?: string;
  spouseDoingReturn?: boolean;

  // Entities
  hasEntities: boolean;
  entities: Entity[];

  // Tax Identity
  tfn: string;
  residencyStatus: 'resident' | 'non-resident' | 'working-holiday';
  hasMedicareCard: boolean;
  medicareNumber?: string;

  // Income
  annualSalary: number;
  hasInterestIncome: boolean;
  hasDividends: boolean;
  hasRentalProperty: boolean;
  hasSideHustle: boolean;

  // Wealth & Goals
  superBalance: number;
  totalAssets: number;
  totalDebts: number;
  primaryGoal: string;
}

export type StepKey = 'identity' | 'entities' | 'tax' | 'income' | 'wealth' | 'review';

export interface Step {
  key: StepKey;
  label: string;
  description: string;
}
