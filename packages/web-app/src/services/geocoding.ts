/**
 * Geocoding Service for OceanWatch
 * Handles address to coordinates conversion with proper error handling
 */

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  address: string;
}

export interface GeocodeError {
  message: string;
  code: 'NETWORK_ERROR' | 'NO_RESULTS' | 'INVALID_ADDRESS' | 'API_ERROR';
}

/**
 * Convert address to coordinates using OpenStreetMap Nominatim API
 * This is free and doesn't require API keys
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  if (!address || address.trim().length === 0) {
    throw {
      message: 'Address cannot be empty',
      code: 'INVALID_ADDRESS'
    } as GeocodeError;
  }

  try {
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=in`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'OceanWatch/1.0 (oceanwatch@example.com)' // Required by Nominatim
      }
    });

    if (!response.ok) {
      throw {
        message: `Geocoding service returned ${response.status}`,
        code: 'API_ERROR'
      } as GeocodeError;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw {
        message: 'No location found for the provided address',
        code: 'NO_RESULTS'
      } as GeocodeError;
    }

    const result = data[0];
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: result.display_name
    };

  } catch (error: any) {
    if (error.code) {
      throw error; // Re-throw our custom errors
    }
    
    // Handle network and other errors
    throw {
      message: 'Failed to connect to geocoding service',
      code: 'NETWORK_ERROR'
    } as GeocodeError;
  }
}

/**
 * Convert coordinates to address (reverse geocoding)
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  if (!latitude || !longitude) {
    throw {
      message: 'Invalid coordinates provided',
      code: 'INVALID_ADDRESS'
    } as GeocodeError;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'OceanWatch/1.0 (oceanwatch@example.com)'
      }
    });

    if (!response.ok) {
      throw {
        message: `Reverse geocoding service returned ${response.status}`,
        code: 'API_ERROR'
      } as GeocodeError;
    }

    const data = await response.json();

    if (!data || !data.display_name) {
      throw {
        message: 'No address found for the provided coordinates',
        code: 'NO_RESULTS'
      } as GeocodeError;
    }

    return data.display_name;

  } catch (error: any) {
    if (error.code) {
      throw error;
    }
    
    throw {
      message: 'Failed to connect to reverse geocoding service',
      code: 'NETWORK_ERROR'
    } as GeocodeError;
  }
}

/**
 * Validate if coordinates are within reasonable bounds for India
 */
export function validateCoordinates(latitude: number, longitude: number): boolean {
  // India bounds: roughly 6°N to 37°N latitude, 68°E to 97°E longitude
  return (
    latitude >= 6 && latitude <= 37 &&
    longitude >= 68 && longitude <= 97
  );
}
