export function getVendorGoogleUrl(params: {
  placeId?: string | null;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
}): string {
  if (params.placeId) {
    return `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(
      params.placeId
    )}`;
  }

  const queryParts = [params.name, params.address, params.city, params.state]
    .filter(Boolean)
    .join(', ');

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    queryParts || params.name
  )}`;
}
