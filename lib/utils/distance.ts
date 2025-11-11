const EARTH_RADIUS_MILES = 3958.8;

const toRadians = (angle: number) => (angle * Math.PI) / 180;

export function haversineDistanceWithTime(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  avgSpeedMph = 60
): {
  distanceMiles: number;
  hours: number;
  minutes: number;
} {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.asin(Math.sqrt(a));
  const distance = EARTH_RADIUS_MILES * c;

  const hours = distance / avgSpeedMph;
  const minutes = Math.round(hours * 60);

  return {
    distanceMiles: Number(distance.toFixed(1)),
    hours: Number(hours.toFixed(2)),
    minutes,
  };
}
