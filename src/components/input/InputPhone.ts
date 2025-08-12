   
interface PhoneInputProps {
  value?: string;
  onChange?: (value: string, isValid: boolean, callingCode: string) => void;
  placeholder?: string;
  class?: string;
  defaultCountry?: string;
  label?: string;
}

const countryData = [
  { code: "US", flag: "🇺🇸", name: "United States", callingCode: "+1" },
  { code: "RU", flag: "🇷🇺", name: "Russia", callingCode: "+7" },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom", callingCode: "+44" },
  { code: "DE", flag: "🇩🇪", name: "Germany", callingCode: "+49" },
  { code: "FR", flag: "🇫🇷", name: "France", callingCode: "+33" },
  { code: "IT", flag: "🇮🇹", name: "Italy", callingCode: "+39" },
  { code: "ES", flag: "🇪🇸", name: "Spain", callingCode: "+34" },
  { code: "CA", flag: "🇨🇦", name: "Canada", callingCode: "+1" },
  { code: "AU", flag: "🇦🇺", name: "Australia", callingCode: "+61" },
  { code: "JP", flag: "🇯🇵", name: "Japan", callingCode: "+81" },
  { code: "CN", flag: "🇨🇳", name: "China", callingCode: "+86" },
  { code: "IN", flag: "🇮🇳", name: "India", callingCode: "+91" },
  { code: "BR", flag: "🇧🇷", name: "Brazil", callingCode: "+55" },
  { code: "MX", flag: "🇲🇽", name: "Mexico", callingCode: "+52" },
  { code: "KR", flag: "🇰🇷", name: "South Korea", callingCode: "+82" },
  { code: "NL", flag: "🇳🇱", name: "Netherlands", callingCode: "+31" },
  { code: "SE", flag: "🇸🇪", name: "Sweden", callingCode: "+46" },
  { code: "NO", flag: "🇳🇴", name: "Norway", callingCode: "+47" },
  { code: "DK", flag: "🇩🇰", name: "Denmark", callingCode: "+45" },
  { code: "FI", flag: "🇫🇮", name: "Finland", callingCode: "+358" },
  { code: "PL", flag: "🇵🇱", name: "Poland", callingCode: "+48" },
  { code: "CZ", flag: "🇨🇿", name: "Czech Republic", callingCode: "+420" },
  { code: "AT", flag: "🇦🇹", name: "Austria", callingCode: "+43" },
  { code: "CH", flag: "🇨🇭", name: "Switzerland", callingCode: "+41" },
  { code: "BE", flag: "🇧🇪", name: "Belgium", callingCode: "+32" },
  { code: "IE", flag: "🇮🇪", name: "Ireland", callingCode: "+353" },
  { code: "PT", flag: "🇵🇹", name: "Portugal", callingCode: "+351" },
  { code: "GR", flag: "🇬🇷", name: "Greece", callingCode: "+30" },
  { code: "HU", flag: "🇭🇺", name: "Hungary", callingCode: "+36" },
  { code: "RO", flag: "🇷🇴", name: "Romania", callingCode: "+40" },
  { code: "BG", flag: "🇧🇬", name: "Bulgaria", callingCode: "+359" },
  { code: "HR", flag: "🇭🇷", name: "Croatia", callingCode: "+385" },
  { code: "SI", flag: "🇸🇮", name: "Slovenia", callingCode: "+386" },
  { code: "SK", flag: "🇸🇰", name: "Slovakia", callingCode: "+421" },
  { code: "LT", flag: "🇱🇹", name: "Lithuania", callingCode: "+370" },
  { code: "LV", flag: "🇱🇻", name: "Latvia", callingCode: "+371" },
  { code: "EE", flag: "🇪🇪", name: "Estonia", callingCode: "+372" },
  { code: "UA", flag: "🇺🇦", name: "Ukraine", callingCode: "+380" },
  { code: "BY", flag: "🇧🇾", name: "Belarus", callingCode: "+375" },
  { code: "KZ", flag: "🇰🇿", name: "Kazakhstan", callingCode: "+7" },
  { code: "UZ", flag: "🇺🇿", name: "Uzbekistan", callingCode: "+998" },
  { code: "KG", flag: "🇰🇬", name: "Kyrgyzstan", callingCode: "+996" },
  { code: "TJ", flag: "🇹🇯", name: "Tajikistan", callingCode: "+992" },
  { code: "TM", flag: "🇹🇲", name: "Turkmenistan", callingCode: "+993" },
  { code: "AZ", flag: "🇦🇿", name: "Azerbaijan", callingCode: "+994" },
  { code: "GE", flag: "🇬🇪", name: "Georgia", callingCode: "+995" },
  { code: "AM", flag: "🇦🇲", name: "Armenia", callingCode: "+374" },
  { code: "TR", flag: "🇹🇷", name: "Turkey", callingCode: "+90" },
  { code: "IL", flag: "🇮🇱", name: "Israel", callingCode: "+972" },
  { code: "SA", flag: "🇸🇦", name: "Saudi Arabia", callingCode: "+966" },
  { code: "AE", flag: "🇦🇪", name: "United Arab Emirates", callingCode: "+971" },
  { code: "QA", flag: "🇶🇦", name: "Qatar", callingCode: "+974" },
  { code: "KW", flag: "🇰🇼", name: "Kuwait", callingCode: "+965" },
  { code: "BH", flag: "🇧🇭", name: "Bahrain", callingCode: "+973" },
  { code: "OM", flag: "🇴🇲", name: "Oman", callingCode: "+968" },
  { code: "JO", flag: "🇯🇴", name: "Jordan", callingCode: "+962" },
  { code: "LB", flag: "🇱🇧", name: "Lebanon", callingCode: "+961" },
  { code: "SY", flag: "🇸🇾", name: "Syria", callingCode: "+963" },
  { code: "IQ", flag: "🇮🇶", name: "Iraq", callingCode: "+964" },
  { code: "IR", flag: "🇮🇷", name: "Iran", callingCode: "+98" },
  { code: "AF", flag: "🇦🇫", name: "Afghanistan", callingCode: "+93" },
  { code: "PK", flag: "🇵🇰", name: "Pakistan", callingCode: "+92" },
  { code: "BD", flag: "🇧🇩", name: "Bangladesh", callingCode: "+880" },
  { code: "LK", flag: "🇱🇰", name: "Sri Lanka", callingCode: "+94" },
  { code: "NP", flag: "🇳🇵", name: "Nepal", callingCode: "+977" },
  { code: "BT", flag: "🇧🇹", name: "Bhutan", callingCode: "+975" },
  { code: "MV", flag: "🇲🇻", name: "Maldives", callingCode: "+960" },
  { code: "MY", flag: "🇲🇾", name: "Malaysia", callingCode: "+60" },
  { code: "SG", flag: "🇸🇬", name: "Singapore", callingCode: "+65" },
  { code: "TH", flag: "🇹🇭", name: "Thailand", callingCode: "+66" },
  { code: "VN", flag: "🇻🇳", name: "Vietnam", callingCode: "+84" },
  { code: "PH", flag: "🇵🇭", name: "Philippines", callingCode: "+63" },
  { code: "ID", flag: "🇮🇩", name: "Indonesia", callingCode: "+62" },
  { code: "MM", flag: "🇲🇲", name: "Myanmar", callingCode: "+95" },
  { code: "LA", flag: "🇱🇦", name: "Laos", callingCode: "+856" },
  { code: "KH", flag: "🇰🇭", name: "Cambodia", callingCode: "+855" },
  { code: "MN", flag: "🇲🇳", name: "Mongolia", callingCode: "+976" },
  { code: "NZ", flag: "🇳🇿", name: "New Zealand", callingCode: "+64" },
  { code: "ZA", flag: "🇿🇦", name: "South Africa", callingCode: "+27" },
  { code: "EG", flag: "🇪🇬", name: "Egypt", callingCode: "+20" },
  { code: "NG", flag: "🇳🇬", name: "Nigeria", callingCode: "+234" },
  { code: "KE", flag: "🇰🇪", name: "Kenya", callingCode: "+254" },
  { code: "ET", flag: "🇪🇹", name: "Ethiopia", callingCode: "+251" },
  { code: "TZ", flag: "🇹🇿", name: "Tanzania", callingCode: "+255" },
  { code: "UG", flag: "🇺🇬", name: "Uganda", callingCode: "+256" },
  { code: "GH", flag: "🇬🇭", name: "Ghana", callingCode: "+233" },
  { code: "CI", flag: "🇨🇮", name: "Ivory Coast", callingCode: "+225" },
  { code: "SN", flag: "🇸🇳", name: "Senegal", callingCode: "+221" },
  { code: "ML", flag: "🇲🇱", name: "Mali", callingCode: "+223" },
  { code: "BF", flag: "🇧🇫", name: "Burkina Faso", callingCode: "+226" },
  { code: "NE", flag: "🇳🇪", name: "Niger", callingCode: "+227" },
  { code: "TD", flag: "🇹🇩", name: "Chad", callingCode: "+235" },
  { code: "SD", flag: "🇸🇩", name: "Sudan", callingCode: "+249" },
  { code: "LY", flag: "🇱🇾", name: "Libya", callingCode: "+218" },
  { code: "TN", flag: "🇹🇳", name: "Tunisia", callingCode: "+216" },
  { code: "DZ", flag: "🇩🇿", name: "Algeria", callingCode: "+213" },
  { code: "MA", flag: "🇲🇦", name: "Morocco", callingCode: "+212" },
  { code: "AR", flag: "🇦🇷", name: "Argentina", callingCode: "+54" },
  { code: "CL", flag: "🇨🇱", name: "Chile", callingCode: "+56" },
  { code: "PE", flag: "🇵🇪", name: "Peru", callingCode: "+51" },
  { code: "CO", flag: "🇨🇴", name: "Colombia", callingCode: "+57" },
  { code: "VE", flag: "🇻🇪", name: "Venezuela", callingCode: "+58" },
  { code: "EC", flag: "🇪🇨", name: "Ecuador", callingCode: "+593" },
  { code: "BO", flag: "🇧🇴", name: "Bolivia", callingCode: "+591" },
  { code: "PY", flag: "🇵🇾", name: "Paraguay", callingCode: "+595" },
  { code: "UY", flag: "🇺🇾", name: "Uruguay", callingCode: "+598" },
  { code: "GY", flag: "🇬🇾", name: "Guyana", callingCode: "+592" },
  { code: "SR", flag: "🇸🇷", name: "Suriname", callingCode: "+597" },
  { code: "FK", flag: "🇫🇰", name: "Falkland Islands", callingCode: "+500" },
  { code: "GF", flag: "🇬🇫", name: "French Guiana", callingCode: "+594" },
  { code: "GY", flag: "🇬🇾", name: "Guyana", callingCode: "+592" },
  { code: "SR", flag: "🇸🇷", name: "Suriname", callingCode: "+597" },
  { code: "FK", flag: "🇫🇰", name: "Falkland Islands", callingCode: "+500" },
  { code: "GF", flag: "🇬🇫", name: "French Guiana", callingCode: "+594" },
];

export const PhoneInput: Component<PhoneInputProps> = (props) => {
  const [phoneNumber, setPhoneNumber] = createSignal(props.value || "");
  const [selectedCountry, setSelectedCountry] = createSignal<CountryCode>(
    (props.defaultCountry as CountryCode) || "US"
  );
  const [isValid, setIsValid] = createSignal(true);
  const [formattedNumber, setFormattedNumber] = createSignal("");
  const [showCountryPicker, setShowCountryPicker] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");

  const formatter = new AsYouType(selectedCountry());

  const getCurrentCountry = () => {
    return (
      countryData.find((country) => country.code === selectedCountry()) ||
      countryData[0]
    );
  };

  const filteredCountries = () => {
    const query = searchQuery().toLowerCase().trim();

    if (!query) {
      return countryData;
    }

    return countryData.filter((country) => {
      const name = country.name.toLowerCase();
      const code = country.code.toLowerCase();
      const callingCode = country.callingCode;

      if (code === query) return true;
      if (callingCode === query) return true;
      if (name === query) return true;

      if (name.includes(query)) return true;
      if (callingCode.includes(query)) return true;
      if (code.includes(query)) return true;

      return false;
    });
  };

  createEffect(() => {
    formatter.reset();
    if (phoneNumber()) {
      const formatted = formatter.input(phoneNumber());
      setFormattedNumber(formatted);
    }
  });

  const handleCountrySelect = (countryCode: CountryCode) => {
    setSelectedCountry(countryCode);
    setShowCountryPicker(false);
    setSearchQuery("");
    formatter.reset();
    if (phoneNumber()) {
      const formatted = formatter.input(phoneNumber());
      setFormattedNumber(formatted);
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);

    formatter.reset();
    const formatted = formatter.input(value);
    setFormattedNumber(formatted);

    if (value && value.length > 5) {
      try {
        const valid = isValidPhoneNumber(value, selectedCountry());
        setIsValid(valid);
        props.onChange?.(value, valid, getCurrentCountry().callingCode);
      } catch {
        setIsValid(false);
        props.onChange?.(value, false, getCurrentCountry().callingCode);
      }
    } else {
      setIsValid(true);
      props.onChange?.(value, true, getCurrentCountry().callingCode);
    }
  };

  return (
    <Flex direction="col" gap={"sm"}>
      {props.label && <span class="text-sm">{props.label}</span>}

      <div class={`relative ${props.class || ""}`}>
        <div class="relative">
          <Input
            type="tel"
            value={formattedNumber()}
            onChange={(e) => handlePhoneChange(e.currentTarget.value)}
            placeholder={props.placeholder || "Enter phone number"}
            class={`pl-16 h-12 relative z-0 ${
              !isValid() ? "border-red-500" : ""
            }`}
          />

          <Button
            type="button"
            class="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 h-8 w-12 z-10 pointer-events-auto"
            onClick={() => setShowCountryPicker(true)}
            color="ghost"
            size="xs"
          >
            <Flex align="center" justify="center" class="gap-1">
              <span class="text-lg">{getCurrentCountry().flag}</span>
              <span class="text-xs">{getCurrentCountry().callingCode}</span>
            </Flex>
          </Button>
        </div>
      </div>

      <BottomSheet
        isOpen={showCountryPicker()}
        onClose={() => setShowCountryPicker(false)}
      >
        <div class="pt-1 pb-10 px-2">
          <Input
            type="text"
            placeholder="Search countries..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            class="mb-4"
          />

          <div class="overflow-y-auto max-h-[50vh]">
            {filteredCountries().map((country) => (
              <Button
                type="button"
                class="w-full flex items-center gap-3 p-3 rounded-lg transition-colors"
                onClick={() => handleCountrySelect(country.code as CountryCode)}
                color="ghost"
                size="xs"
              >
                <span class="text-2xl">{country.flag}</span>
                <Flex direction="row" gap={"sm"} align="center" class="flex-1">
                  <span class="text-sm">{country.callingCode}</span>
                  <span class="font-medium">{country.name}</span>
                </Flex>
                {selectedCountry() === country.code && (
                  <span class="text-blue-500">✓</span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </BottomSheet>
    </Flex>
  );
};  
