/**
 * Get location information from IP address
 * For now, returns 'Unknown' - can be enhanced with ipapi.co or similar service
 */
export function getLocationFromIP(ipAddress) {
    // Basic check for localhost
    if (!ipAddress || ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress.startsWith('::ffff:127.')) {
        return 'Local';
    }

    // TODO: Integrate with IP geolocation service like ipapi.co
    // Example: const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);

    return 'Unknown';
}
