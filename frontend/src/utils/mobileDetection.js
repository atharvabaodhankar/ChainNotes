// Mobile browser detection and MetaMask handling utilities

export const isMobileBrowser = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Check for mobile devices
  const mobileRegex =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

  // Also check for touch capability and screen size as additional indicators
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;

  return (
    mobileRegex.test(userAgent.toLowerCase()) ||
    (isTouchDevice && isSmallScreen)
  );
};

export const isMetaMaskMobileApp = () => {
  return window.ethereum && window.ethereum.isMetaMask && isMobileBrowser();
};

export const hasMetaMaskInstalled = () => {
  return typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask;
};

export const isInMetaMaskBrowser = () => {
  const userAgent = navigator.userAgent || "";
  return userAgent.includes("MetaMaskMobile");
};

export const getMetaMaskDownloadUrl = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // iOS devices
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "https://apps.apple.com/app/metamask/id1438144202";
  }

  // Android devices
  if (/android/i.test(userAgent)) {
    return "https://play.google.com/store/apps/details?id=io.metamask";
  }

  // Default to general download page
  return "https://metamask.io/download/";
};

export const openInMetaMaskApp = () => {
  const currentUrl = window.location.href;
  const metamaskUrl = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}${window.location.search}`;

  // Try to open in MetaMask app
  window.location.href = metamaskUrl;

  // Fallback: if user doesn't have MetaMask app, redirect to download after a delay
  setTimeout(() => {
    if (document.visibilityState === "visible") {
      // User is still on the page, likely means MetaMask app didn't open
      window.open(getMetaMaskDownloadUrl(), "_blank");
    }
  }, 2000);
};

export const shouldShowMobileMetaMaskPrompt = () => {
  // Don't show prompt if already in MetaMask browser
  if (isInMetaMaskBrowser()) {
    return false;
  }

  // Show prompt for mobile browsers without MetaMask
  return isMobileBrowser() && !hasMetaMaskInstalled();
};

export const getMobileInstructions = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return {
      platform: "iOS",
      instructions:
        'Download MetaMask from the App Store, then return to this page and tap "Open in MetaMask App"',
    };
  }

  if (/android/i.test(userAgent)) {
    return {
      platform: "Android",
      instructions:
        'Download MetaMask from Google Play Store, then return to this page and tap "Open in MetaMask App"',
    };
  }

  return {
    platform: "Mobile",
    instructions:
      'Download MetaMask mobile app, then return to this page and tap "Open in MetaMask App"',
  };
};
