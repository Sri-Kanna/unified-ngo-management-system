import React, { createContext, useContext, useEffect, useState } from 'react';
import enTranslations from '../locales/en.json';
import taTranslations from '../locales/ta.json';

type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  tText: (text: string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, any> = {
  en: enTranslations,
  ta: taTranslations,
};

// Database-to-Tamil Translation Dictionary
const tamilDbDictionary: Record<string, string> = {
  // Names
  'Admin User': 'நிர்வாகப் பயனர்',
  'Staff User': 'பணியாளர் பயனர்',
  'Volunteer User': 'தன்னார்வலர் பயனர்',
  'Karthik Raja': 'கார்த்திக் ராஜா',
  'Priya Sundar': 'பிரியா சுந்தர்',
  'Anbarasan M': 'அன்பரசன் எம்',
  'Lakshmi R': 'லட்சுமி ஆர்',
  'Selvam K': 'செல்வம் கே',
  'Meenakshi S': 'மீனாட்சி எஸ்',
  'Dinesh Kumar': 'தினேஷ் குமார்',
  'Ramesh Krishnan': 'ரமேஷ் கிருஷ்ணன்',
  'Tata Consultancy Services': 'டாடா கன்சல்டன்சி சர்வீசஸ் (TCS)',
  'Shanti Foundation': 'சாந்தி அறக்கட்டளை',

  // Genders
  'Male': 'ஆண்',
  'Female': 'பெண்',
  'Other': 'இதர',

  // Statuses
  'active': 'செயலில் உள்ளது',
  'inactive': 'செயலிழப்பானது',
  'in-stock': 'இருப்பில் உள்ளது',
  'low-stock': 'குறைந்த இருப்பு',
  'out-of-stock': 'இருப்பு இல்லை',
  'completed': 'நிறைவடைந்தது',
  'pending': 'நிலுவையில் உள்ளது',
  'scheduled': 'திட்டமிடப்பட்டுள்ளது',
  'ongoing': 'நடைபெறுகிறது',
  'cancelled': 'ரத்து செய்யப்பட்டது',

  // Classifications & Categories
  'monetary': 'பண நன்கொடை',
  'in-kind': 'பொருள் நன்கொடை',
  'individual': 'தனிநபர்',
  'corporate': 'நிறுவனம்',
  'Food': 'உணவு',
  'Medical': 'மருத்துவம்',
  'Medical Equipment': 'மருத்துவ உபகரணங்கள்',
  'Disaster Relief': 'பேரிடர் நிவாரணம்',

  // Inventory Units
  'bags': 'மூட்டைகள்',
  'bottles': 'பாட்டில்கள்',
  'kits': 'பெட்டிகள்',
  'units': 'அலகுகள்',
  'boxes': 'பெட்டிகள்',
  'kg': 'கிலோ',

  // Inventory Items
  'Rice Bags (25kg)': 'அரிசி மூட்டைகள் (25 கிலோ)',
  'Cooking Oil (1L)': 'சமையல் எண்ணெய் (1 லிட்டர்)',
  'First Aid Kits': 'முதலுதவி பெட்டிகள்',
  'Wheelchairs': 'சக்கர நாற்காலிகள்',
  'Blankets': 'போர்வைகள்',

  // Addresses & Locations
  '12, Gandhi Street, Chennai': '12, காந்தி தெரு, சென்னை',
  '45, Nehru Salai, Trichy': '45, நேரு சாலை, திருச்சி',
  '7, Temple Road, Madurai': '7, கோவில் சாலை, மதுரை',
  '102, West Car Street, Coimbatore': '102, மேற்கு தேரடி வீதி, கோயம்புத்தூர்',
  '3/42, Anna Nagar, Salem': '3/42, அண்ணா नगर, சேலம்',
  '54, Lloyds Road, Chennai': '54, லாயிட்ஸ் சாலை, சென்னை',
  'Siruseri IT Park, Chennai': 'சிறுசேரி ஐடி பூங்கா, சென்னை',
  '15, Palace Road, Bangalore': '15, அரண்மனை சாலை, பெங்களூர்',
  'A K Trust Community Hall, Madhavaram': 'ஏ கே அறக்கட்டளை சமூக கூடம், மாதவரம்',
  'Government High School, Royapuram': 'அரசு உயர்நிலைப் பள்ளி, ராயபுரம்',
  'Main Trust Head Office Conference Room': 'தலைமை அலுவலக கூட்ட அரங்கு',
  'Main Warehouse Chennai': 'தலைமை கிடங்கு சென்னை',
  'Health Centre Room A': 'சுகாதார மையம் அறை A',
  'Rehab Depot B': 'மறுவாழ்வு கிடங்கு B',
  'Disaster Store C': 'பேரிடர் மீட்பு சேமிப்பகம் C',

  // Volunteer Skills & Availabilities
  'Teaching': 'கற்பித்தல்',
  'Event Organizing': 'நிகழ்ச்சி ஏற்பாடு',
  'First Aid': 'முதலுதவி',
  'Driving': 'வாகனம் ஓட்டுதல்',
  'Translation': 'மொழிபெயர்ப்பு',
  'Social Media': 'சமூக ஊடகங்கள்',
  'Data Entry': 'தரவு உள்ளீடு',
  'Tamil Translation': 'தமிழ் மொழிபெயர்ப்பு',
  'weekends': 'வார இறுதி நாட்கள்',
  'weekdays': 'வார நாட்கள்',
  'flexible': 'நெகிழ்வான நேரம்',

  // Events
  'Community Health Camp 2026': 'சமூக சுகாதார முகாம் 2026',
  'Free medical checkups, general physician consultations, and free medicines distribution.': 'இலவச மருத்துவ பரிசோதனைகள், பொது மருத்துவர் ஆலோசனைகள் மற்றும் இலவச மருந்து விநியோகம்.',
  'Free Educational Kit Distribution': 'இலவச கல்வி உபகரணங்கள் விநியோகம்',
  'Distributing bags, notebooks, and writing materials to school children from lower income backgrounds.': 'குறைந்த வருமானம் கொண்ட பள்ளி குழந்தைகளுக்கு பைகள், குறிப்பேடுகள் மற்றும் எழுதுபொருட்களை வழங்குதல்.',
  'Distributing bags, notebooks, and writing materials to local school children from lower income backgrounds.': 'குறைந்த வருமானம் கொண்ட பள்ளி குழந்தைகளுக்கு பைகள், குறிப்பேடுகள் மற்றும் எழுதுபொருட்களை வழங்குதல்.',
  'Volunteer Orientation & Training': 'தன்னார்வலர் அறிமுகம் & பயிற்சி',
  'Introduction to A K Social Welfare Trust projects, code of conduct, and task allocations.': 'ஏ கே சமூக நல அறக்கட்டளை திட்டங்கள், நடத்தை விதிகள் மற்றும் பணிகளின் ஒதுக்கீடு பற்றிய அறிமுகம்.',

  // Report Types
  'donation': 'நன்கொடை அறிக்கை',
  'beneficiary': 'பயனாளிகள் அறிக்கை',
  'inventory': 'சரக்கு அறிக்கை',
  'volunteer': 'தன்னார்வலர் அறிக்கை',
  'event': 'நிகழ்வு அறிக்கை',

  // Donations Details
  'Educational scholarship support': 'கல்வி உதவித்தொகை ஆதரவு',
  'CSR contribution for health camp': 'சுகாதார முகாமிற்கான சிஎஸ்ஆர் (CSR) பங்களிப்பு',
  'Monthly operational support funding': 'மாதாந்திர செயல்பாட்டு ஆதரவு நிதி',
  'Dry ration kit donation support': 'உலர் ரேஷன் கிட் நன்கொடை ஆதரவு',
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'en' || saved === 'ta') return saved;
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let obj = translations[language];
    for (const k of keys) {
      if (obj && k in obj) {
        obj = obj[k];
      } else {
        return key;
      }
    }
    return typeof obj === 'string' ? obj : key;
  };

  // Helper to translate dynamic database content
  const tText = (text: string | null | undefined): string => {
    if (!text) return '';
    if (language === 'en') return text;

    const trimmed = text.trim();

    // Direct match check
    if (tamilDbDictionary[trimmed]) {
      return tamilDbDictionary[trimmed];
    }

    // Direct match check case-insensitive
    const matchedKey = Object.keys(tamilDbDictionary).find(
      (k) => k.toLowerCase() === trimmed.toLowerCase()
    );
    if (matchedKey) {
      return tamilDbDictionary[matchedKey];
    }

    // Smart Pattern Translation for System Activity Logs & Details
    if (trimmed.startsWith('Added beneficiary ')) {
      const name = trimmed.replace('Added beneficiary ', '');
      return `பயனாளி சேர்க்கப்பட்டார்: ${tText(name)}`;
    }
    if (trimmed.startsWith('Updated beneficiary ')) {
      const name = trimmed.replace('Updated beneficiary ', '');
      return `பயனாளி புதுப்பிக்கப்பட்டார்: ${tText(name)}`;
    }
    if (trimmed.startsWith('Deleted beneficiary ')) {
      const name = trimmed.replace('Deleted beneficiary ', '');
      return `பயனாளி நீக்கப்பட்டார்: ${tText(name)}`;
    }
    if (trimmed.startsWith('Recorded donation of ')) {
      const detail = trimmed.replace('Recorded donation of ', '');
      return `நன்கொடை பதிவு செய்யப்பட்டது: ${detail}`;
    }
    if (trimmed.startsWith('Created volunteer profile ')) {
      const name = trimmed.replace('Created volunteer profile ', '');
      return `தன்னார்வலர் சுயவிவரம் உருவாக்கப்பட்டது: ${tText(name)}`;
    }
    if (trimmed.startsWith('Added inventory item ')) {
      const item = trimmed.replace('Added inventory item ', '');
      return `சரக்கு பொருள் சேர்க்கப்பட்டது: ${tText(item)}`;
    }
    if (trimmed.startsWith('Updated inventory item ')) {
      const item = trimmed.replace('Updated inventory item ', '');
      return `சரக்கு பொருள் இற்றைப்படுத்தப்பட்டது: ${tText(item)}`;
    }
    if (trimmed.startsWith('Scheduled event ')) {
      const event = trimmed.replace('Scheduled event ', '');
      return `நிகழ்வு திட்டமிடப்பட்டது: ${tText(event)}`;
    }
    if (trimmed.startsWith('Generated report ')) {
      const report = trimmed.replace('Generated report ', '');
      return `அறிக்கை உருவாக்கப்பட்டது: ${tText(report)}`;
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
