import { ref, computed } from "vue";
import { CurrencyRateEntry } from "../types/general";
import { useGeneralService } from "../services/general.service";

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  locale: string;
}

export const CURRENCIES: CurrencyConfig[] = [
  {
    code: "NGN",
    symbol: "₦",
    name: "Nigerian Naira",
    flag: "https://i0.wp.com/flag-shop.ca/wp-content/uploads/2024/11/img-flag-shop-flags-of-the-world-nigeria-flag-1-2.webp?fit=1080%2C540&ssl=1",
    locale: "en-NG",
  },
  {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/960px-Flag_of_the_United_States.svg.png",
    locale: "en-US",
  },
];

/** Rates are always expressed as: 1 USD = N <currency> */
const rates = ref<Record<string, number>>({ USD: 1 });
const ratesLoading = ref(false);
const ratesError = ref<string | null>(null);
const lastFetchedAt = ref<number | null>(null);
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const selectedCurrency = ref<string>("NGN");

function getCurrencyConfig(code: string): CurrencyConfig {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

function buildUsdBasedRates(
  entries: CurrencyRateEntry[],
): Record<string, number> {
  const latestByPair = new Map<string, CurrencyRateEntry>();

  for (const entry of entries) {
    const key = `${entry.currency_from}_${entry.currency_to}`;
    const existing = latestByPair.get(key);
    if (
      !existing ||
      new Date(entry.conversion_date) > new Date(existing.conversion_date)
    ) {
      latestByPair.set(key, entry);
    }
  }

  const usdRates: Record<string, number> = { USD: 1 };

  for (const entry of latestByPair.values()) {
    if (entry.currency_from === "USD") {
      usdRates[entry.currency_to] = Number(entry.conversion_rate);
    }
  }

  for (const entry of latestByPair.values()) {
    if (entry.currency_to === "USD" && !(entry.currency_from in usdRates)) {
      const rate = Number(entry.conversion_rate);
      if (rate > 0) usdRates[entry.currency_from] = 1 / rate;
    }
  }

  return usdRates;
}

/**
 * Fetch latest exchange rates (base: USD) from the free open.er-api.com endpoint.
 * Skips the network call if cached rates are still fresh.
 */
async function fetchRates(force = false): Promise<void> {
  const now = Date.now();
  if (
    !force &&
    lastFetchedAt.value &&
    now - lastFetchedAt.value < CACHE_TTL_MS &&
    Object.keys(rates.value).length > 1
  )
    return;

  ratesLoading.value = true;
  ratesError.value = null;

  try {
    const { getAllRates } = useGeneralService();
    const entries = await getAllRates();
    const usdRates = buildUsdBasedRates(entries);

    if (Object.keys(usdRates).length > 1) {
      rates.value = usdRates;
      lastFetchedAt.value = now;
    } else {
      throw new Error("No usable rates returned");
    }
  } catch (err) {
    console.log(err);
    ratesError.value =
      "Could not fetch exchange rates. Prices may not reflect current rates.";
    if (!rates.value["NGN"]) rates.value["NGN"] = 1580;
  } finally {
    ratesLoading.value = false;
  }
}

/**
 * Fetch a single fresh currency pair rate directly, bypassing the cached
 * bulk table — handy right after an admin updates a rate, without waiting
 * out the 1 hour cache.
 */
async function refreshPairRate(from: string, to: string): Promise<void> {
  try {
    const { getRate } = useGeneralService();
    const rate = await getRate(from, to);

    // Internal table is USD-based, so only update directly when one
    // side of the pair is USD; otherwise we can't safely fold it in.
    if (from === "USD") {
      rates.value = { ...rates.value, [to]: rate };
    } else if (to === "USD" && rate > 0) {
      rates.value = { ...rates.value, [from]: 1 / rate };
    }
  } catch (err) {
    console.log(err);
  }
}

/**
 * Convert an amount from one currency to the currently selected currency.
 * @param amount - the numeric price
 * @param fromCurrency - the currency the price is originally in (default 'USD')
 */
function convert(amount: number, fromCurrency = "USD"): number {
  const toCurrency = selectedCurrency.value;

  if (fromCurrency === toCurrency) return amount;

  const fromRate = rates.value[fromCurrency] ?? 1;
  const toRate = rates.value[toCurrency] ?? 1;

  // Convert to USD first, then to target
  const inUSD = amount / fromRate;
  return inUSD * toRate;
}

/**
 * Format a price for display, converting from `fromCurrency` to the
 * currently selected currency and applying locale-aware formatting.
 *
 * @param amount - numeric price
 * @param fromCurrency - source currency code (default 'USD')
 */
function format(amount: number, fromCurrency = "USD"): string {
  const converted = convert(amount, fromCurrency);
  const config = getCurrencyConfig(selectedCurrency.value);

  // Use Intl for locale-aware thousand separators
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: selectedCurrency.value === "NGN" ? 0 : 2,
    maximumFractionDigits: selectedCurrency.value === "NGN" ? 0 : 2,
  }).format(converted);

  return `${config.symbol}${formatted}`;
}

/**
 * Format a price as a number only (no currency symbol),
 * converting from `fromCurrency` to the currently selected currency.
 *
 * @param amount - numeric price
 * @param fromCurrency - source currency code (default 'USD')
 */
function formatNumber(amount: number, fromCurrency = "USD"): string {
  const converted = convert(amount, fromCurrency);
  const config = getCurrencyConfig(selectedCurrency.value);

  return new Intl.NumberFormat(config.locale, {
    useGrouping: false,
    minimumFractionDigits: selectedCurrency.value === "NGN" ? 0 : 2,
    maximumFractionDigits: selectedCurrency.value === "NGN" ? 0 : 2,
  }).format(converted);
}

function setCurrency(code: string) {
  selectedCurrency.value = code;
}

const currentConfig = computed(() => getCurrencyConfig(selectedCurrency.value));

export function useCurrency() {
  return {
    selectedCurrency,
    rates,
    ratesLoading,
    ratesError,
    currentConfig,
    CURRENCIES,
    fetchRates,
    refreshPairRate,
    setCurrency,
    convert,
    format,
    formatNumber,
    getCurrencyConfig,
  };
}
