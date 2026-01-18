/**
 * HMW Beyond Borders - Complete JavaScript
 * Professional news platform with all features
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('HMW Beyond Borders Platform Initializing...');
  
  // Initialize all modules
  initClockAndDate();
  initThemeToggle();
  initMobileNavigation();
  initSearchFunctionality();
  initMegaMenu();
  initCookieConsent();
  initWeatherWidget();
  initMobileBottomNav();
  initBackToTop();
  initPollSystem();
  initNewsletterForms();
  initImageLazyLoading();
  initLiveUpdates();
  initSocialSharing();
  initAccessibility();
  initPerformanceOptimization();
  
  // Show welcome message for new visitors
  setTimeout(showWelcomeMessage, 2000);
});

// ===== LIVE CLOCK & DATE =====
function initClockAndDate() {
  const clockElement = document.getElementById('currentTime');
  const dateElement = document.getElementById('currentDate');
  
  if (!clockElement || !dateElement) return;
  
  function updateDateTime() {
    const now = new Date();
    
    // Format time
    const timeOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    };
    clockElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
    
    // Format date
    const dateOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    dateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
  }
  
  // Update immediately and then every second
  updateDateTime();
  setInterval(updateDateTime, 1000);
}

// ===== THEME TOGGLE =====
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  
  if (!themeToggle) return;
  
  // Check saved theme preference
  const savedTheme = localStorage.getItem('hmw-theme') || 'light';
  body.classList.toggle('dark-mode', savedTheme === 'dark');
  updateThemeIcon(themeToggle, savedTheme);
  
  // Toggle theme on button click
  themeToggle.addEventListener('click', function() {
    const isDark = body.classList.toggle('dark-mode');
    const theme = isDark ? 'dark' : 'light';
    
    // Save preference
    localStorage.setItem('hmw-theme', theme);
    updateThemeIcon(this, theme);
    
    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }));
    
    // Show notification
    showNotification(`Switched to ${theme} mode`, 'success');
  });
}

function updateThemeIcon(button, theme) {
  const icon = button.querySelector('i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    button.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  }
}

// ===== MOBILE NAVIGATION =====
function initMobileNavigation() {
  const hamburgerMenu = document.querySelector('.hamburger-menu');
  const navCategories = document.querySelector('.nav-categories');
  const mobileBottomNav = document.querySelector('.mobile-bottom-nav');
  const searchMobileBtn = mobileBottomNav?.querySelector('.search-mobile');
  
  // Toggle mobile menu
  if (hamburgerMenu && navCategories) {
    hamburgerMenu.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      navCategories.classList.toggle('active');
      
      // Animate hamburger icon
      const lines = this.querySelectorAll('.hamburger-line');
      if (!isExpanded) {
        lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        lines[1].style.opacity = '0';
        lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
      } else {
        lines[0].style.transform = '';
        lines[1].style.opacity = '';
        lines[2].style.transform = '';
      }
    });
  }
  
  // Mobile search button
  if (searchMobileBtn) {
    searchMobileBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openMobileSearch();
    });
  }
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(event) {
    if (navCategories?.classList.contains('active') && 
        !navCategories.contains(event.target) && 
        !hamburgerMenu?.contains(event.target)) {
      navCategories.classList.remove('active');
      hamburgerMenu?.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Close on escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && navCategories?.classList.contains('active')) {
      navCategories.classList.remove('active');
      hamburgerMenu?.setAttribute('aria-expanded', 'false');
    }
  });
}

// ===== SEARCH FUNCTIONALITY =====
function initSearchFunctionality() {
  const searchToggle = document.querySelector('.search-toggle');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.querySelector('.search-close');
  const searchInput = document.querySelector('.search-input-full');
  const searchButton = document.querySelector('.search-button-full');
  
  // Open search overlay
  if (searchToggle && searchOverlay) {
    searchToggle.addEventListener('click', function() {
      searchOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
    });
  }
  
  // Close search overlay
  if (searchClose) {
    searchClose.addEventListener('click', closeSearchOverlay);
  }
  
  // Close on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && searchOverlay?.classList.contains('active')) {
      closeSearchOverlay();
    }
  });
  
  // Close on background click
  if (searchOverlay) {
    searchOverlay.addEventListener('click', function(e) {
      if (e.target === this) {
        closeSearchOverlay();
      }
    });
  }
  
  // Search form submission
  if (searchButton && searchInput) {
    searchButton.addEventListener('click', function(e) {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        performSearch(query);
        closeSearchOverlay();
      }
    });
    
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = this.value.trim();
        if (query) {
          performSearch(query);
          closeSearchOverlay();
        }
      }
    });
  }
  
  // Search suggestions
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = this.value.trim();
        if (query.length >= 2) {
          fetchSearchSuggestions(query);
        }
      }, 300);
    });
  }
}

function closeSearchOverlay() {
  const searchOverlay = document.getElementById('searchOverlay');
  if (searchOverlay) {
    searchOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function performSearch(query) {
  console.log('Searching for:', query);
  // In production, this would redirect to search results page or show results
  showNotification(`Searching for: "${query}"`, 'info');
  
  // Simulate API call
  setTimeout(() => {
    // Redirect to search results page
    // window.location.href = `/search?q=${encodeURIComponent(query)}`;
  }, 500);
}

function fetchSearchSuggestions(query) {
  // Simulated suggestions
  const suggestions = [
    `${query} news`,
    `${query} africa`,
    `${query} latest updates`,
    `${query} breaking news`
  ];
  
  // Show suggestions (in production, this would update a dropdown)
  console.log('Suggestions:', suggestions);
}

// ===== MOBILE SEARCH =====
function openMobileSearch() {
  const mobileSearch = document.querySelector('.mobile-search');
  const mobileSearchInput = mobileSearch?.querySelector('.mobile-search-input');
  const mobileSearchClose = mobileSearch?.querySelector('.mobile-search-close');
  
  if (!mobileSearch || !mobileSearchInput) return;
  
  mobileSearch.style.display = 'flex';
  setTimeout(() => mobileSearchInput.focus(), 100);
  
  // Close button
  if (mobileSearchClose) {
    mobileSearchClose.addEventListener('click', closeMobileSearch);
  }
  
  // Close on escape
  document.addEventListener('keydown', function closeOnEscape(e) {
    if (e.key === 'Escape') {
      closeMobileSearch();
      document.removeEventListener('keydown', closeOnEscape);
    }
  });
  
  // Submit on enter
  mobileSearchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      const query = this.value.trim();
      if (query) {
        performSearch(query);
        closeMobileSearch();
      }
    }
  });
}

function closeMobileSearch() {
  const mobileSearch = document.querySelector('.mobile-search');
  if (mobileSearch) {
    mobileSearch.style.display = 'none';
  }
}

// ===== MEGA MENU =====
function initMegaMenu() {
  const moreDropdown = document.querySelector('.category-item.dropdown');
  
  if (!moreDropdown) return;
  
  const megaMenu = moreDropdown.querySelector('.mega-menu');
  const moreLink = moreDropdown.querySelector('.category-link');
  
  // Show mega menu on hover
  moreDropdown.addEventListener('mouseenter', function() {
    megaMenu.style.display = 'block';
  });
  
  moreDropdown.addEventListener('mouseleave', function(e) {
    // Check if mouse is leaving the dropdown area
    if (!this.contains(e.relatedTarget)) {
      megaMenu.style.display = 'none';
    }
  });
  
  // Keep mega menu open when hovering over it
  megaMenu.addEventListener('mouseenter', function() {
    this.style.display = 'block';
  });
  
  megaMenu.addEventListener('mouseleave', function() {
    this.style.display = 'none';
  });
  
  // Click on mobile
  moreLink.addEventListener('click', function(e) {
    if (window.innerWidth <= 992) {
      e.preventDefault();
      megaMenu.style.display = megaMenu.style.display === 'block' ? 'none' : 'block';
    }
  });
}

// ===== COOKIE CONSENT =====
function initCookieConsent() {
  const cookieConsent = document.getElementById('cookieConsent');
  const acceptBtn = document.getElementById('acceptCookies');
  const rejectBtn = document.getElementById('rejectCookies');
  const settingsBtn = document.getElementById('cookieSettings');
  
  // Check if consent already given
  const cookiesAccepted = localStorage.getItem('hmw-cookies-accepted');
  if (cookiesAccepted === 'true') {
    return;
  }
  
  // Show consent banner after delay
  setTimeout(() => {
    if (cookieConsent) {
      cookieConsent.classList.add('show');
    }
  }, 1000);
  
  // Handle accept
  if (acceptBtn) {
    acceptBtn.addEventListener('click', function() {
      localStorage.setItem('hmw-cookies-accepted', 'true');
      localStorage.setItem('hmw-cookies-essential', 'true');
      localStorage.setItem('hmw-cookies-analytics', 'true');
      localStorage.setItem('hmw-cookies-marketing', 'true');
      
      if (cookieConsent) {
        cookieConsent.classList.remove('show');
      }
      
      showNotification('Cookie preferences saved. Thank you!', 'success');
      
      // Initialize analytics (in production)
      initAnalytics();
    });
  }
  
  // Handle reject
  if (rejectBtn) {
    rejectBtn.addEventListener('click', function() {
      localStorage.setItem('hmw-cookies-accepted', 'true');
      localStorage.setItem('hmw-cookies-essential', 'true');
      localStorage.setItem('hmw-cookies-analytics', 'false');
      localStorage.setItem('hmw-cookies-marketing', 'false');
      
      if (cookieConsent) {
        cookieConsent.classList.remove('show');
      }
      
      showNotification('Only essential cookies enabled.', 'info');
    });
  }
  
  // Settings
  if (settingsBtn) {
    settingsBtn.addEventListener('click', function() {
      // In production, open cookie settings modal
      alert('Cookie settings would open here in production version.');
    });
  }
}

function initAnalytics() {
  // Initialize analytics tools (GA, etc.)
  console.log('Analytics initialized');
}

// ===== WEATHER WIDGET =====
function initWeatherWidget() {
  const weatherWidget = document.getElementById('weatherWidget');
  const localSwitches = document.querySelectorAll('.local-switch');
  
  if (!weatherWidget) return;
  
  // Simulated weather data
  const weatherData = {
    nairobi: { temp: '24°C', condition: 'Sunny', icon: 'fa-sun' },
    national: { temp: '22°C', condition: 'Partly Cloudy', icon: 'fa-cloud-sun' },
    global: { temp: '18°C', condition: 'Cloudy', icon: 'fa-cloud' }
  };
  
  function updateWeather(location) {
    const data = weatherData[location] || weatherData.nairobi;
    const icon = weatherWidget.querySelector('i');
    const temp = weatherWidget.querySelector('.weather-temp');
    const locationSpan = weatherWidget.querySelector('.weather-location');
    
    if (icon) icon.className = `fas ${data.icon}`;
    if (temp) temp.textContent = data.temp;
    if (locationSpan) locationSpan.textContent = location === 'nairobi' ? 'Nairobi' : 
                                               location === 'national' ? 'National' : 'Global';
  }
  
  // Listen for location changes
  localSwitches.forEach(button => {
    button.addEventListener('click', function() {
      const location = this.dataset.region;
      
      // Update active state
      localSwitches.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Update weather
      updateWeather(location);
      
      // Update detailed weather widget if exists
      updateDetailedWeather(location);
    });
  });
  
  // Initialize with default location
  updateWeather('nairobi');
}

function updateDetailedWeather(location) {
  const detailedWeather = document.querySelector('.weather-detailed');
  if (!detailedWeather) return;
  
  // Update detailed weather info
  const weatherData = {
    nairobi: { 
      temp: '24°C', 
      condition: 'Sunny',
      wind: '12 km/h',
      humidity: '65%',
      visibility: '10 km'
    },
    national: { 
      temp: '22°C', 
      condition: 'Partly Cloudy',
      wind: '15 km/h',
      humidity: '70%',
      visibility: '8 km'
    },
    global: { 
      temp: '18°C', 
      condition: 'Cloudy',
      wind: '20 km/h',
      humidity: '75%',
      visibility: '5 km'
    }
  };
  
  const data = weatherData[location] || weatherData.nairobi;
  
  // Update elements
  const tempElement = detailedWeather.querySelector('.temp');
  const conditionElement = detailedWeather.querySelector('.condition');
  const windElement = detailedWeather.querySelector('.detail-item:nth-child(1) span');
  const humidityElement = detailedWeather.querySelector('.detail-item:nth-child(2) span');
  const visibilityElement = detailedWeather.querySelector('.detail-item:nth-child(3) span');
  
  if (tempElement) tempElement.textContent = data.temp;
  if (conditionElement) conditionElement.textContent = data.condition;
  if (windElement) windElement.textContent = `Wind: ${data.wind}`;
  if (humidityElement) humidityElement.textContent = `Humidity: ${data.humidity}`;
  if (visibilityElement) visibilityElement.textContent = `Visibility: ${data.visibility}`;
}

// ===== MOBILE BOTTOM NAVIGATION =====
function initMobileBottomNav() {
  const bottomNav = document.querySelector('.mobile-bottom-nav');
  if (!bottomNav) return;
  
  const navItems = bottomNav.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      if (this.classList.contains('active')) return;
      
      // Update active state
      navItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      
      // Handle special actions
      const text = this.querySelector('span').textContent.toLowerCase();
      switch(text) {
        case 'search':
          e.preventDefault();
          openMobileSearch();
          break;
        case 'profile':
          e.preventDefault();
          // In production, open login/profile modal
          showNotification('Login/Profile feature would open here', 'info');
          break;
      }
    });
  });
}

// ===== BACK TO TOP =====
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTop');
  const sidebarBackBtn = document.getElementById('backToTopSidebar');
  
  // Main back to top button
  if (backToTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });
    
    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Sidebar back to top button
  if (sidebarBackBtn) {
    sidebarBackBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

// ===== POLL SYSTEM =====
function initPollSystem() {
  const pollOptions = document.querySelectorAll('.poll-option');
  
  pollOptions.forEach(option => {
    option.addEventListener('click', function() {
      const poll = this.closest('.quick-poll, .live-poll');
      if (!poll) return;
      
      const question = poll.querySelector('.poll-question')?.textContent || 'Poll';
      const answer = this.textContent;
      
      // Disable all options in this poll
      poll.querySelectorAll('.poll-option').forEach(opt => {
        opt.disabled = true;
        opt.style.opacity = '0.5';
        opt.style.cursor = 'not-allowed';
      });
      
      // Highlight selected
      this.style.background = 'var(--primary-color)';
      this.style.color = 'white';
      this.style.borderColor = 'var(--primary-color)';
      
      // Show results if available
      const results = poll.querySelector('.poll-results');
      if (results) {
        setTimeout(() => {
          results.style.display = 'block';
          animatePollResults(results);
        }, 500);
      }
      
      // Record vote (in production, send to server)
      recordPollVote(question, answer);
    });
  });
}

function recordPollVote(question, answer) {
  console.log('Poll vote recorded:', { question, answer });
  
  // Save to localStorage for demo
  let votes = JSON.parse(localStorage.getItem('hmw-poll-votes') || '[]');
  votes.push({ question, answer, timestamp: new Date().toISOString() });
  localStorage.setItem('hmw-poll-votes', JSON.stringify(votes));
  
  showNotification('Thank you for your vote!', 'success');
}

function animatePollResults(resultsContainer) {
  const resultBars = resultsContainer.querySelectorAll('.result-fill');
  resultBars.forEach(bar => {
    const width = bar.style.width;
    bar.style.width = '0';
    setTimeout(() => {
      bar.style.width = width;
    }, 100);
  });
}

// ===== NEWSLETTER FORMS =====
function initNewsletterForms() {
  const newsletterForms = document.querySelectorAll('.newsletter-form, .footer-subscribe, .newsletter-form-mini');
  
  newsletterForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const emailInput = this.querySelector('input[type="email"]');
      if (!emailInput) return;
      
      const email = emailInput.value.trim();
      
      if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
      }
      
      // Get subscription preferences
      const preferences = {
        breakingNews: this.querySelector('input[type="checkbox"]')?.checked || false,
        weeklyDigest: this.querySelectorAll('input[type="checkbox"]')[1]?.checked || false
      };
      
      // Subscribe user
      subscribeNewsletter(email, preferences);
      
      // Reset form
      this.reset();
    });
  });
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function subscribeNewsletter(email, preferences) {
  console.log('Subscribing:', { email, preferences });
  
  // Save to localStorage for demo
  let subscribers = JSON.parse(localStorage.getItem('hmw-newsletter-subscribers') || '[]');
  subscribers.push({ email, preferences, date: new Date().toISOString() });
  localStorage.setItem('hmw-newsletter-subscribers', JSON.stringify(subscribers));
  
  showNotification('Successfully subscribed to newsletter!', 'success');
}

// ===== IMAGE LAZY LOADING =====
function initImageLazyLoading() {
  // Use native lazy loading with fallback
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });
    
    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    images.forEach(img => {
      img.classList.add('loaded');
    });
  }
}

// ===== LIVE UPDATES =====
function initLiveUpdates() {
  // Update visitor count
  updateVisitorCount();
  
  // Update live scores
  updateLiveScores();
  
  // Update stock indices
  updateStockIndices();
  
  // Simulate live updates
  setInterval(simulateLiveUpdate, 30000);
}

function updateVisitorCount() {
  const visitorElement = document.querySelector('#visitorCount');
  if (!visitorElement) return;
  
  // Simulate visitor count
  let count = parseInt(visitorElement.textContent.replace(/,/g, '')) || 1247;
  
  setInterval(() => {
    const change = Math.floor(Math.random() * 20) - 5;
    count = Math.max(1200, count + change);
    visitorElement.textContent = count.toLocaleString();
  }, 60000);
}

function updateLiveScores() {
  const scoresContainer = document.querySelector('.scores-container');
  if (!scoresContainer) return;
  
  const matches = [
    { team1: 'KEN', team2: 'UGA', score: '2-1', status: 'LIVE 75', sport: 'futbol' },
    { team1: 'NGR', team2: 'RSA', score: '85-78', status: 'Q4', sport: 'basketball-ball' },
    { team1: 'EGY', team2: 'MAR', score: '1-0', status: 'HT', sport: 'futbol' }
  ];
  
  let currentIndex = 0;
  
  setInterval(() => {
    const match = matches[currentIndex % matches.length];
    scoresContainer.innerHTML = `
      <div class="sport-match ${match.status.includes('LIVE') ? 'active' : ''}">
        <span class="sport-icon"><i class="fas fa-${match.sport}"></i></span>
        <span class="team">${match.team1}</span>
        <span class="score">${match.score}</span>
        <span class="team">${match.team2}</span>
        <span class="match-status ${match.status.includes('LIVE') ? 'live' : ''}">${match.status}</span>
      </div>
    `;
    currentIndex++;
  }, 10000);
}

function updateStockIndices() {
  const indices = document.querySelectorAll('.index-item');
  
  setInterval(() => {
    indices.forEach(item => {
      const valueElement = item.querySelector('.index-value');
      const changeElement = item.querySelector('.index-change');
      
      if (valueElement && changeElement) {
        let value = parseFloat(valueElement.textContent.replace(/,/g, ''));
        const change = (Math.random() - 0.5) * 2;
        
        value = value * (1 + change / 100);
        
        valueElement.textContent = value.toFixed(2);
        changeElement.textContent = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
        changeElement.className = `index-change ${change > 0 ? 'positive' : 'negative'}`;
      }
    });
  }, 30000);
}

function simulateLiveUpdate() {
  const liveFeed = document.querySelector('.live-feed');
  if (!liveFeed) return;
  
  const updates = [
    'Breaking: New trade agreement announced between African nations',
    'Live: Presidential press conference underway in Nairobi',
    'Update: Market closing figures released',
    'Alert: Weather warning issued for coastal regions',
    'Sports: Major tournament results just in',
    'Tech: New startup funding round announced'
  ];
  
  const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
  addLiveUpdate(randomUpdate);
}

function addLiveUpdate(text) {
  const liveFeed = document.querySelector('.live-feed');
  if (!liveFeed) return;
  
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const updateElement = document.createElement('div');
  updateElement.className = 'update-item';
  updateElement.innerHTML = `
    <span class="update-time">${timeString}</span>
    <span class="update-text">${text}</span>
  `;
  
  liveFeed.prepend(updateElement);
  
  // Keep only last 5 updates
  const updates = liveFeed.querySelectorAll('.update-item');
  if (updates.length > 5) {
    updates[updates.length - 1].remove();
  }
}

// ===== SOCIAL SHARING =====
function initSocialSharing() {
  const shareButtons = document.querySelectorAll('.hero-action[aria-label*="Share"], .share-btn');
  
  shareButtons.forEach(button => {
    button.addEventListener('click', function() {
      const article = this.closest('article');
      const title = article?.querySelector('h1, h2, h3, .hero-title, .news-title')?.textContent || document.title;
      const url = window.location.href;
      const text = article?.querySelector('.excerpt, .hero-excerpt, .news-excerpt')?.textContent || '';
      
      // Open share dialog
      if (navigator.share) {
        navigator.share({
          title: title,
          text: text,
          url: url
        }).catch(console.error);
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`${title}\n${url}`).then(() => {
          showNotification('Link copied to clipboard!', 'success');
        });
      }
    });
  });
}

// ===== ACCESSIBILITY =====
function initAccessibility() {
  // Skip to main content
  const skipLink = document.querySelector('.skip-to-main');
  if (skipLink) {
    skipLink.addEventListener('click', function(e) {
      e.preventDefault();
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus();
      }
    });
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    // Ctrl + 1 to skip to main content
    if (e.ctrlKey && e.key === '1') {
      e.preventDefault();
      skipLink?.focus();
    }
  });
  
  // Focus styles for keyboard users
  let isUsingKeyboard = false;
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      isUsingKeyboard = true;
      document.body.classList.add('keyboard-navigation');
    }
  });
  
  document.addEventListener('mousedown', function() {
    isUsingKeyboard = false;
    document.body.classList.remove('keyboard-navigation');
  });
  
  // ARIA enhancements
  enhanceARIA();
}

function enhanceARIA() {
  // Add aria-labels to icons
  document.querySelectorAll('i[class*="fa-"]').forEach(icon => {
    if (!icon.hasAttribute('aria-label') && !icon.closest('button, a')) {
      const parent = icon.parentElement;
      if (parent.tagName !== 'BUTTON' && parent.tagName !== 'A') {
        // Try to infer label from context
        const label = inferAriaLabel(icon);
        if (label) {
          icon.setAttribute('aria-label', label);
        }
      }
    }
  });
}

function inferAriaLabel(icon) {
  const classes = icon.className;
  if (classes.includes('fa-search')) return 'Search';
  if (classes.includes('fa-bell')) return 'Notifications';
  if (classes.includes('fa-share-alt')) return 'Share';
  if (classes.includes('fa-bookmark')) return 'Bookmark';
  if (classes.includes('fa-play')) return 'Play';
  if (classes.includes('fa-user')) return 'User';
  if (classes.includes('fa-moon')) return 'Dark mode';
  if (classes.includes('fa-sun')) return 'Light mode';
  return null;
}

// ===== PERFORMANCE OPTIMIZATION =====
function initPerformanceOptimization() {
  // Debounce scroll events
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Handle scroll-based operations
    }, 100);
  }, { passive: true });
  
  // Preload critical resources
  preloadResources();
  
  // Initialize service worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').then(
        function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        },
        function(err) {
          console.log('ServiceWorker registration failed: ', err);
        }
      );
    });
  }
}

function preloadResources() {
  // Preload critical images
  const criticalImages = [
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => {
    notification.remove();
  });
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${getNotificationIcon(type)}"></i>
    <span>${message}</span>
    <button class="notification-close" aria-label="Close notification">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
  
  // Close button
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.remove();
  });
}

function getNotificationIcon(type) {
  switch(type) {
    case 'success': return 'check-circle';
    case 'error': return 'exclamation-circle';
    case 'warning': return 'exclamation-triangle';
    default: return 'info-circle';
  }
}

// ===== WELCOME MESSAGE =====
function showWelcomeMessage() {
  if (!localStorage.getItem('hmw-welcome-shown')) {
    setTimeout(() => {
      showNotification('Welcome to HMW Beyond Borders! Customize your experience in settings.', 'info');
      localStorage.setItem('hmw-welcome-shown', 'true');
    }, 1000);
  }
}

// ===== ERROR HANDLING =====
window.addEventListener('error', function(event) {
  console.error('JavaScript Error:', event.error);
  // In production, send to error tracking service
});

window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled Promise Rejection:', event.reason);
});

// ===== OFFLINE DETECTION =====
window.addEventListener('online', function() {
  showNotification('You are back online. Syncing updates...', 'success');
  // Refresh data
  initLiveUpdates();
});

window.addEventListener('offline', function() {
  showNotification('You are offline. Some features may be limited.', 'warning');
});

// ===== EXPORT FUNCTIONS FOR GLOBAL USE =====
window.HMWNews = {
  showNotification,
  performSearch,
  subscribeNewsletter,
  recordPollVote
};

console.log('HMW Beyond Borders Platform Initialized Successfully');