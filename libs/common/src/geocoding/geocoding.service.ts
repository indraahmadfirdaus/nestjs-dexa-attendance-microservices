import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  country?: string;
  postcode?: string;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly nominatimBaseUrl = 'https://nominatim.openstreetmap.org';

  /**
   * Reverse Geocoding: Convert lat/long to human-readable address
   */
  async reverseGeocode(
    latitude: number,
    longitude: number,
  ): Promise<string | null> {
    try {
      const response = await axios.get(`${this.nominatimBaseUrl}/reverse`, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'AttendanceApp/1.0',
        },
        timeout: 5000,
      });

      if (response.data && response.data.display_name) {
        const address = response.data.display_name;
        this.logger.log(`Reverse geocoded: ${latitude}, ${longitude} -> ${address}`);
        return address;
      }

      return null;
    } catch (error) {
      this.logger.warn(
        `Failed to reverse geocode ${latitude}, ${longitude}:`,
        error.message,
      );
      return null;
    }
  }

  async getAddressDetails(
    latitude: number,
    longitude: number,
  ): Promise<GeocodeResult | null> {
    try {
      const response = await axios.get(`${this.nominatimBaseUrl}/reverse`, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'AttendanceApp/1.0',
        },
        timeout: 5000,
      });

      if (response.data) {
        const data = response.data;
        const address = data.address || {};

        return {
          latitude,
          longitude,
          address: data.display_name,
          city: address.city || address.town || address.village || null,
          country: address.country || null,
          postcode: address.postcode || null,
        };
      }

      return null;
    } catch (error) {
      this.logger.warn(
        `Failed to get address details for ${latitude}, ${longitude}:`,
        error.message,
      );
      return null;
    }
  }

  async geocode(address: string): Promise<GeocodeResult | null> {
    try {
      const response = await axios.get(`${this.nominatimBaseUrl}/search`, {
        params: {
          q: address,
          format: 'json',
          addressdetails: 1,
          limit: 1,
        },
        headers: {
          'User-Agent': 'AttendanceApp/1.0',
        },
        timeout: 5000,
      });

      if (response.data && response.data.length > 0) {
        const data = response.data[0];
        const addressData = data.address || {};

        return {
          latitude: parseFloat(data.lat),
          longitude: parseFloat(data.lon),
          address: data.display_name,
          city: addressData.city || addressData.town || null,
          country: addressData.country || null,
          postcode: addressData.postcode || null,
        };
      }

      return null;
    } catch (error) {
      this.logger.warn(`Failed to geocode address "${address}":`, error.message);
      return null;
    }
  }

  formatCoordinates(latitude: number, longitude: number): string {
    const latDir = latitude >= 0 ? 'N' : 'S';
    const lonDir = longitude >= 0 ? 'E' : 'W';
    
    return `${Math.abs(latitude).toFixed(6)}°${latDir}, ${Math.abs(longitude).toFixed(6)}°${lonDir}`;
  }

  isValidCoordinates(latitude: number, longitude: number): boolean {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }
}