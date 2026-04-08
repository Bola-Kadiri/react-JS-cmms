// src/components/LanguageSwitcher.tsx
import { useState, useEffect } from 'react';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

export function LanguageSwitcher() {
  const { i18n } = useTypedTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  // Sync state with i18n.language changes
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setCurrentLanguage(languageCode);
    
    // Save language preference to localStorage
    localStorage.setItem('preferredLanguage', languageCode);
  };

  const getCurrentLanguageFlag = () => {
    const currentLang = languages.find(lang => lang.code === currentLanguage);
    return currentLang?.flag || '🌐';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-green-700 hover:text-white px-4">
          <Globe className="h-5 w-5" />
          <span className="ml-1">{getCurrentLanguageFlag()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={currentLanguage === language.code ? "bg-green-50 text-green-800" : ""}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}