/**
 * Helper para acceso seguro a property_data (JSONB).
 * Evita any y usa type guards.
 */
export function getPropertyAddress(propertyData: Record<string, unknown> | null | undefined): string | null {
  if (!propertyData || typeof propertyData !== 'object') return null;
  const v = propertyData.address;
  return typeof v === 'string' ? v : null;
}

export function getPropertyField(
  propertyData: Record<string, unknown> | null | undefined,
  key: string
): string | number | boolean | Record<string, unknown> | unknown[] | null {
  if (!propertyData || typeof propertyData !== 'object') return null;
  const v = propertyData[key];
  return v !== undefined && v !== null ? (v as string | number | boolean | Record<string, unknown> | unknown[]) : null;
}
