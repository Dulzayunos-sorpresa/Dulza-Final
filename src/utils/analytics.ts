
/**
 * Utility for Google Analytics tracking
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-HDK80W7242', {
      page_path: url,
    });
  }
};

export const AnalyticsEvents = {
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  CHECKOUT_PROGRESS: 'checkout_progress',
  PURCHASE: 'purchase',
  PAYMENT_FAILED: 'payment_failed',
  ORDER_CANCELLED: 'order_cancelled',
  VIEW_ITEM: 'view_item',
  APPLY_COUPON: 'apply_coupon',
  OUT_OF_COVERAGE: 'out_of_coverage_inquiry',
  ORDER_PRINTED: 'order_printed',
  EXPORT_EXCEL: 'export_excel',
  IMPORT_EXCEL: 'import_excel',
};
