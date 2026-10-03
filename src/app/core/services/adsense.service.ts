import {
  Injectable,
  inject,
  PLATFORM_ID,
  signal,
  computed
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface AdSenseConfig {
  /**
   * Your Google AdSense Publisher ID (format: ca-pub-XXXXXXXXXXXXXXXX)
   * Leave empty during pre-approval/development.
   */
  publisherId: string;
  /**
   * Master switch to enable live Google AdSense ad requests.
   * When false, ad slots are hidden unless showPlaceholder is explicitly set to true.
   */
  enabled: boolean;
  /**
   * Whether to display ad placeholders in pre-approval/development mode.
   * Defaults to false so end-users never see placeholders.
   */
  showPlaceholder?: boolean;
  /**
   * Dedicated slot IDs created in Google AdSense Dashboard -> Ads -> By ad unit
   */
  slots: {
    topLeaderboard?: string;
    inContent?: string;
    bottom?: string;
  };
}

export const DEFAULT_ADSENSE_CONFIG: AdSenseConfig = {
  publisherId: '', // e.g. 'ca-pub-0000000000000000'
  enabled: false,  // Set to true once approved by Google AdSense
  showPlaceholder: false, // Ensure users never see placeholders
  slots: {
    topLeaderboard: '',
    inContent: '',
    bottom: ''
  }
};

@Injectable({
  providedIn: 'root'
})
export class AdSenseService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  // Reactive configuration signal
  readonly config = signal<AdSenseConfig>(DEFAULT_ADSENSE_CONFIG);

  // Active status: live ads only render when in browser, publisherId is set, and enabled is true
  readonly isLive = computed<boolean>(() => {
    const cfg = this.config();
    return this.isBrowser && Boolean(cfg.publisherId) && cfg.enabled;
  });

  readonly publisherId = computed<string>(() => this.config().publisherId);

  private scriptInjected = false;

  /**
   * Dynamically loads the official Google AdSense script into the document head
   */
  initAdSense(): void {
    if (!this.isLive() || this.scriptInjected || !this.isBrowser) {
      return;
    }

    const pubId = this.publisherId();
    if (!pubId) return;

    // Check if script already exists in document
    const existing = document.querySelector(`script[src*="adsbygoogle.js"]`);
    if (existing) {
      this.scriptInjected = true;
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`;
    document.head.appendChild(script);
    this.scriptInjected = true;
  }

  /**
   * Safely pushes an ad request to Google's adsbygoogle queue
   */
  pushAd(): void {
    if (!this.isBrowser) return;

    try {
      const win = window as unknown as { adsbygoogle?: unknown[] };
      win.adsbygoogle = win.adsbygoogle || [];
      win.adsbygoogle.push({});
    } catch (err) {
      // Catch and suppress adblocker or runtime push errors without breaking the SPA
      console.warn('AdSense push notice:', err);
    }
  }

  /**
   * Update configuration dynamically
   */
  updateConfig(newConfig: Partial<AdSenseConfig>): void {
    this.config.update(prev => ({
      ...prev,
      ...newConfig,
      slots: {
        ...prev.slots,
        ...(newConfig.slots || {})
      }
    }));

    if (this.isLive()) {
      this.initAdSense();
    }
  }
}
