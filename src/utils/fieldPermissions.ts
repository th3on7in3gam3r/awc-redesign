/**
 * Field-Level Permissions for AWC-Connect
 * Controls visibility of sensitive fields based on user role
 */

export interface FieldVisibility {
    email: boolean;
    phone: boolean;
    address: boolean;
    notes: boolean;
    financialInfo: boolean;
    sensitiveData: boolean;
    mediaConsent: boolean;
}

/**
 * Get field visibility settings for a role
 * @param role - User's role
 * @returns Object indicating which fields are visible
 */
export function getFieldVisibility(role: string | undefined): FieldVisibility {
    const baseFields: FieldVisibility = {
        email: false,
        phone: false,
        address: false,
        notes: false,
        financialInfo: false,
        sensitiveData: false,
        mediaConsent: false
    };

    if (!role) return baseFields;

    switch (role) {
        case 'pastor':
        case 'admin':
            // Full access to all fields
            return {
                email: true,
                phone: true,
                address: true,
                notes: true,
                financialInfo: true,
                sensitiveData: true,
                mediaConsent: true
            };

        case 'first_lady':
            // Executive view - no financial data
            return {
                email: true,
                phone: true,
                address: true,
                notes: true,
                financialInfo: false,
                sensitiveData: false,
                mediaConsent: true
            };

        case 'administrator':
            // Operations view - limited financial, no pastoral notes
            return {
                email: true,
                phone: true,
                address: true,
                notes: false,
                financialInfo: false,
                sensitiveData: false,
                mediaConsent: true
            };

        case 'finance':
            // Financial data only, limited personal info
            return {
                email: true,
                phone: true,
                address: false,
                notes: false,
                financialInfo: true,
                sensitiveData: false,
                mediaConsent: false
            };

        case 'ministry_leader':
        case 'staff':
            // Basic contact info only
            return {
                email: true,
                phone: true,
                address: false,
                notes: false,
                financialInfo: false,
                sensitiveData: false,
                mediaConsent: false
            };

        case 'checkin_team':
            // Minimal info for check-in purposes
            return {
                email: false,
                phone: true,
                address: false,
                notes: false,
                financialInfo: false,
                sensitiveData: false,
                mediaConsent: true
            };

        default:
            return baseFields;
    }
}

/**
 * Check if user can view a specific field
 * @param role - User's role
 * @param fieldName - Name of the field to check
 * @returns boolean indicating if field is visible
 */
export function canViewField(
    role: string | undefined,
    fieldName: keyof FieldVisibility
): boolean {
    const visibility = getFieldVisibility(role);
    return visibility[fieldName] || false;
}

/**
 * Filter object properties based on field visibility
 * @param data - Data object to filter
 * @param role - User's role
 * @returns Filtered data object
 */
export function filterSensitiveFields<T extends Record<string, any>>(
    data: T,
    role: string | undefined
): Partial<T> {
    const visibility = getFieldVisibility(role);
    const filtered: Partial<T> = { ...data };

    // Remove fields based on visibility
    if (!visibility.email) delete filtered.email;
    if (!visibility.phone) delete filtered.phone;
    if (!visibility.address) {
        delete filtered.address;
        delete filtered.city;
        delete filtered.state;
        delete filtered.zip;
    }
    if (!visibility.notes) delete filtered.notes;
    if (!visibility.financialInfo) {
        delete filtered.giving_total;
        delete filtered.giving_frequency;
    }
    if (!visibility.sensitiveData) {
        delete filtered.ssn;
        delete filtered.dob;
    }
    if (!visibility.mediaConsent) {
        delete filtered.media_consent_status;
        delete filtered.media_consent_updated_at;
    }

    return filtered;
}
