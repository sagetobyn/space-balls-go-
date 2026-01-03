import { Platform, Alert } from 'react-native';
import { create } from 'zustand';

// Product ID configuration
const ITEM_SKUS = Platform.select({
    ios: ['remove_ads'],
    android: ['remove_ads']
}) || ['remove_ads'];

// Safe module loader - returns null if module is not available
let RNIap: any = null;
try {
    RNIap = require('react-native-iap');
} catch (e) {
    console.log('react-native-iap not available (Expo Go mode)');
}

interface PaymentState {
    connected: boolean;
    products: any[];
    hasRemovedAds: boolean;
    loading: boolean;
    isAvailable: boolean; // Whether IAP is available (native build)
    initialize: () => Promise<void>;
    requestPurchase: (sku: string) => Promise<void>;
    restorePurchases: () => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
    connected: false,
    products: [],
    hasRemovedAds: false,
    loading: false,
    isAvailable: RNIap !== null,

    initialize: async () => {
        if (!RNIap) {
            console.log('IAP: Skipping initialization (module not available)');
            set({ connected: false, isAvailable: false });
            return;
        }

        try {
            const connected = await RNIap.initConnection();
            set({ connected, isAvailable: true });
            console.log('IAP: Connection initialized:', connected);

            if (connected && ITEM_SKUS) {
                try {
                    const products = await RNIap.getProducts({ skus: ITEM_SKUS });
                    set({ products });
                    console.log('IAP: Products loaded:', products.length);
                } catch (productErr) {
                    console.warn('IAP: Failed to load products:', productErr);
                }
            }
        } catch (err) {
            console.warn('IAP: Init failed:', err);
            set({ connected: false, isAvailable: false });
        }
    },

    requestPurchase: async (sku: string) => {
        if (!RNIap) {
            Alert.alert(
                "Not Available",
                "In-app purchases require the full app from the Play Store. This feature is not available in development builds.",
                [{ text: "OK" }]
            );
            return;
        }

        const { connected } = get();
        if (!connected) {
            Alert.alert(
                "Connection Error",
                "Unable to connect to the store. Please check your internet connection and try again.",
                [{ text: "OK" }]
            );
            return;
        }

        set({ loading: true });
        try {
            await RNIap.requestPurchase({ sku });
            // Purchase result handled by listener
        } catch (err: any) {
            console.warn('IAP: Purchase error:', err);
            // User cancelled - don't show error
            if (err?.code === 'E_USER_CANCELLED') {
                return;
            }
            Alert.alert(
                "Purchase Error",
                "Unable to complete the purchase. Please try again later.",
                [{ text: "OK" }]
            );
        } finally {
            set({ loading: false });
        }
    },

    restorePurchases: async () => {
        if (!RNIap) {
            Alert.alert(
                "Not Available",
                "Purchase restoration requires the full app from the Play Store.",
                [{ text: "OK" }]
            );
            return;
        }

        set({ loading: true });
        try {
            const purchases = await RNIap.getAvailablePurchases();
            const hasAdsRemoved = purchases.find((p: any) => p.productId === 'remove_ads');
            if (hasAdsRemoved) {
                set({ hasRemovedAds: true });
                Alert.alert("Restored!", "Your ad-free purchase has been restored.", [{ text: "Great!" }]);
            } else {
                Alert.alert("No Purchases", "No previous purchases found for this account.", [{ text: "OK" }]);
            }
        } catch (err) {
            console.warn('IAP: Restore error:', err);
            Alert.alert("Error", "Unable to restore purchases. Please try again later.", [{ text: "OK" }]);
        } finally {
            set({ loading: false });
        }
    }
}));

// Setup Global Purchase Listeners (Called once in App root)
export const setupPurchaseListeners = (): (() => void) => {
    if (!RNIap) {
        console.log('IAP: Skipping listeners (module not available)');
        return () => { };
    }

    try {
        const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
            async (purchase: any) => {
                console.log('IAP: Purchase update received:', purchase.productId);
                const receipt = purchase.transactionReceipt;
                if (receipt) {
                    try {
                        await RNIap.finishTransaction({ purchase, isConsumable: false });

                        if (purchase.productId === 'remove_ads') {
                            usePaymentStore.setState({ hasRemovedAds: true });
                            Alert.alert(
                                "Thank You! 💎",
                                "Ads have been removed. Enjoy your ad-free experience!",
                                [{ text: "Awesome!" }]
                            );
                        }
                    } catch (ackErr) {
                        console.warn('IAP: Acknowledge error:', ackErr);
                    }
                }
            },
        );

        const purchaseErrorSubscription = RNIap.purchaseErrorListener(
            (error: any) => {
                console.warn('IAP: Purchase error listener:', error);
                // Don't show alert for user cancellation
                if (error?.code !== 'E_USER_CANCELLED') {
                    // Error already shown in requestPurchase
                }
            },
        );

        return () => {
            if (purchaseUpdateSubscription) {
                purchaseUpdateSubscription.remove();
            }
            if (purchaseErrorSubscription) {
                purchaseErrorSubscription.remove();
            }
        };
    } catch (e) {
        console.warn('IAP: Listeners setup failed:', e);
        return () => { };
    }
};

