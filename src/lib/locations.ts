/**
 * Carlton Valley — Location Data
 * Sri Lanka districts and Australian states/territories for order forms.
 */

export const SL_DISTRICTS = [
  // Western Province
  'Colombo',
  'Gampaha',
  'Kalutara',
  // Central Province
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  // Southern Province
  'Galle',
  'Matara',
  'Hambantota',
  // Northern Province
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Mullaitivu',
  'Vavuniya',
  // Eastern Province
  'Trincomalee',
  'Batticaloa',
  'Ampara',
  // North Western Province
  'Kurunegala',
  'Puttalam',
  // North Central Province
  'Anuradhapura',
  'Polonnaruwa',
  // Uva Province
  'Badulla',
  'Monaragala',
  // Sabaragamuwa Province
  'Ratnapura',
  'Kegalle',
] as const;

export const AU_STATES = [
  'New South Wales (NSW)',
  'Victoria (VIC)',
  'Queensland (QLD)',
  'Western Australia (WA)',
  'South Australia (SA)',
  'Tasmania (TAS)',
  'Australian Capital Territory (ACT)',
  'Northern Territory (NT)',
] as const;

export const COUNTRIES = [
  {
    value: 'Sri Lanka',
    label: 'Sri Lanka 🇱🇰',
    subLabel: 'District',
    subLocations: SL_DISTRICTS as unknown as string[],
  },
  {
    value: 'Australia',
    label: 'Australia 🇦🇺',
    subLabel: 'State / Territory',
    subLocations: AU_STATES as unknown as string[],
  },
] as const;

export type SLDistrict = typeof SL_DISTRICTS[number];
export type AUState = typeof AU_STATES[number];
export type CountryValue = 'Sri Lanka' | 'Australia';
