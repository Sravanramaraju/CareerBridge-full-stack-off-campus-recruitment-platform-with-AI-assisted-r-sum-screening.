export function buildQueryString(values = {}, aliases = {}) {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    const parameter = aliases[key] || key;
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.filter((item) => item !== '').forEach((item) => query.append(parameter, item));
      return;
    }
    query.set(parameter, String(value));
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}
