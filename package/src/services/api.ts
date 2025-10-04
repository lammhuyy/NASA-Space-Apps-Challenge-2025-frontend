// API service for NASA Space Apps Challenge backend endpoints

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PlanetData {
    kepid: string;
    hostname: string;
    [key: string]: any;
}

export interface FindByHostnameResponse {
    hostname: string;
    kepid: number;
    total_rows: number;
    data: PlanetData[];
}

export interface LightcurveData {
    time: number[];
    flux: number[];
    [key: string]: any;
}

export interface HostnamesResponse {
    total_hostnames: number;
    hostnames: string[];
}

class ApiService {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        console.log(`🌐 Making API request to: ${url}`);
        console.log(`📡 Base URL: ${this.baseURL}`);
        console.log(`🔗 Endpoint: ${endpoint}`);

        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
                ...options,
            });

            console.log(`📊 Response status: ${response.status} ${response.statusText}`);
            console.log(`📋 Response headers:`, Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ HTTP error response:`, errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log(`✅ API response data:`, data);
            return data;
        } catch (error) {
            console.error(`❌ API request failed for ${endpoint}:`, error);

            // Enhanced error messages for common issues
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                throw new Error(`Network error: Unable to connect to ${url}. Please check if the backend server is running and accessible.`);
            }

            throw error;
        }
    }

    /**
     * Test backend connection
     */
    async testConnection(): Promise<{ status: string; url: string; timestamp: string }> {
        const url = `${this.baseURL}/visualization/hostnames`;
        const timestamp = new Date().toISOString();

        try {
            console.log(`🔍 Testing connection to: ${url}`);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            return {
                status: response.ok ? 'success' : `error_${response.status}`,
                url,
                timestamp
            };
        } catch (error) {
            console.error('Connection test failed:', error);
            return {
                status: 'failed',
                url,
                timestamp
            };
        }
    }

    /**
     * Get all hostnames from the CSV file
     */
    async getAllHostnames(): Promise<string[]> {
        const response = await this.request<HostnamesResponse>('/visualization/hostnames');
        return response.hostnames;
    }

    /**
     * Find all rows with matching kepid based on the given hostname
     */
    async findByHostname(hostname: string): Promise<FindByHostnameResponse> {
        return this.request<FindByHostnameResponse>(`/visualization/find_by_hostname/${encodeURIComponent(hostname)}`);
    }

    /**
     * Fetch lightcurve data from MAST API for the given star_id and tce number
     */
    async getLightcurve(starId: string, tceNum: string): Promise<LightcurveData> {
        return this.request<LightcurveData>(`/visualization/lightcurve/${encodeURIComponent(starId)}/${encodeURIComponent(tceNum)}`);
    }
}

export const apiService = new ApiService();
