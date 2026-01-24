/* ============================================
   HMW BEYOND BORDERS - CORE JAVASCRIPT MODULE
   Date: 2025-01-24
   Version: 3.0
   Author: Senior JavaScript Developer
   ============================================ */

const HMWApp = (function() {
    'use strict';

    // ============================================
    // 1. CONFIGURATION & STATE MANAGEMENT
    // ============================================
    const config = {
        appName: 'HMW Beyond Borders',
        version: '3.0',
        api: {
            weather: 'https://api.openweathermap.org/data/2.5/weather',
            news: 'https://newsapi.org/v2/everything'
        },
        limits: {
            freeArticles: 3,
            maxImageSize: 5 * 1024 * 1024, // 5MB
            maxImages: 5
        },
        localStorageKeys: {
            theme: 'hmw_theme_preference',
            auth: 'hmw_auth_state',
            freeArticles: 'hmw_free_articles_read',
            pollsVoted: 'hmw_polls_voted'
        },
        classes: {
            active: 'active',
            hidden: 'hidden',
            visible: 'visible',
            expanded: 'expanded',
            selected: 'selected'
        }
    };

    // Application State
    let state = {
        // User State
        user: {
            isAuthenticated: false,
            name: null,
            email: null,
            subscription: null,
            freeArticlesRead: 0
        },
        
        // UI State
        theme: 'light-mode',
        currentCategory: 'all',
        searchQuery: '',
        modalOpen: null,
        notificationCount: 3,
        
        // Content State
        articles: [],
        trendingTopics: [],
        currentPoll: null,
        liveUpdates: [],
        
        // Settings
        autoRefresh: true,
        notifications: true,
        savedArticles: []
    };

    // DOM Cache
    let dom = {};

    // ============================================
    // 2. CORE INITIALIZATION
    // ============================================
    function init() {
        console.log(`🚀 ${config.appName} v${config.version} initializing...`);
        
        cacheDOM();
        loadState();
        bindEvents();
        startLiveUpdates();
        
        console.log('✅ Application initialized successfully');
    }

    function cacheDOM() {
        // Header & Navigation
        dom.header = document.querySelector('.main-navigation');
        dom.navCategories = document.querySelector('.nav-categories');
        dom.categoryLinks = document.querySelectorAll('.category-link');
        dom.categoryMenu = document.querySelector('.category-menu');
        dom.navActions = document.querySelector('.nav-actions');
        dom.hamburgerMenu = document.querySelector('.hamburger-menu');
        
        // Utility Bar
        dom.utilityBar = document.querySelector('.top-utility-bar');
        dom.liveClock = document.querySelector('#liveClock #currentTime');
        dom.currentDate = document.querySelector('#currentDate');
        dom.weatherWidget = document.querySelector('#weatherWidget');
        
        // Content Areas
        dom.mainContent = document.querySelector('.main-content');
        dom.storyGrid = document.querySelector('.story-grid');
        dom.storyCards = document.querySelectorAll('.story-card');
        dom.manualArticlesGrid = document.querySelector('#manualArticlesGrid');
        dom.autoArticlesGrid = document.querySelector('#autoArticlesGrid');
        
        // Modals
        dom.authModal = document.querySelector('#authModal');
        dom.paywallModal = document.querySelector('#paywallModal');
        dom.articleReaderModal = document.querySelector('#articleReaderModal');
        dom.articleSubmissionModal = document.querySelector('#articleSubmissionModal');
        dom.searchOverlay = document.querySelector('#searchOverlay');
        dom.modalCloses = document.querySelectorAll('.modal-close');
        
        // Forms
        dom.loginForm = document.querySelector('#loginForm');
        dom.registerForm = document.querySelector('#registerForm');
        dom.resetForm = document.querySelector('#resetForm');
        dom.articleSubmissionForm = document.querySelector('#articleSubmissionForm');
        dom.searchInput = document.querySelector('.search-input-full');
        dom.mobileSearchInput = document.querySelector('.mobile-search-input');
        
        // Interactive Elements
        dom.themeToggle = document.querySelector('#themeToggle');
        dom.loginTrigger = document.querySelector('#loginTrigger');
        dom.subscribeTrigger = document.querySelector('#subscribeTrigger');
        dom.submitStoryTrigger = document.querySelector('#submitStoryTrigger');
        dom.accountDropdown = document.querySelector('#accountDropdown');
        dom.backToTop = document.querySelector('#backToTop');
        dom.notificationBell = document.querySelector('#notificationBell');
        dom.notificationToast = document.querySelector('#notificationToast');
        
        // Breaking News
        dom.breakingTicker = document.querySelector('.breaking-news-ticker');
        dom.tickerContent = document.querySelector('.ticker-content');
        
        // Polls
        dom.pollOptions = document.querySelectorAll('.poll-option');
        
        // Footer
        dom.footerSubscribe = document.querySelector('.footer-subscribe');
    }

    function loadState() {
        // Load theme preference
        const savedTheme = localStorage.getItem(config.localStorageKeys.theme);
        if (savedTheme) {
            state.theme = savedTheme;
            document.body.className = savedTheme;
            updateThemeIcon(savedTheme);
        }

        // Load authentication state
        const savedAuth = localStorage.getItem(config.localStorageKeys.auth);
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                state.user.isAuthenticated = true;
                state.user.name = authData.name;
                state.user.email = authData.email;
                state.user.subscription = authData.subscription;
                updateAuthUI();
            } catch (e) {
                console.warn('Failed to parse auth state:', e);
            }
        }

        // Load free articles count
        const articlesRead = localStorage.getItem(config.localStorageKeys.freeArticles);
        if (articlesRead) {
            state.user.freeArticlesRead = parseInt(articlesRead);
        }

        // Update notification badge
        updateNotificationBadge();
    }

    function saveState() {
        localStorage.setItem(config.localStorageKeys.theme, state.theme);
        
        if (state.user.isAuthenticated) {
            const authData = {
                name: state.user.name,
                email: state.user.email,
                subscription: state.user.subscription
            };
            localStorage.setItem(config.localStorageKeys.auth, JSON.stringify(authData));
        }
        
        localStorage.setItem(config.localStorageKeys.freeArticles, state.user.freeArticlesRead.toString());
    }

    // ============================================
    // 3. UTILITY FUNCTIONS
    // ============================================
    const utils = {
        // DOM Utilities
        show(element) {
            if (element) {
                element.removeAttribute('hidden');
                element.setAttribute('aria-hidden', 'false');
            }
        },

        hide(element) {
            if (element) {
                element.setAttribute('hidden', '');
                element.setAttribute('aria-hidden', 'true');
            }
        },

        toggle(element, force) {
            if (element) {
                const isHidden = element.hasAttribute('hidden');
                if (force === undefined) {
                    if (isHidden) {
                        this.show(element);
                    } else {
                        this.hide(element);
                    }
                } else {
                    if (force) {
                        this.show(element);
                    } else {
                        this.hide(element);
                    }
                }
            }
        },

        addClass(element, className) {
            if (element) element.classList.add(className);
        },

        removeClass(element, className) {
            if (element) element.classList.remove(className);
        },

        toggleClass(element, className, force) {
            if (element) element.classList.toggle(className, force);
        },

        // Formatting Utilities
        formatTime(date = new Date()) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        },

        formatDate(date = new Date()) {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },

        formatRelativeTime(timestamp) {
            const now = new Date();
            const diff = now - new Date(timestamp);
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (minutes < 1) return 'Just now';
            if (minutes < 60) return `${minutes}m ago`;
            if (hours < 24) return `${hours}h ago`;
            if (days < 7) return `${days}d ago`;
            return this.formatDate(new Date(timestamp));
        },

        // Validation Utilities
        validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },

        validatePassword(password) {
            const minLength = 8;
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            return {
                isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
                strength: {
                    length: password.length >= minLength,
                    upperCase: hasUpperCase,
                    lowerCase: hasLowerCase,
                    numbers: hasNumbers,
                    specialChar: hasSpecialChar
                }
            };
        },

        // Storage Utilities
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

        throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Content Utilities
        truncateText(text, maxLength = 100) {
            if (text.length <= maxLength) return text;
            return text.substr(0, maxLength).trim() + '...';
        },

        sanitizeHTML(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    };

    // ============================================
    // 4. LIVE DATA ENGINE
    // ============================================
    function startLiveUpdates() {
        // Live Clock
        updateClock();
        setInterval(updateClock, 1000);

        // Live Weather
        updateWeather();
        setInterval(updateWeather, 300000); // Every 5 minutes

        // Live Ticker
        setupTicker();
        
        // Live Feed Updates
        if (state.autoRefresh) {
            setInterval(simulateLiveUpdate, 30000); // Every 30 seconds
        }
    }

    function updateClock() {
        const now = new Date();
        if (dom.liveClock) {
            dom.liveClock.textContent = utils.formatTime(now);
        }
        if (dom.currentDate) {
            dom.currentDate.textContent = utils.formatDate(now);
        }
    }

    function updateWeather() {
        // Simulate API call with fallback data
        const weatherData = {
            temp: 24,
            condition: 'Sunny',
            location: 'Nairobi',
            humidity: 65,
            wind: 12,
            icon: 'fas fa-sun'
        };

        if (dom.weatherWidget) {
            const tempSpan = dom.weatherWidget.querySelector('.weather-temp');
            const locationSpan = dom.weatherWidget.querySelector('.weather-location');
            const icon = dom.weatherWidget.querySelector('i');

            if (tempSpan) tempSpan.textContent = `${weatherData.temp}°C`;
            if (locationSpan) locationSpan.textContent = weatherData.location;
            if (icon) icon.className = weatherData.icon;
        }
    }

    function setupTicker() {
        if (!dom.tickerContent) return;

        const tickerItems = dom.tickerContent.querySelectorAll('span:not(.ticker-separator)');
        let currentIndex = 0;
        const totalItems = tickerItems.length;

        function rotateTicker() {
            if (state.breakingTickerPaused) return;

            // Remove active class from all items
            tickerItems.forEach(item => {
                item.style.transform = 'translateX(100%)';
            });

            // Set next item as active
            const nextIndex = (currentIndex + 1) % totalItems;
            tickerItems[nextIndex].style.transform = 'translateX(0)';
            currentIndex = nextIndex;
        }

        // Start rotation
        setInterval(rotateTicker, 5000);

        // Pause on hover
        if (dom.breakingTicker) {
            dom.breakingTicker.addEventListener('mouseenter', () => {
                state.breakingTickerPaused = true;
            });

            dom.breakingTicker.addEventListener('mouseleave', () => {
                state.breakingTickerPaused = false;
            });
        }
    }

    function simulateLiveUpdate() {
        // Simulate new live updates
        const updates = [
            { time: '14:45', text: 'Cultural festival in Senegal breaks attendance records', badge: 'CULTURE' },
            { time: '14:30', text: 'New archaeological discovery in Egypt reveals ancient temple', badge: 'HISTORY' },
            { time: '14:15', text: 'Women leaders summit announces new mentorship program', badge: 'LEADERSHIP' }
        ];

        const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
        addLiveUpdate(randomUpdate);
    }

    function addLiveUpdate(update) {
        // Add to live feed widget
        const liveFeed = document.querySelector('#liveFeed');
        if (liveFeed) {
            const updateElement = document.createElement('div');
            updateElement.className = 'update-item';
            updateElement.innerHTML = `
                <span class="update-time">${update.time}</span>
                <span class="update-text">${update.text}</span>
                <span class="update-badge">${update.badge}</span>
            `;
            liveFeed.prepend(updateElement);

            // Limit to 5 items
            const items = liveFeed.querySelectorAll('.update-item');
            if (items.length > 5) {
                items[items.length - 1].remove();
            }

            // Show notification for important updates
            if (state.notifications && update.badge === 'BREAKING') {
                showToast(update.text, 'breaking');
            }
        }
    }

    // ============================================
    // 5. THEME MANAGEMENT
    // ============================================
    function toggleTheme() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const newTheme = isDarkMode ? 'light-mode' : 'dark-mode';
        
        // Update DOM
        document.body.className = newTheme;
        
        // Update state
        state.theme = newTheme;
        
        // Update icon
        updateThemeIcon(newTheme);
        
        // Save preference
        localStorage.setItem(config.localStorageKeys.theme, newTheme);
        
        // Show feedback
        showToast(`Switched to ${isDarkMode ? 'Light' : 'Dark'} Mode`);
        
        console.log(`🎨 Theme changed to: ${newTheme}`);
    }

    function updateThemeIcon(theme) {
        if (dom.themeToggle) {
            const icon = dom.themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark-mode' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    // ============================================
    // 6. SCROLL MANAGEMENT
    // ============================================
    function setupScrollManagement() {
        let lastScrollTop = 0;
        const headerHeight = dom.header ? dom.header.offsetHeight : 0;
        const shrinkPoint = 50;

        // Header shrink on scroll
        window.addEventListener('scroll', utils.throttle(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Sticky header behavior
            if (dom.header) {
                if (scrollTop > shrinkPoint) {
                    dom.header.classList.add('shrunk');
                } else {
                    dom.header.classList.remove('shrunk');
                }

                // Hide/show on scroll direction
                if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
                    // Scrolling down
                    dom.header.classList.add('hidden-header');
                } else {
                    // Scrolling up
                    dom.header.classList.remove('hidden-header');
                }
            }

            // Back to top button
            if (dom.backToTop) {
                if (scrollTop > 300) {
                    utils.addClass(dom.backToTop, 'visible');
                } else {
                    utils.removeClass(dom.backToTop, 'visible');
                }
            }

            lastScrollTop = scrollTop;
        }, 100));

        // Back to top functionality
        if (dom.backToTop) {
            dom.backToTop.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }

        // Infinite scroll trigger
        const infiniteScrollTrigger = document.querySelector('#infiniteScrollTrigger');
        if (infiniteScrollTrigger) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !state.loadingMore) {
                        loadMoreArticles();
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(infiniteScrollTrigger);
        }
    }

    // ============================================
    // 7. CATEGORY NAVIGATION SYSTEM
    // ============================================
    function setupCategoryNavigation() {
        if (!dom.categoryLinks.length) return;

        // Event delegation for category clicks
        dom.navCategories.addEventListener('click', (e) => {
            const categoryLink = e.target.closest('.category-link');
            if (!categoryLink) return;

            e.preventDefault();
            
            // Get category from data attribute or text
            const category = categoryLink.getAttribute('data-category') || 
                           categoryLink.querySelector('.category-text').textContent.toLowerCase();
            
            // Update active state
            dom.categoryLinks.forEach(link => {
                utils.removeClass(link, 'active');
            });
            utils.addClass(categoryLink, 'active');
            
            // Filter articles
            filterArticlesByCategory(category);
            
            // Update URL hash (for SPA feel)
            window.location.hash = `category=${category}`;
            
            // Update state
            state.currentCategory = category;
            
            console.log(`📂 Category selected: ${category}`);
        });

        // Horizontal scroll for categories (desktop)
        if (dom.categoryMenu && window.innerWidth > 768) {
            let isDragging = false;
            let startX;
            let scrollLeft;

            dom.categoryMenu.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.pageX - dom.categoryMenu.offsetLeft;
                scrollLeft = dom.categoryMenu.scrollLeft;
                dom.categoryMenu.style.cursor = 'grabbing';
                e.preventDefault();
            });

            dom.categoryMenu.addEventListener('mouseleave', () => {
                isDragging = false;
                dom.categoryMenu.style.cursor = 'grab';
            });

            dom.categoryMenu.addEventListener('mouseup', () => {
                isDragging = false;
                dom.categoryMenu.style.cursor = 'grab';
            });

            dom.categoryMenu.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                const x = e.pageX - dom.categoryMenu.offsetLeft;
                const walk = (x - startX) * 2;
                dom.categoryMenu.scrollLeft = scrollLeft - walk;
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.category-menu')) {
                const activeLink = document.querySelector('.category-link.active');
                if (!activeLink) return;

                const links = Array.from(dom.categoryLinks);
                const currentIndex = links.indexOf(activeLink);

                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        const prevIndex = (currentIndex - 1 + links.length) % links.length;
                        links[prevIndex].click();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        const nextIndex = (currentIndex + 1) % links.length;
                        links[nextIndex].click();
                        break;
                    case 'Home':
                        e.preventDefault();
                        links[0].click();
                        break;
                    case 'End':
                        e.preventDefault();
                        links[links.length - 1].click();
                        break;
                }
            }
        });
    }

    function filterArticlesByCategory(category) {
        // Show skeleton loading
        showSkeletonLoading();

        // Simulate network delay
        setTimeout(() => {
            const allArticles = document.querySelectorAll('.story-card[data-category]');
            let hasVisibleArticles = false;

            allArticles.forEach(article => {
                const articleCategory = article.getAttribute('data-category');
                const isVisible = category === 'all' || articleCategory === category;

                if (isVisible) {
                    utils.show(article);
                    article.style.display = '';
                    hasVisibleArticles = true;
                } else {
                    utils.hide(article);
                    article.style.display = 'none';
                }
            });

            // Update section heading
            updateSectionHeading(category);

            // Show message if no articles
            if (!hasVisibleArticles && dom.storyGrid) {
                const noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.innerHTML = `
                    <i class="fas fa-newspaper"></i>
                    <h3>No stories found in "${category}"</h3>
                    <p>Check back soon for new content in this category.</p>
                `;
                dom.storyGrid.appendChild(noResults);
            }

            // Hide skeleton loading
            hideSkeletonLoading();

            // Show toast feedback
            if (category !== 'all') {
                showToast(`Showing ${category} stories`);
            }
        }, 300);
    }

    function updateSectionHeading(category) {
        const sectionTitle = document.querySelector('.section-title');
        if (!sectionTitle) return;

        const categoryMap = {
            'all': 'Featured Stories',
            'culture': 'Culture & Arts',
            'history': 'History & Heritage',
            'women': 'Women in Leadership',
            'human': 'Human Interest',
            'profiles': 'Profiles & Biographies',
            'bizarre': 'Bizarre & Unusual',
            'lifestyle': 'Lifestyle & Society'
        };

        const title = categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
        sectionTitle.innerHTML = `<i class="fas fa-edit"></i> ${title}`;
    }

    function showSkeletonLoading() {
        const skeletonHTML = `
            <div class="skeleton-loading">
                <div class="skeleton-card">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-title"></div>
                    <div class="skeleton-excerpt"></div>
                    <div class="skeleton-meta"></div>
                </div>
                <div class="skeleton-card">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-title"></div>
                    <div class="skeleton-excerpt"></div>
                    <div class="skeleton-meta"></div>
                </div>
                <div class="skeleton-card">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-title"></div>
                    <div class="skeleton-excerpt"></div>
                    <div class="skeleton-meta"></div>
                </div>
            </div>
        `;

        if (dom.storyGrid) {
            dom.storyGrid.innerHTML = skeletonHTML;
        }
    }

    function hideSkeletonLoading() {
        const skeleton = document.querySelector('.skeleton-loading');
        if (skeleton) {
            skeleton.style.opacity = '0';
            setTimeout(() => {
                if (skeleton.parentNode) {
                    skeleton.parentNode.removeChild(skeleton);
                }
            }, 300);
        }
    }

    // ============================================
    // 8. AUTHENTICATION SYSTEM
    // ============================================
    function setupAuthentication() {
        // Modal triggers
        if (dom.loginTrigger) {
            dom.loginTrigger.addEventListener('click', () => openModal('authModal', 'login'));
        }

        if (dom.submitStoryTrigger) {
            dom.submitStoryTrigger.addEventListener('click', (e) => {
                if (!state.user.isAuthenticated) {
                    e.preventDefault();
                    openModal('authModal', 'login');
                    showToast('Please login to submit a story');
                } else {
                    openModal('articleSubmissionModal');
                }
            });
        }

        // Auth tabs switching
        const authTabs = document.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                switchAuthTab(tabName);
            });
        });

        // Form submissions
        setupAuthForms();
    }

    function openModal(modalId, tab = null) {
        // Close any open modal first
        closeAllModals();

        // Show the requested modal
        const modal = document.getElementById(modalId);
        if (modal) {
            utils.show(modal);
            modal.setAttribute('aria-hidden', 'false');
            state.modalOpen = modalId;

            // Switch to specific tab if requested
            if (tab && modalId === 'authModal') {
                switchAuthTab(tab);
            }

            // Trap focus within modal
            trapFocus(modal);

            // Add ESC key listener
            document.addEventListener('keydown', handleModalEscape);
        }
    }

    function closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay[aria-hidden="false"]');
        modals.forEach(modal => {
            utils.hide(modal);
            modal.setAttribute('aria-hidden', 'true');
        });
        
        state.modalOpen = null;
        document.removeEventListener('keydown', handleModalEscape);
    }

    function handleModalEscape(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    }

    function trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', function(e) {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });

        // Focus first element
        setTimeout(() => firstElement.focus(), 100);
    }

    function switchAuthTab(tabName) {
        // Update active tab
        const tabs = document.querySelectorAll('.auth-tab');
        tabs.forEach(tab => {
            const isActive = tab.getAttribute('data-tab') === tabName;
            utils.toggleClass(tab, 'active', isActive);
            tab.setAttribute('aria-selected', isActive.toString());
        });

        // Show corresponding form
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            const isActive = form.getAttribute('data-tab') === tabName;
            utils.toggle(form, isActive);
        });
    }

    function setupAuthForms() {
        // Login form
        if (dom.loginForm) {
            dom.loginForm.addEventListener('submit', handleLogin);
        }

        // Registration form
        if (dom.registerForm) {
            setupRegistrationValidation();
            dom.registerForm.addEventListener('submit', handleRegistration);
        }

        // Password reset form
        if (dom.resetForm) {
            dom.resetForm.addEventListener('submit', handlePasswordReset);
        }
    }

    function setupRegistrationValidation() {
        const emailInput = document.querySelector('#registerEmail');
        const passwordInput = document.querySelector('#registerPassword');
        const confirmInput = document.querySelector('#registerConfirmPassword');

        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                const isValid = utils.validateEmail(emailInput.value);
                updateInputValidation(emailInput, isValid, 'Please enter a valid email address');
            });
        }

        if (passwordInput) {
            passwordInput.addEventListener('input', utils.debounce(() => {
                const validation = utils.validatePassword(passwordInput.value);
                updatePasswordStrength(validation);
            }, 300));
        }

        if (confirmInput) {
            confirmInput.addEventListener('input', utils.debounce(() => {
                const passwordsMatch = passwordInput.value === confirmInput.value;
                updateInputValidation(confirmInput, passwordsMatch, 'Passwords do not match');
            }, 300));
        }
    }

    function updateInputValidation(input, isValid, errorMessage) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;

        // Remove existing error
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) existingError.remove();

        if (!isValid && input.value.trim()) {
            // Add error
            utils.removeClass(input, 'valid');
            utils.addClass(input, 'error');
            
            const errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            errorElement.textContent = errorMessage;
            formGroup.appendChild(errorElement);
        } else {
            // Remove error
            utils.removeClass(input, 'error');
            if (isValid && input.value.trim()) {
                utils.addClass(input, 'valid');
            }
        }
    }

    function updatePasswordStrength(validation) {
        const strengthMeter = document.querySelector('.password-strength');
        if (!strengthMeter) return;

        const { isValid, strength } = validation;
        const criteriaMet = Object.values(strength).filter(Boolean).length;
        const strengthPercent = (criteriaMet / 5) * 100;

        strengthMeter.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill" style="width: ${strengthPercent}%"></div>
            </div>
            <div class="strength-text">
                ${isValid ? 'Strong password' : 'Weak password'}
            </div>
        `;
    }

    async function handleLogin(e) {
        e.preventDefault();
        
        const email = document.querySelector('#loginEmail').value;
        const password = document.querySelector('#loginPassword').value;
        const rememberMe = document.querySelector('#rememberMe').checked;

        // Basic validation
        if (!email || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        if (!utils.validateEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        // Show loading state
        const submitBtn = dom.loginForm.querySelector('.btn-auth-submit');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Mock authentication - in real app, this would be an API call
            const mockUsers = [
                { email: 'reader@example.com', password: 'password123', name: 'John Reader', subscription: 'free' },
                { email: 'premium@example.com', password: 'premium123', name: 'Sarah Premium', subscription: 'annual' }
            ];

            const user = mockUsers.find(u => u.email === email && u.password === password);

            if (user) {
                // Successful login
                state.user.isAuthenticated = true;
                state.user.email = user.email;
                state.user.name = user.name;
                state.user.subscription = user.subscription;

                // Update UI
                updateAuthUI();
                
                // Close modal
                closeAllModals();
                
                // Show success message
                showToast(`Welcome back, ${user.name}!`, 'success');

                // Save auth state if remember me is checked
                if (rememberMe) {
                    saveState();
                }

                console.log(`🔐 User logged in: ${user.email}`);
            } else {
                // Failed login
                showToast('Invalid email or password', 'error');
            }

            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }

    async function handleRegistration(e) {
        e.preventDefault();
        
        const firstName = document.querySelector('#registerFirstName').value;
        const lastName = document.querySelector('#registerLastName').value;
        const email = document.querySelector('#registerEmail').value;
        const password = document.querySelector('#registerPassword').value;
        const confirmPassword = document.querySelector('#registerConfirmPassword').value;
        const acceptTerms = document.querySelector('#acceptTerms').checked;
        const newsletterOptIn = document.querySelector('#newsletterOptIn').checked;

        // Validation
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        if (!utils.validateEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (!acceptTerms) {
            showToast('Please accept the Terms of Service', 'error');
            return;
        }

        const passwordValidation = utils.validatePassword(password);
        if (!passwordValidation.isValid) {
            showToast('Password must be at least 8 characters with uppercase, lowercase, and numbers', 'error');
            return;
        }

        // Show loading state
        const submitBtn = dom.registerForm.querySelector('.btn-auth-submit');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Check if user already exists (in real app, this would be an API call)
            const existingUsers = JSON.parse(localStorage.getItem('hmw_mock_users') || '[]');
            const userExists = existingUsers.some(u => u.email === email);

            if (userExists) {
                showToast('An account with this email already exists', 'error');
            } else {
                // Create new user
                const newUser = {
                    id: utils.generateUUID(),
                    firstName,
                    lastName,
                    email,
                    password, // In real app, this would be hashed
                    newsletterOptIn,
                    createdAt: new Date().toISOString(),
                    subscription: 'free'
                };

                // Save to mock database
                existingUsers.push(newUser);
                localStorage.setItem('hmw_mock_users', JSON.stringify(existingUsers));

                // Log user in
                state.user.isAuthenticated = true;
                state.user.email = email;
                state.user.name = `${firstName} ${lastName}`;
                state.user.subscription = 'free';

                // Update UI
                updateAuthUI();
                
                // Switch to login tab and close modal
                switchAuthTab('login');
                setTimeout(() => {
                    closeAllModals();
                    showToast(`Welcome to HMW Beyond Borders, ${firstName}!`, 'success');
                }, 500);

                console.log(`📝 New user registered: ${email}`);
            }

            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }

    async function handlePasswordReset(e) {
        e.preventDefault();
        
        const email = document.querySelector('#resetEmail').value;

        if (!email || !utils.validateEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        // Show loading state
        const submitBtn = dom.resetForm.querySelector('.btn-auth-submit');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // In real app, this would send a reset email
            showToast(`Password reset link sent to ${email}`, 'success');
            
            // Switch back to login
            setTimeout(() => {
                switchAuthTab('login');
            }, 1500);

            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }

    function updateAuthUI() {
        if (state.user.isAuthenticated) {
            // Show account dropdown, hide login button
            if (dom.accountDropdown) {
                utils.show(dom.accountDropdown);
            }
            if (dom.loginTrigger) {
                utils.hide(dom.loginTrigger);
            }

            // Update user info in dropdown
            const userNameElement = dom.accountDropdown.querySelector('.dropdown-menu [data-action="profile"]');
            if (userNameElement && state.user.name) {
                userNameElement.innerHTML = `<i class="fas fa-user-circle"></i> ${state.user.name}`;
            }

            // Update subscription status
            const subscriptionElement = dom.accountDropdown.querySelector('.dropdown-menu [data-action="subscription"]');
            if (subscriptionElement && state.user.subscription) {
                const subscriptionText = state.user.subscription === 'free' ? 'Free Account' : 
                                       state.user.subscription === 'monthly' ? 'Monthly Subscriber' :
                                       state.user.subscription === 'annual' ? 'Annual Subscriber' : 'Subscriber';
                subscriptionElement.innerHTML = `<i class="fas fa-credit-card"></i> ${subscriptionText}`;
            }
        } else {
            // Show login button, hide account dropdown
            if (dom.accountDropdown) {
                utils.hide(dom.accountDropdown);
            }
            if (dom.loginTrigger) {
                utils.show(dom.loginTrigger);
            }
        }
    }

    function logout() {
        state.user.isAuthenticated = false;
        state.user.name = null;
        state.user.email = null;
        state.user.subscription = null;
        
        // Clear localStorage auth data
        localStorage.removeItem(config.localStorageKeys.auth);
        
        // Update UI
        updateAuthUI();
        
        // Show toast
        showToast('You have been logged out', 'info');
        
        console.log('🔓 User logged out');
    }

    // ============================================
    // 9. ARTICLE INTERACTIONS
    // ============================================
    function setupArticleInteractions() {
        // Event delegation for all story cards
        document.addEventListener('click', (e) => {
            const storyCard = e.target.closest('.story-card');
            if (!storyCard) return;

            // Handle different interactions
            if (e.target.closest('.like-btn')) {
                handleLike(storyCard);
            } else if (e.target.closest('.save-btn')) {
                handleSave(storyCard);
            } else if (e.target.closest('.comment-btn')) {
                handleComment(storyCard);
            } else if (e.target.closest('.share-btn')) {
                handleShare(storyCard);
            } else if (e.target.closest('.btn-follow-author')) {
                handleFollowAuthor(storyCard);
            } else if (e.target.closest('.btn-follow-topic')) {
                handleFollowTopic(storyCard);
            } else {
                // Default: open article reader
                openArticleReader(storyCard);
            }
        });

        // Poll interactions
        if (dom.pollOptions.length) {
            dom.pollOptions.forEach(option => {
                option.addEventListener('click', handlePollVote);
            });
        }

        // Reactions
        document.addEventListener('click', (e) => {
            const reactionBtn = e.target.closest('.reaction-btn');
            if (reactionBtn && e.target.closest('.reactions-container')) {
                handleReaction(reactionBtn);
            }
        });

        // Collection dropdown
        const collectionBtns = document.querySelectorAll('.collection-btn');
        collectionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = btn.nextElementSibling;
                if (dropdown) {
                    utils.toggleClass(dropdown, 'show');
                }
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.collection-dropdown')) {
                document.querySelectorAll('.collection-options').forEach(dropdown => {
                    utils.removeClass(dropdown, 'show');
                });
            }
            if (!e.target.closest('.share-dropdown')) {
                document.querySelectorAll('.share-options').forEach(dropdown => {
                    utils.removeClass(dropdown, 'show');
                });
            }
        });
    }

    function openArticleReader(storyCard) {
        // Check paywall for non-subscribers
        if (!state.user.isAuthenticated || state.user.subscription === 'free') {
            state.user.freeArticlesRead++;
            saveState();

            if (state.user.freeArticlesRead > config.limits.freeArticles) {
                openModal('paywallModal');
                showToast('Subscribe to read unlimited stories', 'info');
                return;
            }
        }

        // Get article data
        const articleId = storyCard.getAttribute('data-article-id');
        const headline = storyCard.querySelector('.story-headline')?.textContent || 'Untitled Story';
        const excerpt = storyCard.querySelector('.story-excerpt')?.textContent || '';
        const image = storyCard.querySelector('.featured-image')?.src || 
                     storyCard.querySelector('.story-image img')?.src || 
                     'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
        const author = storyCard.querySelector('.author-name')?.textContent || 'HMW Staff';
        const authorTitle = storyCard.querySelector('.author-title')?.textContent || 'Correspondent';
        const category = storyCard.querySelector('.category-label')?.textContent || 'Story';
        const date = storyCard.querySelector('.metadata-item time')?.textContent || 
                    utils.formatRelativeTime(Date.now());

        // Populate modal
        const modal = dom.articleReaderModal;
        if (!modal) return;

        // Update content
        modal.querySelector('#articleReaderTitle').textContent = headline;
        modal.querySelector('#articleReaderBody').innerHTML = generateArticleContent({
            headline,
            excerpt,
            image,
            author,
            authorTitle,
            category,
            date
        });

        // Open modal
        openModal('articleReaderModal');

        // Track article view
        trackArticleView(articleId);
    }

    function generateArticleContent(data) {
        return `
            <div class="article-reader-header">
                <div class="reader-category">${data.category}</div>
                <h2 id="articleReaderTitle">${data.headline}</h2>
                <div class="reader-meta">
                    <div class="reader-author">
                        <img src="https://images.unsplash.com/photo-1494790108755-2616b786d49f?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80" 
                             alt="${data.author}" 
                             class="author-avatar">
                        <div class="author-details">
                            <span class="author-name">${data.author}</span>
                            <span class="author-title">${data.authorTitle}</span>
                            <span class="article-date"><i class="far fa-clock"></i> ${data.date} • 7 min read</span>
                        </div>
                    </div>
                    <div class="reader-actions">
                        <button class="reader-action" aria-label="Save article">
                            <i class="far fa-bookmark"></i>
                        </button>
                        <button class="reader-action" aria-label="Share article">
                            <i class="fas fa-share-alt"></i>
                        </button>
                        <button class="reader-action" aria-label="Print article">
                            <i class="fas fa-print"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="article-reader-body" id="articleReaderBody">
                <div class="reader-featured-image">
                    <img src="${data.image}" 
                         alt="${data.headline}" 
                         loading="lazy">
                    <div class="image-caption">${data.excerpt}</div>
                </div>
                <div class="reader-content">
                    <p>${data.excerpt}</p>
                    <p>This is a sample article content. In a real implementation, this would be fetched from a database or API.</p>
                    
                    <h3>Detailed Analysis</h3>
                    <p>Detailed content would go here with proper paragraphs, quotes, and multimedia elements.</p>
                    
                    <blockquote class="reader-quote">
                        <p>"This is an important quote from the article that highlights key insights."</p>
                        <cite>— Important Person, Relevant Title</cite>
                    </blockquote>
                    
                    <p>More content continues here with relevant information and analysis.</p>
                </div>
                <div class="reader-footer">
                    <div class="reader-tags">
                        <a href="#" class="tag">${data.category}</a>
                        <a href="#" class="tag">Storytelling</a>
                        <a href="#" class="tag">Journalism</a>
                    </div>
                    <div class="reader-interaction">
                        <button class="reader-like">
                            <i class="far fa-heart"></i>
                            <span>324 Likes</span>
                        </button>
                        <button class="reader-comment">
                            <i class="far fa-comment"></i>
                            <span>58 Comments</span>
                        </button>
                        <button class="reader-share">
                            <i class="fas fa-share-alt"></i>
                            <span>Share Story</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function handleLike(storyCard) {
        const likeBtn = storyCard.querySelector('.like-btn');
        const likeIcon = likeBtn.querySelector('i');
        const likeCount = storyCard.querySelector('.metric-item:nth-child(2) .metric-value');
        
        const isLiked = likeIcon.classList.contains('fas');
        
        if (isLiked) {
            // Unlike
            likeIcon.className = 'far fa-heart';
            if (likeCount) {
                const currentCount = parseInt(likeCount.textContent) || 0;
                likeCount.textContent = Math.max(0, currentCount - 1);
            }
            showToast('Removed from liked stories');
        } else {
            // Like
            likeIcon.className = 'fas fa-heart';
            if (likeCount) {
                const currentCount = parseInt(likeCount.textContent) || 0;
                likeCount.textContent = currentCount + 1;
            }
            showToast('Added to liked stories');
        }
    }

    function handleSave(storyCard) {
        const saveBtn = storyCard.querySelector('.save-btn');
        const saveIcon = saveBtn.querySelector('i');
        const saveCount = storyCard.querySelector('.metric-item:nth-child(5) .metric-value');
        const articleId = storyCard.getAttribute('data-article-id');
        
        const isSaved = saveIcon.classList.contains('fas');
        
        if (isSaved) {
            // Unsave
            saveIcon.className = 'far fa-bookmark';
            if (saveCount) {
                const currentCount = parseInt(saveCount.textContent) || 0;
                saveCount.textContent = Math.max(0, currentCount - 1);
            }
            // Remove from saved articles
            state.savedArticles = state.savedArticles.filter(id => id !== articleId);
            showToast('Removed from saved stories');
        } else {
            // Save
            saveIcon.className = 'fas fa-bookmark';
            if (saveCount) {
                const currentCount = parseInt(saveCount.textContent) || 0;
                saveCount.textContent = currentCount + 1;
            }
            // Add to saved articles
            if (!state.savedArticles.includes(articleId)) {
                state.savedArticles.push(articleId);
            }
            showToast('Story saved for later');
        }
    }

    function handleComment(storyCard) {
        const articleId = storyCard.getAttribute('data-article-id');
        openArticleReader(storyCard);
        
        // Focus on comment section after a delay
        setTimeout(() => {
            const commentTextarea = document.querySelector('.comment-textarea');
            if (commentTextarea) {
                commentTextarea.focus();
            }
        }, 500);
    }

    function handleShare(storyCard) {
        const headline = storyCard.querySelector('.story-headline')?.textContent || 'Check out this story';
        const url = window.location.href;
        
        // Create share data
        const shareData = {
            title: headline,
            text: headline + ' - HMW Beyond Borders',
            url: url
        };
        
        // Use Web Share API if available
        if (navigator.share) {
            navigator.share(shareData)
                .then(() => showToast('Story shared successfully'))
                .catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${headline} - ${url}`)
                .then(() => showToast('Link copied to clipboard'))
                .catch(err => {
                    // Ultimate fallback: open share dialog
                    openShareDialog(storyCard);
                });
        }
    }

    function openShareDialog(storyCard) {
        const shareOptions = storyCard.closest('.share-dropdown')?.querySelector('.share-options');
        if (shareOptions) {
            utils.toggleClass(shareOptions, 'show');
        }
    }

    function handleReaction(reactionBtn) {
        const emoji = reactionBtn.textContent;
        const storyCard = reactionBtn.closest('.story-card');
        const likeBtn = storyCard?.querySelector('.like-btn');
        
        if (likeBtn) {
            // Update like button to show reaction
            likeBtn.innerHTML = `${emoji} Liked`;
            
            // Show toast
            showToast(`Reacted with ${emoji}`);
            
            // Hide reactions dropdown
            const reactionsContainer = reactionBtn.closest('.reactions-container');
            if (reactionsContainer) {
                utils.removeClass(reactionsContainer, 'show');
            }
        }
    }

    function handleFollowAuthor(storyCard) {
        const authorName = storyCard.querySelector('.author-name')?.textContent || 'this author';
        const followBtn = storyCard.querySelector('.btn-follow-author');
        
        if (followBtn.textContent.includes('Follow')) {
            followBtn.innerHTML = '<i class="fas fa-user-check"></i> Following';
            showToast(`Now following ${authorName}`);
        } else {
            followBtn.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
            showToast(`Unfollowed ${authorName}`);
        }
    }

    function handleFollowTopic(storyCard) {
        const topicBtn = storyCard.querySelector('.btn-follow-topic');
        
        if (topicBtn.textContent.includes('Follow')) {
            topicBtn.innerHTML = '<i class="fas fa-check"></i> Following Topic';
            showToast('Topic added to your interests');
        } else {
            topicBtn.innerHTML = '<i class="fas fa-plus"></i> Follow Topic';
            showToast('Topic removed from your interests');
        }
    }

    function handlePollVote(e) {
        const pollOption = e.currentTarget;
        const pollContainer = pollOption.closest('.poll-content') || pollOption.closest('.community-poll');
        
        if (!pollContainer) return;
        
        // Get poll data
        const pollId = pollContainer.getAttribute('data-poll-id') || 'daily-poll';
        const votedPolls = JSON.parse(localStorage.getItem(config.localStorageKeys.pollsVoted) || '[]');
        
        // Check if already voted
        if (votedPolls.includes(pollId)) {
            showToast('You have already voted in this poll', 'info');
            return;
        }
        
        // Mark as voted
        votedPolls.push(pollId);
        localStorage.setItem(config.localStorageKeys.pollsVoted, JSON.stringify(votedPolls));
        
        // Update UI
        const pollOptions = pollContainer.querySelectorAll('.poll-option');
        pollOptions.forEach(opt => {
            utils.removeClass(opt, 'active');
            opt.disabled = true;
        });
        
        utils.addClass(pollOption, 'active');
        
        // Show results
        showPollResults(pollContainer);
        
        // Show toast
        showToast('Thanks for voting!');
    }

    function showPollResults(pollContainer) {
        const pollOptions = pollContainer.querySelectorAll('.poll-option');
        const totalVotes = 100 + Math.floor(Math.random() * 100); // Random total for demo
        
        // Create results container if it doesn't exist
        let resultsContainer = pollContainer.querySelector('.poll-results');
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.className = 'poll-results';
            pollContainer.appendChild(resultsContainer);
        }
        
        // Generate random percentages for demo
        resultsContainer.innerHTML = '';
        pollOptions.forEach((option, index) => {
            const percent = index === 0 ? 45 : index === 1 ? 35 : 20; // Fixed percentages for demo
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <span class="result-label">${option.textContent}</span>
                <div class="result-bar">
                    <div class="result-fill" style="width: ${percent}%"></div>
                </div>
                <span class="result-percent">${percent}%</span>
            `;
            resultsContainer.appendChild(resultItem);
        });
        
        // Update poll footer
        const pollFooter = pollContainer.querySelector('.poll-footer');
        if (pollFooter) {
            const totalElement = pollFooter.querySelector('.poll-total') || pollFooter.querySelector('.poll-count');
            if (totalElement) {
                totalElement.innerHTML = `<i class="fas fa-users"></i> ${totalVotes} votes`;
            }
        }
    }

    function trackArticleView(articleId) {
        // In a real app, this would send analytics to your backend
        console.log(`📊 Article viewed: ${articleId}`);
        
        // Update view count in UI if visible
        const viewCountElement = document.querySelector(`[data-article-id="${articleId}"] .metric-item:nth-child(1) .metric-value`);
        if (viewCountElement) {
            const currentCount = parseInt(viewCountElement.textContent.replace('K', '000')) || 0;
            const newCount = currentCount + 1;
            viewCountElement.textContent = newCount >= 1000 ? `${(newCount / 1000).toFixed(1)}K` : newCount.toString();
        }
    }

    // ============================================
    // 10. SUBSCRIPTION & PAYWALL SYSTEM
    // ============================================
    function setupSubscriptionSystem() {
        // Plan selection
        const planButtons = document.querySelectorAll('.btn-plan-select');
        planButtons.forEach(button => {
            button.addEventListener('click', handlePlanSelection);
        });

        // Paywall login link
        const paywallLogin = document.querySelector('#paywallLogin');
        if (paywallLogin) {
            paywallLogin.addEventListener('click', (e) => {
                e.preventDefault();
                closeAllModals();
                setTimeout(() => openModal('authModal', 'login'), 300);
            });
        }

        // Subscribe trigger
        if (dom.subscribeTrigger) {
            dom.subscribeTrigger.addEventListener('click', () => openModal('paywallModal'));
        }
    }

    function handlePlanSelection(e) {
        const button = e.currentTarget;
        const plan = button.getAttribute('data-plan');
        
        // Update UI
        document.querySelectorAll('.btn-plan-select').forEach(btn => {
            utils.removeClass(btn, 'selected');
        });
        utils.addClass(button, 'selected');
        
        // Show loading state
        const originalText = button.textContent;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        button.disabled = true;
        
        // Simulate payment processing
        setTimeout(() => {
            // Update user subscription
            state.user.subscription = plan;
            state.user.isAuthenticated = true;
            
            // Save state
            saveState();
            
            // Update UI
            updateAuthUI();
            
            // Close modal
            closeAllModals();
            
            // Show success message
            showToast(`Successfully subscribed to ${plan} plan!`, 'success');
            
            // Reset button
            button.textContent = originalText;
            button.disabled = false;
            
            console.log(`💰 User subscribed to ${plan} plan`);
        }, 2000);
    }

    function checkPaywall() {
        if (!state.user.isAuthenticated || state.user.subscription === 'free') {
            return state.user.freeArticlesRead >= config.limits.freeArticles;
        }
        return false;
    }

    // ============================================
    // 11. ARTICLE SUBMISSION SYSTEM
    // ============================================
    function setupArticleSubmission() {
        if (!dom.articleSubmissionForm) return;

        // Image upload preview
        const imageUpload = document.querySelector('#submissionImages');
        const imagePreview = document.querySelector('#imagePreview');
        const browseButton = document.querySelector('#browseImages');

        if (browseButton && imageUpload) {
            browseButton.addEventListener('click', () => imageUpload.click());
        }

        if (imageUpload && imagePreview) {
            imageUpload.addEventListener('change', handleImageUpload);
        }

        // Rich text editor
        setupRichTextEditor();

        // Form submission
        dom.articleSubmissionForm.addEventListener('submit', handleArticleSubmission);
    }

    function handleImageUpload(e) {
        const files = Array.from(e.target.files);
        const preview = document.querySelector('#imagePreview');
        
        if (!preview) return;

        // Clear previous previews
        preview.innerHTML = '';

        // Validate files
        const validFiles = files.filter(file => {
            const isValidType = file.type.startsWith('image/');
            const isValidSize = file.size <= config.limits.maxImageSize;
            
            if (!isValidType) {
                showToast(`${file.name} is not a valid image file`, 'error');
            }
            if (!isValidSize) {
                showToast(`${file.name} is too large (max 5MB)`, 'error');
            }
            
            return isValidType && isValidSize;
        });

        // Limit number of images
        const limitedFiles = validFiles.slice(0, config.limits.maxImages);
        
        if (validFiles.length > config.limits.maxImages) {
            showToast(`Maximum ${config.limits.maxImages} images allowed`, 'info');
        }

        // Create previews
        limitedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'image-preview-item';
                imgContainer.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button class="remove-image" aria-label="Remove image">×</button>
                `;
                preview.appendChild(imgContainer);

                // Add remove functionality
                imgContainer.querySelector('.remove-image').addEventListener('click', () => {
                    imgContainer.remove();
                    updateImageUploadCount();
                });
            };
            reader.readAsDataURL(file);
        });

        updateImageUploadCount();
    }

    function updateImageUploadCount() {
        const preview = document.querySelector('#imagePreview');
        const count = preview ? preview.children.length : 0;
        const uploadArea = document.querySelector('.image-upload-area p');
        
        if (uploadArea) {
            if (count === 0) {
                uploadArea.textContent = 'Drag & drop images or click to browse';
            } else {
                uploadArea.textContent = `${count} image${count !== 1 ? 's' : ''} selected`;
            }
        }
    }

    function setupRichTextEditor() {
        const editorToolbar = document.querySelector('.editor-toolbar');
        const contentTextarea = document.querySelector('#submissionContent');
        
        if (!editorToolbar || !contentTextarea) return;

        editorToolbar.addEventListener('click', (e) => {
            const button = e.target.closest('.editor-btn');
            if (!button) return;

            e.preventDefault();
            const command = button.getAttribute('data-command');
            
            // Focus on textarea first
            contentTextarea.focus();
            
            // Save selection
            const start = contentTextarea.selectionStart;
            const end = contentTextarea.selectionEnd;
            const selectedText = contentTextarea.value.substring(start, end);
            
            let newText = '';
            
            switch (command) {
                case 'bold':
                    newText = `**${selectedText}**`;
                    break;
                case 'italic':
                    newText = `*${selectedText}*`;
                    break;
                case 'insertUnorderedList':
                    newText = selectedText ? `\n• ${selectedText}` : '\n• ';
                    break;
                case 'insertOrderedList':
                    newText = selectedText ? `\n1. ${selectedText}` : '\n1. ';
                    break;
                case 'createLink':
                    const url = prompt('Enter URL:', 'https://');
                    if (url) {
                        newText = `[${selectedText || 'link'}](${url})`;
                    } else {
                        return; // User cancelled
                    }
                    break;
            }
            
            // Replace selected text
            contentTextarea.value = 
                contentTextarea.value.substring(0, start) +
                newText +
                contentTextarea.value.substring(end);
            
            // Restore focus and selection
            contentTextarea.focus();
            const newPosition = start + newText.length;
            contentTextarea.setSelectionRange(newPosition, newPosition);
        });
    }

    function handleArticleSubmission(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            title: document.querySelector('#submissionTitle').value,
            category: document.querySelector('#submissionCategory').value,
            excerpt: document.querySelector('#submissionExcerpt').value,
            content: document.querySelector('#submissionContent').value,
            author: document.querySelector('#submissionAuthor').value,
            email: document.querySelector('#submissionEmail').value,
            tags: document.querySelector('#submissionTags').value,
            isOriginal: document.querySelector('#submissionOriginal').checked,
            consent: document.querySelector('#submissionConsent').checked
        };

        // Validation
        if (!formData.title || !formData.category || !formData.excerpt || !formData.content || 
            !formData.author || !formData.email) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        if (!utils.validateEmail(formData.email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        if (!formData.isOriginal || !formData.consent) {
            showToast('Please confirm originality and consent', 'error');
            return;
        }

        // Show loading state
        const submitBtn = dom.articleSubmissionForm.querySelector('.btn-submit-article');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // In real app, this would submit to backend
            console.log('📤 Article submitted:', formData);
            
            // Reset form
            dom.articleSubmissionForm.reset();
            const imagePreview = document.querySelector('#imagePreview');
            if (imagePreview) imagePreview.innerHTML = '';
            updateImageUploadCount();
            
            // Close modal
            closeAllModals();
            
            // Show success message
            showToast('Story submitted successfully! Our editors will review it shortly.', 'success');
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }

    // ============================================
    // 12. SEARCH FUNCTIONALITY
    // ============================================
    function setupSearch() {
        // Desktop search
        if (dom.searchInput) {
            const searchButton = document.querySelector('.search-button-full');
            
            dom.searchInput.addEventListener('input', utils.debounce((e) => {
                performSearch(e.target.value);
            }, 300));
            
            if (searchButton) {
                searchButton.addEventListener('click', () => performSearch(dom.searchInput.value));
            }
            
            dom.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch(dom.searchInput.value);
                }
            });
        }

        // Mobile search
        if (dom.mobileSearchInput) {
            dom.mobileSearchInput.addEventListener('input', utils.debounce((e) => {
                performSearch(e.target.value);
            }, 300));
        }

        // Search toggle
        const searchToggle = document.querySelector('.search-toggle');
        const mobileSearchToggle = document.querySelector('.search-mobile');
        
        if (searchToggle) {
            searchToggle.addEventListener('click', () => {
                utils.addClass(dom.searchOverlay, 'visible');
                setTimeout(() => dom.searchInput?.focus(), 100);
            });
        }
        
        if (mobileSearchToggle) {
            mobileSearchToggle.addEventListener('click', () => {
                const mobileSearch = document.querySelector('#mobileSearch');
                if (mobileSearch) {
                    utils.addClass(mobileSearch, 'active');
                    setTimeout(() => dom.mobileSearchInput?.focus(), 100);
                }
            });
        }

        // Search close buttons
        const searchClose = document.querySelector('.search-close');
        const mobileSearchClose = document.querySelector('.mobile-search-close');
        
        if (searchClose) {
            searchClose.addEventListener('click', () => {
                utils.removeClass(dom.searchOverlay, 'visible');
                if (dom.searchInput) dom.searchInput.value = '';
                performSearch('');
            });
        }
        
        if (mobileSearchClose) {
            mobileSearchClose.addEventListener('click', () => {
                const mobileSearch = document.querySelector('#mobileSearch');
                if (mobileSearch) {
                    utils.removeClass(mobileSearch, 'active');
                    if (dom.mobileSearchInput) dom.mobileSearchInput.value = '';
                    performSearch('');
                }
            });
        }
    }

    function performSearch(query) {
        state.searchQuery = query.toLowerCase().trim();
        
        if (!state.searchQuery) {
            // Show all articles
            document.querySelectorAll('.story-card').forEach(card => {
                utils.show(card);
                card.style.display = '';
            });
            return;
        }

        // Search through articles
        document.querySelectorAll('.story-card').forEach(card => {
            const headline = card.querySelector('.story-headline')?.textContent.toLowerCase() || '';
            const excerpt = card.querySelector('.story-excerpt')?.textContent.toLowerCase() || '';
            const category = card.querySelector('.category-label')?.textContent.toLowerCase() || '';
            const tags = Array.from(card.querySelectorAll('.story-tag'))
                .map(tag => tag.textContent.toLowerCase())
                .join(' ');
            const author = card.querySelector('.author-name')?.textContent.toLowerCase() || '';

            const searchableText = `${headline} ${excerpt} ${category} ${tags} ${author}`;
            const isMatch = searchableText.includes(state.searchQuery);

            if (isMatch) {
                utils.show(card);
                card.style.display = '';
                utils.addClass(card, 'search-match');
            } else {
                utils.hide(card);
                card.style.display = 'none';
                utils.removeClass(card, 'search-match');
            }
        });

        // Show no results message
        const visibleCards = document.querySelectorAll('.story-card:not([style*="display: none"])');
        const noResultsElement = document.querySelector('.no-search-results');
        
        if (visibleCards.length === 0) {
            if (!noResultsElement) {
                const noResults = document.createElement('div');
                noResults.className = 'no-search-results';
                noResults.innerHTML = `
                    <i class="fas fa-search"></i>
                    <h3>No results found for "${query}"</h3>
                    <p>Try different keywords or browse our categories</p>
                `;
                if (dom.storyGrid) {
                    dom.storyGrid.appendChild(noResults);
                }
            }
        } else if (noResultsElement) {
            noResultsElement.remove();
        }
    }

    // ============================================
    // 13. NOTIFICATION SYSTEM
    // ============================================
    function setupNotifications() {
        if (!dom.notificationBell) return;

        // Notification badge click
        dom.notificationBell.addEventListener('click', showNotificationsPanel);

        // Request notification permission
        if (state.notifications && Notification.permission === 'default') {
            setTimeout(() => {
                const notificationPermission = document.querySelector('#notificationPermission');
                if (notificationPermission) {
                    utils.show(notificationPermission);
                    
                    const allowBtn = document.querySelector('#allowNotifications');
                    const denyBtn = document.querySelector('#denyNotifications');
                    
                    if (allowBtn) {
                        allowBtn.addEventListener('click', requestNotificationPermission);
                    }
                    
                    if (denyBtn) {
                        denyBtn.addEventListener('click', () => {
                            utils.hide(notificationPermission);
                            state.notifications = false;
                        });
                    }
                }
            }, 5000);
        }
    }

    function updateNotificationBadge() {
        if (!dom.notificationBell) return;
        
        const badge = dom.notificationBell.querySelector('.notification-badge');
        if (badge) {
            if (state.notificationCount > 0) {
                badge.textContent = state.notificationCount;
                utils.show(badge);
            } else {
                utils.hide(badge);
            }
        }
    }

    function showNotificationsPanel() {
        // In a real app, this would show a notifications dropdown
        // For now, just show a toast
        showToast(`You have ${state.notificationCount} unread notifications`, 'info');
        
        // Mark as read
        state.notificationCount = 0;
        updateNotificationBadge();
    }

    function requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                const notificationPermission = document.querySelector('#notificationPermission');
                if (notificationPermission) {
                    utils.hide(notificationPermission);
                }
                
                if (permission === 'granted') {
                    state.notifications = true;
                    showToast('Notifications enabled');
                    
                    // Show welcome notification
                    if (Notification.permission === 'granted') {
                        new Notification('HMW Beyond Borders', {
                            body: 'Welcome! Get ready for inspiring stories.',
                            icon: '/favicon-32x32.png'
                        });
                    }
                } else {
                    state.notifications = false;
                }
            });
        }
    }

    function showToast(message, type = 'info') {
        if (!dom.notificationToast) return;

        // Update toast content
        const toastMessage = dom.notificationToast.querySelector('.toast-message');
        const toastAction = dom.notificationToast.querySelector('.toast-action');
        const toastIcon = dom.notificationToast.querySelector('i');
        
        if (toastMessage) toastMessage.textContent = message;
        
        // Set type-specific styling
        dom.notificationToast.className = 'notification-toast';
        utils.addClass(dom.notificationToast, type);
        
        // Set icon based on type
        if (toastIcon) {
            switch (type) {
                case 'success':
                    toastIcon.className = 'fas fa-check-circle';
                    break;
                case 'error':
                    toastIcon.className = 'fas fa-exclamation-circle';
                    break;
                case 'warning':
                    toastIcon.className = 'fas fa-exclamation-triangle';
                    break;
                case 'breaking':
                    toastIcon.className = 'fas fa-bolt';
                    break;
                default:
                    toastIcon.className = 'fas fa-info-circle';
            }
        }

        // Show toast
        utils.addClass(dom.notificationToast, 'visible');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            utils.removeClass(dom.notificationToast, 'visible');
        }, 5000);

        // Close button
        const closeBtn = dom.notificationToast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                utils.removeClass(dom.notificationToast, 'visible');
            };
        }

        // Action button
        if (toastAction) {
            toastAction.onclick = () => {
                utils.removeClass(dom.notificationToast, 'visible');
                // Custom action based on message type
                if (message.includes('saved')) {
                    // Navigate to saved articles
                    console.log('Navigate to saved articles');
                } else if (message.includes('logged')) {
                    // Open profile
                    console.log('Open profile');
                }
            };
        }
    }

    // ============================================
    // 14. EVENT BINDING
    // ============================================
    function bindEvents() {
        // Theme toggle
        if (dom.themeToggle) {
            dom.themeToggle.addEventListener('click', toggleTheme);
        }

        // Modal close buttons
        dom.modalCloses.forEach(button => {
            button.addEventListener('click', closeAllModals);
        });

        // Back to top
        if (dom.backToTop) {
            dom.backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Account dropdown
        if (dom.accountDropdown) {
            const accountBtn = dom.accountDropdown.querySelector('.btn-account');
            if (accountBtn) {
                accountBtn.addEventListener('click', toggleAccountDropdown);
            }

            // Dropdown menu items
            const dropdownItems = dom.accountDropdown.querySelectorAll('.dropdown-menu a');
            dropdownItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    const action = item.getAttribute('data-action');
                    handleAccountAction(action, e);
                });
            });
        }

        // Hamburger menu
        if (dom.hamburgerMenu) {
            dom.hamburgerMenu.addEventListener('click', toggleMobileMenu);
        }

        // Footer subscription
        if (dom.footerSubscribe) {
            dom.footerSubscribe.addEventListener('submit', handleFooterSubscription);
        }

        // Window resize
        window.addEventListener('resize', utils.debounce(handleResize, 250));

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    function toggleAccountDropdown(e) {
        e.stopPropagation();
        const dropdownMenu = dom.accountDropdown.querySelector('.dropdown-menu');
        if (dropdownMenu) {
            utils.toggleClass(dropdownMenu, 'show');
        }
    }

    function handleAccountAction(action, e) {
        e.preventDefault();
        
        // Hide dropdown
        const dropdownMenu = dom.accountDropdown.querySelector('.dropdown-menu');
        if (dropdownMenu) {
            utils.removeClass(dropdownMenu, 'show');
        }

        switch (action) {
            case 'dashboard':
                showToast('Opening dashboard...');
                // In real app: navigate to dashboard
                break;
            case 'profile':
                showToast('Opening profile...');
                // In real app: navigate to profile
                break;
            case 'saved':
                showToast('Opening saved stories...');
                // In real app: navigate to saved stories
                break;
            case 'subscription':
                openModal('paywallModal');
                break;
            case 'settings':
                showToast('Opening settings...');
                // In real app: navigate to settings
                break;
            case 'help':
                showToast('Opening help center...');
                // In real app: navigate to help
                break;
            case 'logout':
                logout();
                break;
        }
    }

    function toggleMobileMenu() {
        const isExpanded = dom.hamburgerMenu.getAttribute('aria-expanded') === 'true';
        dom.hamburgerMenu.setAttribute('aria-expanded', (!isExpanded).toString());
        
        // In a real app, this would show/hide mobile menu
        showToast('Mobile menu ' + (isExpanded ? 'closed' : 'opened'));
    }

    function handleFooterSubscription(e) {
        e.preventDefault();
        const emailInput = dom.footerSubscribe.querySelector('input[type="email"]');
        const email = emailInput.value;
        
        if (email && utils.validateEmail(email)) {
            showToast('Subscribed to newsletter!', 'success');
            emailInput.value = '';
        } else {
            showToast('Please enter a valid email address', 'error');
        }
    }

    function handleResize() {
        // Update any responsive elements
        const isMobile = window.innerWidth < 768;
        
        // Update hamburger menu visibility
        if (dom.hamburgerMenu) {
            utils.toggle(dom.hamburgerMenu, isMobile);
        }
        
        // Update mobile bottom nav visibility
        const mobileBottomNav = document.querySelector('.mobile-bottom-nav');
        if (mobileBottomNav) {
            utils.toggle(mobileBottomNav, isMobile);
        }
    }

    function handleKeyboardShortcuts(e) {
        // Don't trigger shortcuts when user is typing in inputs
        if (e.target.matches('input, textarea, [contenteditable]')) return;

        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            utils.addClass(dom.searchOverlay, 'visible');
            setTimeout(() => dom.searchInput?.focus(), 100);
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            closeAllModals();
            utils.removeClass(dom.searchOverlay, 'visible');
        }

        // D for dark mode toggle
        if (e.key === 'd' && e.altKey) {
            e.preventDefault();
            toggleTheme();
        }

        // ? for help
        if (e.key === '?' && e.shiftKey) {
            e.preventDefault();
            showToast('Keyboard Shortcuts: Ctrl+K (Search), Alt+D (Theme), Esc (Close)');
        }
    }

    // ============================================
    // 15. DATA LOADING & RENDERING
    // ============================================
    function loadMoreArticles() {
        if (state.loadingMore) return;
        
        state.loadingMore = true;
        
        // Show loading indicator
        const loadingIndicator = document.querySelector('#loadingIndicator');
        if (loadingIndicator) {
            utils.show(loadingIndicator);
        }
        
        // Simulate API call
        setTimeout(() => {
            // Generate mock articles
            const newArticles = generateMockArticles(3);
            
            // Append to grid
            if (dom.storyGrid) {
                newArticles.forEach(article => {
                    const articleElement = createArticleElement(article);
                    dom.storyGrid.appendChild(articleElement);
                });
            }
            
            // Update state
            state.loadingMore = false;
            
            // Hide loading indicator
            if (loadingIndicator) {
                utils.hide(loadingIndicator);
            }
            
            // Show toast
            showToast('Loaded more stories');
            
            console.log(`📰 Loaded ${newArticles.length} more articles`);
        }, 1000);
    }

    function generateMockArticles(count) {
        const categories = ['culture', 'history', 'women', 'human', 'profiles', 'bizarre', 'lifestyle'];
        const titles = [
            'The Art of Storytelling in Modern Africa',
            'Forgotten Heroes: Women Who Shaped History',
            'Innovative Solutions to Community Challenges',
            'Cultural Exchange Programs Making a Difference',
            'Traditional Medicine Meets Modern Science',
            'Young Entrepreneurs Changing Their Communities',
            'Preserving Ancient Languages in the Digital Age'
        ];
        
        const articles = [];
        
        for (let i = 0; i < count; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const title = titles[Math.floor(Math.random() * titles.length)];
            
            articles.push({
                id: utils.generateUUID(),
                title: title,
                excerpt: `This is a compelling story about ${category} that will inspire and inform readers.`,
                category: category,
                image: `https://images.unsplash.com/photo-${1500000000000 + i}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`,
                author: 'HMW Contributor',
                date: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
                views: Math.floor(Math.random() * 1000) + 100,
                likes: Math.floor(Math.random() * 100) + 10,
                comments: Math.floor(Math.random() * 50) + 5
            });
        }
        
        return articles;
    }

    function createArticleElement(article) {
        const element = document.createElement('article');
        element.className = 'story-card';
        element.setAttribute('data-article-id', article.id);
        element.setAttribute('data-category', article.category);
        
        element.innerHTML = `
            <header class="story-metadata">
                <div class="category-label">${article.category}</div>
                <div class="metadata-grid">
                    <span class="metadata-item">
                        <i class="far fa-clock"></i>
                        <time datetime="${article.date}">${utils.formatRelativeTime(article.date)}</time>
                    </span>
                    <span class="metadata-item">
                        <i class="far fa-clock"></i>
                        7 min read
                    </span>
                </div>
            </header>

            <section class="story-content-preview">
                <div class="story-image">
                    <img src="${article.image}" 
                         alt="${article.title}" 
                         loading="lazy">
                </div>
                
                <h3 class="story-headline">${article.title}</h3>
                
                <p class="story-excerpt">${article.excerpt}</p>
                
                <div class="author-info">
                    <span class="author-name">${article.author}</span>
                </div>
            </section>

            <section class="engagement-metrics">
                <div class="metrics-grid compact">
                    <div class="metric-item">
                        <i class="far fa-eye"></i>
                        <span class="metric-value">${article.views}</span>
                    </div>
                    <div class="metric-item">
                        <i class="far fa-heart"></i>
                        <span class="metric-value">${article.likes}</span>
                    </div>
                    <div class="metric-item">
                        <i class="far fa-comment"></i>
                        <span class="metric-value">${article.comments}</span>
                    </div>
                    <div class="metric-item">
                        <i class="fas fa-share-alt"></i>
                        <span class="metric-value">${Math.floor(article.views / 10)}</span>
                    </div>
                </div>
            </section>

            <section class="social-interaction-bar compact">
                <div class="interaction-grid">
                    <button class="btn-interaction like-btn" aria-label="Like">
                        <i class="far fa-heart"></i>
                    </button>
                    <button class="btn-interaction comment-btn" aria-label="Comment">
                        <i class="far fa-comment"></i>
                    </button>
                    <button class="btn-interaction share-btn" aria-label="Share">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button class="btn-interaction save-btn" aria-label="Save">
                        <i class="far fa-bookmark"></i>
                    </button>
                </div>
            </section>
        `;
        
        return element;
    }

    // ============================================
    // 16. PUBLIC API
    // ============================================
    return {
        // Initialization
        init,
        
        // Public methods
        showToast,
        openModal,
        closeAllModals,
        toggleTheme,
        logout,
        
        // State access (read-only)
        getState: () => ({ ...state }),
        getUser: () => ({ ...state.user }),
        
        // Utility methods
        utils
    };
})();

// ============================================
// 17. BOOTSTRAP & ERROR HANDLING
// ============================================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function initializeApp() {
    try {
        HMWApp.init();
        
        // Make HMWApp available globally for debugging
        window.HMWApp = HMWApp;
        
        console.log('🎉 HMW Beyond Borders application loaded successfully!');
    } catch (error) {
        console.error('❌ Failed to initialize HMW App:', error);
        
        // Show error to user
        const errorElement = document.createElement('div');
        errorElement.className = 'app-error';
        errorElement.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Application Error</h3>
                <p>There was a problem loading the application. Please refresh the page.</p>
                <button onclick="window.location.reload()">Refresh Page</button>
            </div>
        `;
        document.body.appendChild(errorElement);
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Don't show error toast for network errors
    if (event.error.message && !event.error.message.includes('fetch')) {
        HMWApp.showToast('An error occurred. Please try again.', 'error');
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    HMWApp.showToast('An unexpected error occurred.', 'error');
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Offline detection
window.addEventListener('online', () => {
    HMWApp.showToast('Back online', 'success');
});

window.addEventListener('offline', () => {
    HMWApp.showToast('You are offline. Some features may be limited.', 'warning');
});
