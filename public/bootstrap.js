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

  function getSiteHostname() {
    try {
      var cfg = getRuntimeConfig();
      var configured = (cfg && cfg.VITE_SITE_URL) || null;
      if (configured) {
        var url = new URL(configured);
        return url.hostname;
      }
    } catch (e) {
      if (isDevelopment()) {
        console.error('Error getting site hostname from config:', e);
      }
    }

    return window.location.hostname || 'localhost';
  }

  function injectPlausible() {
    try {
      var domain = getSiteHostname();
      var s = document.createElement('script');
      s.setAttribute('defer', '');
      s.setAttribute('data-domain', domain);
      s.src = 'https://analytics.akdscloud.eu/js/script.js';
      document.head.appendChild(s);
      
      if (isDevelopment()) {
        console.log('Plausible Analytics injected for domain:', domain);
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
      if (siteId) {
        var s = document.createElement('script');
        s.setAttribute('defer', '');
        s.setAttribute('data-site-id', siteId);
        s.src = 'https://ranalytics.akdscloud.eu/api/script.js';
        document.head.appendChild(s);
        
        if (isDevelopment()) {
          console.log('Rybbit Analytics injected for site ID:', siteId);
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
