import type { Show } from '@/lib/types';

export interface ShowDistanceResult {
  distance_miles: number;
  travel_time_minutes: number;
}

export async function calculateShowToShowDistance(
  fromShow: Show,
  toShow: Show
): Promise<ShowDistanceResult> {
  if (!fromShow.latitude || !fromShow.longitude || !toShow.latitude || !toShow.longitude) {
    throw new Error('Missing coordinates for shows');
  }

  const apiKey = process.env.OPENROUTESERVICE_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTESERVICE_API_KEY not configured');
  }

  const url = `https://api.openrouteservice.org/v2/directions/driving-car`;
  const body = {
    coordinates: [
      [fromShow.longitude, fromShow.latitude],
      [toShow.longitude, toShow.latitude],
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouteService API error: ${error}`);
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = data.routes[0];
    const distanceMeters = route.summary.distance;
    const distanceMiles = distanceMeters * 0.000621371; // Convert meters to miles
    const durationSeconds = route.summary.duration;
    const travelTimeMinutes = Math.round(durationSeconds / 60);

    return {
      distance_miles: Math.round(distanceMiles * 100) / 100, // Round to 2 decimals
      travel_time_minutes: travelTimeMinutes,
    };
  } catch (error) {
    console.error('Error calculating show-to-show distance:', error);
    throw error;
  }
}

