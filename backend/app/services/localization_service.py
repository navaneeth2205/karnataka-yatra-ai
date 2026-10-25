"""
Comprehensive multilingual localization engine for Karnataka Yatra AI.
Ensures 100% natural and culturally accurate itinerary generation across
Kannada, Hindi, Telugu, Tamil, Malayalam, and English, eliminating awkward
mixed-language output.
"""

from typing import Dict, List, Any


# Localized names for all 12 Karnataka destinations
DESTINATION_NAMES: Dict[str, Dict[str, str]] = {
    "hampi": {
        "kannada": "ಹಂಪಿ",
        "hindi": "हम्पी",
        "telugu": "హంపి",
        "tamil": "ஹம்பி",
        "malayalam": "ഹംപി",
        "english": "Hampi",
    },
    "mysuru": {
        "kannada": "ಮೈಸೂರು",
        "hindi": "मैसूरु",
        "telugu": "మైసూర్",
        "tamil": "மைசூர்",
        "malayalam": "മൈസൂരു",
        "english": "Mysuru",
    },
    "coorg": {
        "kannada": "ಮಡಿಕೇರಿ / ಕೊಡಗು (ಕೂರ್ಗ್)",
        "hindi": "कूर्ग / मदिकेरी",
        "telugu": "కూర్గ్ / మడికేరి",
        "tamil": "கூர்க் / மடிக்கேரி",
        "malayalam": "കൂർഗ് / മടിക്കേരി",
        "english": "Coorg (Madikeri)",
    },
    "gokarna": {
        "kannada": "ಗೋಕರ್ಣ",
        "hindi": "गोकर्ण",
        "telugu": "గోకర్ణ",
        "tamil": "கோகர்ணா",
        "malayalam": "ഗോകർണം",
        "english": "Gokarna",
    },
    "chikmagalur": {
        "kannada": "ಚಿಕ್ಕಮಗಳೂರು",
        "hindi": "चिकमगलूर",
        "telugu": "చిక్కమగళూరు",
        "tamil": "சிக்கமகளூர்",
        "malayalam": "ചിക്കമംഗളൂരു",
        "english": "Chikmagalur",
    },
    "badami": {
        "kannada": "ಬಾದಾಮಿ",
        "hindi": "बादामी",
        "telugu": "బాదామి",
        "tamil": "பாதாமி",
        "malayalam": "ബാദാമി",
        "english": "Badami",
    },
    "kabini": {
        "kannada": "ಕಬಿನಿ ವನ್ಯಜೀವಿ ಧಾಮ",
        "hindi": "कबिनी वन्यजीव अभयारण्य",
        "telugu": "కబిని అభయారణ్యం",
        "tamil": "கபினி சரணாலயம்",
        "malayalam": "കബിനി വന്യജീവി സങ്കേതം",
        "english": "Kabini Wildlife Reserve",
    },
    "udupi": {
        "kannada": "ಉಡುಪಿ",
        "hindi": "उडुपी",
        "telugu": "ఉడుపి",
        "tamil": "உடுப்பி",
        "malayalam": "ഉഡുപ്പി",
        "english": "Udupi",
    },
    "dandeli": {
        "kannada": "ದಾಂಡೇಲಿ",
        "hindi": "दांडेली",
        "telugu": "దాండేలి",
        "tamil": "தாண்டேலி",
        "malayalam": "ദാണ്ടേലി",
        "english": "Dandeli",
    },
    "belur_halebidu": {
        "kannada": "ಬೇಲೂರು ಮತ್ತು ಹಳೇಬೀಡು",
        "hindi": "बेलूर और हलेबीडु",
        "telugu": "బేలూరు మరియు హళేబీడు",
        "tamil": "பேலூர் மற்றும் ஹளேபீடு",
        "malayalam": "ബേലൂരും ഹളേബീഡും",
        "english": "Belur & Halebidu",
    },
    "mangaluru": {
        "kannada": "ಮಂಗಳೂರು",
        "hindi": "मंगलुरु",
        "telugu": "మంగళూరు",
        "tamil": "மங்களூரு",
        "malayalam": "മംഗലാപുരം",
        "english": "Mangaluru",
    },
    "jogfalls": {
        "kannada": "ಜೋಗ ಜಲಪಾತ",
        "hindi": "जोग जलप्रपात",
        "telugu": "జోగ్ జలపాతం",
        "tamil": "ஜோக் அருவி",
        "malayalam": "ജോഗ് വെള്ളച്ചാട്ടം",
        "english": "Jog Falls",
    },
    "bengaluru": {
        "kannada": "ಬೆಂಗಳೂರು",
        "hindi": "बेंगलुरु",
        "telugu": "బెంగళూరు",
        "tamil": "பெங்களூரு",
        "malayalam": "ബെംഗളൂരു",
        "english": "Bengaluru",
    },
    "hubballi": {
        "kannada": "ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ",
        "hindi": "हुबली-धारवाड़",
        "telugu": "హుబ్లీ-ధార్వాడ్",
        "tamil": "ஹூப்ளி-தார்வாட்",
        "malayalam": "ഹുബ്ബള്ളി-ധാർവാഡ്",
        "english": "Hubballi-Dharwad",
    },
}

# Localized day title templates
DAY_TITLE_TEMPLATES: Dict[str, List[str]] = {
    "kannada": [
        "ದಿನ {day}: {dest}ದಲ್ಲಿ ಆಗಮನ ಮತ್ತು ಭವ್ಯ ಸ್ವಾಗತ",
        "ದಿನ {day}: {dest}ದ ಪಾರಂಪರಿಕ ರತ್ನಗಳು ಮತ್ತು ಸಂಸ್ಕೃತಿ ದರ್ಶನ",
        "ದಿನ {day}: ಸುಂದರ ಪ್ರಕೃತಿ ನೋಟಗಳು ಮತ್ತು ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಅನ್ವೇಷಣೆ",
        "ದಿನ {day}: ಸಾಂಪ್ರದಾಯಿಕ ಊಟ ಮತ್ತು ಸ್ಥಳೀಯ ಬಜಾರ್ ನಡಿಗೆ",
        "ದಿನ {day}: ಪವಿತ್ರ ದೇವಾಲಯಗಳು ಮತ್ತು ಸೂರ್ಯಾಸ್ತ ವೀಕ್ಷಣೆ",
    ],
    "hindi": [
        "दिन {day}: {dest} में आगमन और सांस्कृतिक अन्वेषण",
        "दिन {day}: {dest} की ऐतिहासिक धरोहर और वास्तुकला दर्शन",
        "दिन {day}: प्राकृतिक सौंदर्य और सुरम्य घाट यात्रा",
        "दिन {day}: प्रसिद्ध स्थानीय व्यंजन और बाज़ार भ्रमण",
        "दिन {day}: पवित्र तीर्थ स्थल और मनमोहक सूर्यास्त",
    ],
    "telugu": [
        "రోజు {day}: {dest}లో రాక మరియు సాంస్కృతిక అన్వేషణ",
        "రోజు {day}: {dest} చారిత్రక సంపద మరియు శిల్పకళా దర్శనం",
        "రోజు {day}: పశ్చిమ కనుమల ప్రకృతి అందాలు మరియు విహారం",
        "రోజు {day}: ప్రసిద్ధ స్థానిక రుచులు మరియు మార్కెట్ నడక",
        "రోజు {day}: పుణ్యక్షేత్ర దర్శనం మరియు సూర్యాస్తమయ వీక్షణం",
    ],
    "tamil": [
        "நாள் {day}: {dest}க்கு வருகை மற்றும் பண்பாட்டுப் பயணம்",
        "நாள் {day}: {dest}ன் வரலாற்றுச் சின்னங்கள் மற்றும் சிற்பக்கலை",
        "நாள் {day}: இயற்கை எழில் மற்றும் மலைத்தொடர் உலா",
        "நாள் {day}: பாரம்பரிய சுவைகள் மற்றும் உள்ளூர் சந்தை உலா",
        "நாள் {day}: புனிதத் தலங்கள் மற்றும் மாலை நேரக் காட்சி",
    ],
    "malayalam": [
        "ദിവസം {day}: {dest}ൽ എത്തിച്ചേരലും സംസ്കാര പര്യവേക്ഷണവും",
        "ദിവസം {day}: {dest}ലെ ചരിത്രസ്മാരകങ്ങളും ശില്പകലകളും",
        "ദിവസം {day}: പശ്ചിമഘട്ടത്തിന്റെ പ്രകൃതിഭംഗിയും യാത്രയും",
        "ദിവസം {day}: പ്രശസ്തമായ പ്രാദേശിക ഭക്ഷണരുചികളും അങ്ങാടിയും",
        "ദിവസം {day}: തീർത്ഥാടന കേന്ദ്രങ്ങളും മനോഹര സൂര്യാസ്തമയവും",
    ],
    "english": [
        "Day {day}: Arrival & Cultural Immersion in {dest}",
        "Day {day}: Architectural Marvels & Living Traditions of {dest}",
        "Day {day}: Scenic Western Ghats Vistas & Nature Trails",
        "Day {day}: Authentic Regional Cuisine & Heritage Bazaar Walk",
        "Day {day}: Sacred Sanctuaries & Breathtaking Sunset Overlook",
    ],
}

# Localized food recommendations by destination
LOCALIZED_CUISINE: Dict[str, Dict[str, List[str]]] = {
    "mysuru": {
        "kannada": ["ಮೈಸೂರು ಪಾಕ್", "ಮೈಲಾರಿ ಮಸಾಲ ದೋಸೆ", "ಫಿಲ್ಟರ್ ಕಾಫಿ", "ಮೈಸೂರು ರಸಂ"],
        "hindi": ["मैसूर पाक", "माइलारी मसाला डोसा", "फ़िल्टर कॉफ़ी", "मैसूरु रसम"],
        "telugu": ["మైసూర్ పాక్", "మైలారి మసాలా దోశ", "ఫిల్టర్ కాఫీ", "మైసూర్ రసం"],
        "tamil": ["மைசூர் பாக்", "மைலாரி மசாலா தோசை", "பில்டர் காபி", "மைசூர் ரசம்"],
        "malayalam": ["മൈസൂർ പാക്ക്", "മൈലാരി മസാല ദോശ", "ഫിൽട്ടർ കോഫി", "മൈസൂർ രസം"],
        "english": ["Mysore Pak", "Mylari Masala Dosa", "Traditional Filter Coffee", "Mysore Rasam"],
    },
    "hampi": {
        "kannada": ["ಜೋಳದ ರೊಟ್ಟಿ ಊಟ", "ಬದನೆಕಾಯಿ ಎಣ್ಣೆಗಾಯಿ", "ಮಿರ್ಚಿ ಬಜ್ಜಿ", "ಎಳನೀರು"],
        "hindi": ["जोलद रोट्टी भोजन", "बैंगन एण्णेगायी", "मिर्ची भज्जी", "ताज़ा नारियल पानी"],
        "telugu": ["జొన్న రొట్టె భోజనం", "గుత్తి వంకాయ", "మిర్చి బజ్జి", "లేత కొబ్బరి నీళ్ళు"],
        "tamil": ["சோள ரொட்டி சாப்பாடு", "எண்ணெய் கத்தரிக்காய்", "மிளகாய் பஜ்ஜி", "இளநீர்"],
        "malayalam": ["ജോളദ റൊട്ടി ഊണ്", "എണ്ണെഗായി കറി", "മുളക് ബജ്ജി", "ഇളനീർ"],
        "english": ["Jolada Rotti Meals", "Stuffed Brinjal Curry", "Mirchi Bajji", "Fresh Tender Coconut"],
    },
    "coorg": {
        "kannada": ["ಕಡಂಬಟ್ಟು ಮತ್ತು ಪಾಂಡಿ ಕರಿ", "ಅಕ್ಕಿ ರೊಟ್ಟಿ", "ಕೂಲಪುಟ್ಟು", "ಕೊಡಗಿನ ಬಿಸಿ ಕಾಫಿ"],
        "hindi": ["कदम्बट्टु और पांडी करी", "अक्की रोट्टी", "कूर्ग की ताज़ा ब्लैक कॉफ़ी", "बांस करी"],
        "telugu": ["కదంబట్టు మరియు పాండి కర్రీ", "అక్కి రొట్టె", "కూర్గ్ కాఫీ", "వెదురు చిగురు కూర"],
        "tamil": ["கதம்பட்டு மற்றும் பாண்டி கறி", "அரிசி ரொட்டி", "கூர்க் பில்டர் காபி"],
        "malayalam": ["കദമ്പട്ടുവും പാണ്ഡി കറിയും", "അക്കി റൊട്ടി", "കൂർഗ് ഫ്രഷ് കോഫി"],
        "english": ["Kadambattu Dumplings & Curry", "Akki Rotti", "Estate Arabica Coffee", "Bamboo Shoot Curry"],
    },
    "gokarna": {
        "kannada": ["ಕರಾವಳಿ ಮೀನು ಸಾರು", "ನೀರ್ ದೋಸೆ", "ಕೊಟ್ಟಿಗೆ ಕಡುಬು", "ಕರಿಮೀನಿನ ಫ್ರೈ"],
        "hindi": ["तटीय फिश करी", "नीर डोसा", "कोटिगे कडुबु", "सुरमई रवा फ्राई"],
        "telugu": ["తీరప్రాంత చేపల పులుసు", "నీర్ దోశ", "రవ్వ ఫిష్ ఫ్రై", "కొబ్బరి చట్నీ"],
        "tamil": ["கடற்கரை மீன் குழம்பு", "நீர் தோசை", "வஞ்சிரம் ரவா வறுவல்"],
        "malayalam": ["തീരദേശ മീൻ കറി", "നീർ ദോശ", "നെയ്മീൻ ഫ്രൈ", "തേങ്ങാ ചമ്മന്തി"],
        "english": ["Coastal Fish Curry", "Soft Neer Dosa", "Mangalore Ghee Roast", "Kingfish Rava Fry"],
    },
    "chikmagalur": {
        "kannada": ["ಅಕ್ಕಿ ರೊಟ್ಟಿ ಬದನೆಕಾಯಿ ಗೊಜ್ಜು", "ಮಲೆನಾಡಿನ ಕಷಾಯ", "ಕಾಫಿ ಎಸ್ಟೇಟ್ ಫಿಲ್ಟರ್ ಕಾಫಿ"],
        "hindi": ["अक्की रोट्टी बैंगन गोज्जू", "मलेनाडु हर्बल कषाय", "चिकमगलूर फ़िल्टर कॉफ़ी"],
        "telugu": ["అక్కి రొట్టె వంకాయ గొజ్జు", "మలెనాడు కషాయం", "తాజా ఎస్టేట్ కాఫీ"],
        "tamil": ["அரிசி ரொட்டி கத்தரிக்காய் கொஜ்ஜு", "மலெநாடு மூலிகை கஷாயம்", "எஸ்டேட் காபி"],
        "malayalam": ["അക്കി റൊട്ടിയും വഴുതനങ്ങ ഗോജ്ജുവും", "മലനാട് കാപ്പി", "കഷായം"],
        "english": ["Malenadu Akki Rotti & Gojju", "Estate Robusta Coffee", "Herbal Malenadu Kashaya"],
    },
    "bengaluru": {
        "kannada": ["ಬೆಣ್ಣೆ ಮಸಾಲ ದೋಸೆ", "ಫಿಲ್ಟರ್ ಕಾಫಿ", "ರವಾ ಇಡ್ಲಿ", "ವಿವಿ ಪುರಂ ಚಾಟ್ಸ್", "ಮೈಸೂರು ಪಾಕ್"],
        "hindi": ["बटर मसाला डोसा", "पारंपरिक फ़िल्टर कॉफ़ी", "रवा इडली", "वीवी पुरम स्ट्रीट फ़ूड", "मैसूर पाक"],
        "telugu": ["బెన్నె మసాలా దోశ", "ఫిల్టర్ కాఫీ", "రవ్వ ఇడ్లీ", "వీవీ పురం చాట్స్", "మైసూర్ పాక్"],
        "tamil": ["வெண்ணெய் மசாலா தோசை", "பில்டர் காபி", "ரவா இட்லி", "விவி புரம் சாட்", "மைசூர் பாக்"],
        "malayalam": ["ബട്ടർ മസാല ദോശ", "ഫിൽട്ടർ കോഫി", "റവ ഇഡ്ഡലി", "വിവി പുരം ചാറ്റ്സ്"],
        "english": ["Benne Masala Dosa", "Traditional Filter Coffee", "Rava Idli", "VV Puram Food Street Chaats", "Mysore Pak"],
    },
    "hubballi": {
        "kannada": ["ಧಾರವಾಡ ಪೇಡಾ", "ಗಿರ್ಮಿಟ್ ಮತ್ತು ಮಿರ್ಚಿ ಬಜ್ಜಿ", "ಜೋಳದ ರೊಟ್ಟಿ ಊಟ"],
        "hindi": ["धारवाड़ पेड़ा", "गिरमिट और मिर्ची भज्जी", "जोलद रोट्टी भोजन"],
        "telugu": ["ధార్వాడ్ పేడా", "గిర్మిట్ మరియు మిర్చి బజ్జి", "జొన్న రొట్టె"],
        "tamil": ["தார்வாட் பேடா", "கிர்மிட் மற்றும் மிளகாய் பஜ்ஜி", "சோள ரொட்டி"],
        "malayalam": ["ധാർവാഡ് പേഡ", "ഗിർമിറ്റ് & മുളക് ബജ്ജി", "റൊട്ടി ഊണ്"],
        "english": ["Famous Dharwad Peda", "Spicy Girmit & Mirchi Bajji", "North Karnataka Jolada Rotti Oota"],
    },
}

# Localized activity slots archetypes
SLOT_TRANSLATIONS: Dict[str, Dict[str, Dict[str, str]]] = {
    "morning": {
        "kannada": {
            "title": "{dest}ದ ಐತಿಹಾಸಿಕ ತಾಣಗಳ ಪವಿತ್ರ ದರ್ಶನ",
            "desc": "ಮುಂಜಾನೆಯ ತಂಪಾದ ವಾತಾವರಣದಲ್ಲಿ ವಾಸ್ತುಶಿಲ್ಪ, ಪ್ರಾಚೀನ ದೇವಾಲಯಗಳು ಮತ್ತು ಪಾರಂಪರಿಕ ಸ್ಥಳಗಳ ದರ್ಶನ.",
        },
        "hindi": {
            "title": "{dest} के ऐतिहासिक स्थलों और मंदिरों का दर्शन",
            "desc": "सुबह के सुहावने मौसम में प्राचीन वास्तुकला, मंदिरों और धरोहरों का शांतिपूर्ण भ्रमण।",
        },
        "telugu": {
            "title": "{dest} చారిత్రక ప్రాశస్త్యం మరియు ఆలయ దర్శనం",
            "desc": "ఉదయం ఆహ్లాదకర వాతావరణంలో శిల్పకళ, పురాతన ఆలయాలు మరియు పర్యాటక స్థలాల సందర్శన.",
        },
        "tamil": {
            "title": "{dest}ன் வரலாற்றுத் தலங்கள் மற்றும் கோவில் தரிசனம்",
            "desc": "காலை வேளையில் புராதனக் கட்டிடக்கலை, ஆலயங்கள் மற்றும் பாரம்பரியத் தலங்களை ரசித்துப் பார்த்தல்.",
        },
        "malayalam": {
            "title": "{dest}ലെ പുരാതന സ്മാരകങ്ങളും ക്ഷേത്രദർശനവും",
            "desc": "പ്രഭാതത്തിലെ സുഖകരമായ തണുപ്പിൽ ശില്പകലയും ചരിത്രപ്രസിദ്ധമായ ക്ഷേത്രങ്ങളും കണ്ടറിയൽ.",
        },
        "english": {
            "title": "Heritage Walk & Monument Exploration in {dest}",
            "desc": "Early morning exploration of ancient architecture, sacred sanctums, and UNESCO heritage landmarks.",
        },
    },
    "afternoon": {
        "kannada": {
            "title": "ಸ್ಥಳೀಯ ಸಂಸ್ಕೃತಿ ಮತ್ತು ಕರಕುಶಲ ಮಳಿಗೆಗಳ ಭೇಟಿ",
            "desc": "ಮಧ್ಯಾಹ್ನದ ಸಮಯದಲ್ಲಿ ಸ್ಥಳೀಯ ರೇಷ್ಮೆ, ಗಂಧದ ಕೆತ್ತನೆಗಳು, ಸಾಂಬಾರ ಪದಾರ್ಥಗಳ ಮಾರುಕಟ್ಟೆ ವೀಕ್ಷಣೆ.",
        },
        "hindi": {
            "title": "स्थानीय शिल्प, मसाले और सांस्कृतिक केंद्रों का भ्रमण",
            "desc": "दोपहर में स्थानीय रेशम, चंदन की कलाकृतियां, कॉफी बगान और हस्तशिल्प बाज़ार का अनुभव।",
        },
        "telugu": {
            "title": "స్థానిక హస్తకళలు, సుగంధ ద్రవ్యాలు మరియు మార్కెట్ సందర్శన",
            "desc": "మధ్యాహ్న సమయములో ప్రసిద్ధ పట్టు, గంధపు శిల్పాలు మరియు కాఫీ తోటల అనుభూతి.",
        },
        "tamil": {
            "title": "உள்ளூர் கைவினைப்பொருட்கள், சந்தை மற்றும் கலாச்சார மையம்",
            "desc": "மதிய வேளையில் மைசூர் பட்டு, சந்தன மரச் சிற்பங்கள் மற்றும் நறுமணப் பொருட்கள் சந்தை உலா.",
        },
        "malayalam": {
            "title": "പ്രാദേശിക കരകൗശലങ്ങൾ, സുഗന്ധവ്യഞ്ജനങ്ങൾ, സംസ്കാരം",
            "desc": "ഉച്ചയ്ക്ക് പട്ട്, ചന്ദന ശില്പങ്ങൾ, കാപ്പിത്തോട്ടങ്ങൾ എന്നിവ കണ്ടറിയുന്ന സന്ദർശനം.",
        },
        "english": {
            "title": "Artisan Handicrafts, Spice Trails & Cultural Discovery",
            "desc": "Afternoon visit to local artisan workshops, sandalwood carving galleries, and aromatic spice bazaars.",
        },
    },
    "evening": {
        "kannada": {
            "title": "ಮನಮೋಹಕ ಸೂರ್ಯಾಸ್ತ ವೀಕ್ಷಣೆ ಮತ್ತು ಸ್ಥಳೀಯ ಖಾದ್ಯ ಸವಿಯುವುದು",
            "desc": "ಸಂಜೆಯ ವೇಳೆ ಬೆಟ್ಟದ ತುದಿಯಲ್ಲಿ ಅಥವಾ ಸಮುದ್ರ ತೀರದಲ್ಲಿ ಸೂರ್ಯಾಸ್ತ ವೀಕ್ಷಿಸಿ, ಬಿಸಿ ಕಾಫಿ ಮತ್ತು ಚಾಟ್ಸ್ ಆಸ್ವಾದಿಸಿ.",
        },
        "hindi": {
            "title": "मनमोहक सूर्यास्त और शाम की रोशनी का आनंद",
            "desc": "शाम को समुद्र तट या पहाड़ी चोटी से सूर्यास्त का दृश्य और स्थानीय स्वादिष्ट स्ट्रीट फूड का स्वाद।",
        },
        "telugu": {
            "title": "సూర్యాస్తమయ వీక్షణం మరియు సాయంత్రం దీపాలంకరణ",
            "desc": "కొండ శిఖరం లేదా సముద్రతీరంలో సూర్యాస్తమయాన్ని ఆస్వాదిస్తూ వేడి కాఫీ మరియు చిరుతిళ్ళ ఆనందం.",
        },
        "tamil": {
            "title": "மாலை நேரக் கண்ணைக் கவரும் சூரிய அஸ்தமனம் மற்றும் சிற்றுண்டி",
            "desc": "மாலை வேளையில் கடற்கரை அல்லது குன்றின் உச்சியில் சூரிய அஸ்தமனத்தை ரசித்து உள்ளூர் சிற்றுண்டிகளை ருசித்தல்.",
        },
        "malayalam": {
            "title": "സൂര്യാസ്തമയ ഭംഗിയും സായാഹ്ന വെളിച്ച വിരുന്നും",
            "desc": "കടൽത്തീരത്തോ മലമുകളിലോ ഇരുന്ന് സൂര്യാസ്തമയം കാണുകയും തനത് പലഹാരങ്ങൾ ആസ്വദിക്കുകയും ചെയ്യുക.",
        },
        "english": {
            "title": "Sunset Viewpoint, Palace Illumination & Evening Promenade",
            "desc": "Golden hour panoramic vistas followed by town promenade and savoring authentic local snacks and filter coffee.",
        },
    },
}

# Localized logistics advice
LOCALIZED_TIPS: Dict[str, List[str]] = {
    "kannada": [
        "ದೇವಾಲಯ ಪ್ರವೇಶಕ್ಕೆ ಸಾಂಪ್ರದಾಯಿಕ ಉಡುಪು ಧರಿಸುವುದು ಸೂಕ್ತ.",
        "ಘಾಟ್ ರಸ್ತೆಗಳಲ್ಲಿ ಮೊಬೈಲ್ ನೆಟ್‌ವರ್ಕ್ ಕಡಿಮೆ ಇರುವ ಕಾರಣ ನಗದು ಹಣವನ್ನು ಜೊತೆಯಲ್ಲಿಟ್ಟುಕೊಳ್ಳಿ.",
        "ಬಿಸಿಲಿನಿಂದ ತಪ್ಪಿಸಲು ಮುಂಜಾನೆ 8:30 ರೊಳಗೆ ಪ್ರವಾಸ ಪ್ರಾರಂಭಿಸಿ.",
        "ತಾಜಾ ಎಳನೀರು ಕುಡಿಯುವುದರಿಂದ ಪ್ರಯಾಣದ ಆಯಾಸ ಕಡಿಮೆಯಾಗುತ್ತದೆ.",
    ],
    "hindi": [
        "धार्मिक स्थलों और मंदिरों में शालीन पारंपरिक वस्त्र पहनना उचित है।",
        "घाट खंडों में मोबाइल नेटवर्क कमजोर हो सकता है, अतः कुछ नकद राशि साथ रखें।",
        "दोपहर की धूप से बचने के लिए सुबह 8:30 बजे तक यात्रा शुरू करें।",
        "यात्रा के दौरान तरोताज़ा रहने के लिए ताज़ा नारियल पानी ज़रूर पिएं।",
    ],
    "telugu": [
        "ఆలయ దర్శనానికి సాంప్రదాయ దుస్తులు ధరించడం శ్రేయస్కరం.",
        "ఘాట్ రోడ్లలో నెట్‌వర్క్ సమస్యల కారణంగా కొంత నగదు వెంట ఉంచుకోండి.",
        "ఎండ నుండి తప్పించుకోవడానికి ఉదయం 8:30 గంటలకే ప్రయాణం ప్రారంభించండి.",
    ],
    "tamil": [
        "கோவில்களுக்குச் செல்லும்போது பாரம்பரிய ஆடை அணிவது சிறந்தது.",
        "மலைப்பாதைகளில் இணைய வசதி குறைவாக இருக்கும் என்பதால் சிறிது ரொக்கப் பணம் வைத்திருக்கவும்.",
        "வெயிலைத் தவிர்க்க காலை 8:30 மணிக்கு பயணத்தைத் தொடங்கவும்.",
    ],
    "malayalam": [
        "ക്ഷേത്രദർശനത്തിന് അനുയോജ്യമായ വസ്ത്രധാരണം ശ്രദ്ധിക്കുക.",
        "ഘട്ട് റോഡുകളിൽ മൊബൈൽ നെറ്റ്‌വർക്ക് കുറവായതിനാൽ കയ്യിൽ പണം കരുതുക.",
        "ചൂട് കൂടുന്നതിന് മുൻപായി രാവിലെ 8:30-ന് യാത്ര ആരംഭിക്കുക.",
    ],
    "english": [
        "Modest temple attire is customary when visiting ancient sanctums and mathas.",
        "Keep physical cash handy as digital UPI connectivity can be intermittent in deep Western Ghat valleys.",
        "Start early by 8:30 AM to explore outdoor ruins and peaks in pleasant morning light.",
    ],
}

# Multilingual Kannada Phrasebook with explanations in target language
MULTILINGUAL_PHRASEBOOK: Dict[str, List[Dict[str, str]]] = {
    "kannada": [
        {"phrase": "ನಮಸ್ಕಾರ (Namaskara)", "pronunciation": "ನಮಸ್ಕಾರ", "meaning": "ಗೌರವಪೂರ್ವಕ ವಂದನೆಗಳು", "context": "ಕರ್ನಾಟಕದ ಜನಪ್ರಿಯ ಸ್ವಾಗತ"},
        {"phrase": "ಊಟ ಆಯ್ತಾ? (Oota aayitha?)", "pronunciation": "ಊಟ ಆಯ್ತಾ?", "meaning": "ಊಟ ಮಾಡಿದಿರಾ? (ಆಪ್ತ ಕ್ಷೇಮ ವಿಚಾರಣೆ)", "context": "ಹೃದಯಸ್ಪರ್ಶಿ ಕನ್ನಡಿಗರ ಕುಶಲೋಪರಿ"},
        {"phrase": "ಇದು ಎಷ್ಟು? (Idhu eshtu?)", "pronunciation": "ಇದು ಎಷ್ಟು?", "meaning": "ಇದರ ಬೆಲೆ ಎಷ್ಟು?", "context": "ಶಾಪಿಂಗ್ ಮತ್ತು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ"},
        {"phrase": "ಧನ್ಯವಾದಗಳು (Dhanyavadagalu)", "pronunciation": "ಧನ್ಯವಾದಗಳು", "meaning": "ಕೃತಜ್ಞತೆಗಳು", "context": "ಸಹಾಯ ಮಾಡಿದವರಿಗೆ ಧನ್ಯವಾದ"},
        {"phrase": "ಇಲ್ಲಿ ಪ್ರಸಿದ್ಧ ಊಟ ಯಾವುದು? (Illi prasiddha oota yavudhu?)", "pronunciation": "ಇಲ್ಲಿ ಪ್ರಸಿದ್ಧ ಊಟ ಯಾವುದು?", "meaning": "ಇಲ್ಲಿನ ವಿಶೇಷ ಖಾದ್ಯ ಯಾವುದು?", "context": "ವಿಶೇಷ ಊಟ ಸವಿಯಲು"},
    ],
    "hindi": [
        {"phrase": "ನಮಸ್ಕಾರ (Namaskara)", "pronunciation": "नमस्ते / अभिवादन", "meaning": "नमस्ते / हैलो", "context": "कर्नाटक में हर जगह शिष्ट अभिवादन"},
        {"phrase": "ಊಟ ಆಯ್ತಾ? (Oota aayitha?)", "pronunciation": "ऊटा आयिता?", "meaning": "क्या आपने भोजन कर लिया?", "context": "कन्नड़ संस्कृति में अपनत्व भरा हाल-चाल"},
        {"phrase": "ಇದು ಎಷ್ಟು? (Idhu eshtu?)", "pronunciation": "इदु एष्टु?", "meaning": "यह कितने का है?", "context": "बाज़ार और दुकानों में दाम पूछते समय"},
        {"phrase": "ಧನ್ಯವಾದಗಳು (Dhanyavadagalu)", "pronunciation": "धन्यवादगलु", "meaning": "बहुत-बहुत धन्यवाद", "context": "आभार व्यक्त करने के लिए"},
        {"phrase": "ಸ್ವಲ್ಪ ನಿಧಾನವಾಗಿ ಹೋಗಿ (Swalpa nidhanavagi hogi)", "pronunciation": "स्वल्प निधानवागि होगि", "meaning": "कृपया थोड़ा धीरे चलाएं", "context": "घाट की घुमावदार सड़कों पर"},
    ],
    "telugu": [
        {"phrase": "ನಮಸ್ಕಾರ (Namaskara)", "pronunciation": "నమస్కార", "meaning": "నమస్కారం", "context": "కర్ణాటకలో సాధారణ మర్యాదపూర్వక పలకరింపు"},
        {"phrase": "ಊಟ ಆಯ್ತಾ? (Oota aayitha?)", "pronunciation": "ఊటా ఆయితా?", "meaning": "భోజనం చేశారా?", "context": "ఆప్యాయంగా పలకరించే మాట"},
        {"phrase": "ಇದು ಎಷ್ಟು? (Idhu eshtu?)", "pronunciation": "ఇదు ఎష్టు?", "meaning": "ఇది ఎంత ఖరీదు?", "context": "దుకాణాలు మరియు మార్కెట్లలో"},
        {"phrase": "ಧನ್ಯವಾದಗಳು (Dhanyavadagalu)", "pronunciation": "ధన్యవాదగళు", "meaning": "చాలా ధన్యవాదాలు", "context": "కృతజ్ఞతలు తెలపడానికి"},
    ],
    "tamil": [
        {"phrase": "ನಮಸ್ಕಾರ (Namaskara)", "pronunciation": "நமஸ்காரா", "meaning": "வணக்கம்", "context": "கர்நாடகாவில் பொதுவான மரியாதை வணக்கம்"},
        {"phrase": "ಊಟ ಆಯ್ತಾ? (Oota aayitha?)", "pronunciation": "ஊட்டா ஆயித்தா?", "meaning": "சாப்பிட்டீர்களா?", "context": "அன்பான நலம் விசாரிப்பு"},
        {"phrase": "ಇದು ಎಷ್ಟು? (Idhu eshtu?)", "pronunciation": "இது எஷ்டு?", "meaning": "இது எவ்வளவு விலை?", "context": "கடை மற்றும் சந்தைகளில்"},
        {"phrase": "ಧನ್ಯವಾದಗಳು (Dhanyavadagalu)", "pronunciation": "தன்யவாதகளு", "meaning": "மிக்க நன்றி", "context": "நன்றி தெரிவிப்பதற்கு"},
    ],
    "malayalam": [
        {"phrase": "ನಮಸ್ಕಾರ (Namaskara)", "pronunciation": "നമസ്കാര", "meaning": "നമസ്കാരം", "context": "കർണാടകയിലെ സൗഹാർദ്ദപരമായ അഭിവാദ്യം"},
        {"phrase": "ಊಟ ಆಯ್ತಾ? (Oota aayitha?)", "pronunciation": "ഊട്ടാ ആയിത്താ?", "meaning": "ഭക്ഷണം കഴിച്ചോ?", "context": "സ്നേഹത്തോടെയുള്ള ക്ഷേമാന്വേഷണം"},
        {"phrase": "ಇದು ಎಷ್ಟು? (Idhu eshtu?)", "pronunciation": "ഇദു എഷ്ടു?", "meaning": "ഇതിന് എത്ര രൂപയാണ്?", "context": "സാധനങ്ങൾ വാങ്ങുമ്പോൾ"},
        {"phrase": "ಧನ್ಯವಾದಗಳು (Dhanyavadagalu)", "pronunciation": "ധന്യവാദഗളു", "meaning": "വളരെ നന്ദി", "context": "നന്ദി പ്രകടിപ്പിക്കാൻ"},
    ],
    "english": [
        {"phrase": "ನಮಸ್ಕಾರ (Namaskara)", "pronunciation": "Nuh-muh-skah-rah", "meaning": "Hello / Greetings", "context": "Polite everyday greeting across Karnataka"},
        {"phrase": "ಊಟ ಆಯ್ತಾ? (Oota aayitha?)", "pronunciation": "Oo-tah aah-yee-thah?", "meaning": "Did you have your meal? (How are you?)", "context": "Affectionate cultural greeting"},
        {"phrase": "ಇದು ಎಷ್ಟು? (Idhu eshtu?)", "pronunciation": "Ee-dhoo esh-too?", "meaning": "How much does this cost?", "context": "Shopping at local bazaars and fruit stalls"},
        {"phrase": "ಧನ್ಯವಾದಗಳು (Dhanyavadagalu)", "pronunciation": "Dhun-yuh-vah-duh-guh-loo", "meaning": "Thank you very much", "context": "Expressing appreciation"},
        {"phrase": "ಸ್ವಲ್ಪ ನಿಧಾನವಾಗಿ ಹೋಗಿ (Swalpa nidhanavagi hogi)", "pronunciation": "Swul-pah nee-dhah-nuh-vah-gee hoh-gee", "meaning": "Please drive a little slower", "context": "Useful on winding Western Ghat roads"},
    ],
}


class LocalizationService:
    @classmethod
    def get_localized_destination_name(cls, dest_id: str, language: str) -> str:
        lang = language.lower()
        if dest_id in DESTINATION_NAMES:
            return DESTINATION_NAMES[dest_id].get(lang, DESTINATION_NAMES[dest_id]["english"])
        return dest_id.title()

    @classmethod
    def get_localized_day_title(cls, day_num: int, dest_name: str, language: str) -> str:
        lang = language.lower()
        templates = DAY_TITLE_TEMPLATES.get(lang, DAY_TITLE_TEMPLATES["english"])
        tmpl = templates[(day_num - 1) % len(templates)]
        return tmpl.format(day=day_num, dest=dest_name)

    @classmethod
    def get_localized_cuisine(cls, dest_id: str, language: str) -> List[str]:
        lang = language.lower()
        if dest_id in LOCALIZED_CUISINE:
            return LOCALIZED_CUISINE[dest_id].get(lang, LOCALIZED_CUISINE[dest_id]["english"])
        return LOCALIZED_CUISINE["mysuru"].get(lang, LOCALIZED_CUISINE["mysuru"]["english"])

    @classmethod
    def get_localized_slot(cls, period: str, dest_name: str, language: str) -> Dict[str, str]:
        lang = language.lower()
        period_key = period.lower()
        slot_map = SLOT_TRANSLATIONS.get(period_key, SLOT_TRANSLATIONS["morning"])
        data = slot_map.get(lang, slot_map["english"])
        return {
            "title": data["title"].format(dest=dest_name),
            "desc": data["desc"].format(dest=dest_name),
        }

    @classmethod
    def get_localized_tip(cls, day_num: int, language: str) -> str:
        lang = language.lower()
        tips = LOCALIZED_TIPS.get(lang, LOCALIZED_TIPS["english"])
        return tips[(day_num - 1) % len(tips)]

    @classmethod
    def get_localized_phrases(cls, language: str) -> List[Dict[str, str]]:
        lang = language.lower()
        return MULTILINGUAL_PHRASEBOOK.get(lang, MULTILINGUAL_PHRASEBOOK["english"])
