// Shared script for all pages
const STATE_KEY = "bluesendAppState";
const DEFAULT_STATE = {
  senderCountry: "US",
  recipientCountry: "", // no default destination
  amountSend: "",
  exchangeRate: null,
  recipientBank: {
    nuban: ""
  },
  recipientName: {
    first: "",
    last: ""
  },
  reason: "",
  card: {
    number: "",
    brand: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    name: "",
    street: "",
    unit: "",
    city: "",
    state: "",
    zip: "",
    useHome: false
  },
  homeAddress: {
    street: "",
    unit: "",
    city: "",
    state: "",
    zip: ""
  },
  totalCharge: null,
  trackingNumber: null
};

let appState = loadState();
let countriesData = [];

// -------------------- BASIC HELPERS ------------------------------
function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    return { ...structuredClone(DEFAULT_STATE), ...JSON.parse(raw) };
  } catch (e) {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(appState));
}

function goTo(href) {
  document.body.classList.add("fade-out");
  setTimeout(() => {
    window.location.href = href;
  }, 200);
}

function setProgress(val) {
  const fill = document.querySelector(".progress-fill");
  if (fill) {
    fill.style.width = `${val}%`;
  }
}

// -------------------- COUNTRY DATA -------------------------------
function codeToFlagEmoji(countryCode) {
  // Turn "US" into 🇺🇸 etc.
  if (!countryCode) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// FIXED: Updated exchange rates for all currencies
function getCurrencyRate(currencyCode) {
  const rates = {
    'USD': 1,
    'NGN': 1494.13,
    'GBP': 0.78,
    'CAD': 1.36,
    'EUR': 0.92,
    'KES': 129.5,
    'GHS': 15.0,
    'INR': 83.5,
    'CNY': 7.2,
    'PHP': 57.0,
    'PKR': 280.0,
    'BDT': 120.0,
    'MXN': 18.2,
    'BRL': 5.2,
    'ZAR': 18.9,
    'AED': 3.67,
    'SAR': 3.75,
    'JPY': 149.0,
    'AUD': 1.52,
    'CHF': 0.89,
    'NZD': 1.62,
    'SEK': 10.45,
    'NOK': 10.68,
    'DKK': 6.88,
    'PLN': 4.03,
    'CZK': 22.85,
    'HUF': 358.0,
    'RON': 4.58,
    'TRY': 32.0,
    'RUB': 92.0,
    'UAH': 36.5,
    'KRW': 1330.0,
    'SGD': 1.34,
    'HKD': 7.82,
    'TWD': 31.5,
    'MYR': 4.72,
    'IDR': 15600.0,
    'THB': 35.8,
    'VND': 24500.0
  };
  return rates[currencyCode] || 1;
}

async function loadCountries() {
  // FIXED: Countries with correct usdRate values
  const fallback = [
    { code: "US", name: "United States", currencyCode: "USD", currencyName: "US Dollar", flag: "🇺🇸", usdRate: 1 },
    { code: "NG", name: "Nigeria", currencyCode: "NGN", currencyName: "Nigerian Naira", flag: "🇳🇬", usdRate: 1494.13 },
    { code: "GB", name: "United Kingdom", currencyCode: "GBP", currencyName: "British Pound", flag: "🇬🇧", usdRate: 0.78 },
    { code: "CA", name: "Canada", currencyCode: "CAD", currencyName: "Canadian Dollar", flag: "🇨🇦", usdRate: 1.36 },
    { code: "DE", name: "Germany", currencyCode: "EUR", currencyName: "Euro", flag: "🇩🇪", usdRate: 0.92 },
    { code: "FR", name: "France", currencyCode: "EUR", currencyName: "Euro", flag: "🇫🇷", usdRate: 0.92 },
    { code: "ES", name: "Spain", currencyCode: "EUR", currencyName: "Euro", flag: "🇪🇸", usdRate: 0.92 },
    { code: "IT", name: "Italy", currencyCode: "EUR", currencyName: "Euro", flag: "🇮🇹", usdRate: 0.92 },
    { code: "IE", name: "Ireland", currencyCode: "EUR", currencyName: "Euro", flag: "🇮🇪", usdRate: 0.92 },
    { code: "KE", name: "Kenya", currencyCode: "KES", currencyName: "Kenyan Shilling", flag: "🇰🇪", usdRate: 129.5 },
    { code: "GH", name: "Ghana", currencyCode: "GHS", currencyName: "Ghanaian Cedi", flag: "🇬🇭", usdRate: 15.0 },
    { code: "IN", name: "India", currencyCode: "INR", currencyName: "Indian Rupee", flag: "🇮🇳", usdRate: 83.5 },
    { code: "CN", name: "China", currencyCode: "CNY", currencyName: "Chinese Yuan", flag: "🇨🇳", usdRate: 7.2 },
    { code: "PH", name: "Philippines", currencyCode: "PHP", currencyName: "Philippine Peso", flag: "🇵🇭", usdRate: 57.0 },
    { code: "PK", name: "Pakistan", currencyCode: "PKR", currencyName: "Pakistani Rupee", flag: "🇵🇰", usdRate: 280.0 },
    { code: "BD", name: "Bangladesh", currencyCode: "BDT", currencyName: "Taka", flag: "🇧🇩", usdRate: 120.0 },
    { code: "MX", name: "Mexico", currencyCode: "MXN", currencyName: "Mexican Peso", flag: "🇲🇽", usdRate: 18.2 },
    { code: "BR", name: "Brazil", currencyCode: "BRL", currencyName: "Brazilian Real", flag: "🇧🇷", usdRate: 5.2 },
    { code: "ZA", name: "South Africa", currencyCode: "ZAR", currencyName: "South African Rand", flag: "🇿🇦", usdRate: 18.9 },
    { code: "AE", name: "United Arab Emirates", currencyCode: "AED", currencyName: "Dirham", flag: "🇦🇪", usdRate: 3.67 },
    { code: "SA", name: "Saudi Arabia", currencyCode: "SAR", currencyName: "Riyal", flag: "🇸🇦", usdRate: 3.75 }
  ];

  try {
    // Try to load from countries.json
    const res = await fetch("countries.json");
    if (res.ok) {
      countriesData = await res.json();
      // Ensure all countries have usdRate
      countriesData = countriesData.map(country => {
        if (!country.usdRate) {
          country.usdRate = getCurrencyRate(country.currencyCode);
        }
        return country;
      });
      return;
    }
  } catch (e) {
    console.log("Using fallback countries data");
  }

  // Use fallback if file not found
  countriesData = fallback;
}

function getCountry(code) {
  if (!code) return null;
  return countriesData.find((c) => c.code === code) || null;
}

// FIXED: Proper exchange rate calculation
function computeRate(senderCode, destCode) {
  const sender = getCountry(senderCode);
  const dest = getCountry(destCode);
  
  if (!sender || !dest) return null;
  
  // Get USD rates for both currencies
  const senderUsdRate = sender.usdRate || getCurrencyRate(sender.currencyCode);
  const destUsdRate = dest.usdRate || getCurrencyRate(dest.currencyCode);
  
  // Calculate exchange rate: 1 senderCurrency = (destUsdRate / senderUsdRate) destCurrency
  const rate = destUsdRate / senderUsdRate;
  
  return {
    value: rate,
    senderCurrency: sender.currencyCode,
    destCurrency: dest.currencyCode,
    senderUsdRate: senderUsdRate,
    destUsdRate: destUsdRate
  };
}

// -------------------- COUNTRY MODAL ------------------------------
let currentCountryTarget = null;

function openCountryModal(target) {
  currentCountryTarget = target; // "senderCountry" | "recipientCountry"
  const backdrop = document.querySelector("#country-modal");
  if (!backdrop) return;
  backdrop.classList.add("open");
  const searchInput = backdrop.querySelector("#country-search");
  const listBox = backdrop.querySelector("#country-list");
  if (searchInput) searchInput.value = "";
  renderCountryList(listBox, "");
}

function closeCountryModal() {
  const backdrop = document.querySelector("#country-modal");
  if (backdrop) backdrop.classList.remove("open");
  currentCountryTarget = null;
}

function renderCountryList(container, query) {
  if (!container) return;
  const q = query.toLowerCase();
  container.innerHTML = "";
  countriesData
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.currencyCode.toLowerCase().includes(q)
    )
    .forEach((c) => {
      const row = document.createElement("div");
      row.className = "country-list-item";
      row.innerHTML = `
        <div class="country-info">
          <div class="flag-circle">${c.flag}</div>
          <div>
            <div class="country-text-main">${c.name}</div>
            <div class="country-text-sub">${c.currencyCode} · ${
        c.currencyName
      }</div>
          </div>
        </div>
        <div class="country-text-sub">${c.code}</div>
      `;
      row.addEventListener("click", () => {
        if (!currentCountryTarget) return;
        appState[currentCountryTarget] = c.code;
        saveState();
        if (typeof updateIndexCountryDisplay === "function") {
          updateIndexCountryDisplay();
        }
        if (typeof updateExchangeAndAmount === "function") {
          updateExchangeAndAmount();
        }
        // Update city placeholder when sender country changes
        if (currentCountryTarget === "senderCountry") {
          updateCityPlaceholder();
        }
        closeCountryModal();
      });
      container.appendChild(row);
    });
}

// -------------------- CARD VALIDATION ---------------------------
function detectCardBrand(num) {
  const digits = num.replace(/\D/g, "");
  if (/^4[0-9]{6,}$/.test(digits)) return "visa";
  if (/^5[1-5][0-9]{5,}$/.test(digits) || /^2(2[2-9]|[3-7][0-9])[0-9]{4,}$/.test(digits))
    return "mastercard";
  if (/^3[47][0-9]{5,}$/.test(digits)) return "amex";
  if (/^6(?:011|5[0-9]{2})[0-9]{3,}$/.test(digits)) return "discover";
  if (/^506[0-1][0-9]{6,}$/.test(digits) || /^650[0-9]{6,}$/.test(digits)) return "verve";
  return "";
}

function luhnCheck(num) {
  let sum = 0;
  let shouldDouble = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

// -------------------- STATE/CITY FUNCTIONS ----------------------
async function loadStatesForCountry(countryCode) {
  try {
    const response = await fetch('states.json');
    if (!response.ok) throw new Error('Failed to load states');
    const statesData = await response.json();
    return statesData[countryCode] || [];
  } catch (error) {
    // Fallback for common countries
    const fallback = {
      'US': ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'],
      'NG': ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'],
      'GB': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
      'CA': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland', 'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan'],
      'AU': ['NSW', 'QLD', 'SA', 'TAS', 'VIC', 'WA', 'ACT', 'NT'],
      'DE': ['Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia', 'Rhineland-Palatinate', 'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia'],
      'FR': ['Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Brittany', 'Centre-Val de Loire', 'Corsica', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandy', 'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur']
    };
    return fallback[countryCode] || [];
  }
}

function updateStateSelect(states, selectedValue = '') {
  const stateSelect = document.querySelector('#state');
  if (!stateSelect) return;
  
  stateSelect.innerHTML = '<option value="">Select a state/province</option>';
  
  states.forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    if (state === selectedValue) {
      option.selected = true;
    }
    stateSelect.appendChild(option);
  });
}

function updateCityPlaceholder() {
  const cityInput = document.querySelector('#city');
  if (!cityInput) return;
  
  const country = getCountry(appState.senderCountry);
  if (!country) {
    cityInput.placeholder = 'e.g., New York';
    return;
  }
  
  const cityExamples = {
    'US': 'New York',
    'NG': 'Lagos',
    'GB': 'London',
    'CA': 'Toronto',
    'AU': 'Sydney',
    'DE': 'Berlin',
    'FR': 'Paris',
    'ES': 'Madrid',
    'IT': 'Rome',
    'KE': 'Nairobi',
    'GH': 'Accra',
    'IN': 'Mumbai',
    'CN': 'Beijing',
    'PH': 'Manila',
    'PK': 'Karachi',
    'BD': 'Dhaka',
    'MX': 'Mexico City',
    'BR': 'São Paulo',
    'ZA': 'Johannesburg',
    'AE': 'Dubai',
    'SA': 'Riyadh'
  };
  
  cityInput.placeholder = `e.g., ${cityExamples[country.code] || 'City'}`;
}

// -------------------- INDEX PAGE --------------------------------
let updateIndexCountryDisplay = null;
let updateExchangeAndAmount = null;

function initIndexPage() {
  setProgress(0);
  const sendPill = document.querySelector("#sender-pill");
  const destPill = document.querySelector("#recipient-pill");
  const amountInput = document.querySelector("#amount-send");
  const sendButton = document.querySelector("#btn-send-money");
  const getStartedButton = document.querySelector("#btn-get-started");
  const rateLabel = document.querySelector("#exchange-label");
  const previewLabel = document.querySelector("#amount-preview");
  const headerTitleText = document.querySelector("#header-destination-text");

  function updateHeaderDestination() {
    const dest = getCountry(appState.recipientCountry);
    if (!headerTitleText) return;
    if (dest) {
      headerTitleText.textContent = `Sending to ${dest.name}`;
    } else {
      headerTitleText.textContent = "Where are you sending to?";
    }
  }

  function updateButtonState() {
    const amt = parseFloat(amountInput.value);
    const valid =
      !Number.isNaN(amt) && amt > 0 && appState.senderCountry && appState.recipientCountry;
    sendButton.disabled = !valid;
    getStartedButton.disabled = !valid;
    if (valid) {
      appState.amountSend = amountInput.value;
      saveState();
    }
  }

  updateIndexCountryDisplay = function () {
    const sender = getCountry(appState.senderCountry);
    const dest = getCountry(appState.recipientCountry);
    if (sendPill) {
      const flag = sendPill.querySelector(".flag-circle");
      const main = sendPill.querySelector(".country-text-main");
      const sub = sendPill.querySelector(".country-text-sub");
      if (sender) {
        flag.textContent = sender.flag;
        main.textContent = sender.name;
        sub.textContent = sender.currencyCode;
      } else {
        flag.textContent = "🌎";
        main.textContent = "Choose country";
        sub.textContent = "Currency";
      }
    }
    if (destPill) {
      const flag = destPill.querySelector(".flag-circle");
      const main = destPill.querySelector(".country-text-main");
      const sub = destPill.querySelector(".country-text-sub");
      if (dest) {
        flag.textContent = dest.flag;
        main.textContent = dest.name;
        sub.textContent = dest.currencyCode;
      } else {
        flag.textContent = "🌍";
        main.textContent = "Choose destination";
        sub.textContent = "Currency";
      }
    }
    updateHeaderDestination();
  };

  updateExchangeAndAmount = function () {
    if (!rateLabel || !previewLabel) return;
    
    const rateObj = computeRate(appState.senderCountry, appState.recipientCountry);
    
    if (!rateObj) {
      rateLabel.textContent = "";
      previewLabel.textContent = "";
      return;
    }
    
    appState.exchangeRate = rateObj;
    saveState();
    
    const { value, senderCurrency, destCurrency } = rateObj;
    
    // FIXED: Show exchange rate
    rateLabel.textContent = `1 ${senderCurrency} = ${value.toFixed(4)} ${destCurrency}`;
    
    const amt = parseFloat(amountInput.value || "0");
    if (!amt || Number.isNaN(amt)) {
      previewLabel.textContent = "";
    } else {
      const destAmount = amt * value;
      previewLabel.textContent = `${amt.toFixed(2)} ${senderCurrency} ≈ ${destAmount.toFixed(2)} ${destCurrency}`;
      appState.totalCharge = amt;
      saveState();
    }
  };

  if (sendPill) {
    sendPill.addEventListener("click", () =>
      openCountryModal("senderCountry")
    );
  }
  if (destPill) {
    destPill.addEventListener("click", () =>
      openCountryModal("recipientCountry")
    );
  }

  if (amountInput) {
    amountInput.value = appState.amountSend || "";
    amountInput.addEventListener("input", () => {
      updateExchangeAndAmount();
      updateButtonState();
    });
  }

  function goFromIndex() {
    updateButtonState();
    if (!sendButton.disabled) {
      goTo("recipient-bank.html");
    }
  }

  if (sendButton) {
    sendButton.addEventListener("click", goFromIndex);
  }
  if (getStartedButton) {
    getStartedButton.addEventListener("click", goFromIndex);
  }

  updateIndexCountryDisplay();
  updateExchangeAndAmount();
  updateButtonState();

  // Country modal events
  const backdrop = document.querySelector("#country-modal");
  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeCountryModal();
    });
    const closeBtn = document.querySelector("#country-close");
    if (closeBtn) closeBtn.addEventListener("click", closeCountryModal);
    const searchInput = document.querySelector("#country-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) =>
        renderCountryList(
          document.querySelector("#country-list"),
          e.target.value
        )
      );
    }
  }
}

// -------------------- BANK PAGE ---------------------------------
function initRecipientBankPage() {
  setProgress(20);
  const form = document.querySelector("#bank-form");
  const nubanInput = document.querySelector("#nuban");
  const errorEl = document.querySelector("#nuban-error");
  const btn = document.querySelector("#btn-bank-continue");

  if (!form) return;

  nubanInput.value = appState.recipientBank.nuban || "";

  function validate() {
    const val = nubanInput.value.trim();
    const valid = /^\d{10}$/.test(val);
    if (!valid && val !== "") {
      errorEl.textContent = "NUBAN must be exactly 10 digits.";
    } else {
      errorEl.textContent = "";
    }
    btn.disabled = !valid;
    return valid;
  }

  nubanInput.addEventListener("input", validate);
  validate();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;
    appState.recipientBank.nuban = nubanInput.value.trim();
    saveState();
    goTo("recipient-name.html");
  });
}

// -------------------- NAME PAGE ---------------------------------
function initRecipientNamePage() {
  setProgress(40);
  const form = document.querySelector("#name-form");
  const firstInput = document.querySelector("#first-name");
  const lastInput = document.querySelector("#last-name");
  const btn = document.querySelector("#btn-name-continue");

  if (!form) return;

  firstInput.value = appState.recipientName.first || "";
  lastInput.value = appState.recipientName.last || "";

  function validate() {
    const valid =
      firstInput.value.trim().length > 1 &&
      lastInput.value.trim().length > 1;
    btn.disabled = !valid;
    return valid;
  }

  firstInput.addEventListener("input", validate);
  lastInput.addEventListener("input", validate);
  validate();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;
    appState.recipientName.first = firstInput.value.trim();
    appState.recipientName.last = lastInput.value.trim();
    saveState();
    goTo("reason.html");
  });
}

// -------------------- REASON PAGE -------------------------------
function initReasonPage() {
  setProgress(55);
  const form = document.querySelector("#reason-form");
  const select = document.querySelector("#reason-select");
  const btn = document.querySelector("#btn-reason-continue");

  if (!form) return;

  if (appState.reason) {
    select.value = appState.reason;
  }

  function validate() {
    const valid = !!select.value;
    btn.disabled = !valid;
    return valid;
  }

  select.addEventListener("change", validate);
  validate();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;
    appState.reason = select.value;
    saveState();
    goTo("payment-card.html");
  });
}

// -------------------- CARD PAGE ---------------------------------
async function initPaymentCardPage() {
  setProgress(75);
  const form = document.querySelector("#card-form");
  if (!form) return;

  const cardInput = document.querySelector("#card-number");
  const brandBadge = document.querySelector("#card-brand");
  const expMonthInput = document.querySelector("#exp-month");
  const expYearInput = document.querySelector("#exp-year");
  const cvvInput = document.querySelector("#cvv");
  const nameInput = document.querySelector("#card-name");
  const streetInput = document.querySelector("#street-address");
  const unitInput = document.querySelector("#unit-address");
  const cityInput = document.querySelector("#city");
  const stateSelect = document.querySelector("#state");
  const zipInput = document.querySelector("#zip");
  const useHomeCheckbox = document.querySelector("#use-home");
  const btn = document.querySelector("#btn-card-review");
  const cardError = document.querySelector("#card-error");

  // Prefill from state
  cardInput.value = appState.card.number || "";
  expMonthInput.value = appState.card.expiryMonth || "";
  expYearInput.value = appState.card.expiryYear || "";
  cvvInput.value = appState.card.cvv || "";
  nameInput.value = appState.card.name || "";
  streetInput.value = appState.card.street || "";
  unitInput.value = appState.card.unit || "";
  cityInput.value = appState.card.city || "";
  zipInput.value = appState.card.zip || "";
  useHomeCheckbox.checked = !!appState.card.useHome;

  // Load states for the current sender country
  const states = await loadStatesForCountry(appState.senderCountry);
  updateStateSelect(states, appState.card.state);
  
  // Update city placeholder
  updateCityPlaceholder();

  // If "use home address" is checked and homeAddress is saved, prefill now
  if (useHomeCheckbox.checked && appState.homeAddress?.street) {
    streetInput.value = appState.homeAddress.street;
    unitInput.value = appState.homeAddress.unit;
    cityInput.value = appState.homeAddress.city;
    stateSelect.value = appState.homeAddress.state;
    zipInput.value = appState.homeAddress.zip;
  }

  function renderBrandIcon(brand) {
    if (!brandBadge) return;
    if (!brand) {
      brandBadge.innerHTML = "CARD";
      brandBadge.style.fontSize = "10px";
      brandBadge.style.color = "#666";
      return;
    }
    
    brandBadge.innerHTML = "";
    brandBadge.style.fontSize = "12px";
    
    if (brand === "visa") {
      brandBadge.innerHTML = `
        <svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="24" rx="3" fill="#1a1f71" />
          <text x="9" y="16" fill="#ffffff" font-size="11" font-family="Inter, system-ui" font-weight="700">VISA</text>
        </svg>
      `;
    } else if (brand === "mastercard") {
      brandBadge.innerHTML = `
        <svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="24" rx="3" fill="#ffffff" />
          <circle cx="16" cy="12" r="7" fill="#eb001b" />
          <circle cx="24" cy="12" r="7" fill="#f79e1b" />
        </svg>
      `;
    } else if (brand === "amex") {
      brandBadge.innerHTML = `
        <svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="24" rx="3" fill="#2e77bb" />
          <text x="6" y="15" fill="#ffffff" font-size="9" font-family="Inter, system-ui" font-weight="700">AMEX</text>
        </svg>
      `;
    } else if (brand === "discover") {
      brandBadge.innerHTML = `
        <svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="24" rx="3" fill="#ffffff" />
          <circle cx="26" cy="12" r="7" fill="#f47216" />
        </svg>
      `;
    } else if (brand === "verve") {
      brandBadge.innerHTML = `
        <svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="24" rx="3" fill="#00a651" />
          <text x="7" y="15" fill="#ffffff" font-size="10" font-family="Inter, system-ui" font-weight="700">VERVE</text>
        </svg>
      `;
    } else {
      brandBadge.innerHTML = "CARD";
      brandBadge.style.fontSize = "10px";
      brandBadge.style.color = "#666";
    }
  }

  function syncBrand(numRaw) {
    const brand = detectCardBrand(numRaw);
    appState.card.brand = brand;
    saveState();
    renderBrandIcon(brand);
  }

  cardInput.addEventListener("input", (e) => {
    let digits = e.target.value.replace(/\D/g, "").slice(0, 19);
    let formatted = "";
    for (let i = 0; i < digits.length; i += 4) {
      formatted += digits.substring(i, i + 4) + " ";
    }
    e.target.value = formatted.trim();
    syncBrand(digits);
    validate();
  });

  function normalize2(input) {
    let val = input.value.replace(/\D/g, "").slice(0, 2);
    input.value = val;
  }

  expMonthInput.addEventListener("input", () => {
    normalize2(expMonthInput);
    validate();
  });
  expYearInput.addEventListener("input", () => {
    normalize2(expYearInput);
    validate();
  });

  cvvInput.addEventListener("input", () => {
    cvvInput.value = cvvInput.value.replace(/\D/g, "").slice(0, 4);
    validate();
  });

  [
    nameInput,
    streetInput,
    unitInput,
    cityInput,
    stateSelect,
    zipInput
  ].forEach((el) => {
    el.addEventListener("input", validate);
  });

  useHomeCheckbox.addEventListener("change", () => {
    // If home address is saved, fill when box is checked
    if (useHomeCheckbox.checked && appState.homeAddress?.street) {
      streetInput.value = appState.homeAddress.street || "";
      unitInput.value = appState.homeAddress.unit || "";
      cityInput.value = appState.homeAddress.city || "";
      stateSelect.value = appState.homeAddress.state || "";
      zipInput.value = appState.homeAddress.zip || "";
    }
    validate();
  });

  function validate() {
    const cardDigits = cardInput.value.replace(/\D/g, "");
    const brand = detectCardBrand(cardDigits);
    const mm = expMonthInput.value;
    const yy = expYearInput.value;
    const cvv = cvvInput.value;
    const now = new Date();
    const curYear = now.getFullYear() % 100;
    const curMonth = now.getMonth() + 1;

    let valid = true;
    cardError.textContent = "";

    // Card validation - accept any valid Luhn number, regardless of brand
    if (!(cardDigits.length >= 13 && cardDigits.length <= 19 && luhnCheck(cardDigits))) {
      valid = false;
      if (cardDigits.length > 0) {
        cardError.textContent = "Enter a valid card number.";
      }
    }

    // Expiry validation
    const monthNum = parseInt(mm, 10);
    const yearNum = parseInt(yy, 10);
    if (
      !monthNum ||
      monthNum < 1 ||
      monthNum > 12 ||
      !yearNum ||
      yearNum < curYear ||
      (yearNum === curYear && monthNum < curMonth)
    ) {
      valid = false;
    }

    // CVV validation
    if (!(cvv.length >= 3 && cvv.length <= 4)) valid = false;
    
    // Don't reject cards with unknown brands
    // if (brand === "") valid = false; // REMOVED - accept unknown brands

    // Address validation
    if (nameInput.value.trim().length < 3) valid = false;
    if (streetInput.value.trim().length < 3) valid = false;
    if (cityInput.value.trim().length < 2) valid = false;
    if (!stateSelect.value) valid = false;
    if (zipInput.value.trim().length < 3) valid = false;

    btn.disabled = !valid;

    appState.card = {
      number: cardInput.value,
      brand,
      expiryMonth: mm,
      expiryYear: yy,
      cvv,
      name: nameInput.value,
      street: streetInput.value,
      unit: unitInput.value,
      city: cityInput.value,
      state: stateSelect.value,
      zip: zipInput.value,
      useHome: useHomeCheckbox.checked
    };

    // Save "home address" so future transfers can auto-fill
    if (useHomeCheckbox.checked) {
      appState.homeAddress = {
        street: streetInput.value,
        unit: unitInput.value,
        city: cityInput.value,
        state: stateSelect.value,
        zip: zipInput.value
      };
    }

    saveState();
    renderBrandIcon(brand);
    return valid;
  }

  validate();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;
    goTo("review.html");
  });
}

// -------------------- REVIEW PAGE -------------------------------
function initReviewPage() {
  setProgress(90);
  const amountLabel = document.querySelector("#review-amount");
  const sendRow = document.querySelector("#review-send");
  const destRow = document.querySelector("#review-dest");
  const bankRow = document.querySelector("#review-bank");
  const nameRow = document.querySelector("#review-name");
  const reasonRow = document.querySelector("#review-reason");
  const btn = document.querySelector("#btn-review-pay");

  // FIXED: Get exchange rate using computeRate function
  const rate = computeRate(appState.senderCountry, appState.recipientCountry);
  const sender = getCountry(appState.senderCountry);
  const dest = getCountry(appState.recipientCountry);
  const amt = parseFloat(appState.amountSend || "0");

  if (rate && sender && dest && amountLabel) {
    const destAmount = amt * rate.value;
    amountLabel.textContent = `${amt.toFixed(2)} ${sender.currencyCode} → ${destAmount.toFixed(2)} ${dest.currencyCode}`;
  } else if (amountLabel) {
    // Fallback display
    amountLabel.textContent = `${amt.toFixed(2)} USD`;
  }

  if (sendRow && sender) {
    sendRow.textContent = `${sender.name} (${sender.currencyCode})`;
  } else if (sendRow) {
    sendRow.textContent = "—";
  }
  
  if (destRow && dest) {
    destRow.textContent = `${dest.name} (${dest.currencyCode})`;
  } else if (destRow) {
    destRow.textContent = "—";
  }
  
  if (bankRow) {
    // Show only account number, no "(GTBank)"
    bankRow.textContent = `${appState.recipientBank.nuban || "—"}`;
  }
  
  if (nameRow) {
    const fullName = `${appState.recipientName.first || ""} ${appState.recipientName.last || ""}`.trim();
    nameRow.textContent = fullName || "—";
  }
  
  if (reasonRow) {
    reasonRow.textContent = appState.reason || "—";
  }

  btn.addEventListener("click", () => {
    const tracking =
      "BL-" +
      Date.now().toString(36).toUpperCase().slice(-6) +
      "-" +
      Math.floor(Math.random() * 9999)
        .toString()
        .padStart(4, "0");
    appState.trackingNumber = tracking;
    saveState();
    goTo("success.html");
  });
}

// -------------------- SUCCESS PAGE ------------------------------
function initSuccessPage() {
  setProgress(100);
  const trackingEl = document.querySelector("#success-tracking");
  const summaryEl = document.querySelector("#success-summary");
  const sender = getCountry(appState.senderCountry);
  const dest = getCountry(appState.recipientCountry);
  const rate = computeRate(appState.senderCountry, appState.recipientCountry);
  const amt = parseFloat(appState.amountSend || "0");

  if (trackingEl) {
    trackingEl.textContent = appState.trackingNumber || "N/A";
  }
  
  if (summaryEl && sender && dest && rate) {
    const destAmount = amt * rate.value;
    summaryEl.textContent = `${amt.toFixed(2)} ${sender.currencyCode} to ${destAmount.toFixed(2)} ${dest.currencyCode} for ${appState.recipientName.first || ""} ${appState.recipientName.last || ""} in ${dest.name}.`;
  } else if (summaryEl) {
    summaryEl.textContent = `Transfer completed successfully. Tracking: ${appState.trackingNumber || "N/A"}`;
  }
}

// -------------------- MENU (ALL PAGES) --------------------------
function initMenuSheet() {
  const menuBackdrop = document.querySelector("#menu-backdrop");
  const menuSheet = document.querySelector("#menu-sheet");
  const toggles = document.querySelectorAll(".menu-toggle");

  if (!menuBackdrop || !menuSheet || !toggles.length) return;

  function close() {
    menuBackdrop.classList.remove("open");
  }

  function toggle() {
    menuBackdrop.classList.toggle("open");
  }

  toggles.forEach((btn) => btn.addEventListener("click", toggle));

  menuBackdrop.addEventListener("click", (e) => {
    if (e.target === menuBackdrop) close();
  });

  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", () => {
      // For now just close; you can wire separate pages if you want
      close();
      alert(item.dataset.action || item.textContent.trim());
    });
  });
}

// -------------------- ROUTER ------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  await loadCountries();

  const page = document.body.dataset.page;

  switch (page) {
    case "index":
      initIndexPage();
      break;
    case "bank":
      initRecipientBankPage();
      break;
    case "name":
      initRecipientNamePage();
      break;
    case "reason":
      initReasonPage();
      break;
    case "card":
      initPaymentCardPage();
      break;
    case "review":
      initReviewPage();
      break;
    case "success":
      initSuccessPage();
      break;
  }

  // Back buttons
  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => history.back());
  });

  // Menu sheet is shared
  initMenuSheet();
});