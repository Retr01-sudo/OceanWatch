export const SEVERITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium', 
  HIGH: 'High',
  CRITICAL: 'Critical'
} as const;

export type SeverityLevel = typeof SEVERITY_LEVELS[keyof typeof SEVERITY_LEVELS];

export const SEVERITY_OPTIONS = [
  { value: SEVERITY_LEVELS.LOW, label: 'Low - Minimal risk' },
  { value: SEVERITY_LEVELS.MEDIUM, label: 'Medium - Moderate risk' },
  { value: SEVERITY_LEVELS.HIGH, label: 'High - Significant risk' },
  { value: SEVERITY_LEVELS.CRITICAL, label: 'Critical - Life threatening' }
];

export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case SEVERITY_LEVELS.CRITICAL:
      return 'bg-red-100 text-red-800';
    case SEVERITY_LEVELS.HIGH:
      return 'bg-orange-100 text-orange-800';
    case SEVERITY_LEVELS.MEDIUM:
      return 'bg-yellow-100 text-yellow-800';
    case SEVERITY_LEVELS.LOW:
    default:
      return 'bg-green-100 text-green-800';
  }
};

export const getSeverityMapColor = (severity: string): string => {
  switch (severity) {
    case SEVERITY_LEVELS.CRITICAL:
      return '#DC2626'; // red-600
    case SEVERITY_LEVELS.HIGH:
      return '#EA580C'; // orange-600
    case SEVERITY_LEVELS.MEDIUM:
      return '#D97706'; // amber-600
    case SEVERITY_LEVELS.LOW:
    default:
      return '#16A34A'; // green-600
  }
};
