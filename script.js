/**
 * HMW Beyond Borders - Main JavaScript File
 * Comprehensive functionality for news platform
 * Compatible with existing HTML and CSS
 */

(function() {
    'use strict';

    // ===========================================
    // GLOBAL STATE & CONFIGURATION
    // ===========================================
    
    const state = {
        currentUser: null,
        isLoggedIn: false,
        theme: 'light',
        notificationsEnabled: false,
        notifications: [],
        bookmarkedArticles: new Set(),
        readingHistory: [],
        liveChatActive: false,
        liveChatMessages: [],
        currentPage: 1,
        isLoading: false,
        hasMoreStories: true,
        apiEndpoint: 'https://api.hmwbeyondborders.com/v1',
        mockApiDelay: 1000
    };

    const config = {
        maxCommentsPerLoad: 10,
        articlesPerPage: 8,
        infiniteScrollThreshold: 200,
        toastDuration: 5000,
        debounceDelay: 300,
        maxLiveChatMessages: 50,
        cookieConsentKey: 'cookie_consent_accepted',
        notificationPermissionKey: 'notification_permission',
        themeKey: 'theme_preference'
    };

    // ===========================================
    // DOM ELEMENT CACHE
    // ===========================================
    
    const elements = {
        // Utility Bar
        liveClock: document.getElementById('liveClock'),
        currentDate: document.getElementById('currentDate'),
        currentTime: document.getElementById('currentTime'),
        weatherWidget: document.getElementById('weatherWidget'),
        loginTrigger: document.getElementById('loginTrigger'),
        subscribeTrigger: document.getElementById('subscribeTrigger'),
        submitStoryTrigger: document.getElementById('submitStoryTrigger'),
        accountDropdown: document.getElementById('accountDropdown'),
        
        // Navigation
        themeToggle: document.getElementById('themeToggle'),
        notificationBell: document.getElementById('notificationBell'),
        hamburgerMenu: document.querySelector('.hamburger-menu'),
        searchToggle: document.querySelector('.search-toggle'),
        megaMenu: document.getElementById('megaMenu'),
        
        // Modals
        authModal: document.getElementById('authModal'),
        paywallModal: document.getElementById('paywallModal'),
        articleReaderModal: document.getElementById('articleReaderModal'),
        articleSubmissionModal: document.getElementById('articleSubmissionModal'),
        
        // Search
        searchOverlay: document.getElementById('searchOverlay'),
        searchInputFull: document.querySelector('.search-input-full'),
        mobileSearch: document.getElementById('mobileSearch'),
        
        // Content
        manualArticlesGrid: document.getElementById('manualArticlesGrid'),
        autoArticlesGrid: document.getElementById('autoArticlesGrid'),
        autoArticleTemplate: document.getElementById('autoArticleTemplate'),
        loadMoreStories: document.getElementById('loadMoreStories'),
        loadingIndicator: document.getElementById('loadingIndicator'),
        infiniteScrollTrigger: document.getElementById('infiniteScrollTrigger'),
        
        // Sidebars
        liveFeed: document.getElementById('liveFeed'),
        pauseLive: document.getElementById('pauseLive'),
        refreshAutoStories: document.getElementById('refreshAutoStories'),
        
        // Cookie & Notifications
        cookieConsent: document.getElementById('cookieConsent'),
        acceptCookies: document.getElementById('acceptCookies'),
        rejectCookies: document.getElementById('rejectCookies'),
        notificationPermission: document.getElementById('notificationPermission'),
        allowNotifications: document.getElementById('allowNotifications'),
        denyNotifications: document.getElementById('denyNotifications'),
        notificationToast: document.getElementById('notificationToast'),
        
        // Footer & Navigation
        backToTop: document.getElementById('backToTop'),
        backToTopFooter: document.getElementById('backToTopFooter'),
        backToTopSidebar: document.getElementById('backToTopSidebar'),
        mobileBottomNav: document.querySelector('.mobile-bottom-nav')
    };

    // ===========================================
    // UTILITY FUNCTIONS
    // ===========================================
    
    /**
     * Safely get element by selector
     */
    function getElement(selector) {
        return document.querySelector(selector);
    }

    /**
     * Safely get all elements by selector
     */
    function getElements(selector) {
        return document.querySelectorAll(selector);
    }

    /**
     * Debounce function for performance optimization
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function for scroll/resize events
     */
    function throttle(func, limit) {
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
    }

    /**
     * Show toast notification
     */
    function showToast(message, type = 'info') {
        if (!elements.notificationToast) return;
        
        const toast = elements.notificationToast;
        const messageEl = toast.querySelector('.toast-message');
        const actionEl = toast.querySelector('.toast-action');
        
        if (!messageEl) return;
        
        // Set message
        messageEl.textContent = message;
        
        // Set type-specific styling
        toast.className = 'notification-toast';
        toast.classList.add(`toast-${type}`);
        
        // Show toast
        toast.style.display = 'flex';
        
        // Auto-hide after delay
        setTimeout(() => {
            hideToast();
        }, config.toastDuration);
        
        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.onclick = hideToast;
        }
        
        // Action button handler
        if (actionEl) {
            actionEl.onclick = function() {
                hideToast();
                // Default action - can be customized
                showToast('Action performed!', 'success');
            };
        }
    }

    /**
     * Hide toast notification
     */
    function hideToast() {
        if (elements.notificationToast) {
            elements.notificationToast.style.display = 'none';
        }
    }

    /**
     * Store data in localStorage
     */
    function storeData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to store data:', error);
            return false;
        }
    }

    /**
     * Retrieve data from localStorage
     */
    function retrieveData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to retrieve data:', error);
            return null;
        }
    }

    /**
     * Remove data from localStorage
     */
    function removeData(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove data:', error);
            return false;
        }
    }

    /**
     * Format date for display
     */
    function formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Format time for display
     */
    function formatTime(date) {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Calculate reading time
     */
    function calculateReadingTime(text) {
        const wordsPerMinute = 200;
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return `${minutes} min read`;
    }

    // ===========================================
    // MODAL MANAGEMENT
    // ===========================================
    
    /**
     * Open modal with backdrop
     */
    function openModal(modalElement) {
        if (!modalElement) return;
        
        // Store current scroll position
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        
        // Show modal
        modalElement.removeAttribute('hidden');
        modalElement.style.display = 'flex';
        
        // Add ESC key listener
        document.addEventListener('keydown', handleEscapeKey);
        
        // Focus trap
        trapFocus(modalElement);
        
        showToast('Modal opened', 'info');
    }

    /**
     * Close modal and restore scroll
     */
    function closeModal(modalElement) {
        if (!modalElement) return;
        
        // Hide modal
        modalElement.setAttribute('hidden', 'true');
        modalElement.style.display = 'none';
        
        // Restore scroll position
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
        
        // Remove ESC key listener
        document.removeEventListener('keydown', handleEscapeKey);
    }

    /**
     * Handle ESC key for modal closing
     */
    function handleEscapeKey(event) {
        if (event.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal-overlay:not([hidden])');
            openModals.forEach(modal => closeModal(modal));
        }
    }

    /**
     * Trap focus within modal for accessibility
     */
    function trapFocus(modalElement) {
        const focusableElements = modalElement.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        modalElement.addEventListener('keydown', function(event) {
            if (event.key !== 'Tab') return;

            if (event.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    event.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    event.preventDefault();
                    firstFocusable.focus();
                }
            }
        });

        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    /**
     * Handle backdrop click to close modal
     */
    function setupBackdropClose(modalElement) {
        if (!modalElement) return;
        
        modalElement.addEventListener('click', function(event) {
            if (event.target === modalElement) {
                closeModal(modalElement);
            }
        });
    }

    // ===========================================
    // AUTHENTICATION SYSTEM
    // ===========================================
    
    /**
     * Initialize authentication system
     */
    function initAuthSystem() {
        // Check login state
        const userData = retrieveData('currentUser');
        if (userData) {
            state.currentUser = userData;
            state.isLoggedIn = true;
            updateAuthUI();
        }

        // Login trigger
        if (elements.loginTrigger) {
            elements.loginTrigger.addEventListener('click', function(event) {
                event.preventDefault();
                openModal(elements.authModal);
            });
        }

        // Auth tabs switching
        const authTabs = getElements('.auth-tab');
        const authForms = getElements('.auth-form');

        authTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                
                // Update active tab
                authTabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                
                // Show corresponding form
                authForms.forEach(form => {
                    if (form.getAttribute('data-tab') === tabName) {
                        form.classList.add('active');
                        form.removeAttribute('hidden');
                    } else {
                        form.classList.remove('active');
                        form.setAttribute('hidden', 'true');
                    }
                });
            });
        });

        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }

        // Registration form submission
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegistration);
        }

        // Password reset form submission
        const resetForm = document.getElementById('resetForm');
        if (resetForm) {
            resetForm.addEventListener('submit', handlePasswordReset);
        }

        // Modal close buttons
        const modalCloseButtons = getElements('.modal-close');
        modalCloseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal-overlay');
                if (modal) closeModal(modal);
            });
        });

        // Setup backdrop close for all modals
        const modals = getElements('.modal-overlay');
        modals.forEach(modal => setupBackdropClose(modal));
    }

    /**
     * Handle login form submission
     */
    function handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail')?.value;
        const password = document.getElementById('loginPassword')?.value;
        const rememberMe = document.getElementById('rememberMe')?.checked;

        if (!email || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        // Mock login - in real app, this would be an API call
        const mockUser = {
            id: 'user_123',
            email: email,
            firstName: 'John',
            lastName: 'Doe',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80',
            subscription: 'free',
            joined: new Date().toISOString()
        };

        state.currentUser = mockUser;
        state.isLoggedIn = true;
        
        // Store user data
        if (rememberMe) {
            storeData('currentUser', mockUser);
        }

        // Update UI
        updateAuthUI();
        
        // Close modal
        closeModal(elements.authModal);
        
        showToast('Successfully logged in!', 'success');
    }

    /**
     * Handle registration form submission
     */
    function handleRegistration(event) {
        event.preventDefault();
        
        const firstName = document.getElementById('registerFirstName')?.value;
        const lastName = document.getElementById('registerLastName')?.value;
        const email = document.getElementById('registerEmail')?.value;
        const password = document.getElementById('registerPassword')?.value;
        const confirmPassword = document.getElementById('registerConfirmPassword')?.value;
        const acceptTerms = document.getElementById('acceptTerms')?.checked;

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (!acceptTerms) {
            showToast('Please accept the terms and conditions', 'error');
            return;
        }

        // Mock registration - in real app, this would be an API call
        const mockUser = {
            id: 'user_' + Date.now(),
            email: email,
            firstName: firstName,
            lastName: lastName,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80',
            subscription: 'free',
            joined: new Date().toISOString()
        };

        state.currentUser = mockUser;
        state.isLoggedIn = true;
        storeData('currentUser', mockUser);
        
        // Update UI
        updateAuthUI();
        
        // Switch to login tab
        const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
        if (loginTab) loginTab.click();
        
        showToast('Account created successfully!', 'success');
    }

    /**
     * Handle password reset
     */
    function handlePasswordReset(event) {
        event.preventDefault();
        
        const email = document.getElementById('resetEmail')?.value;
        
        if (!email) {
            showToast('Please enter your email address', 'error');
            return;
        }

        // Mock password reset
        showToast('Password reset link sent to your email', 'success');
        
        // Switch to login tab
        const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
        if (loginTab) loginTab.click();
    }

    /**
     * Update UI based on authentication state
     */
    function updateAuthUI() {
        const userActions = document.querySelector('.user-actions');
        const accountDropdown = document.getElementById('accountDropdown');
        const btnLogin = elements.loginTrigger;
        
        if (!userActions || !btnLogin) return;
        
        if (state.isLoggedIn && state.currentUser) {
            // Hide login button, show account dropdown
            btnLogin.style.display = 'none';
            
            if (accountDropdown) {
                accountDropdown.removeAttribute('hidden');
                
                // Update user info in dropdown
                const userName = accountDropdown.querySelector('.author-name');
                const userAvatar = accountDropdown.querySelector('.author-avatar');
                
                if (userName) {
                    userName.textContent = `${state.currentUser.firstName} ${state.currentUser.lastName}`;
                }
                
                if (userAvatar && state.currentUser.avatar) {
                    userAvatar.src = state.currentUser.avatar;
                    userAvatar.alt = `${state.currentUser.firstName}'s avatar`;
                }
                
                // Setup dropdown actions
                setupAccountDropdown();
            }
            
            // Enable submit story button
            if (elements.submitStoryTrigger) {
                elements.submitStoryTrigger.disabled = false;
                elements.submitStoryTrigger.title = 'Submit your story';
            }
        } else {
            // Show login button, hide account dropdown
            btnLogin.style.display = 'flex';
            
            if (accountDropdown) {
                accountDropdown.setAttribute('hidden', 'true');
            }
            
            // Disable submit story button
            if (elements.submitStoryTrigger) {
                elements.submitStoryTrigger.disabled = true;
                elements.submitStoryTrigger.title = 'Please login to submit a story';
            }
        }
    }

    /**
     * Setup account dropdown actions
     */
    function setupAccountDropdown() {
        const dropdownLinks = getElements('.dropdown-menu a');
        
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const action = this.getAttribute('data-action');
                
                switch (action) {
                    case 'dashboard':
                        showToast('Opening dashboard...', 'info');
                        // In real app, navigate to dashboard
                        break;
                    case 'profile':
                        showToast('Opening profile...', 'info');
                        // In real app, navigate to profile
                        break;
                    case 'saved':
                        showToast('Opening saved stories...', 'info');
                        // In real app, navigate to saved stories
                        break;
                    case 'subscription':
                        openModal(elements.paywallModal);
                        break;
                    case 'settings':
                        showToast('Opening settings...', 'info');
                        // In real app, navigate to settings
                        break;
                    case 'help':
                        showToast('Opening help center...', 'info');
                        // In real app, navigate to help
                        break;
                    case 'logout':
                        handleLogout();
                        break;
                }
            });
        });
    }

    /**
     * Handle user logout
     */
    function handleLogout() {
        state.currentUser = null;
        state.isLoggedIn = false;
        removeData('currentUser');
        updateAuthUI();
        showToast('Successfully logged out', 'success');
    }

    // ===========================================
    // ARTICLE SYSTEM
    // ===========================================
    
    /**
     * Initialize article system
     */
    function initArticleSystem() {
        // Setup story card clicks
        setupStoryCardClicks();
        
        // Setup article interactions
        setupArticleInteractions();
        
        // Load auto-fetched articles
        loadAutoFetchedArticles();
        
        // Setup load more functionality
        setupLoadMore();
        
        // Setup infinite scroll
        setupInfiniteScroll();
        
        // Setup reading progress
        setupReadingProgress();
        
        // Setup article submission
        setupArticleSubmission();
    }

    /**
     * Setup story card click handlers
     */
    function setupStoryCardClicks() {
        const storyCards = getElements('.story-card, .side-article, .pick-item, .read-item, .trending-item');
        
        storyCards.forEach(card => {
            card.addEventListener('click', function(event) {
                // Don't trigger if clicking interactive elements
                if (event.target.closest('.interaction-btn') || 
                    event.target.closest('.share-btn') ||
                    event.target.closest('a')) {
                    return;
                }
                
                const articleId = this.getAttribute('data-article-id');
                const articleType = this.getAttribute('data-article-type');
                
                if (articleId) {
                    openArticleReader(articleId, articleType);
                }
            });
        });
    }

    /**
     * Open article reader with content
     */
    function openArticleReader(articleId, articleType) {
        if (!elements.articleReaderModal) return;
        
        // Track in reading history
        if (state.isLoggedIn) {
            state.readingHistory.unshift({
                id: articleId,
                type: articleType,
                timestamp: new Date().toISOString()
            });
            
            // Keep only last 100 items
            if (state.readingHistory.length > 100) {
                state.readingHistory = state.readingHistory.slice(0, 100);
            }
            
            storeData('readingHistory', state.readingHistory);
        }
        
        // Show loading state
        const readerBody = document.getElementById('articleReaderBody');
        if (readerBody) {
            readerBody.innerHTML = `
                <div class="loading-indicator">
                    <div class="spinner"></div>
                    <p>Loading article...</p>
                </div>
            `;
        }
        
        // Open modal
        openModal(elements.articleReaderModal);
        
        // Load article content
        loadArticleContent(articleId, articleType);
    }

    /**
     * Load article content from mock data
     */
    function loadArticleContent(articleId, articleType) {
        // Mock article data - in real app, this would be an API call
        const mockArticles = {
            '1': {
                title: 'Weaving Legacy: How Grandmothers Are Preserving Ancient Crafts',
                category: 'Culture & Arts',
                author: 'Sarah Mwangi',
                authorTitle: 'Cultural Heritage Correspondent',
                authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b786d49f?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80',
                date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                content: `
                    <div class="reader-featured-image">
                        <img src="https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                             alt="Elderly woman teaching traditional basket weaving" 
                             loading="lazy">
                        <div class="image-caption">Elderly women passing down centuries-old weaving techniques to younger generations in remote villages.</div>
                    </div>
                    <div class="reader-content">
                        <p>In the sun-drenched villages of Mali, Kenya, and Ghana, a quiet revolution is taking place. Elderly women, their hands weathered by decades of work, are gathering under ancient baobab trees to teach their granddaughters the nearly-lost art of traditional basket weaving.</p>
                        
                        <p>These grandmothers are not just passing down techniques; they're preserving entire cultural histories woven into each pattern and design. "Every basket tells a story," says 78-year-old Aminata Diallo from a village in Mali. "The patterns represent our ancestors, our beliefs, and our connection to the land."</p>
                        
                        <h3>The Revival Movement</h3>
                        <p>What began as a cultural preservation effort has blossomed into an economic lifeline for many communities. Non-governmental organizations have partnered with these master weavers to create sustainable market access for their products.</p>
                        
                        <div class="reader-stats">
                            <div class="stat-item">
                                <span class="stat-number">500+</span>
                                <span class="stat-label">Master Weavers</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">3,000+</span>
                                <span class="stat-label">Apprentices Trained</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">12</span>
                                <span class="stat-label">Countries Involved</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">200%</span>
                                <span class="stat-label">Income Increase</span>
                            </div>
                        </div>
                        
                        <p>The revival has spread across 12 African countries, with over 500 master weavers now training more than 3,000 younger women. The economic impact has been significant, with many families doubling their household income through the sale of traditional crafts.</p>
                    </div>
                    <div class="reader-footer">
                        <div class="reader-tags">
                            <a href="#" class="tag">Traditional Crafts</a>
                            <a href="#" class="tag">Cultural Preservation</a>
                            <a href="#" class="tag">Women Empowerment</a>
                            <a href="#" class="tag">African Heritage</a>
                            <a href="#" class="tag">Sustainable Livelihoods</a>
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
                `,
                likes: 324,
                comments: 58,
                readingTime: '7 min read'
            }
            // More mock articles would be added in a real implementation
        };
        
        // Simulate API delay
        setTimeout(() => {
            const article = mockArticles[articleId] || getDefaultArticle();
            
            // Update modal content
            const titleEl = document.getElementById('articleReaderTitle');
            const bodyEl = document.getElementById('articleReaderBody');
            
            if (titleEl) {
                titleEl.textContent = article.title;
            }
            
            if (bodyEl) {
                bodyEl.innerHTML = article.content;
                
                // Setup interaction buttons in the reader
                setupReaderInteractions(articleId, article.likes, article.comments);
                
                // Setup comment system
                setupCommentSystem(articleId);
            }
            
            // Update metadata
            const categoryEl = elements.articleReaderModal.querySelector('.reader-category');
            const authorNameEl = elements.articleReaderModal.querySelector('.author-name');
            const authorTitleEl = elements.articleReaderModal.querySelector('.author-title');
            const authorAvatarEl = elements.articleReaderModal.querySelector('.author-avatar');
            const articleDateEl = elements.articleReaderModal.querySelector('.article-date');
            
            if (categoryEl) categoryEl.textContent = article.category;
            if (authorNameEl) authorNameEl.textContent = article.author;
            if (authorTitleEl) authorTitleEl.textContent = article.authorTitle;
            if (authorAvatarEl && article.authorAvatar) {
                authorAvatarEl.src = article.authorAvatar;
                authorAvatarEl.alt = `${article.author}'s avatar`;
            }
            if (articleDateEl) {
                articleDateEl.innerHTML = `<i class="far fa-clock"></i> ${formatTime(article.date)} • ${article.readingTime}`;
            }
            
            // Setup close button
            const closeBtn = elements.articleReaderModal.querySelector('.article-reader-close');
            if (closeBtn) {
                closeBtn.onclick = () => closeModal(elements.articleReaderModal);
            }
            
            // Setup backdrop close
            setupBackdropClose(elements.articleReaderModal);
            
        }, config.mockApiDelay);
    }

    /**
     * Get default article for fallback
     */
    function getDefaultArticle() {
        return {
            title: 'Article Not Found',
            category: 'General',
            author: 'Editorial Team',
            authorTitle: 'HMW Beyond Borders',
            content: '<p>This article could not be loaded. Please try again later.</p>',
            likes: 0,
            comments: 0,
            readingTime: '1 min read'
        };
    }

    /**
     * Setup reader interaction buttons
     */
    function setupReaderInteractions(articleId, initialLikes, initialComments) {
        const likeBtn = elements.articleReaderModal.querySelector('.reader-like');
        const commentBtn = elements.articleReaderModal.querySelector('.reader-comment');
        const shareBtn = elements.articleReaderModal.querySelector('.reader-share');
        
        // Like button
        if (likeBtn) {
            let liked = state.bookmarkedArticles.has(articleId);
            let likes = initialLikes;
            
            likeBtn.innerHTML = `<i class="${liked ? 'fas' : 'far'} fa-heart"></i><span>${likes} Likes</span>`;
            
            likeBtn.onclick = function() {
                liked = !liked;
                
                if (liked) {
                    state.bookmarkedArticles.add(articleId);
                    likes++;
                    showToast('Article liked!', 'success');
                } else {
                    state.bookmarkedArticles.delete(articleId);
                    likes--;
                    showToast('Like removed', 'info');
                }
                
                this.innerHTML = `<i class="${liked ? 'fas' : 'far'} fa-heart"></i><span>${likes} Likes</span>`;
                
                // Store bookmarks
                storeData('bookmarkedArticles', Array.from(state.bookmarkedArticles));
            };
        }
        
        // Comment button - scroll to comment section
        if (commentBtn) {
            commentBtn.onclick = function() {
                const commentSection = elements.articleReaderModal.querySelector('.comment-section');
                if (commentSection) {
                    commentSection.scrollIntoView({ behavior: 'smooth' });
                    const commentInput = commentSection.querySelector('textarea');
                    if (commentInput) commentInput.focus();
                }
            };
        }
        
        // Share button
        if (shareBtn) {
            shareBtn.onclick = function() {
                shareArticle(articleId);
            };
        }
    }

    /**
     * Setup article interactions (like, save, share)
     */
    function setupArticleInteractions() {
        // Event delegation for interaction buttons
        document.addEventListener('click', function(event) {
            const likeBtn = event.target.closest('.like-btn');
            const saveBtn = event.target.closest('.save-btn');
            const shareBtn = event.target.closest('.share-btn');
            const commentBtn = event.target.closest('.comment-btn');
            
            if (likeBtn) {
                handleLikeClick(likeBtn);
            }
            
            if (saveBtn) {
                handleSaveClick(saveBtn);
            }
            
            if (shareBtn) {
                handleShareClick(shareBtn);
            }
            
            if (commentBtn) {
                handleCommentClick(commentBtn);
            }
        });
    }

    /**
     * Handle like button click
     */
    function handleLikeClick(button) {
        const articleId = button.getAttribute('data-article-id');
        if (!articleId) return;
        
        const likeCount = button.querySelector('.like-count');
        const icon = button.querySelector('i');
        
        let currentLikes = parseInt(likeCount?.textContent || '0');
        let isLiked = icon?.classList.contains('fas');
        
        // Toggle like state
        isLiked = !isLiked;
        currentLikes = isLiked ? currentLikes + 1 : currentLikes - 1;
        
        // Update UI
        if (likeCount) likeCount.textContent = currentLikes;
        if (icon) {
            icon.className = isLiked ? 'fas fa-heart' : 'far fa-heart';
            icon.style.color = isLiked ? '#dc3545' : '';
        }
        
        // Show feedback
        showToast(isLiked ? 'Article liked!' : 'Like removed', isLiked ? 'success' : 'info');
        
        // In real app, send to API
        // mockApiCall('POST', `/articles/${articleId}/like`, { liked: isLiked });
    }

    /**
     * Handle save button click
     */
    function handleSaveClick(button) {
        const articleId = button.getAttribute('data-article-id');
        if (!articleId) return;
        
        const icon = button.querySelector('i');
        const isSaved = icon?.classList.contains('fas');
        
        // Toggle save state
        if (isSaved) {
            state.bookmarkedArticles.delete(articleId);
            if (icon) {
                icon.className = 'far fa-bookmark';
                icon.style.color = '';
            }
            showToast('Removed from saved articles', 'info');
        } else {
            state.bookmarkedArticles.add(articleId);
            if (icon) {
                icon.className = 'fas fa-bookmark';
                icon.style.color = '#004D99';
            }
            showToast('Article saved!', 'success');
        }
        
        // Store bookmarks
        storeData('bookmarkedArticles', Array.from(state.bookmarkedArticles));
    }

    /**
     * Handle share button click
     */
    function handleShareClick(button) {
        const articleId = button.getAttribute('data-article-id');
        shareArticle(articleId);
    }

    /**
     * Handle comment button click
     */
    function handleCommentClick(button) {
        const articleId = button.getAttribute('data-article-id');
        showToast('Opening comments...', 'info');
        // In real app, this would open comments for the specific article
    }

    /**
     * Share article functionality
     */
    function shareArticle(articleId) {
        const url = `${window.location.origin}/article/${articleId}`;
        const title = document.title;
        
        if (navigator.share) {
            // Use Web Share API if available
            navigator.share({
                title: title,
                url: url
            }).then(() => {
                showToast('Article shared successfully!', 'success');
            }).catch(error => {
                console.log('Share failed:', error);
                fallbackShare(url);
            });
        } else {
            fallbackShare(url);
        }
    }

    /**
     * Fallback share method
     */
    function fallbackShare(url) {
        // Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link copied to clipboard!', 'success');
        }).catch(() => {
            // Last resort - show URL
            prompt('Copy this link to share:', url);
        });
    }

    // ===========================================
    // COMMENT SYSTEM
    // ===========================================
    
    /**
     * Setup comment system for article reader
     */
    function setupCommentSystem(articleId) {
        const readerBody = document.getElementById('articleReaderBody');
        if (!readerBody) return;
        
        // Check if comment section already exists
        let commentSection = readerBody.querySelector('.comment-section');
        
        if (!commentSection) {
            // Create comment section
            commentSection = document.createElement('div');
            commentSection.className = 'comment-section';
            commentSection.innerHTML = `
                <div class="comment-header">
                    <h3><i class="fas fa-comments"></i> Comments</h3>
                    <span class="comment-count">0 comments</span>
                </div>
                <div class="comment-form">
                    <textarea placeholder="Share your thoughts..." rows="3"></textarea>
                    <div class="comment-form-actions">
                        <button class="btn-post-comment">Post Comment</button>
                        <button class="btn-cancel-comment">Cancel</button>
                    </div>
                </div>
                <div class="comments-list">
                    <div class="no-comments">
                        <i class="far fa-comment-alt"></i>
                        <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                </div>
            `;
            
            // Add to reader body
            const readerFooter = readerBody.querySelector('.reader-footer');
            if (readerFooter) {
                readerBody.insertBefore(commentSection, readerFooter);
            } else {
                readerBody.appendChild(commentSection);
            }
        }
        
        // Load existing comments
        loadComments(articleId, commentSection);
        
        // Setup comment form
        setupCommentForm(articleId, commentSection);
    }

    /**
     * Load comments for article
     */
    function loadComments(articleId, commentSection) {
        // Mock comments - in real app, fetch from API
        const mockComments = [
            {
                id: 'comment_1',
                author: 'James Kariuki',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80',
                content: 'This is such an inspiring story! We need more initiatives like this to preserve our cultural heritage.',
                timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                likes: 12
            },
            {
                id: 'comment_2',
                author: 'Amina Said',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b786d49f?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80',
                content: 'My grandmother was a weaver. This brings back so many memories. Thank you for sharing this beautiful story.',
                timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
                likes: 8
            }
        ];
        
        const commentsList = commentSection.querySelector('.comments-list');
        const commentCount = commentSection.querySelector('.comment-count');
        
        if (!commentsList || !commentCount) return;
        
        // Clear existing comments except "no comments" message
        const noComments = commentsList.querySelector('.no-comments');
        commentsList.innerHTML = '';
        if (noComments) {
            commentsList.appendChild(noComments);
        }
        
        // Add comments
        mockComments.forEach(comment => {
            const commentEl = createCommentElement(comment);
            commentsList.appendChild(commentEl);
        });
        
        // Update count
        commentCount.textContent = `${mockComments.length} comments`;
    }

    /**
     * Create comment element
     */
    function createCommentElement(comment) {
        const commentEl = document.createElement('div');
        commentEl.className = 'comment-item';
        commentEl.innerHTML = `
            <div class="comment-author">
                <img src="${comment.avatar}" alt="${comment.author}'s avatar" class="comment-avatar">
                <div class="comment-author-info">
                    <span class="comment-author-name">${comment.author}</span>
                    <span class="comment-time">${formatTime(comment.timestamp)}</span>
                </div>
            </div>
            <div class="comment-content">
                <p>${comment.content}</p>
            </div>
            <div class="comment-actions">
                <button class="comment-like" data-comment-id="${comment.id}">
                    <i class="far fa-heart"></i>
                    <span>${comment.likes}</span>
                </button>
                <button class="comment-reply">Reply</button>
            </div>
        `;
        
        return commentEl;
    }

    /**
     * Setup comment form
     */
    function setupCommentForm(articleId, commentSection) {
        const commentForm = commentSection.querySelector('.comment-form');
        const textarea = commentForm?.querySelector('textarea');
        const postBtn = commentForm?.querySelector('.btn-post-comment');
        const cancelBtn = commentForm?.querySelector('.btn-cancel-comment');
        
        if (!commentForm || !textarea || !postBtn) return;
        
        // Initially hide form if user is not logged in
        if (!state.isLoggedIn) {
            commentForm.style.display = 'none';
            textarea.placeholder = 'Please login to comment';
            return;
        }
        
        // Show form when textarea is clicked
        textarea.addEventListener('focus', function() {
            commentForm.classList.add('active');
        });
        
        // Post comment
        postBtn.addEventListener('click', function() {
            const content = textarea.value.trim();
            
            if (!content) {
                showToast('Please enter a comment', 'error');
                textarea.focus();
                return;
            }
            
            if (content.length > 1000) {
                showToast('Comment is too long (max 1000 characters)', 'error');
                return;
            }
            
            // Create new comment
            const newComment = {
                id: 'comment_' + Date.now(),
                author: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
                avatar: state.currentUser.avatar,
                content: content,
                timestamp: new Date().toISOString(),
                likes: 0
            };
            
            // Add to comments list
            const commentsList = commentSection.querySelector('.comments-list');
            const noComments = commentsList.querySelector('.no-comments');
            
            if (noComments) {
                noComments.remove();
            }
            
            const commentEl = createCommentElement(newComment);
            commentsList.insertBefore(commentEl, commentsList.firstChild);
            
            // Update comment count
            const commentCount = commentSection.querySelector('.comment-count');
            if (commentCount) {
                const currentCount = parseInt(commentCount.textContent) || 0;
                commentCount.textContent = `${currentCount + 1} comments`;
            }
            
            // Clear textarea
            textarea.value = '';
            commentForm.classList.remove('active');
            
            // Show success message
            showToast('Comment posted successfully!', 'success');
            
            // Update comment count in reader header
            const commentBtn = elements.articleReaderModal.querySelector('.reader-comment');
            if (commentBtn) {
                const countSpan = commentBtn.querySelector('span');
                if (countSpan) {
                    const currentCount = parseInt(countSpan.textContent) || 0;
                    countSpan.textContent = `${currentCount + 1} Comments`;
                }
            }
        });
        
        // Cancel comment
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                textarea.value = '';
                commentForm.classList.remove('active');
            });
        }
        
        // Handle comment likes
        commentSection.addEventListener('click', function(event) {
            const likeBtn = event.target.closest('.comment-like');
            if (likeBtn) {
                const commentId = likeBtn.getAttribute('data-comment-id');
                handleCommentLike(likeBtn, commentId);
            }
        });
    }

    /**
     * Handle comment like
     */
    function handleCommentLike(button, commentId) {
        const icon = button.querySelector('i');
        const countSpan = button.querySelector('span');
        
        let isLiked = icon.classList.contains('fas');
        let count = parseInt(countSpan.textContent) || 0;
        
        isLiked = !isLiked;
        count = isLiked ? count + 1 : count - 1;
        
        icon.className = isLiked ? 'fas fa-heart' : 'far fa-heart';
        icon.style.color = isLiked ? '#dc3545' : '';
        countSpan.textContent = count;
        
        // In real app, send to API
        // mockApiCall('POST', `/comments/${commentId}/like`, { liked: isLiked });
    }

    // ===========================================
    // CONTENT LOADING & INFINITE SCROLL
    // ===========================================
    
    /**
     * Load auto-fetched articles
     */
    function loadAutoFetchedArticles() {
        if (!elements.autoArticlesGrid || !elements.autoArticleTemplate) return;
        
        // Show loading state
        const placeholder = elements.autoArticlesGrid.querySelector('.api-placeholder');
        if (placeholder) {
            placeholder.innerHTML = `
                <div class="placeholder-content">
                    <div class="loading-indicator">
                        <div class="spinner"></div>
                        <p>Loading trending stories...</p>
                    </div>
                </div>
            `;
        }
        
        // Simulate API delay
        setTimeout(() => {
            loadMockAutoArticles();
        }, config.mockApiDelay);
        
        // Setup refresh button
        if (elements.refreshAutoStories) {
            elements.refreshAutoStories.addEventListener('click', function() {
                this.disabled = true;
                this.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
                
                setTimeout(() => {
                    loadMockAutoArticles();
                    this.disabled = false;
                    this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
                    showToast('Stories refreshed!', 'success');
                }, config.mockApiDelay);
            });
        }
    }

    /**
     * Load mock auto-fetched articles
     */
    function loadMockAutoArticles() {
        if (!elements.autoArticlesGrid || !elements.autoArticleTemplate) return;
        
        // Clear existing content except placeholder
        const placeholder = elements.autoArticlesGrid.querySelector('.api-placeholder');
        elements.autoArticlesGrid.innerHTML = '';
        if (placeholder) {
            elements.autoArticlesGrid.appendChild(placeholder);
        }
        
        // Mock auto-fetched articles
        const mockAutoArticles = [
            {
                id: 'auto_1',
                title: 'Climate Change: How African Farmers Are Adapting',
                excerpt: 'Innovative farming techniques helping communities withstand changing weather patterns.',
                category: 'Environment',
                author: 'Reuters',
                time: '45 min ago',
                source: 'Reuters',
                image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                id: 'auto_2',
                title: 'Tech Startup Raises $10M to Expand Across Africa',
                excerpt: 'Fintech company plans to bring digital banking to rural communities.',
                category: 'Technology',
                author: 'TechCrunch',
                time: '1 hour ago',
                source: 'TechCrunch',
                image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                id: 'auto_3',
                title: 'Ancient Manuscripts Discovered in Ethiopian Monastery',
                excerpt: 'Rare religious texts found in remote mountain monastery dating back 800 years.',
                category: 'History',
                author: 'BBC News',
                time: '2 hours ago',
                source: 'BBC',
                image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                id: 'auto_4',
                title: 'Women Entrepreneurs Breaking Barriers in North Africa',
                excerpt: 'New report shows significant growth in female-led businesses across the region.',
                category: 'Business',
                author: 'Forbes',
                time: '3 hours ago',
                source: 'Forbes',
                image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            }
        ];
        
        // Add articles to grid
        mockAutoArticles.forEach(article => {
            const template = elements.autoArticleTemplate.content.cloneNode(true);
            const articleCard = template.querySelector('.story-card');
            
            // Fill template with data
            articleCard.setAttribute('data-article-id', article.id);
            articleCard.setAttribute('data-article-type', 'auto');
            articleCard.setAttribute('data-api-source', article.source);
            
            const image = articleCard.querySelector('.story-image img');
            const category = articleCard.querySelector('.story-category');
            const title = articleCard.querySelector('.story-title');
            const excerpt = articleCard.querySelector('.story-excerpt');
            const author = articleCard.querySelector('.author');
            const time = articleCard.querySelector('.time-text');
            const source = articleCard.querySelector('.source-name');
            
            if (image) {
                image.src = article.image;
                image.alt = article.title;
            }
            if (category) category.textContent = article.category;
            if (title) title.textContent = article.title;
            if (excerpt) excerpt.textContent = article.excerpt;
            if (author) author.textContent = article.author;
            if (time) time.textContent = article.time;
            if (source) source.textContent = article.source;
            
            // Add to grid
            elements.autoArticlesGrid.appendChild(template);
            
            // Remove placeholder if it exists
            if (placeholder && placeholder.parentNode === elements.autoArticlesGrid) {
                placeholder.remove();
            }
        });
        
        // Setup click handlers for new articles
        setupStoryCardClicks();
        setupArticleInteractions();
    }

    /**
     * Setup load more functionality
     */
    function setupLoadMore() {
        if (!elements.loadMoreStories) return;
        
        elements.loadMoreStories.addEventListener('click', loadMoreStories);
    }

    /**
     * Load more stories
     */
    function loadMoreStories() {
        if (state.isLoading || !state.hasMoreStories) return;
        
        state.isLoading = true;
        
        // Show loading state
        elements.loadMoreStories.disabled = true;
        elements.loadMoreStories.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Loading...';
        
        if (elements.loadingIndicator) {
            elements.loadingIndicator.removeAttribute('hidden');
        }
        
        // Simulate API delay
        setTimeout(() => {
            appendMockStories();
            
            // Reset loading state
            state.isLoading = false;
            state.currentPage++;
            
            // Check if we should disable load more
            if (state.currentPage >= 3) { // Mock limit
                state.hasMoreStories = false;
                elements.loadMoreStories.style.display = 'none';
                showToast('All stories loaded!', 'info');
            } else {
                elements.loadMoreStories.disabled = false;
                elements.loadMoreStories.innerHTML = '<i class="fas fa-sync-alt"></i> Load More Stories';
            }
            
            if (elements.loadingIndicator) {
                elements.loadingIndicator.setAttribute('hidden', 'true');
            }
            
            showToast(`Loaded page ${state.currentPage}`, 'success');
        }, config.mockApiDelay);
    }

    /**
     * Append mock stories to grid
     */
    function appendMockStories() {
        if (!elements.manualArticlesGrid) return;
        
        const mockStories = [
            {
                id: `story_${Date.now()}_1`,
                title: 'The Art of Traditional Pottery in Rural Communities',
                excerpt: 'Ancient pottery techniques being preserved by master craftsmen across West Africa.',
                category: 'Culture & Arts',
                author: 'Cultural Desk',
                time: 'Just now',
                image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                id: `story_${Date.now()}_2`,
                title: 'Young Innovators Creating Sustainable Solutions',
                excerpt: 'Teenagers developing eco-friendly products to address local environmental challenges.',
                category: 'Innovation',
                author: 'Youth Desk',
                time: 'Just now',
                image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            }
        ];
        
        mockStories.forEach(story => {
            const storyCard = createStoryCard(story);
            elements.manualArticlesGrid.appendChild(storyCard);
        });
    }

    /**
     * Create story card element
     */
    function createStoryCard(story) {
        const card = document.createElement('article');
        card.className = 'story-card';
        card.setAttribute('data-article-id', story.id);
        card.setAttribute('data-article-type', 'manual');
        card.setAttribute('data-category', story.category.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-'));
        
        card.innerHTML = `
            <div class="story-image">
                <img src="${story.image}" alt="${story.title}" loading="lazy">
                <div class="story-badge">NEW</div>
            </div>
            <div class="story-content">
                <div class="story-category">${story.category}</div>
                <h3 class="story-title">${story.title}</h3>
                <p class="story-excerpt">${story.excerpt}</p>
                <div class="story-meta">
                    <div class="author-info">
                        <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=30&q=80" 
                             alt="${story.author}" 
                             class="author-thumb">
                        <span class="author">${story.author}</span>
                    </div>
                    <div class="meta-right">
                        <span class="time"><i class="far fa-clock"></i> ${story.time}</span>
                        <span class="read-time">3 min read</span>
                    </div>
                </div>
            </div>
            <div class="story-interaction">
                <button class="interaction-btn save-btn" data-article-id="${story.id}">
                    <i class="far fa-bookmark"></i>
                </button>
                <button class="interaction-btn share-btn" data-article-id="${story.id}">
                    <i class="fas fa-share-alt"></i>
                </button>
            </div>
        `;
        
        return card;
    }

    /**
     * Setup infinite scroll
     */
    function setupInfiniteScroll() {
        if (!elements.infiniteScrollTrigger) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !state.isLoading && state.hasMoreStories) {
                    loadMoreStories();
                }
            });
        }, {
            root: null,
            rootMargin: `${config.infiniteScrollThreshold}px`,
            threshold: 0.1
        });
        
        observer.observe(elements.infiniteScrollTrigger);
    }

    // ===========================================
    // READING PROGRESS
    // ===========================================
    
    /**
     * Setup reading progress indicator
     */
    function setupReadingProgress() {
        // Update progress on scroll
        window.addEventListener('scroll', throttle(updateReadingProgress, 100));
        
        // Also update on load
        updateReadingProgress();
    }

    /**
     * Update reading progress indicator
     */
    function updateReadingProgress() {
        const progressBars = getElements('.progress-fill');
        if (!progressBars.length) return;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Calculate scroll percentage
        const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
        
        // Update all progress bars
        progressBars.forEach(bar => {
            bar.style.width = `${Math.min(100, Math.max(0, scrollPercentage))}%`;
        });
        
        // Show/hide back to top button
        if (elements.backToTop) {
            if (scrollPercentage > 20) {
                elements.backToTop.classList.add('visible');
            } else {
                elements.backToTop.classList.remove('visible');
            }
        }
    }

    // ===========================================
    // ARTICLE SUBMISSION
    // ===========================================
    
    /**
     * Setup article submission
     */
    function setupArticleSubmission() {
        // Submit story triggers
        const submitTriggers = [
            elements.submitStoryTrigger,
            document.getElementById('sidebarSubmitStory'),
            document.getElementById('submitStoryLink')
        ];
        
        submitTriggers.forEach(trigger => {
            if (trigger) {
                trigger.addEventListener('click', function(event) {
                    event.preventDefault();
                    
                    if (!state.isLoggedIn) {
                        openModal(elements.authModal);
                        showToast('Please login to submit a story', 'warning');
                        return;
                    }
                    
                    openModal(elements.articleSubmissionModal);
                });
            }
        });
        
        // Setup submission form
        const submissionForm = document.getElementById('articleSubmissionForm');
        if (submissionForm) {
            submissionForm.addEventListener('submit', handleArticleSubmission);
            
            // Setup image upload
            const imageUploadArea = document.getElementById('imageUploadArea');
            const browseImages = document.getElementById('browseImages');
            const imageInput = document.getElementById('submissionImages');
            const imagePreview = document.getElementById('imagePreview');
            
            if (imageUploadArea && browseImages && imageInput) {
                // Click to browse
                browseImages.addEventListener('click', () => imageInput.click());
                
                // Drag and drop
                imageUploadArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    imageUploadArea.classList.add('drag-over');
                });
                
                imageUploadArea.addEventListener('dragleave', () => {
                    imageUploadArea.classList.remove('drag-over');
                });
                
                imageUploadArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    imageUploadArea.classList.remove('drag-over');
                    
                    if (e.dataTransfer.files.length) {
                        handleImageUpload(e.dataTransfer.files);
                    }
                });
                
                // File input change
                imageInput.addEventListener('change', (e) => {
                    if (e.target.files.length) {
                        handleImageUpload(e.target.files);
                    }
                });
            }
            
            // Setup editor buttons
            const editorBtns = submissionForm.querySelectorAll('.editor-btn');
            editorBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const command = this.getAttribute('data-command');
                    const contentField = document.getElementById('submissionContent');
                    
                    if (contentField && command) {
                        // Basic rich text commands
                        document.execCommand(command, false, null);
                        contentField.focus();
                    }
                });
            });
            
            // Setup preview button
            const previewBtn = submissionForm.querySelector('.btn-preview-article');
            if (previewBtn) {
                previewBtn.addEventListener('click', function() {
                    showToast('Article preview feature coming soon!', 'info');
                });
            }
            
            // Setup save draft button
            const saveDraftBtn = submissionForm.querySelector('.btn-save-draft');
            if (saveDraftBtn) {
                saveDraftBtn.addEventListener('click', function() {
                    saveArticleDraft();
                });
            }
        }
    }

    /**
     * Handle image upload for article submission
     */
    function handleImageUpload(files) {
        const imagePreview = document.getElementById('imagePreview');
        if (!imagePreview) return;
        
        Array.from(files).slice(0, 5).forEach(file => {
            if (!file.type.startsWith('image/')) {
                showToast('Please upload only image files', 'error');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showToast('Image size must be less than 5MB', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'image-preview-item';
                imgContainer.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button class="remove-image" type="button">&times;</button>
                `;
                
                imagePreview.appendChild(imgContainer);
                
                // Remove button
                imgContainer.querySelector('.remove-image').addEventListener('click', function() {
                    imgContainer.remove();
                });
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Save article draft
     */
    function saveArticleDraft() {
        const form = document.getElementById('articleSubmissionForm');
        if (!form) return;
        
        const formData = {
            title: document.getElementById('submissionTitle')?.value,
            category: document.getElementById('submissionCategory')?.value,
            excerpt: document.getElementById('submissionExcerpt')?.value,
            content: document.getElementById('submissionContent')?.value,
            tags: document.getElementById('submissionTags')?.value,
            author: document.getElementById('submissionAuthor')?.value,
            email: document.getElementById('submissionEmail')?.value,
            timestamp: new Date().toISOString()
        };
        
        storeData('articleDraft', formData);
        showToast('Draft saved successfully!', 'success');
    }

    /**
     * Handle article submission
     */
    function handleArticleSubmission(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        // Basic validation
        const requiredFields = ['submissionTitle', 'submissionCategory', 'submissionExcerpt', 'submissionContent'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                isValid = false;
                field.classList.add('error');
                showToast(`Please fill in ${field.previousElementSibling?.textContent || 'this field'}`, 'error');
            } else if (field) {
                field.classList.remove('error');
            }
        });
        
        if (!isValid) return;
        
        // Show loading state
        const submitBtn = form.querySelector('.btn-submit-article');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        }
        
        // Simulate API submission
        setTimeout(() => {
            // Reset form
            form.reset();
            
            // Clear image preview
            const imagePreview = document.getElementById('imagePreview');
            if (imagePreview) imagePreview.innerHTML = '';
            
            // Close modal
            closeModal(elements.articleSubmissionModal);
            
            // Show success message
            showToast('Story submitted successfully! Our editors will review it soon.', 'success');
            
            // Reset button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Submit Story';
            }
        }, 2000);
    }

    // ===========================================
    // NOTIFICATION SYSTEM
    // ===========================================
    
    /**
     * Initialize notification system
     */
    function initNotificationSystem() {
        // Check notification permission
        checkNotificationPermission();
        
        // Setup notification bell
        if (elements.notificationBell) {
            elements.notificationBell.addEventListener('click', showNotifications);
        }
        
        // Setup permission buttons
        if (elements.allowNotifications) {
            elements.allowNotifications.addEventListener('click', requestNotificationPermission);
        }
        
        if (elements.denyNotifications) {
            elements.denyNotifications.addEventListener('click', () => {
                if (elements.notificationPermission) {
                    elements.notificationPermission.setAttribute('hidden', 'true');
                }
                storeData(config.notificationPermissionKey, 'denied');
            });
        }
        
        // Load stored notifications
        loadStoredNotifications();
        
        // Mock notification updates
        setupMockNotifications();
    }

    /**
     * Check notification permission
     */
    function checkNotificationPermission() {
        const permission = retrieveData(config.notificationPermissionKey);
        
        if (permission === 'granted') {
            state.notificationsEnabled = true;
            if (elements.notificationPermission) {
                elements.notificationPermission.setAttribute('hidden', 'true');
            }
        } else if (permission === 'denied') {
            if (elements.notificationPermission) {
                elements.notificationPermission.setAttribute('hidden', 'true');
            }
        }
        // If permission is null, show the prompt
    }

    /**
     * Request notification permission
     */
    function requestNotificationPermission() {
        if (!('Notification' in window)) {
            showToast('Notifications not supported in this browser', 'error');
            return;
        }
        
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                state.notificationsEnabled = true;
                storeData(config.notificationPermissionKey, 'granted');
                
                if (elements.notificationPermission) {
                    elements.notificationPermission.setAttribute('hidden', 'true');
                }
                
                showToast('Notifications enabled!', 'success');
                
                // Create sample notification
                if (state.notificationsEnabled) {
                    new Notification('HMW Beyond Borders', {
                        body: 'Welcome! You\'ll now receive updates on inspiring stories.',
                        icon: '/favicon.ico'
                    });
                }
            } else {
                storeData(config.notificationPermissionKey, 'denied');
                showToast('Notifications disabled', 'info');
            }
        });
    }

    /**
     * Load stored notifications
     */
    function loadStoredNotifications() {
        const stored = retrieveData('userNotifications');
        if (stored && Array.isArray(stored)) {
            state.notifications = stored.slice(0, 50); // Limit to 50
        }
    }

    /**
     * Setup mock notifications
     */
    function setupMockNotifications() {
        // Add sample notifications
        if (state.notifications.length === 0) {
            state.notifications = [
                {
                    id: 'notif_1',
                    title: 'New Story Published',
                    message: 'Check out our latest feature on cultural heritage preservation',
                    time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    read: false,
                    type: 'story'
                },
                {
                    id: 'notif_2',
                    title: 'Comment Reply',
                    message: 'Someone replied to your comment on "Weaving Legacy"',
                    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    read: false,
                    type: 'comment'
                },
                {
                    id: 'notif_3',
                    title: 'Weekly Digest',
                    message: 'Your weekly inspiring stories digest is ready',
                    time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    read: true,
                    type: 'digest'
                }
            ];
            storeData('userNotifications', state.notifications);
        }
        
        // Update notification badge
        updateNotificationBadge();
        
        // Simulate new notifications
        setInterval(() => {
            // Random chance to add notification (10% chance every 5 minutes)
            if (Math.random() < 0.1 && state.notificationsEnabled) {
                addMockNotification();
            }
        }, 5 * 60 * 1000);
    }

    /**
     * Add mock notification
     */
    function addMockNotification() {
        const mockNotifs = [
            {
                title: 'Trending Now',
                message: 'Your story is trending in the Culture & Arts section',
                type: 'trending'
            },
            {
                title: 'New Follower',
                message: 'You have a new follower on HMW Beyond Borders',
                type: 'social'
            },
            {
                title: 'Editor\'s Pick',
                message: 'Your comment was featured as an Editor\'s Pick',
                type: 'achievement'
            }
        ];
        
        const notif = mockNotifs[Math.floor(Math.random() * mockNotifs.length)];
        const newNotification = {
            id: 'notif_' + Date.now(),
            title: notif.title,
            message: notif.message,
            time: new Date().toISOString(),
            read: false,
            type: notif.type
        };
        
        state.notifications.unshift(newNotification);
        
        // Keep only last 50 notifications
        if (state.notifications.length > 50) {
            state.notifications = state.notifications.slice(0, 50);
        }
        
        storeData('userNotifications', state.notifications);
        updateNotificationBadge();
        
        // Show browser notification if enabled
        if (state.notificationsEnabled && document.hidden) {
            new Notification(newNotification.title, {
                body: newNotification.message,
                icon: '/favicon.ico'
            });
        }
        
        // Show toast
        showToast(`New notification: ${newNotification.title}`, 'info');
    }

    /**
     * Update notification badge count
     */
    function updateNotificationBadge() {
        const badge = elements.notificationBell?.querySelector('.notification-badge');
        if (!badge) return;
        
        const unreadCount = state.notifications.filter(n => !n.read).length;
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount.toString();
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    /**
     * Show notifications dropdown
     */
    function showNotifications() {
        // Create or update notifications dropdown
        let dropdown = document.querySelector('.notifications-dropdown');
        
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.className = 'notifications-dropdown';
            dropdown.innerHTML = `
                <div class="notifications-header">
                    <h4>Notifications</h4>
                    <button class="mark-all-read">Mark all as read</button>
                </div>
                <div class="notifications-list"></div>
                <div class="notifications-footer">
                    <a href="#">View all notifications</a>
                </div>
            `;
            
            document.body.appendChild(dropdown);
            
            // Position near bell
            const bellRect = elements.notificationBell.getBoundingClientRect();
            dropdown.style.top = `${bellRect.bottom + window.scrollY + 10}px`;
            dropdown.style.right = `${window.innerWidth - bellRect.right}px`;
            
            // Mark all as read
            dropdown.querySelector('.mark-all-read').addEventListener('click', markAllNotificationsRead);
            
            // Close on outside click
            document.addEventListener('click', function closeDropdown(event) {
                if (!dropdown.contains(event.target) && event.target !== elements.notificationBell) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        }
        
        // Populate notifications
        const list = dropdown.querySelector('.notifications-list');
        list.innerHTML = '';
        
        if (state.notifications.length === 0) {
            list.innerHTML = '<div class="no-notifications">No notifications yet</div>';
        } else {
            state.notifications.slice(0, 10).forEach(notif => {
                const notifEl = document.createElement('div');
                notifEl.className = `notification-item ${notif.read ? 'read' : 'unread'}`;
                notifEl.innerHTML = `
                    <div class="notification-icon">
                        <i class="fas fa-${getNotificationIcon(notif.type)}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notif.title}</div>
                        <div class="notification-message">${notif.message}</div>
                        <div class="notification-time">${formatTime(notif.time)}</div>
                    </div>
                `;
                
                notifEl.addEventListener('click', () => markNotificationRead(notif.id));
                list.appendChild(notifEl);
            });
        }
    }

    /**
     * Get icon for notification type
     */
    function getNotificationIcon(type) {
        const icons = {
            story: 'newspaper',
            comment: 'comment',
            digest: 'envelope',
            trending: 'fire',
            social: 'user-friends',
            achievement: 'award'
        };
        return icons[type] || 'bell';
    }

    /**
     * Mark notification as read
     */
    function markNotificationRead(notificationId) {
        const notif = state.notifications.find(n => n.id === notificationId);
        if (notif && !notif.read) {
            notif.read = true;
            storeData('userNotifications', state.notifications);
            updateNotificationBadge();
        }
    }

    /**
     * Mark all notifications as read
     */
    function markAllNotificationsRead() {
        state.notifications.forEach(notif => notif.read = true);
        storeData('userNotifications', state.notifications);
        updateNotificationBadge();
        showToast('All notifications marked as read', 'success');
    }

    // ===========================================
    // COOKIE CONSENT
    // ===========================================
    
    /**
     * Initialize cookie consent
     */
    function initCookieConsent() {
        const consent = retrieveData(config.cookieConsentKey);
        
        if (consent === null) {
            // Show cookie consent after delay
            setTimeout(() => {
                if (elements.cookieConsent) {
                    elements.cookieConsent.classList.add('show');
                }
            }, 2000);
        }
        
        // Accept cookies
        if (elements.acceptCookies) {
            elements.acceptCookies.addEventListener('click', () => {
                storeData(config.cookieConsentKey, 'accepted');
                if (elements.cookieConsent) {
                    elements.cookieConsent.classList.remove('show');
                }
                showToast('Cookie preferences saved', 'success');
            });
        }
        
        // Reject non-essential cookies
        if (elements.rejectCookies) {
            elements.rejectCookies.addEventListener('click', () => {
                storeData(config.cookieConsentKey, 'rejected');
                if (elements.cookieConsent) {
                    elements.cookieConsent.classList.remove('show');
                }
                showToast('Non-essential cookies rejected', 'info');
            });
        }
        
        // Settings button
        const settingsBtn = document.getElementById('cookieSettings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                showToast('Cookie settings panel coming soon!', 'info');
            });
        }
    }

    // ===========================================
    // THEME SYSTEM
    // ===========================================
    
    /**
     * Initialize theme system
     */
    function initThemeSystem() {
        // Load saved theme
        const savedTheme = retrieveData(config.themeKey) || 'light';
        state.theme = savedTheme;
        
        // Apply theme
        applyTheme(state.theme);
        
        // Setup theme toggle
        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', toggleTheme);
            updateThemeIcon();
        }
    }

    /**
     * Toggle between light and dark theme
     */
    function toggleTheme() {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        applyTheme(state.theme);
        storeData(config.themeKey, state.theme);
        updateThemeIcon();
        showToast(`${state.theme === 'dark' ? 'Dark' : 'Light'} theme activated`, 'success');
    }

    /**
     * Apply theme to document
     */
    function applyTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');
    }

    /**
     * Update theme toggle icon
     */
    function updateThemeIcon() {
        if (!elements.themeToggle) return;
        
        const icon = elements.themeToggle.querySelector('i');
        if (icon) {
            icon.className = state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // ===========================================
    // LIVE UPDATES & CHAT
    // ===========================================
    
    /**
     * Initialize live updates system
     */
    function initLiveUpdates() {
        // Setup live feed auto-scroll
        if (elements.liveFeed) {
            setupLiveFeedScroll();
        }
        
        // Setup pause/play for live feed
        if (elements.pauseLive) {
            let isPaused = false;
            
            elements.pauseLive.addEventListener('click', function() {
                isPaused = !isPaused;
                
                if (isPaused) {
                    this.innerHTML = '<i class="fas fa-play"></i> Resume Updates';
                    this.classList.remove('btn-pause-live');
                    this.classList.add('btn-resume-live');
                } else {
                    this.innerHTML = '<i class="fas fa-pause"></i> Pause Updates';
                    this.classList.remove('btn-resume-live');
                    this.classList.add('btn-pause-live');
                }
                
                showToast(isPaused ? 'Updates paused' : 'Updates resumed', 'info');
            });
        }
        
        // Setup live chat
        setupLiveChat();
        
        // Simulate live updates
        simulateLiveUpdates();
    }

    /**
     * Setup live feed auto-scroll
     */
    function setupLiveFeedScroll() {
        if (!elements.liveFeed) return;
        
        let isUserScrolling = false;
        let scrollTimeout;
        
        elements.liveFeed.addEventListener('scroll', function() {
            isUserScrolling = true;
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isUserScrolling = false;
            }, 2000);
        });
        
        // Auto-scroll to bottom when new content added
        const observer = new MutationObserver(() => {
            if (!isUserScrolling) {
                elements.liveFeed.scrollTop = elements.liveFeed.scrollHeight;
            }
        });
        
        observer.observe(elements.liveFeed, { childList: true, subtree: true });
    }

    /**
     * Simulate live updates
     */
    function simulateLiveUpdates() {
        const liveUpdates = [
            "Cultural festival in Senegal breaks attendance records",
            "New archaeological discovery in Ethiopia unveiled",
            "Women's entrepreneurship conference announces keynote speakers",
            "Traditional music ensemble performs at international festival",
            "Community conservation project receives UN recognition"
        ];
        
        // Add initial updates
        liveUpdates.forEach((update, index) => {
            setTimeout(() => {
                addLiveUpdate(update);
            }, index * 30000); // Every 30 seconds
        });
        
        // Continue adding updates periodically
        setInterval(() => {
            const updates = [
                "Breaking: Cultural heritage site restoration completed",
                "Update: Women leaders summit day 2 highlights",
                "Live: Traditional craft workshop in progress",
                "New: Documentary series on African history announced",
                "Trending: Indigenous language preservation initiative"
            ];
            
            const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
            addLiveUpdate(randomUpdate);
        }, 120000); // Every 2 minutes
    }

    /**
     * Add live update to feed
     */
    function addLiveUpdate(text) {
        if (!elements.liveFeed) return;
        
        const update = document.createElement('div');
        update.className = 'update-item';
        update.innerHTML = `
            <span class="update-time">${formatTime(new Date())}</span>
            <span class="update-text">${text}</span>
            <span class="update-badge">LIVE</span>
        `;
        
        elements.liveFeed.appendChild(update);
        
        // Limit to 20 updates
        const updates = elements.liveFeed.querySelectorAll('.update-item');
        if (updates.length > 20) {
            updates[0].remove();
        }
    }

    /**
     * Setup live chat functionality
     */
    function setupLiveChat() {
        const chatToggle = document.getElementById('chatToggle');
        if (!chatToggle) return;
        
        let chatOpen = false;
        
        chatToggle.addEventListener('click', function() {
            chatOpen = !chatOpen;
            
            if (chatOpen) {
                openLiveChat();
            } else {
                closeLiveChat();
            }
        });
        
        // Mock chat messages
        state.liveChatMessages = [
            { user: 'Visitor_23', message: 'This story is amazing!', time: '14:30' },
            { user: 'Culture_Lover', message: 'Does anyone know when the next cultural festival is?', time: '14:32' },
            { user: 'Admin', message: 'Welcome to the live chat! Feel free to discuss the stories.', time: '14:35' }
        ];
    }

    /**
     * Open live chat widget
     */
    function openLiveChat() {
        // Create chat widget if it doesn't exist
        let chatWidget = document.querySelector('.live-chat-widget');
        
        if (!chatWidget) {
            chatWidget = document.createElement('div');
            chatWidget.className = 'live-chat-widget';
            chatWidget.innerHTML = `
                <div class="chat-header">
                    <h4><i class="fas fa-comments"></i> Live Chat</h4>
                    <button class="chat-close">&times;</button>
                </div>
                <div class="chat-messages"></div>
                <div class="chat-input">
                    <input type="text" placeholder="Type your message..." maxlength="200">
                    <button class="chat-send">Send</button>
                </div>
            `;
            
            document.body.appendChild(chatWidget);
            
            // Close button
            chatWidget.querySelector('.chat-close').addEventListener('click', closeLiveChat);
            
            // Send button
            const sendBtn = chatWidget.querySelector('.chat-send');
            const input = chatWidget.querySelector('input');
            
            sendBtn.addEventListener('click', sendChatMessage);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendChatMessage();
            });
            
            // Load messages
            loadChatMessages();
        }
        
        chatWidget.classList.add('open');
        state.liveChatActive = true;
        
        // Focus input
        const input = chatWidget.querySelector('input');
        if (input) input.focus();
    }

    /**
     * Close live chat widget
     */
    function closeLiveChat() {
        const chatWidget = document.querySelector('.live-chat-widget');
        if (chatWidget) {
            chatWidget.classList.remove('open');
        }
        state.liveChatActive = false;
    }

    /**
     * Load chat messages
     */
    function loadChatMessages() {
        const chatWidget = document.querySelector('.live-chat-widget');
        if (!chatWidget) return;
        
        const messagesContainer = chatWidget.querySelector('.chat-messages');
        if (!messagesContainer) return;
        
        messagesContainer.innerHTML = '';
        
        state.liveChatMessages.forEach(msg => {
            const msgEl = document.createElement('div');
            msgEl.className = 'chat-message';
            msgEl.innerHTML = `
                <div class="chat-user">${msg.user}</div>
                <div class="chat-text">${msg.message}</div>
                <div class="chat-time">${msg.time}</div>
            `;
            messagesContainer.appendChild(msgEl);
        });
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Send chat message
     */
    function sendChatMessage() {
        const chatWidget = document.querySelector('.live-chat-widget');
        if (!chatWidget) return;
        
        const input = chatWidget.querySelector('input');
        const messagesContainer = chatWidget.querySelector('.chat-messages');
        
        if (!input || !messagesContainer || !input.value.trim()) return;
        
        // Create message
        const message = {
            user: state.isLoggedIn ? state.currentUser.firstName : 'Guest',
            message: input.value.trim(),
            time: formatTime(new Date())
        };
        
        // Add to messages
        state.liveChatMessages.push(message);
        
        // Keep only last N messages
        if (state.liveChatMessages.length > config.maxLiveChatMessages) {
            state.liveChatMessages.shift();
        }
        
        // Add to UI
        const msgEl = document.createElement('div');
        msgEl.className = 'chat-message';
        msgEl.innerHTML = `
            <div class="chat-user">${message.user}</div>
            <div class="chat-text">${message.message}</div>
            <div class="chat-time">${message.time}</div>
        `;
        messagesContainer.appendChild(msgEl);
        
        // Clear input
        input.value = '';
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Mock reply (in real app, this would be from server)
        setTimeout(() => {
            const replies = [
                "Thanks for sharing!",
                "Interesting perspective!",
                "Has anyone else experienced this?",
                "Great discussion everyone!",
                "Check out our related story on this topic"
            ];
            
            const reply = {
                user: 'Community_Helper',
                message: replies[Math.floor(Math.random() * replies.length)],
                time: formatTime(new Date())
            };
            
            state.liveChatMessages.push(reply);
            
            const replyEl = document.createElement('div');
            replyEl.className = 'chat-message';
            replyEl.innerHTML = `
                <div class="chat-user">${reply.user}</div>
                <div class="chat-text">${reply.message}</div>
                <div class="chat-time">${reply.time}</div>
            `;
            messagesContainer.appendChild(replyEl);
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000 + Math.random() * 2000);
    }

    // ===========================================
    // MONETIZATION & PAYWALL
    // ===========================================
    
    /**
     * Initialize monetization system
     */
    function initMonetization() {
        // Setup subscribe trigger
        if (elements.subscribeTrigger) {
            elements.subscribeTrigger.addEventListener('click', function(event) {
                event.preventDefault();
                openModal(elements.paywallModal);
            });
        }
        
        // Setup paywall login link
        const paywallLogin = document.getElementById('paywallLogin');
        if (paywallLogin) {
            paywallLogin.addEventListener('click', function(event) {
                event.preventDefault();
                closeModal(elements.paywallModal);
                openModal(elements.authModal);
            });
        }
        
        // Setup subscription plan selection
        const planButtons = getElements('.btn-plan-select');
        planButtons.forEach(button => {
            button.addEventListener('click', function() {
                const plan = this.getAttribute('data-plan');
                handleSubscription(plan);
            });
        });
        
        // Setup donation
        const donateToggle = document.getElementById('donateToggle');
        if (donateToggle) {
            donateToggle.addEventListener('click', showDonationModal);
        }
        
        // Track ad impressions
        trackAdImpressions();
    }

    /**
     * Handle subscription selection
     */
    function handleSubscription(plan) {
        if (!state.isLoggedIn) {
            closeModal(elements.paywallModal);
            openModal(elements.authModal);
            showToast('Please login to subscribe', 'warning');
            return;
        }
        
        // Mock subscription process
        showToast(`Processing ${plan} subscription...`, 'info');
        
        // Simulate payment processing
        setTimeout(() => {
            closeModal(elements.paywallModal);
            showToast('Subscription successful! Thank you for supporting independent journalism.', 'success');
            
            // Update user subscription
            if (state.currentUser) {
                state.currentUser.subscription = plan;
                storeData('currentUser', state.currentUser);
            }
        }, 2000);
    }

    /**
     * Show donation modal
     */
    function showDonationModal() {
        showToast('Donation feature coming soon!', 'info');
        // In real implementation, this would open a donation modal
    }

    /**
     * Track ad impressions
     */
    function trackAdImpressions() {
        // Mock ad tracking
        const ads = getElements('.ad-content');
        ads.forEach((ad, index) => {
            // Simulate impression after ad comes into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        console.log(`Ad ${index + 1} impression tracked`);
                        // In real app, send to analytics
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(ad);
        });
    }

    // ===========================================
    // NAVIGATION & SEARCH
    // ===========================================
    
    /**
     * Initialize navigation system
     */
    function initNavigation() {
        // Setup mobile hamburger menu
        if (elements.hamburgerMenu) {
            elements.hamburgerMenu.addEventListener('click', toggleMobileMenu);
        }
        
        // Setup search functionality
        initSearchSystem();
        
        // Setup back to top buttons
        setupBackToTop();
        
        // Setup mega menu hover
        if (elements.megaMenu) {
            const moreCategories = document.getElementById('moreCategories');
            if (moreCategories) {
                moreCategories.addEventListener('mouseenter', () => {
                    elements.megaMenu.style.display = 'block';
                });
                
                moreCategories.addEventListener('mouseleave', () => {
                    setTimeout(() => {
                        if (!elements.megaMenu.matches(':hover')) {
                            elements.megaMenu.style.display = 'none';
                        }
                    }, 200);
                });
                
                elements.megaMenu.addEventListener('mouseleave', () => {
                    elements.megaMenu.style.display = 'none';
                });
            }
        }
        
        // Setup mobile bottom nav
        if (elements.mobileBottomNav) {
            document.body.classList.add('has-mobile-nav');
            setupMobileBottomNav();
        }
    }

    /**
     * Toggle mobile menu
     */
    function toggleMobileMenu() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        
        // Toggle hamburger animation
        this.classList.toggle('active');
        
        // In real implementation, this would show/hide mobile menu
        showToast('Mobile menu toggled', 'info');
    }

    /**
     * Initialize search system
     */
    function initSearchSystem() {
        // Search toggle
        if (elements.searchToggle) {
            elements.searchToggle.addEventListener('click', () => {
                if (elements.searchOverlay) {
                    elements.searchOverlay.classList.add('active');
                    if (elements.searchInputFull) {
                        elements.searchInputFull.focus();
                    }
                }
            });
        }
        
        // Mobile search
        const mobileSearchToggle = document.querySelector('.search-mobile');
        if (mobileSearchToggle) {
            mobileSearchToggle.addEventListener('click', () => {
                if (elements.mobileSearch) {
                    elements.mobileSearch.style.display = 'block';
                    const input = elements.mobileSearch.querySelector('input');
                    if (input) input.focus();
                }
            });
        }
        
        // Close search buttons
        const closeButtons = [
            elements.searchOverlay?.querySelector('.search-close'),
            elements.mobileSearch?.querySelector('.mobile-search-close')
        ];
        
        closeButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', closeAllSearch);
            }
        });
        
        // Search input handling
        if (elements.searchInputFull) {
            elements.searchInputFull.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch(elements.searchInputFull.value);
                }
            });
            
            const searchBtn = elements.searchOverlay?.querySelector('.search-button-full');
            if (searchBtn) {
                searchBtn.addEventListener('click', () => {
                    performSearch(elements.searchInputFull.value);
                });
            }
        }
        
        // Search suggestions
        const suggestionTags = getElements('.suggestion-tags a');
        suggestionTags.forEach(tag => {
            tag.addEventListener('click', function(event) {
                event.preventDefault();
                const searchTerm = this.textContent.replace('#', '');
                performSearch(searchTerm);
            });
        });
    }

    /**
     * Close all search overlays
     */
    function closeAllSearch() {
        if (elements.searchOverlay) {
            elements.searchOverlay.classList.remove('active');
        }
        if (elements.mobileSearch) {
            elements.mobileSearch.style.display = 'none';
        }
    }

    /**
     * Perform search
     */
    function performSearch(query) {
        if (!query.trim()) return;
        
        closeAllSearch();
        showToast(`Searching for: ${query}`, 'info');
        
        // In real implementation, this would navigate to search results
        // window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }

    /**
     * Setup back to top functionality
     */
    function setupBackToTop() {
        const backToTopButtons = [
            elements.backToTop,
            elements.backToTopFooter,
            elements.backToTopSidebar
        ];
        
        backToTopButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', scrollToTop);
            }
        });
        
        // Show/hide on scroll
        window.addEventListener('scroll', throttle(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (elements.backToTop) {
                if (scrollTop > 300) {
                    elements.backToTop.classList.add('visible');
                } else {
                    elements.backToTop.classList.remove('visible');
                }
            }
        }, 200));
    }

    /**
     * Scroll to top of page
     */
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    /**
     * Setup mobile bottom navigation
     */
    function setupMobileBottomNav() {
        const navItems = elements.mobileBottomNav.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', function(event) {
                // Remove active class from all items
                navItems.forEach(navItem => navItem.classList.remove('active'));
                
                // Add active class to clicked item
                this.classList.add('active');
                
                // Handle special cases
                if (this.classList.contains('search-mobile')) {
                    event.preventDefault();
                    if (elements.mobileSearch) {
                        elements.mobileSearch.style.display = 'block';
                        const input = elements.mobileSearch.querySelector('input');
                        if (input) input.focus();
                    }
                }
            });
        });
    }

    // ===========================================
    // UTILITY BAR FUNCTIONS
    // ===========================================
    
    /**
     * Initialize utility bar functions
     */
    function initUtilityBar() {
        // Update live clock
        updateLiveClock();
        setInterval(updateLiveClock, 60000); // Update every minute
        
        // Update date
        updateCurrentDate();
        
        // Setup weather widget
        setupWeatherWidget();
        
        // Setup language selector
        setupLanguageSelector();
        
        // Setup trending topics auto-scroll
        setupTrendingTopicsScroll();
    }

    /**
     * Update live clock
     */
    function updateLiveClock() {
        if (elements.currentTime) {
            const now = new Date();
            elements.currentTime.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
    }

    /**
     * Update current date
     */
    function updateCurrentDate() {
        if (elements.currentDate) {
            const now = new Date();
            elements.currentDate.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    /**
     * Setup weather widget
     */
    function setupWeatherWidget() {
        if (!elements.weatherWidget) return;
        
        // Mock weather data - in real app, fetch from API
        const mockWeather = {
            temp: '24°C',
            location: 'Nairobi',
            condition: 'Sunny'
        };
        
        elements.weatherWidget.innerHTML = `
            <i class="fas fa-cloud-sun"></i>
            <div class="weather-info">
                <span class="weather-temp">${mockWeather.temp}</span>
                <span class="weather-location">${mockWeather.location}</span>
            </div>
        `;
        
        // Refresh weather on click
        elements.weatherWidget.addEventListener('click', function() {
            showToast('Refreshing weather...', 'info');
            // In real app, this would fetch fresh weather data
        });
    }

    /**
     * Setup language selector
     */
    function setupLanguageSelector() {
        const languageSelect = document.querySelector('.language-dropdown');
        if (!languageSelect) return;
        
        // Load saved language preference
        const savedLanguage = retrieveData('language_preference') || 'en';
        languageSelect.value = savedLanguage;
        
        languageSelect.addEventListener('change', function() {
            const language = this.value;
            storeData('language_preference', language);
            showToast(`Language changed to ${this.options[this.selectedIndex].text}`, 'success');
            
            // In real app, this would reload the page with new language
            // window.location.href = `/${language}${window.location.pathname}`;
        });
    }

    /**
     * Setup trending topics auto-scroll
     */
    function setupTrendingTopicsScroll() {
        const scroller = document.querySelector('.topics-scroller');
        if (!scroller) return;
        
        // Clone content for seamless scroll
        const content = scroller.innerHTML;
        scroller.innerHTML = content + content;
        
        // Pause on hover
        scroller.addEventListener('mouseenter', () => {
            scroller.style.animationPlayState = 'paused';
        });
        
        scroller.addEventListener('mouseleave', () => {
            scroller.style.animationPlayState = 'running';
        });
    }

    // ===========================================
    // FEEDBACK & ENGAGEMENT
    // ===========================================
    
    /**
     * Initialize feedback system
     */
    function initFeedback() {
        // Feedback toggle
        const feedbackToggle = document.getElementById('feedbackToggle');
        if (feedbackToggle) {
            feedbackToggle.addEventListener('click', showFeedbackModal);
        }
        
        // Share toggle
        const shareToggle = document.getElementById('shareToggle');
        if (shareToggle) {
            shareToggle.addEventListener('click', showShareOptions);
        }
        
        // Poll interactions
        setupPollInteractions();
        
        // Newsletter signup
        setupNewsletterSignup();
    }

    /**
     * Show feedback modal
     */
    function showFeedbackModal() {
        showToast('Feedback feature coming soon!', 'info');
        // In real implementation, this would open a feedback modal
    }

    /**
     * Show share options
     */
    function showShareOptions() {
        const url = window.location.href;
        const title = document.title;
        
        if (navigator.share) {
            navigator.share({
                title: title,
                url: url
            }).then(() => {
                showToast('Shared successfully!', 'success');
            }).catch(error => {
                console.log('Share failed:', error);
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(url).then(() => {
                showToast('Link copied to clipboard!', 'success');
            });
        }
    }

    /**
     * Setup poll interactions
     */
    function setupPollInteractions() {
        const pollOptions = getElements('.poll-option');
        pollOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove active class from all options in this poll
                const poll = this.closest('.poll-content, .poll-question');
                if (poll) {
                    const allOptions = poll.querySelectorAll('.poll-option');
                    allOptions.forEach(opt => opt.classList.remove('active'));
                }
                
                // Add active class to clicked option
                this.classList.add('active');
                
                // Show thank you message
                showToast('Thank you for voting!', 'success');
                
                // In real app, send vote to server
                const pollId = this.closest('.live-poll, .quick-poll')?.id;
                if (pollId) {
                    // mockApiCall('POST', `/polls/${pollId}/vote`, { option: this.textContent });
                }
            });
        });
    }

    /**
     * Setup newsletter signup
     */
    function setupNewsletterSignup() {
        const newsletterForms = getElements('.newsletter-form');
        
        newsletterForms.forEach(form => {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                
                const emailInput = this.querySelector('input[type="email"]');
                if (!emailInput || !emailInput.value.trim()) {
                    showToast('Please enter your email address', 'error');
                    return;
                }
                
                // Mock subscription
                showToast('Subscribing to newsletter...', 'info');
                
                setTimeout(() => {
                    emailInput.value = '';
                    showToast('Successfully subscribed to newsletter!', 'success');
                }, 1000);
            });
        });
    }

    // ===========================================
    // ERROR HANDLING & LOGGING
    // ===========================================
    
    /**
     * Initialize error handling
     */
    function initErrorHandling() {
        // Global error handler
        window.addEventListener('error', function(event) {
            console.error('Global error:', event.error);
            showToast('An unexpected error occurred', 'error');
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', function(event) {
            console.error('Unhandled promise rejection:', event.reason);
            showToast('An operation failed', 'error');
        });
        
        // Log page errors to console (in real app, send to analytics)
        console.log('HMW Beyond Borders - JavaScript initialized');
    }

    // ===========================================
    // INITIALIZATION
    // ===========================================
    
    /**
     * Initialize all systems
     */
    function init() {
        try {
            // Load saved state
            loadSavedState();
            
            // Initialize systems in order
            initErrorHandling();
            initCookieConsent();
            initThemeSystem();
            initUtilityBar();
            initNavigation();
            initAuthSystem();
            initArticleSystem();
            initNotificationSystem();
            initLiveUpdates();
            initMonetization();
            initFeedback();
            
            // Setup lazy loading for images
            setupLazyLoading();
            
            // Setup performance monitoring
            setupPerformanceMonitoring();
            
            // Show welcome message
            setTimeout(() => {
                showToast('Welcome to HMW Beyond Borders!', 'info');
            }, 1000);
            
            console.log('HMW Beyond Borders - Initialization complete');
            
        } catch (error) {
            console.error('Initialization error:', error);
            showToast('Failed to initialize page features', 'error');
        }
    }

    /**
     * Load saved application state
     */
    function loadSavedState() {
        // Load bookmarked articles
        const bookmarks = retrieveData('bookmarkedArticles');
        if (bookmarks && Array.isArray(bookmarks)) {
            state.bookmarkedArticles = new Set(bookmarks);
        }
        
        // Load reading history
        const history = retrieveData('readingHistory');
        if (history && Array.isArray(history)) {
            state.readingHistory = history;
        }
        
        // Apply bookmarks to UI
        applyBookmarksToUI();
    }

    /**
     * Apply saved bookmarks to UI
     */
    function applyBookmarksToUI() {
        // This would update bookmark buttons to show saved state
        // Implementation depends on when articles are loaded
    }

    /**
     * Setup lazy loading for images
     */
    function setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const lazyImages = getElements('img[loading="lazy"]');
            
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    /**
     * Setup performance monitoring
     */
    function setupPerformanceMonitoring() {
        // Log page load performance
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const perfData = window.performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log(`Page loaded in ${perfData.domContentLoadedEventEnd - perfData.fetchStart}ms`);
                }
            }
        });
    }

    // ===========================================
    // MOCK API FUNCTION (FOR DEMONSTRATION)
    // ===========================================
    
    /**
     * Mock API call function
     */
    async function mockApiCall(method, endpoint, data = null) {
        console.log(`Mock API: ${method} ${endpoint}`, data);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, config.mockApiDelay));
        
        // Return mock response based on endpoint
        switch (endpoint) {
            case '/articles':
                return {
                    success: true,
                    data: [],
                    pagination: { page: 1, totalPages: 3 }
                };
                
            case '/comments':
                return {
                    success: true,
                    data: []
                };
                
            default:
                return {
                    success: true,
                    message: 'Operation completed successfully'
                };
        }
    }

    // ===========================================
    // START APPLICATION
    // ===========================================
    
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(); // End of IIFE
