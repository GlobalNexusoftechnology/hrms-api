const DEFAULT_SENSITIVE_KEYS = [
  'password',
  'token',
  'otp',
  'refreshtoken',
  'accesstoken',
  'secret',
  'salaryaccountnumber',
  'aadhaar',
  'pan',
  'passport',
  'apikey',
];

export function maskData(
  data: Record<string, any> | undefined | null,
  additionalKeys: string[] = [],
): Record<string, any> | undefined | null {
  if (!data || typeof data !== 'object') return data;

  const maskedObj = { ...data };
  const sensitiveKeys = [...DEFAULT_SENSITIVE_KEYS, ...additionalKeys].map(
    (k) => k.toLowerCase(),
  );

  for (const key of Object.keys(maskedObj)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      maskedObj[key] = '********';
    } else if (
      typeof maskedObj[key] === 'object' &&
      maskedObj[key] !== null &&
      !(maskedObj[key] instanceof Date) &&
      !Array.isArray(maskedObj[key]) // Simple object masking, array masking could be added if needed
    ) {
      maskedObj[key] = maskData(maskedObj[key], additionalKeys);
    }
  }

  return maskedObj;
}
