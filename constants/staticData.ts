export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

export const COUNTRIES = [
  { value: 'US', label: 'USA' },
  { value: 'CA', label: 'Canada' },
  { value: 'MX', label: 'Mexico' },
];

// Legacy simplified timezones (for backward compatibility)
export const TIMEZONES = [
  { value: 'ET', label: 'Eastern Time (ET)' },
  { value: 'CT', label: 'Central Time (CT)' },
  { value: 'MT', label: 'Mountain Time (MT)' },
  { value: 'PT', label: 'Pacific Time (PT)' },
  { value: 'AKT', label: 'Alaska Time (AKT)' },
  { value: 'HST', label: 'Hawaii Time (HST)' },
];

// Get IANA timezones using Intl API
const IANATimezones = new Set(Intl.supportedValuesOf('timeZone'));

// Helper function to format timezone name for display
const formatTimezoneLabel = (timezone: string): string => {
  try {
    // Get current date/time info for the timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });
    
    // Extract timezone abbreviation (e.g., "EST", "PST")
    const parts = formatter.formatToParts(now);
    const tzName = parts.find((part) => part.type === 'timeZoneName')?.value || '';
    
    // Format the label: "America/New_York" -> "America/New York (EST)"
    // Replace underscores with spaces and properly capitalize
    const displayName = timezone
      .replace(/_/g, ' ')
      .split('/')
      .map((part) => {
        // Capitalize first letter of each word
        return part
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      })
      .join('/');
    
    return tzName ? `${displayName} (${tzName})` : displayName;
  } catch (error) {
    // Fallback if formatting fails
    return timezone.replace(/_/g, ' ');
  }
};

// Generate IANA timezone options
export const getIANATimezones = (): Array<{ value: string; label: string }> => {
  return Array.from(IANATimezones)
    .map((tz) => ({
      value: tz,
      label: formatTimezoneLabel(tz),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

// Cached timezone options (computed once)
export const IANA_TIMEZONE_OPTIONS = getIANATimezones();

export const BUSINESS_TYPES = [
  { value: 'LLC', label: 'LLC' },
  { value: 'Corporation', label: 'Corporation' },
  { value: 'Partnership', label: 'Partnership' },
  { value: 'Sole Proprietorship', label: 'Sole Proprietorship' },
  { value: 'Nonprofit', label: 'Nonprofit' },
];

export const NOTICE_UNITS = [
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
];

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
];
