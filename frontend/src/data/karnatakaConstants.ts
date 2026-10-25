import {
  SupportedInterest,
  SupportedExperience,
  SupportedTransport,
  SupportedLanguage,
  TripPlanRequest,
} from '../types/travel';

export interface InterestMeta {
  id: SupportedInterest;
  label: string;
  labelKannada: string;
  iconName: string;
  description: string;
}

export const INTERESTS_DATA: InterestMeta[] = [
  {
    id: 'heritage',
    label: 'Heritage & History',
    labelKannada: 'ಪರಂಪರೆ ಮತ್ತು ಇತಿಹಾಸ',
    iconName: 'Landmark',
    description: 'Ancient temples, Vijayanagara ruins, UNESCO forts, and Hoysala soapstone architecture',
  },
  {
    id: 'nature',
    label: 'Nature & Waterfalls',
    labelKannada: 'ಪ್ರಕೃತಿ ಮತ್ತು ಜಲಪಾತ',
    iconName: 'Trees',
    description: 'Western Ghats biodiversity, Jog falls, lush valleys, and misty tea/coffee estates',
  },
  {
    id: 'beaches',
    label: 'Coastal & Beaches',
    labelKannada: 'ಕರಾವಳಿ ಮತ್ತು ಬೀಚ್‌ಗಳು',
    iconName: 'Waves',
    description: 'Arabian sea sunsets, Om Beach, pristine Karavali sands, and lighthouse viewpoints',
  },
  {
    id: 'wildlife',
    label: 'Wildlife & Safari',
    labelKannada: 'ವನ್ಯಜೀವಿ ಮತ್ತು ಸಫಾರಿ',
    iconName: 'Compass',
    description: 'Tiger & elephant corridors in Kabini, Nagarhole, and Dandeli hornbill sanctuaries',
  },
  {
    id: 'food',
    label: 'Culinary Trails',
    labelKannada: 'ಕರ್ನಾಟಕದ ಆಹಾರ ಸಂಸ್ಕೃತಿ',
    iconName: 'Utensils',
    description: 'Mylari Masala Dosa, Neer Dosa, Mangaluru Ghee Roast, Jolada Rotti, and Mysore Pak',
  },
  {
    id: 'spirituality',
    label: 'Spirituality & Temples',
    labelKannada: 'ಧಾರ್ಮಿಕ ಮತ್ತು ದೇವಾಲಯಗಳು',
    iconName: 'Sparkles',
    description: 'Udupi Krishna Matha, Gokarna Atmalinga, Chamundi Hills, and sacred shrine circuits',
  },
  {
    id: 'adventure',
    label: 'Adventure & Treks',
    labelKannada: 'ಸಾಹಸ ಮತ್ತು ಚಾರಣ',
    iconName: 'Mountain',
    description: 'Mullayanagiri peak treks, Kali river rafting, bouldering at Hampi, and canopy walks',
  },
];

export const POPULAR_CITIES = [
  'Bengaluru',
  'Mysuru',
  'Mangaluru',
  'Hubballi',
  'Belagavi',
  'Shivamogga',
  'Udupi',
  'Hassan',
];

export const EXPERIENCE_TYPES: { id: SupportedExperience; label: string; sub: string }[] = [
  {
    id: 'budget-friendly',
    label: 'Budget-Friendly',
    sub: 'Clean budget stays, local transport, maximum value',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    sub: 'Comfortable hotels, flexible pacing, authentic dining',
  },
  {
    id: 'relaxed',
    label: 'Relaxed & Leisure',
    sub: 'Scenic resorts, slow-paced mornings, premium stays',
  },
  {
    id: 'adventurous',
    label: 'Active & Adventurous',
    sub: 'Early treks, water sports, safaris, and exploration',
  },
];

export const TRANSPORT_MODES: { id: SupportedTransport; label: string; sub: string }[] = [
  {
    id: 'cab_rental',
    label: 'Private Chauffeur Cab',
    sub: 'Direct door-to-door convenience and scenic roadside halts',
  },
  {
    id: 'public_bus',
    label: 'KSRTC Public Bus',
    sub: 'Extensive, economical state transport network',
  },
  {
    id: 'train',
    label: 'Train (Indian Railways)',
    sub: 'Scenic railway lines like the green Western Ghat route',
  },
  {
    id: 'self_drive',
    label: 'Self-Drive Vehicle',
    sub: 'Total freedom on highways and countryside backroads',
  },
];

export const LANGUAGES: { id: SupportedLanguage; label: string; nativeName: string }[] = [
  { id: 'english', label: 'English', nativeName: 'English' },
  { id: 'kannada', label: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { id: 'hindi', label: 'Hindi', nativeName: 'हिन्दी' },
  { id: 'telugu', label: 'Telugu', nativeName: 'తెలుగు' },
  { id: 'tamil', label: 'Tamil', nativeName: 'தமிழ்' },
  { id: 'malayalam', label: 'Malayalam', nativeName: 'മലയാളം' },
];

export interface CircuitPreset {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  bannerGradient: string;
  sampleRequest: TripPlanRequest;
  highlights: string[];
}

export const CURATED_PRESETS: CircuitPreset[] = [
  {
    id: 'hoysala-heritage',
    title: 'Hoysala & Vijayanagara Heritage',
    subtitle: 'UNESCO temples, intricate soapstone friezes, and boulder-strewn kingdoms',
    badge: 'Heritage & History',
    bannerGradient: 'from-amber-700 via-amber-800 to-stone-900',
    highlights: ['Hampi Stone Chariot', 'Belur Chennakeshava', 'Badami Caves'],
    sampleRequest: {
      starting_city: 'Bengaluru',
      duration_days: 3,
      total_budget_inr: 16000,
      travelers_count: 2,
      interests: ['heritage', 'spirituality'],
      experience_preference: 'balanced',
      transport_mode: 'cab_rental',
      preferred_language: 'kannada',
    },
  },
  {
    id: 'karavali-coastal',
    title: 'Karavali Coastal & Sunset Odyssey',
    subtitle: 'Golden shores, Om Beach, Murudeshwar Shiva, and fresh coastal delicacies',
    badge: 'Beaches & Food',
    bannerGradient: 'from-blue-700 via-cyan-800 to-slate-900',
    highlights: ['Gokarna Om Beach', 'Murudeshwar Statue', 'Mangalore Ghee Roast'],
    sampleRequest: {
      starting_city: 'Mangaluru',
      duration_days: 3,
      total_budget_inr: 14000,
      travelers_count: 2,
      interests: ['beaches', 'food', 'spirituality'],
      experience_preference: 'relaxed',
      transport_mode: 'public_bus',
      preferred_language: 'english',
    },
  },
  {
    id: 'western-ghats-coffee',
    title: 'Western Ghats Monsoon & Coffee Retreat',
    subtitle: 'Misty hills of Coorg and Chikmagalur with rolling peaks and waterfalls',
    badge: 'Nature & Adventure',
    bannerGradient: 'from-emerald-800 via-green-900 to-stone-900',
    highlights: ['Mullayanagiri Peak', 'Abbey Falls', 'Coffee Estate Trails'],
    sampleRequest: {
      starting_city: 'Bengaluru',
      duration_days: 4,
      total_budget_inr: 22000,
      travelers_count: 2,
      interests: ['nature', 'adventure', 'food'],
      experience_preference: 'balanced',
      transport_mode: 'self_drive',
      preferred_language: 'english',
    },
  },
  {
    id: 'mysuru-kabini-safari',
    title: 'Royal Mysuru & Kabini Tiger Safari',
    subtitle: 'Grand palaces, Mysore Pak treats, and deep forest wildlife encounters',
    badge: 'Wildlife & Royalty',
    bannerGradient: 'from-yellow-700 via-amber-900 to-stone-950',
    highlights: ['Amba Vilas Palace', 'Kabini Jungle Safari', 'Chamundi Hills'],
    sampleRequest: {
      starting_city: 'Mysuru',
      duration_days: 3,
      total_budget_inr: 24000,
      travelers_count: 2,
      interests: ['wildlife', 'heritage', 'nature'],
      experience_preference: 'relaxed',
      transport_mode: 'cab_rental',
      preferred_language: 'kannada',
    },
  },
];
