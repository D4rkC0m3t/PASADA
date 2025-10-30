/**
 * PASADA Analytics Tracker
 * Client-side script to track visitor behavior
 * 
 * Usage: Add this script to your website footer
 * <script src="/js/pasada-analytics.js"></script>
 */

(function() {
  'use strict';

  // Configuration
  const API_ENDPOINT = '/api/analytics/log-visit';
  const SESSION_KEY = 'pasada_session_id';
  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

  // Get or create session ID
  function getSessionId() {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    const lastActivity = sessionStorage.getItem(SESSION_KEY + '_time');
    
    // Create new session if none exists or if expired
    if (!sessionId || (lastActivity && Date.now() - parseInt(lastActivity) > SESSION_DURATION)) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    
    // Update last activity time
    sessionStorage.setItem(SESSION_KEY + '_time', Date.now().toString());
    
    return sessionId;
  }

  // Get URL parameters
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign')
    };
  }

  // Get page name from path
  function getPageName() {
    const path = window.location.pathname;
    
    if (path === '/' || path === '/index.html') return 'home';
    if (path.includes('/about')) return 'about';
    if (path.includes('/projects')) return 'projects';
    if (path.includes('/contact')) return 'contact';
    if (path.includes('/works/')) {
      const slug = path.split('/works/')[1]?.replace('/', '');
      return slug ? `work-${slug}` : 'works';
    }
    
    return path.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'unknown';
  }

  // Track page visit
  function trackVisit() {
    const sessionId = getSessionId();
    const urlParams = getUrlParams();
    const startTime = Date.now();

    const visitData = {
      session_id: sessionId,
      page_name: getPageName(),
      page_url: window.location.href,
      referrer: document.referrer || null,
      ...urlParams
    };

    // Send initial visit log
    fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(visitData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.visitor_id) {
        sessionStorage.setItem('pasada_visitor_id', data.visitor_id);
      }
    })
    .catch(error => {
      console.error('Analytics tracking error:', error);
    });

    // Track page duration on unload
    window.addEventListener('beforeunload', function() {
      const duration = Math.round((Date.now() - startTime) / 1000);
      const visitorId = sessionStorage.getItem('pasada_visitor_id');
      
      if (duration > 0 && visitorId) {
        // Use sendBeacon for reliable tracking on page unload
        const durationData = JSON.stringify({
          ...visitData,
          duration_seconds: duration
        });
        
        navigator.sendBeacon(API_ENDPOINT, durationData);
      }
    });
  }

  // Initialize tracking when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackVisit);
  } else {
    trackVisit();
  }

  // Expose global function for form submissions
  window.PASADA = window.PASADA || {};
  window.PASADA.submitLead = function(formData) {
    const visitorId = sessionStorage.getItem('pasada_visitor_id');
    const urlParams = getUrlParams();
    
    return fetch('/api/analytics/submit-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...formData,
        visitor_id: visitorId,
        page_url: window.location.href,
        referrer: document.referrer || null,
        source: urlParams.utm_source || 'website'
      })
    });
  };

})();
