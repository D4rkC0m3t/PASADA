/**
 * GST State Codes
 * Official GST state codes for India
 */

export const GST_STATE_CODES = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman and Diu',
  '26': 'Dadra and Nagar Haveli',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
  '97': 'Other Territory'
} as const

export type StateCode = keyof typeof GST_STATE_CODES

/**
 * Get state code by state name
 */
export function getStateCodeByName(stateName: string): StateCode | null {
  const normalizedName = stateName.trim().toLowerCase()
  
  for (const [code, name] of Object.entries(GST_STATE_CODES)) {
    if (name.toLowerCase() === normalizedName) {
      return code as StateCode
    }
  }
  
  return null
}

/**
 * Get state name by code
 */
export function getStateNameByCode(stateCode: string): string | null {
  return GST_STATE_CODES[stateCode as StateCode] || null
}

/**
 * Get all state codes as array
 */
export function getAllStateCodes(): StateCode[] {
  return Object.keys(GST_STATE_CODES) as StateCode[]
}

/**
 * Get all states as array of objects
 */
export function getAllStates(): Array<{ code: StateCode; name: string }> {
  return Object.entries(GST_STATE_CODES).map(([code, name]) => ({
    code: code as StateCode,
    name
  }))
}

/**
 * Check if state code is valid
 */
export function isValidStateCode(stateCode: string): boolean {
  return stateCode in GST_STATE_CODES
}

/**
 * Get neighboring states (for common business scenarios)
 */
export const NEIGHBORING_STATES: Record<StateCode, StateCode[]> = {
  '29': ['27', '30', '32', '33', '36'], // Karnataka neighbors: Maharashtra, Goa, Kerala, Tamil Nadu, Telangana
  '27': ['23', '22', '24', '29', '30', '36'], // Maharashtra
  '33': ['32', '29', '37', '34'], // Tamil Nadu
  '32': ['33', '29'], // Kerala
  // Add more as needed
} as any

/**
 * Check if two states are neighbors
 */
export function areNeighboringStates(state1: StateCode, state2: StateCode): boolean {
  return NEIGHBORING_STATES[state1]?.includes(state2) || 
         NEIGHBORING_STATES[state2]?.includes(state1) ||
         false
}
