import { apiClient } from './apiClient';

export const telemetryService = {
  async getDevices() {
    return apiClient.get('/dashboard/devices');
  },
  
  async getEvents() {
    return apiClient.get('/dashboard/events');
  },

  async getTrustScores() {
    return apiClient.get('/dashboard/trust-scores');
  },

  async getBehaviorMetrics() {
    return apiClient.get('/dashboard/behavior');
  },

  async getUsbEvents() {
    return apiClient.get('/dashboard/usb');
  },

  async getAlerts() {
    return apiClient.get('/dashboard/alerts');
  }
};
