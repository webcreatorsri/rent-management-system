export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  VIEWER: 'viewer'
};

export const APARTMENT_STATUS = {
  VACANT: 'vacant',
  OCCUPIED: 'occupied',
  UNDER_MAINTENANCE: 'under_maintenance'
};

export const TENANT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
};

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'upi', label: 'UPI' }
];

export const APARTMENT_TYPES = [
  { value: 'studio', label: 'Studio' },
  { value: '1bhk', label: '1 BHK' },
  { value: '2bhk', label: '2 BHK' },
  { value: '3bhk', label: '3 BHK' },
  { value: 'penthouse', label: 'Penthouse' }
];