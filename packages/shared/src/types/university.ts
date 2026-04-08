export interface University {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  country: GCCCountry;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  font_family: string | null;
  timezone: string;
  currency: GCCCurrency;
  sso_provider: SSOProvider;
  sso_config: Record<string, unknown>;
  modules_enabled: string[];
  created_at: string;
  updated_at: string;
}

export type GCCCountry = 'KW' | 'SA' | 'AE' | 'BH' | 'QA' | 'OM';

export type GCCCurrency = 'KWD' | 'SAR' | 'AED' | 'BHD' | 'QAR' | 'OMR';

export type SSOProvider = 'saml' | 'oidc' | 'oauth2';
