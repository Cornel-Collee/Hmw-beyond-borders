// ===== UPDATED GLOBAL VARIABLES =====
const DOM = {
  body: document.body,
  html: document.documentElement,
  
  // Cookie Consent
  cookieConsent: document.getElementById('cookieConsent'),
  acceptCookies: document.getElementById('acceptCookies'),
  rejectCookies: document.getElementById('rejectCookies'),
  cookieSettings: document.getElementById('cookieSettings'),
  
  // Theme Toggle
  themeToggle: document.getElementById('themeToggle'),
  
  // Navigation
  hamburgerMenu: document.querySelector('.hamburger-menu'),
  navCategories: document.querySelector('.nav-categories'),
  moreCategories: document.getElementById('moreCategories'),
  megaMenu: document.getElementById('megaMenu'),
  searchToggle: document.querySelector('.search-toggle'),
  searchOverlay: document.getElementById('searchOverlay'),
  searchClose: document.querySelector('.search-close'),
  
  // Mobile Elements
  mobileSearch: document.querySelector('.mobile-search'),
  mobileSearchClose: document.querySelector('.mobile-search-close'),
  mobileSearchInput: document.querySelector('.mobile-search-input'),
  
  // Breaking News Ticker
  breakingNewsTicker: document.querySelector('.breaking-news-ticker'),
  
  // Live Elements
  liveClock: document.getElementById('liveClock'),
  currentDate: document.getElementById('currentDate'),
  liveFeed: document.getElementById('liveFeed'),
  pauseLive: document.getElementById('pauseLive'),
  
  // Back to Top Buttons
  backToTop: document.getElementById('backToTop'),
  backToTopSidebar: document.getElementById('backToTopSidebar'),
  backToTopFooter: document.getElementById('backToTopFooter'),
  
  // Interactive Elements
  pollOptions: document.querySelectorAll('.poll-option'),
  localSwitches: document.querySelectorAll('.local-switch'),
  newsletterForms: document.querySelectorAll('.newsletter-form'),
  
  // Notification
  notificationToast: document.getElementById('notificationToast'),
  
  // Loading
  loadingIndicator: document.getElementById('loadingIndicator'),
  
  // Reading Progress
  progressFill: document.querySelector('.progress-fill'),
  
  // Weather
  weatherWidget: document.getElementById('weatherWidget'),
  refreshWeather: document.querySelector('.btn-refresh-weather'),
  
  // Live Chat
  floatingActions: document.querySelectorAll('.floating-action'),
  
  // Main Navigation for mobile fixes
  mainNavigation: document.querySelector('.main-navigation'),
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
  // Debounce function for performance
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function for scroll events
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Format date
  formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  },

  // Format time
  formatTime(date) {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  },

  // Get cookie
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  },

  // Set cookie
  setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`;
  },

  // Show notification
  showNotification(message, type = 'info', duration = 5000) {
    const toast = DOM.notificationToast;
    if (!toast) return;
    
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('i');
    
    // Set message and icon based on type
    toastMessage.textContent = message;
    
    switch(type) {
      case 'success':
        toastIcon.className = 'fas fa-check-circle';
        toastIcon.style.color = '#333333';
        break;
      case 'error':
        toastIcon.className = 'fas fa-exclamation-circle';
        toastIcon.style.color = '#222222';
        break;
      case 'warning':
        toastIcon.className = 'fas fa-exclamation-triangle';
        toastIcon.style.color = '#444444';
        break;
      default:
        toastIcon.className = 'fas fa-info-circle';
        toastIcon.style.color = '#000000';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Auto hide
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  },

  // Smooth scroll to element
  smoothScrollTo(element, duration = 500) {
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = Utils.easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    requestAnimationFrame(animation);
  },

  // Easing function
  easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  },

  // Check if element is in viewport
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Add ripple effect to buttons
  addRippleEffect(button) {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.7);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        width: ${size}px;
        height: ${size}px;
        top: ${y}px;
        left: ${x}px;
        pointer-events: none;
      `;
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  },

  // Load more articles
  loadMoreArticles() {
    const loadMoreBtn = document.querySelector('.btn-load-more');
    if (!loadMoreBtn) return;
    
    loadMoreBtn.addEventListener('click', async function() {
      // Show loading indicator
      loadMoreBtn.style.display = 'none';
      if (DOM.loadingIndicator) {
        DOM.loadingIndicator.style.display = 'flex';
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Hide loading indicator
      if (DOM.loadingIndicator) {
        DOM.loadingIndicator.style.display = 'none';
      }
      
      // Show notification
      Utils.showNotification('More articles loaded successfully!', 'success');
      
      // In a real app, you would append new articles here
    });
  },

  // Initialize tooltips
  initTooltips() {
    const elements = document.querySelectorAll('[data-tooltip]');
    elements.forEach(el => {
      el.addEventListener('mouseenter', function(e) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = this.dataset.tooltip;
        document.body.appendChild(tooltip);
        
        const rect = this.getBoundingClientRect();
        tooltip.style.cssText = `
          position: fixed;
          background: var(--dark-surface);
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 10000;
          white-space: nowrap;
          pointer-events: none;
          top: ${rect.top - 40}px;
          left: ${rect.left + rect.width / 2}px;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.2s;
        `;
        
        setTimeout(() => tooltip.style.opacity = '1', 10);
        
        this.addEventListener('mouseleave', () => tooltip.remove(), { once: true });
      });
    });
  },
};

// ===== NAVIGATION SIZE MANAGEMENT =====
const NavSizeManager = {
  init() {
    // Fix navigation categories size on mobile
    this.fixNavCategoriesSize();
    
    // Adjust on resize
    window.addEventListener('resize', Utils.debounce(() => {
      this.fixNavCategoriesSize();
      this.fixHamburgerVisibility();
    }, 250));
    
    // Initial fix
    this.fixHamburgerVisibility();
  },
  
  fixNavCategoriesSize() {
    const navCategories = document.querySelector('.nav-categories');
    if (!navCategories) return;
    
    const isMobile = window.innerWidth <= 767;
    const categoryItems = navCategories.querySelectorAll('.category-item');
    
    if (isMobile) {
      // On mobile: compact mode
      categoryItems.forEach(item => {
        const icon = item.querySelector('.category-icon');
        const arrow = item.querySelector('.category-arrow');
        
        if (icon) {
          icon.style.width = '32px';
          icon.style.height = '32px';
          icon.style.fontSize = '0.9rem';
        }
        
        if (arrow) {
          arrow.style.display = 'none';
        }
        
        // Reduce padding
        const link = item.querySelector('.category-link');
        if (link) {
          link.style.padding = 'var(--space-sm) var(--space-md)';
        }
      });
      
      // Limit max height for mobile
      const viewportHeight = window.innerHeight;
      navCategories.style.maxHeight = `${viewportHeight - 120}px`;
    } else {
      // On desktop: normal mode
      categoryItems.forEach(item => {
        const icon = item.querySelector('.category-icon');
        const arrow = item.querySelector('.category-arrow');
        
        if (icon) {
          icon.style.width = '';
          icon.style.height = '';
          icon.style.fontSize = '';
        }
        
        if (arrow) {
          arrow.style.display = '';
        }
        
        const link = item.querySelector('.category-link');
        if (link) {
          link.style.padding = '';
        }
      });
      
      navCategories.style.maxHeight = '';
    }
  },
  
  fixHamburgerVisibility() {
    const hamburger = document.querySelector('.hamburger-menu');
    if (!hamburger) return;
    
    const isMobile = window.innerWidth <= 767;
    
    if (isMobile) {
      // Ensure hamburger is visible on mobile
      hamburger.style.display = 'flex';
      hamburger.style.opacity = '1';
      hamburger.style.visibility = 'visible';
      
      // Fix positioning
      const navActions = document.querySelector('.nav-actions');
      if (navActions) {
        navActions.style.display = 'flex';
        navActions.style.alignItems = 'center';
        navActions.style.gap = 'var(--space-xs)';
      }
    } else {
      hamburger.style.display = 'none';
    }
  }
};

// ===== SIDEBAR VISIBILITY MANAGER =====
const SidebarManager = {
  init() {
    this.ensureSidebarVisibility();
    
    window.addEventListener('resize', Utils.debounce(() => {
      this.ensureSidebarVisibility();
    }, 250));
  },
  
  ensureSidebarVisibility() {
    const sidebarWidgets = document.querySelectorAll('.right-sidebar .sidebar-widget');
    
    sidebarWidgets.forEach((widget, index) => {
      // Ensure all widgets are visible
      widget.style.display = 'block';
      widget.style.opacity = '1';
      widget.style.visibility = 'visible';
      widget.style.height = 'auto';
      widget.style.overflow = 'visible';
      
      // Add sequential animation for better UX
      widget.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Fix live feed scroll
    const liveFeed = document.getElementById('liveFeed');
    if (liveFeed) {
      liveFeed.style.maxHeight = '200px';
      liveFeed.style.overflowY = 'auto';
    }
  }
};

// ===== FOOTER ALIGNMENT MANAGER =====
const FooterManager = {
  init() {
    this.alignFooterSections();
    
    window.addEventListener('resize', Utils.debounce(() => {
      this.alignFooterSections();
    }, 250));
  },
  
  alignFooterSections() {
    const footerSections = document.querySelectorAll('.footer-brand, .footer-links, .footer-newsletter');
    const isMobile = window.innerWidth <= 767;
    
    footerSections.forEach(section => {
      if (isMobile) {
        // Mobile: center align
        section.style.textAlign = 'center';
        section.style.margin = '0 auto';
        section.style.maxWidth = '100%';
      } else {
        // Desktop: proper alignment
        if (section.classList.contains('footer-brand')) {
          section.style.textAlign = 'left';
        } else if (section.classList.contains('footer-newsletter')) {
          section.style.textAlign = 'left';
        } else {
          section.style.textAlign = 'left';
        }
      }
    });
    
    // Fix newsletter form alignment
    const newsletterForm = document.querySelector('.footer-subscribe .input-group');
    if (newsletterForm) {
      if (isMobile) {
        newsletterForm.style.flexDirection = 'column';
        newsletterForm.style.alignItems = 'center';
      } else {
        newsletterForm.style.flexDirection = 'row';
        newsletterForm.style.alignItems = 'flex-start';
      }
    }
    
    // Fix trust badges alignment
    const trustBadges = document.querySelector('.trust-badges');
    if (trustBadges) {
      trustBadges.style.justifyContent = isMobile ? 'center' : 'flex-start';
    }
    
    // Fix social icons alignment
    const socialIcons = document.querySelector('.social-icons');
    if (socialIcons) {
      socialIcons.style.justifyContent = isMobile ? 'center' : 'flex-start';
    }
  }
};

// ===== HAMBURGER MENU FIXES =====
const HamburgerManager = {
  init() {
    this.fixHamburgerDisplay();
    
    // Re-check on resize
    window.addEventListener('resize', Utils.debounce(() => {
      this.fixHamburgerDisplay();
    }, 250));
    
    // Fix hamburger animation
    this.fixHamburgerAnimation();
  },
  
  fixHamburgerDisplay() {
    const hamburger = document.querySelector('.hamburger-menu');
    if (!hamburger) return;
    
    const isMobile = window.innerWidth <= 767;
    
    if (isMobile) {
      // Ensure hamburger is visible on mobile
      hamburger.style.display = 'flex';
      hamburger.style.opacity = '1';
      hamburger.style.visibility = 'visible';
      hamburger.style.position = 'relative';
      hamburger.style.zIndex = '1001';
      
      // Ensure it's above other elements
      hamburger.style.transform = 'translateZ(0)';
    } else {
      hamburger.style.display = 'none';
    }
  },
  
  fixHamburgerAnimation() {
    const hamburger = document.querySelector('.hamburger-menu');
    if (!hamburger) return;
    
    hamburger.addEventListener('click', function() {
      const lines = this.querySelectorAll('.hamburger-line');
      
      lines.forEach((line, index) => {
        line.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      });
      
      // Prevent animation conflicts
      this.style.transition = 'background 0.3s ease';
    });
  }
};

// ===== THEME MANAGEMENT =====
const ThemeManager = {
  // Initialize theme
  init() {
    const savedTheme = Utils.getCookie('theme') || 'light';
    ThemeManager.setTheme(savedTheme);
    
    // Theme toggle button event
    if (DOM.themeToggle) {
      DOM.themeToggle.addEventListener('click', () => {
        const currentTheme = DOM.body.classList.contains('dark-mode') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        ThemeManager.setTheme(newTheme);
        Utils.setCookie('theme', newTheme, 365);
        Utils.showNotification(`Switched to ${newTheme} mode`, 'success');
      });
    }
  },

  // Set theme
  setTheme(theme) {
    if (theme === 'dark') {
      DOM.body.classList.add('dark-mode');
      if (DOM.themeToggle) {
        DOM.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        DOM.themeToggle.setAttribute('aria-label', 'Switch to light mode');
      }
    } else {
      DOM.body.classList.remove('dark-mode');
      if (DOM.themeToggle) {
        DOM.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        DOM.themeToggle.setAttribute('aria-label', 'Switch to dark mode');
      }
    }
  }
};

// ===== COOKIE CONSENT =====
const CookieManager = {
  init() {
    // Check if user has already made a choice
    const cookieChoice = Utils.getCookie('cookie_consent');
    
    if (!cookieChoice && DOM.cookieConsent) {
      // Show cookie consent after 2 seconds
      setTimeout(() => {
        DOM.cookieConsent.classList.add('show');
      }, 2000);
    }

    // Accept cookies
    if (DOM.acceptCookies) {
      DOM.acceptCookies.addEventListener('click', () => {
        CookieManager.handleConsent('accepted');
        Utils.showNotification('Cookie preferences saved', 'success');
      });
    }

    // Reject non-essential cookies
    if (DOM.rejectCookies) {
      DOM.rejectCookies.addEventListener('click', () => {
        CookieManager.handleConsent('rejected');
        Utils.showNotification('Non-essential cookies rejected', 'info');
      });
    }

    // Cookie settings
    if (DOM.cookieSettings) {
      DOM.cookieSettings.addEventListener('click', () => {
        CookieManager.showSettings();
      });
    }
  },

  handleConsent(choice) {
    Utils.setCookie('cookie_consent', choice, 365);
    if (DOM.cookieConsent) {
      DOM.cookieConsent.classList.remove('show');
    }
    
    // In a real app, you would initialize analytics, ads, etc. based on choice
    if (choice === 'accepted') {
      CookieManager.initializeAnalytics();
    }
  },

  showSettings() {
    // In a real app, you would show detailed cookie settings modal
    Utils.showNotification('Cookie settings would open here', 'info');
  },

  initializeAnalytics() {
    // Initialize analytics scripts here
    console.log('Analytics initialized (for demo purposes)');
  }
};

// ===== NAVIGATION MANAGEMENT =====
const NavigationManager = {
  init() {
    // Mobile hamburger menu
    if (DOM.hamburgerMenu) {
      DOM.hamburgerMenu.addEventListener('click', () => {
        const isExpanded = DOM.hamburgerMenu.getAttribute('aria-expanded') === 'true';
        DOM.hamburgerMenu.setAttribute('aria-expanded', !isExpanded);
        DOM.hamburgerMenu.classList.toggle('active');
        if (DOM.navCategories) {
          DOM.navCategories.classList.toggle('active');
        }
        
        // Toggle body scroll
        DOM.body.style.overflow = DOM.navCategories && DOM.navCategories.classList.contains('active') ? 'hidden' : '';
      });
    }

    // Mega menu toggle
    if (DOM.moreCategories && DOM.megaMenu) {
      DOM.moreCategories.addEventListener('click', (e) => {
        e.preventDefault();
        DOM.megaMenu.classList.toggle('active');
      });

      // Close mega menu when clicking outside
      document.addEventListener('click', (e) => {
        if (DOM.moreCategories && DOM.megaMenu && 
            !DOM.moreCategories.contains(e.target) && !DOM.megaMenu.contains(e.target)) {
          DOM.megaMenu.classList.remove('active');
        }
      });
    }

    // Search functionality
    if (DOM.searchToggle) {
      DOM.searchToggle.addEventListener('click', () => NavigationManager.openSearch());
    }
    
    if (DOM.searchClose) {
      DOM.searchClose.addEventListener('click', () => NavigationManager.closeSearch());
    }
    
    // Mobile search
    if (DOM.mobileSearchClose) {
      DOM.mobileSearchClose.addEventListener('click', () => {
        if (DOM.mobileSearchInput) {
          DOM.mobileSearchInput.value = '';
          DOM.mobileSearchInput.blur();
        }
      });
    }

    // Close search on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') NavigationManager.closeSearch();
    });

    // Mobile bottom nav active state
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', function(e) {
        if (this.classList.contains('search-mobile')) {
          e.preventDefault();
          if (DOM.mobileSearchInput) {
            DOM.mobileSearchInput.focus();
          }
        } else {
          navItems.forEach(i => i.classList.remove('active'));
          this.classList.add('active');
        }
      });
    });

    // Add ripple effects to buttons
    document.querySelectorAll('.btn, .nav-action, .hero-action, .poll-option').forEach(btn => {
      Utils.addRippleEffect(btn);
    });
  },

  openSearch() {
    if (DOM.searchOverlay) {
      DOM.searchOverlay.classList.add('active');
      const searchInput = DOM.searchOverlay.querySelector('input');
      if (searchInput) searchInput.focus();
      DOM.body.style.overflow = 'hidden';
    }
  },

  closeSearch() {
    if (DOM.searchOverlay) {
      DOM.searchOverlay.classList.remove('active');
      DOM.body.style.overflow = '';
    }
  }
};

// ===== LIVE UPDATES =====
const LiveManager = {
  isPaused: false,
  liveUpdates: [],
  updateInterval: null,

  init() {
    // Initialize live clock
    LiveManager.updateClock();
    setInterval(LiveManager.updateClock, 1000);

    // Initialize live updates
    LiveManager.startLiveUpdates();

    // Pause/Resume live updates
    if (DOM.pauseLive) {
      DOM.pauseLive.addEventListener('click', () => {
        LiveManager.isPaused = !LiveManager.isPaused;
        DOM.pauseLive.innerHTML = LiveManager.isPaused ? 
          '<i class="fas fa-play"></i> Resume Updates' : 
          '<i class="fas fa-pause"></i> Pause Updates';
        
        if (LiveManager.isPaused) {
          LiveManager.stopLiveUpdates();
        } else {
          LiveManager.startLiveUpdates();
        }
      });
    }

    // Simulate weather refresh
    if (DOM.refreshWeather) {
      DOM.refreshWeather.addEventListener('click', () => {
        DOM.refreshWeather.style.animation = 'spin 1s linear';
        setTimeout(() => {
          DOM.refreshWeather.style.animation = '';
          Utils.showNotification('Weather updated', 'success');
        }, 1000);
      });
    }
  },

  updateClock() {
    const now = new Date();
    if (DOM.liveClock) {
      DOM.liveClock.innerHTML = `
        <i class="far fa-clock"></i>
        <span>${Utils.formatTime(now)}</span>
      `;
    }
    if (DOM.currentDate) {
      DOM.currentDate.textContent = Utils.formatDate(now);
    }
  },

  startLiveUpdates() {
    if (this.updateInterval) clearInterval(this.updateInterval);
    
    this.updateInterval = setInterval(() => {
      if (!this.isPaused && DOM.liveFeed) {
        LiveManager.addLiveUpdate();
      }
    }, 15000); // Every 15 seconds
  },

  stopLiveUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  },

  addLiveUpdate() {
    const updates = [
      'Breaking: New economic data shows strong growth in African markets',
      'Sports: Major football transfer confirmed between African clubs',
      'Technology: Local startup secures major funding round',
      'Politics: Regional leaders meet for peace talks',
      'Health: New vaccine distribution begins across continent',
      'Entertainment: African film receives international award',
      'Business: Major trade deal signed with Asian partners',
      'Environment: New conservation initiative launched'
    ];
    
    const badges = ['ECONOMY', 'SPORTS', 'TECH', 'POLITICS', 'HEALTH', 'ENTERTAINMENT', 'BUSINESS', 'ENVIRONMENT'];
    
    const randomIndex = Math.floor(Math.random() * updates.length);
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const updateItem = document.createElement('div');
    updateItem.className = 'update-item';
    updateItem.innerHTML = `
      <span class="update-time">${time}</span>
      <span class="update-text">${updates[randomIndex]}</span>
      <span class="update-badge">${badges[randomIndex]}</span>
    `;
    
    // Add animation
    updateItem.style.animation = 'slideInLeft 0.3s var(--ease-out-smooth)';
    
    // Add to top of feed
    DOM.liveFeed.insertBefore(updateItem, DOM.liveFeed.firstChild);
    
    // Remove oldest if more than 5 items
    if (DOM.liveFeed.children.length > 5) {
      DOM.liveFeed.removeChild(DOM.liveFeed.lastChild);
    }
    
    // Show notification for important updates
    if (randomIndex < 3) { // First 3 updates are considered "important"
      Utils.showNotification(updates[randomIndex], 'info');
    }
  }
};

// ===== SCROLL MANAGEMENT =====
const ScrollManager = {
  init() {
    // Show/hide back to top button
    window.addEventListener('scroll', Utils.throttle(ScrollManager.handleScroll, 100));
    
    // Back to top buttons
    [DOM.backToTop, DOM.backToTopSidebar, DOM.backToTopFooter].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
    });

    // Update reading progress
    window.addEventListener('scroll', Utils.throttle(ScrollManager.updateReadingProgress, 100));

    // Lazy load images
    ScrollManager.initLazyLoading();
  },

  handleScroll() {
    const scrollTop = window.pageYOffset || DOM.html.scrollTop;
    
    // Show/hide back to top button
    if (scrollTop > 500) {
      if (DOM.backToTop) {
        DOM.backToTop.classList.add('visible');
      }
    } else {
      if (DOM.backToTop) {
        DOM.backToTop.classList.remove('visible');
      }
    }
    
    // Adjust mobile search position based on breaking news
    if (DOM.breakingNewsTicker) {
      const breakingHeight = DOM.breakingNewsTicker.offsetHeight;
      const hasBreakingNews = breakingHeight > 0;
      
      if (DOM.mobileSearch) {
        DOM.mobileSearch.style.top = hasBreakingNews ? `${breakingHeight}px` : '0';
        DOM.mobileSearch.classList.toggle('no-breaking', !hasBreakingNews);
      }
      
      if (DOM.mainNavigation) {
        DOM.mainNavigation.style.top = hasBreakingNews ? 
          `calc(56px + ${breakingHeight}px)` : '56px';
        DOM.mainNavigation.classList.toggle('no-breaking', !hasBreakingNews);
      }
    }
  },

  updateReadingProgress() {
    if (!DOM.progressFill) return;
    
    const windowHeight = window.innerHeight;
    const documentHeight = DOM.body.scrollHeight;
    const scrollTop = window.pageYOffset || DOM.html.scrollTop;
    const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
    
    DOM.progressFill.style.width = `${scrollPercent}%`;
  },

  initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
};

// ===== INTERACTIVE ELEMENTS =====
const InteractiveManager = {
  init() {
    // Poll voting
    if (DOM.pollOptions) {
      DOM.pollOptions.forEach(option => {
        option.addEventListener('click', function() {
          // Remove active class from all options in this poll
          const poll = this.closest('.poll-options, .live-poll');
          if (poll) {
            poll.querySelectorAll('.poll-option').forEach(opt => {
              opt.classList.remove('active');
            });
          }
          
          // Add active class to clicked option
          this.classList.add('active');
          
          // Update poll results if available
          const results = this.closest('.poll-content')?.querySelector('.poll-results');
          if (results) {
            InteractiveManager.updatePollResults(results, this.textContent.trim());
          }
          
          // Show notification
          Utils.showNotification('Thank you for voting!', 'success');
        });
      });
    }

    // Local news toggle
    if (DOM.localSwitches) {
      DOM.localSwitches.forEach(switchBtn => {
        switchBtn.addEventListener('click', function() {
          const region = this.dataset.region;
          
          // Remove active class from all switches in this group
          const toggleButtons = this.closest('.toggle-buttons');
          if (toggleButtons) {
            toggleButtons.querySelectorAll('.local-switch').forEach(btn => {
              btn.classList.remove('active');
            });
          }
          
          // Add active class to clicked switch
          this.classList.add('active');
          
          // Update content based on region (simulated)
          InteractiveManager.updateLocalNews(region);
        });
      });
    }

    // Newsletter subscription
    if (DOM.newsletterForms) {
      DOM.newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          const email = this.querySelector('input[type="email"]').value;
          
          // Simulate subscription
          setTimeout(() => {
            Utils.showNotification('Successfully subscribed to newsletter!', 'success');
            this.reset();
          }, 500);
        });
      });
    }

    // Save article buttons
    document.querySelectorAll('.btn-save-article').forEach(btn => {
      btn.addEventListener('click', function() {
        const isSaved = this.classList.contains('saved');
        
        if (isSaved) {
          this.classList.remove('saved');
          this.innerHTML = '<i class="far fa-bookmark"></i>';
          Utils.showNotification('Article removed from saved', 'info');
        } else {
          this.classList.add('saved');
          this.innerHTML = '<i class="fas fa-bookmark"></i>';
          Utils.showNotification('Article saved for later', 'success');
        }
      });
    });

    // Floating actions
    if (DOM.floatingActions) {
      DOM.floatingActions.forEach(action => {
        action.addEventListener('click', function() {
          const type = Array.from(this.classList).find(cls => 
            ['chat', 'donate', 'feedback'].includes(cls)
          );
          
          switch(type) {
            case 'chat':
              InteractiveManager.openChat();
              break;
            case 'donate':
              InteractiveManager.openDonation();
              break;
            case 'feedback':
              InteractiveManager.openFeedback();
              break;
          }
        });
      });
    }

    // Tooltips
    Utils.initTooltips();
  },

  updatePollResults(resultsContainer, selectedOption) {
    // In a real app, you would send this to your backend
    // For demo, we'll just simulate updating the results
    const resultItems = resultsContainer.querySelectorAll('.result-item');
    
    resultItems.forEach(item => {
      const label = item.querySelector('.result-label').textContent.trim();
      const fill = item.querySelector('.result-fill');
      const percent = item.querySelector('.result-percent');
      
      if (label === selectedOption) {
        // Increase percentage for selected option
        const currentWidth = parseInt(fill.style.width) || 0;
        const newWidth = Math.min(currentWidth + 10, 100);
        if (fill) fill.style.width = `${newWidth}%`;
        if (percent) percent.textContent = `${newWidth}%`;
      }
    });
  },

  updateLocalNews(region) {
    // In a real app, you would fetch news for this region
    console.log(`Loading news for ${region} region...`);
    
    // Update contextual bar indicators
    const regionIndicators = {
      nairobi: { temp: '24°C', market: '+1.2%' },
      national: { temp: '22°C', market: '+0.8%' },
      global: { temp: '20°C', market: '-0.3%' }
    };
    
    const indicators = regionIndicators[region];
    if (indicators) {
      // Update weather
      const weatherTemp = document.querySelector('.weather-temp');
      if (weatherTemp) weatherTemp.textContent = indicators.temp;
      
      // Update market indicator
      const marketChange = document.querySelector('.index-change.positive');
      if (marketChange) marketChange.textContent = indicators.market;
    }
  },

  openChat() {
    Utils.showNotification('Live chat would open here', 'info');
  },

  openDonation() {
    Utils.showNotification('Donation modal would open here', 'info');
  },

  openFeedback() {
    Utils.showNotification('Feedback form would open here', 'info');
  }
};

// ===== ANIMATIONS & EFFECTS =====
const AnimationManager = {
  init() {
    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple-animation {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    // Animate elements on scroll
    AnimationManager.initScrollAnimations();

    // Hover effects for cards
    AnimationManager.initHoverEffects();
  },

  initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all animatable elements
    document.querySelectorAll('.news-card, .category-card, .sidebar-widget').forEach(el => {
      observer.observe(el);
    });
  },

  initHoverEffects() {
    // Add tilt effect to cards
    const cards = document.querySelectorAll('.news-card, .category-card');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', function(e) {
        if (window.innerWidth > 767) { // Only on desktop
          const rect = this.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateY = (x - centerX) / 25;
          const rotateX = (centerY - y) / 25;
          
          this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        }
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }
};

// ===== PERFORMANCE OPTIMIZATIONS =====
const PerformanceManager = {
  init() {
    // Preload critical resources
    PerformanceManager.preloadResources();
    
    // Initialize service worker for PWA
    PerformanceManager.registerServiceWorker();
    
    // Optimize images
    PerformanceManager.optimizeImages();
  },

  preloadResources() {
    const links = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
      { rel: 'preload', as: 'style', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css' },
      { rel: 'preload', as: 'style', href: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&family=Montserrat:wght@600;700;800;900&display=swap' }
    ];

    links.forEach(link => {
      const el = document.createElement('link');
      Object.assign(el, link);
      document.head.appendChild(el);
    });
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          registration => {
            console.log('ServiceWorker registration successful');
          },
          error => {
            console.log('ServiceWorker registration failed: ', error);
          }
        );
      });
    }
  },

  optimizeImages() {
    // Convert images to WebP if supported
    const supportsWebP = (() => {
      const canvas = document.createElement('canvas');
      if (canvas.getContext && canvas.getContext('2d')) {
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      }
      return false;
    })();

    if (supportsWebP) {
      document.querySelectorAll('img[data-webp]').forEach(img => {
        img.src = img.dataset.webp;
      });
    }
  }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all managers
  PerformanceManager.init();
  ThemeManager.init();
  CookieManager.init();
  NavigationManager.init();
  LiveManager.init();
  ScrollManager.init();
  InteractiveManager.init();
  AnimationManager.init();
  
  // Initialize new managers for fixes
  NavSizeManager.init();
  SidebarManager.init();
  FooterManager.init();
  HamburgerManager.init();
  
  Utils.loadMoreArticles();
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      NavigationManager.openSearch();
    }
    
    // D for dark mode toggle
    if (e.key === 'd' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      if (DOM.themeToggle) DOM.themeToggle.click();
    }
    
    // / for search focus
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const searchInput = DOM.searchOverlay?.querySelector('input') || DOM.mobileSearchInput;
      if (searchInput) {
        if (DOM.searchOverlay && !DOM.searchOverlay.classList.contains('active')) {
          NavigationManager.openSearch();
        }
        searchInput.focus();
      }
    }
  });

  // Show welcome notification
  setTimeout(() => {
    Utils.showNotification('Welcome to HMW Beyond Borders!', 'info');
  }, 1000);

  console.log('HMW Beyond Borders initialized successfully!');
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
  console.error('Application error:', e.error);
  Utils.showNotification('An error occurred. Please refresh the page.', 'error');
});

// ===== OFFLINE SUPPORT =====
window.addEventListener('online', () => {
  Utils.showNotification('You are back online!', 'success');
});

window.addEventListener('offline', () => {
  Utils.showNotification('You are offline. Some features may be limited.', 'warning');
});

// ===== PWA INSTALL PROMPT =====
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  deferredPrompt = e;
  
  // Show custom install button
  setTimeout(() => {
    Utils.showNotification('Install our app for better experience!', 'info', 10000);
  }, 5000);
});

// ===== ANALYTICS (if cookies accepted) =====
if (Utils.getCookie('cookie_consent') === 'accepted') {
  // Initialize analytics here
  console.log('Analytics would be initialized');
}
