/**
 * Parse user agent string to extract device information
 */
export function parseDeviceInfo(userAgent) {
    if (!userAgent) {
        return {
            browser: 'Unknown Browser',
            os: 'Unknown OS',
            deviceType: 'desktop',
            userAgent: ''
        };
    }

    const ua = userAgent.toLowerCase();

    // Detect browser
    let browser = 'Unknown Browser';
    if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('edg')) browser = 'Edge';
    else if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

    // Detect OS
    let os = 'Unknown OS';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

    // Detect device type
    let deviceType = 'desktop';
    if (ua.includes('mobile')) deviceType = 'mobile';
    else if (ua.includes('tablet') || ua.includes('ipad')) deviceType = 'tablet';

    return {
        browser,
        os,
        deviceType,
        userAgent
    };
}
