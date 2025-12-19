/**
 * Converts a timezone string to a short, user-friendly abbreviation
 * @param {string} timezone - Full timezone string (e.g. 'America/New_York')
 * @returns {string} - Short timezone abbreviation (e.g. 'ET', 'IST', 'UTC')
 */
export const getShortTimezone = (timezone = Intl.DateTimeFormat().resolvedOptions().timeZone) => {
  // Common timezone mappings
  const timezoneMap = {
    // North America
    'America/New_York': 'ET',
    'America/Chicago': 'CT',
    'America/Denver': 'MT',
    'America/Los_Angeles': 'PT',
    'America/Phoenix': 'MST',
    'America/Anchorage': 'AKST',
    'America/Adak': 'HST',
    'America/Toronto': 'ET',
    'America/Vancouver': 'PT',
    
    // Europe
    'Europe/London': 'GMT',
    'Europe/Paris': 'CET',
    'Europe/Berlin': 'CET',
    'Europe/Moscow': 'MSK',
    'Europe/Athens': 'EET',
    'Europe/Istanbul': 'TRT',
    
    // Asia
    'Asia/Kolkata': 'IST',
    'Asia/Tokyo': 'JST',
    'Asia/Shanghai': 'CST',
    'Asia/Dubai': 'GST',
    'Asia/Singapore': 'SGT',
    'Asia/Seoul': 'KST',
    'Asia/Hong_Kong': 'HKT',
    
    // Australia/Oceania
    'Australia/Sydney': 'AEST',
    'Australia/Perth': 'AWST',
    'Australia/Adelaide': 'ACST',
    'Pacific/Auckland': 'NZST',
    
    // South America
    'America/Sao_Paulo': 'BRT',
    'America/Argentina/Buenos_Aires': 'ART',
    
    // Africa
    'Africa/Cairo': 'EET',
    'Africa/Johannesburg': 'SAST',
    
    // UTC
    'Etc/UTC': 'UTC',
  };
  
  // Return mapped abbreviation if available
  if (timezoneMap[timezone]) {
    return timezoneMap[timezone];
  }
  
  // Fallback: calculate offset from UTC
  try {
    const now = new Date();
    const utcOffset = -now.getTimezoneOffset() / 60;
    const sign = utcOffset >= 0 ? '+' : '-';
    return `UTC${sign}${Math.abs(utcOffset)}`;
  } catch (error) {
    return 'Local';
  }
};

/**
 * Formats a date with short timezone abbreviation
 * @param {Date} date - Date object to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string with short timezone
 */
export const formatDateWithShortTimezone = (date, options = {}) => {
  const defaultOptions = {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  const formattedDate = date.toLocaleDateString("en-US", mergedOptions).replace(",", " on");
  const shortTimezone = getShortTimezone();
  
  return `${formattedDate} ${shortTimezone}`;
};