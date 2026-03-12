(function () {
  function getRuntimeConfig() {
    try {
      return window.__RUNTIME_CONFIG__ || null;
    } catch (e) {
      if (isDevelopment()) {
        console.error('Error accessing runtime config:', e);
      }
      return null;
    }
  }

  function isDevelopment() {
    try {
      var cfg = getRuntimeConfig();
      return !!(cfg && cfg.NODE_ENV === 'development');
    } catch (e) {
      return false;
    }
  }

  function waitForConfig(callback, maxRetries) {
    maxRetries = maxRetries || 5;
    var retries = 0;
    
    function check() {
      if (window.__RUNTIME_CONFIG__) {
        callback();
      } else if (retries >= maxRetries) {
        if (isDevelopment()) {
          console.warn('Runtime config not available after ' + maxRetries + ' retries, proceeding with fallbacks');
        }
        callback();
      } else {
        retries++;
        setTimeout(check, 100);
      }
    }
    
    check();
  }

  function setTitleFromConfig() {
    try {
      var cfg = getRuntimeConfig();
      if (cfg && cfg.VITE_APP_NAME) {
        document.title = cfg.VITE_APP_NAME;
      }
    } catch (e) {
      if (isDevelopment()) {
        console.error('Error setting title from config:', e);
      }
    }
  }

  function getPlausibleDomain() {
    try {
      var cfg = getRuntimeConfig();
      // Use new VITE_PLAUSIBLE_DOMAIN if available, otherwise fallback to VITE_SITE_URL
      if (cfg && cfg.VITE_PLAUSIBLE_DOMAIN && cfg.VITE_PLAUSIBLE_DOMAIN.trim && cfg.VITE_PLAUSIBLE_DOMAIN.trim().length > 0) {
        return cfg.VITE_PLAUSIBLE_DOMAIN.trim();
      }
      // Fallback to old behavior: derive from VITE_SITE_URL
      var configured = (cfg && cfg.VITE_SITE_URL) || null;
      if (configured) {
        var url = new URL(configured);
        return url.hostname;
      }
    } catch (e) {
      if (isDevelopment()) {
        console.error('Error getting Plausible domain from config:', e);
      }
    }
    return window.location.hostname || 'localhost';
  }

  function injectPlausible() {
    try {
      var domain = getPlausibleDomain();
      var cfg = getRuntimeConfig();
      var scriptUrl = (cfg && cfg.VITE_PLAUSIBLE_SCRIPT_URL) || 'https://analytics.akdscloud.eu/js/script.js';
      
      var s = document.createElement('script');
      s.setAttribute('defer', '');
      s.setAttribute('data-domain', domain);
      s.src = scriptUrl;
      document.head.appendChild(s);
      
      if (isDevelopment()) {
        console.log('Plausible Analytics injected for domain:', domain, 'script URL:', scriptUrl);
      }
    } catch (e) {
      if (isDevelopment()) {
        console.error('Error injecting Plausible Analytics:', e);
      }
    }
  }

  function getRybbitSiteId() {
    try {
      var cfg = getRuntimeConfig();
      var configured = (cfg && cfg.VITE_RYBBIT_SITE_ID) || null;
      if (configured && configured.trim && configured.trim().length > 0) {
        return configured.trim();
      }
    } catch (e) {
      if (isDevelopment()) {
        console.error('Error getting Rybbit site ID from config:', e);
      }
    }
    return null;
  }

  function injectRybbit() {
    try {
      var siteId = getRybbitSiteId();
      var cfg = getRuntimeConfig();
      var scriptUrl = (cfg && cfg.VITE_RYBBIT_SCRIPT_URL) || 'https://ranalytics.akdscloud.eu/api/script.js';
      
      if (siteId) {
        var s = document.createElement('script');
        s.setAttribute('defer', '');
        s.setAttribute('data-site-id', siteId);
        s.src = scriptUrl;
        document.head.appendChild(s);
        
        if (isDevelopment()) {
          console.log('Rybbit Analytics injected for site ID:', siteId, 'script URL:', scriptUrl);
        }
      } else {
        if (isDevelopment()) {
          console.log('Rybbit Analytics: VITE_RYBBIT_SITE_ID not configured, skipping analytics');
        }
      }
    } catch (e) {
      if (isDevelopment()) {
        console.error('Error injecting Rybbit Analytics:', e);
      }
    }
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    waitForConfig(function () {
      if (isDevelopment() && !getRuntimeConfig()) {
        console.warn('Runtime config missing: /config.js did not load or window.__RUNTIME_CONFIG__ is not set');
      }
      setTitleFromConfig();
      injectPlausible();
      injectRybbit();
    });
  });
})();
