import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

/**
 * AdManager - Google AdMob Interstitial Ads
 * 
 * Shows ads after win/fail, starting from level 5 (first 4 levels ad-free)
 * Uses test IDs for development - replace with real IDs before production
 */

class AdManagerClass {
    private interstitial: InterstitialAd | null = null;
    private isLoaded = false;
    private isInitialized = false;

    async init(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Use test interstitial ad unit ID
            this.interstitial = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
                requestNonPersonalizedAdsOnly: true,
            });

            // Ad loaded successfully
            this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
                console.log('[AdManager] Ad loaded');
                this.isLoaded = true;
            });

            // Ad closed - preload next ad
            this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
                console.log('[AdManager] Ad closed, preloading next');
                this.isLoaded = false;
                this.interstitial?.load();
            });

            // Ad failed to load
            this.interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
                console.warn('[AdManager] Ad failed to load:', error);
                this.isLoaded = false;
            });

            // Load the first ad
            this.interstitial.load();
            this.isInitialized = true;
            console.log('[AdManager] Initialized successfully');
        } catch (error) {
            console.error('[AdManager] Failed to initialize:', error);
        }
    }

    async showAd(currentLevel: number): Promise<void> {
        // Check if user has purchased ad removal
        try {
            const { usePaymentStore } = require('../store/PaymentStore');
            if (usePaymentStore.getState().hasRemovedAds) {
                console.log('[AdManager] Ads removed by purchase, skipping');
                return Promise.resolve();
            }
        } catch (e) {
            // PaymentStore not available, continue with ads
        }

        // Skip ads for first 4 levels
        if (currentLevel <= 4) {
            console.log(`[AdManager] Skipping ad for level ${currentLevel} (ad-free zone)`);
            return Promise.resolve();
        }

        if (!this.isInitialized) {
            console.warn('[AdManager] Not initialized, skipping ad');
            return Promise.resolve();
        }

        if (this.isLoaded && this.interstitial) {
            try {
                console.log(`[AdManager] Showing ad for level ${currentLevel}`);
                await this.interstitial.show();
            } catch (error) {
                console.error('[AdManager] Error showing ad:', error);
            }
        } else {
            console.log('[AdManager] Ad not ready yet, skipping');
        }

        return Promise.resolve();
    }

    isAdReady(): boolean {
        return this.isLoaded;
    }
}

export const AdManager = new AdManagerClass();
