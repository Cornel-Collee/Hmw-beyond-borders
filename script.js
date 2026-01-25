// ================================================
// HMW Beyond Borders - Production JavaScript
// ================================================
// Senior JavaScript Engineer & Web Application Architect
// Version: 1.0.0 | Production Ready
// ================================================

'use strict';

// ================================================
// GLOBAL STATE MANAGEMENT
// ================================================

class AppState {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.darkMode = false;
        this.cookieConsent = null;
        this.notificationsEnabled = false;
        this.readingProgress = new Map();
        this.savedArticles = new Set();
        this.followedAuthors = new Set();
        this.followedTopics = new Set();
        this.votedPolls = new Set();
        this.loadedArticles = new Set();
        
        this.initialize();
    }

    initialize() {
        this.loadUserState();
        this.loadThemePreference();
        this.loadSavedArticles();
        this.loadFollowedAuthors();
        this.loadFollowedTopics();
        this.loadVotedPolls();
        this.loadCookieConsent();
    }

    // User State Management
    loadUserState() {
        try {
            const userData = localStorage.getItem('hmw_user');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
            }
        } catch (error) {
            console.error('Error loading user state:', error);
        }
    }

    saveUserState(user) {
        try {
            this.currentUser = user;
            this.isAuthenticated = !!user;
            if (user) {
                localStorage.setItem('hmw_user', JSON.stringify(user));
            } else {
                localStorage.removeItem('hmw_user');
            }
        } catch (error) {
            console.error('Error saving user state:', error);
        }
    }

    // Theme Management
    loadThemePreference() {
        const savedTheme = localStorage.getItem('hmw_theme');
        if (savedTheme === 'dark') {
            this.darkMode = true;
        } else if (savedTheme === 'light') {
            this.darkMode = false;
        } else {
            // System preference detection
            this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
    }

    saveThemePreference() {
        localStorage.setItem('hmw_theme', this.darkMode ? 'dark' : 'light');
    }

    // Saved Articles
    loadSavedArticles() {
        try {
            const saved = localStorage.getItem('hmw_saved_articles');
            if (saved) {
                this.savedArticles = new Set(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading saved articles:', error);
        }
    }

    saveArticlesToStorage() {
        try {
            localStorage.setItem('hmw_saved_articles', JSON.stringify([...this.savedArticles]));
        } catch (error) {
            console.error('Error saving articles:', error);
        }
    }

    toggleSavedArticle(articleId) {
        if (this.savedArticles.has(articleId)) {
            this.savedArticles.delete(articleId);
        } else {
            this.savedArticles.add(articleId);
        }
        this.saveArticlesToStorage();
        return this.savedArticles.has(articleId);
    }

    isArticleSaved(articleId) {
        return this.savedArticles.has(articleId);
    }

    // Followed Authors
    loadFollowedAuthors() {
        try {
            const followed = localStorage.getItem('hmw_followed_authors');
            if (followed) {
                this.followedAuthors = new Set(JSON.parse(followed));
            }
        } catch (error) {
            console.error('Error loading followed authors:', error);
        }
    }

    saveFollowedAuthors() {
        try {
            localStorage.setItem('hmw_followed_authors', JSON.stringify([...this.followedAuthors]));
        } catch (error) {
            console.error('Error saving followed authors:', error);
        }
    }

    toggleFollowAuthor(authorId) {
        if (this.followedAuthors.has(authorId)) {
            this.followedAuthors.delete(authorId);
        } else {
            this.followedAuthors.add(authorId);
        }
        this.saveFollowedAuthors();
        return this.followedAuthors.has(authorId);
    }

    isFollowingAuthor(authorId) {
        return this.followedAuthors.has(authorId);
    }

    // Followed Topics
    loadFollowedTopics() {
        try {
            const topics = localStorage.getItem('hmw_followed_topics');
            if (topics) {
                this.followedTopics = new Set(JSON.parse(topics));
            }
        } catch (error) {
            console.error('Error loading followed topics:', error);
        }
    }

    saveFollowedTopics() {
        try {
            localStorage.setItem('hmw_followed_topics', JSON.stringify([...this.followedTopics]));
        } catch (error) {
            console.error('Error saving followed topics:', error);
        }
    }

    toggleFollowTopic(topic) {
        if (this.followedTopics.has(topic)) {
            this.followedTopics.delete(topic);
        } else {
            this.followedTopics.add(topic);
        }
        this.saveFollowedTopics();
        return this.followedTopics.has(topic);
    }

    isFollowingTopic(topic) {
        return this.followedTopics.has(topic);
    }

    // Poll Voting
    loadVotedPolls() {
        try {
            const voted = localStorage.getItem('hmw_voted_polls');
            if (voted) {
                this.votedPolls = new Set(JSON.parse(voted));
            }
        } catch (error) {
            console.error('Error loading voted polls:', error);
        }
    }

    saveVotedPolls() {
        try {
            localStorage.setItem('hmw_voted_polls', JSON.stringify([...this.votedPolls]));
        } catch (error) {
            console.error('Error saving voted polls:', error);
        }
    }

    recordPollVote(pollId) {
        this.votedPolls.add(pollId);
        this.saveVotedPolls();
    }

    hasVoted(pollId) {
        return this.votedPolls.has(pollId);
    }

    // Cookie Consent
    loadCookieConsent() {
        try {
            this.cookieConsent = localStorage.getItem('hmw_cookie_consent');
        } catch (error) {
            console.error('Error loading cookie consent:', error);
        }
    }

    saveCookieConsent(consent) {
        try {
            this.cookieConsent = consent;
            localStorage.setItem('hmw_cookie_consent', consent);
        } catch (error) {
            console.error('Error saving cookie consent:', error);
        }
    }

    // Reading Progress
    updateReadingProgress(articleId, percentage) {
        this.readingProgress.set(articleId, percentage);
        // Auto-save to localStorage for authenticated users
        if (this.isAuthenticated) {
            try {
                const progress = JSON.stringify([...this.readingProgress]);
                localStorage.setItem('hmw_reading_progress', progress);
            } catch (error) {
                console.error('Error saving reading progress:', error);
            }
        }
    }

    getReadingProgress(articleId) {
        return this.readingProgress.get(articleId) || 0;
    }
}

// ================================================
// DOM UTILITIES
// ================================================

class DOMUtils {
    static getElement(selector) {
        return document.querySelector(selector);
    }

    static getElements(selector) {
        return document.querySelectorAll(selector);
    }

    static showElement(element) {
        if (element) {
            element.removeAttribute('hidden');
            element.style.display = '';
        }
    }

    static hideElement(element) {
        if (element) {
            element.setAttribute('hidden', 'true');
            element.style.display = 'none';
        }
    }

    static toggleElement(element, show) {
        if (show) {
            this.showElement(element);
        } else {
            this.hideElement(element);
        }
    }

    static addClass(element, className) {
        if (element) {
            element.classList.add(className);
        }
    }

    static removeClass(element, className) {
        if (element) {
            element.classList.remove(className);
        }
    }

    static toggleClass(element, className, force) {
        if (element) {
            element.classList.toggle(className, force);
        }
    }

    static disableElement(element) {
        if (element) {
            element.disabled = true;
            element.setAttribute('aria-disabled', 'true');
        }
    }

    static enableElement(element) {
        if (element) {
            element.disabled = false;
            element.removeAttribute('aria-disabled');
        }
    }

    static setLoading(element, isLoading) {
        if (!element) return;

        if (isLoading) {
            const currentText = element.textContent || element.value;
            element.setAttribute('data-original-text', currentText);
            element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            this.disableElement(element);
        } else {
            const originalText = element.getAttribute('data-original-text');
            if (originalText) {
                element.textContent = originalText;
                element.removeAttribute('data-original-text');
            }
            this.enableElement(element);
        }
    }

    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else if (key === 'style') {
                Object.assign(element.style, value);
            } else {
                element.setAttribute(key, value);
            }
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });

        return element;
    }

    static showToast(message, type = 'info', duration = 5000) {
        // Check if toast container exists
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = this.createElement('div', {
                id: 'toastContainer',
                className: 'toast-container',
                style: {
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: '9999'
                }
            });
            document.body.appendChild(container);
        }

        const toast = this.createElement('div', {
            className: `toast toast-${type}`,
            style: {
                background: '#333',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '4px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minWidth: '300px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }
        });

        const messageSpan = this.createElement('span', {
            textContent: message
        });

        const closeBtn = this.createElement('button', {
            className: 'toast-close',
            innerHTML: '<i class="fas fa-times"></i>',
            style: {
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                marginLeft: '15px'
            }
        });

        closeBtn.addEventListener('click', () => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        });

        toast.appendChild(messageSpan);
        toast.appendChild(closeBtn);
        container.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }

    static confirmDialog(message, confirmText = 'Confirm', cancelText = 'Cancel') {
        return new Promise((resolve) => {
            const overlay = this.createElement('div', {
                className: 'confirm-overlay',
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '9999'
                }
            });

            const dialog = this.createElement('div', {
                className: 'confirm-dialog',
                style: {
                    background: 'white',
                    padding: '30px',
                    borderRadius: '8px',
                    maxWidth: '400px',
                    width: '90%',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }
            });

            const messageEl = this.createElement('p', {
                textContent: message,
                style: {
                    marginBottom: '25px',
                    fontSize: '16px',
                    lineHeight: '1.5'
                }
            });

            const buttons = this.createElement('div', {
                className: 'confirm-buttons',
                style: {
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px'
                }
            });

            const cancelBtn = this.createElement('button', {
                className: 'btn-cancel',
                textContent: cancelText,
                style: {
                    padding: '10px 20px',
                    border: '1px solid #ddd',
                    background: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }
            });

            const confirmBtn = this.createElement('button', {
                className: 'btn-confirm',
                textContent: confirmText,
                style: {
                    padding: '10px 20px',
                    border: 'none',
                    background: '#004D99',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }
            });

            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(false);
            });

            confirmBtn.addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(true);
            });

            buttons.appendChild(cancelBtn);
            buttons.appendChild(confirmBtn);

            dialog.appendChild(messageEl);
            dialog.appendChild(buttons);
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
        });
    }
}

// ================================================
// AUTHENTICATION MODULE
// ================================================

class AuthenticationManager {
    constructor(appState) {
        this.appState = appState;
        this.authModal = document.getElementById('authModal');
        this.authTabs = document.querySelectorAll('.auth-tab');
        this.authForms = document.querySelectorAll('.auth-form');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.resetForm = document.getElementById('resetForm');
        this.loginTrigger = document.getElementById('loginTrigger');
        this.modalCloseButtons = document.querySelectorAll('.modal-close');
        this.overlays = document.querySelectorAll('.modal-overlay');
        
        this.initialize();
    }

    initialize() {
        this.bindEvents();
        this.updateAuthUI();
    }

    bindEvents() {
        // Auth modal triggers
        if (this.loginTrigger) {
            this.loginTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.openAuthModal('login');
            });
        }

        // Paywall login link
        const paywallLogin = document.getElementById('paywallLogin');
        if (paywallLogin) {
            paywallLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.openAuthModal('login');
            });
        }

        // Auth tab switching
        this.authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchAuthTab(tabName);
            });
        });

        // Form submissions
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        if (this.resetForm) {
            this.resetForm.addEventListener('submit', (e) => this.handleResetPassword(e));
        }

        // Social login buttons
        const socialButtons = document.querySelectorAll('.btn-social');
        socialButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSocialLogin(e));
        });

        // Forgot password links
        const forgotPasswordLinks = document.querySelectorAll('.forgot-password');
        forgotPasswordLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchAuthTab('reset');
            });
        });

        // Auth footer links
        const authFooterLinks = document.querySelectorAll('.auth-footer a');
        authFooterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = link.getAttribute('data-tab');
                this.switchAuthTab(tabName);
            });
        });

        // Modal close buttons
        this.modalCloseButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeAuthModal());
        });

        // Close modal on overlay click
        this.overlays.forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeAuthModal();
                }
            });
        });

        // Logout functionality
        const logoutLinks = document.querySelectorAll('[data-action="logout"]');
        logoutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        });
    }

    openAuthModal(defaultTab = 'login') {
        DOMUtils.showElement(this.authModal);
        this.authModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        this.switchAuthTab(defaultTab);
        
        // Set focus to first input in active form
        setTimeout(() => {
            const activeForm = document.querySelector('.auth-form.active');
            const firstInput = activeForm.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    closeAuthModal() {
        DOMUtils.hideElement(this.authModal);
        this.authModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Clear form errors
        this.clearFormErrors();
        
        // Reset forms
        if (this.loginForm) this.loginForm.reset();
        if (this.registerForm) this.registerForm.reset();
        if (this.resetForm) this.resetForm.reset();
    }

    switchAuthTab(tabName) {
        // Update tabs
        this.authTabs.forEach(tab => {
            const isActive = tab.getAttribute('data-tab') === tabName;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive.toString());
        });

        // Update forms
        this.authForms.forEach(form => {
            const isActive = form.getAttribute('data-tab') === tabName;
            DOMUtils.toggleElement(form, isActive);
            form.classList.toggle('active', isActive);
        });

        // Update modal title
        const modalTitle = document.getElementById('authModalTitle');
        if (modalTitle) {
            if (tabName === 'login') modalTitle.textContent = 'Welcome Back';
            else if (tabName === 'register') modalTitle.textContent = 'Create Account';
            else if (tabName === 'reset') modalTitle.textContent = 'Reset Password';
        }
    }

    clearFormErrors() {
        const errorElements = document.querySelectorAll('.form-error');
        errorElements.forEach(el => el.remove());
        
        const errorInputs = document.querySelectorAll('.input-error');
        errorInputs.forEach(input => {
            input.classList.remove('input-error');
        });
    }

    showFormError(input, message) {
        this.clearFormErrors();
        
        input.classList.add('input-error');
        
        const errorEl = DOMUtils.createElement('div', {
            className: 'form-error',
            textContent: message,
            style: {
                color: '#dc3545',
                fontSize: '14px',
                marginTop: '5px'
            }
        });
        
        input.parentNode.appendChild(errorEl);
        input.focus();
    }

    // Validation Utilities
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }

    // Form Handlers
    async handleLogin(event) {
        event.preventDefault();
        
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        const rememberMe = document.getElementById('rememberMe');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Validation
        if (!email) {
            this.showFormError(emailInput, 'Email is required');
            return;
        }
        
        if (!this.validateEmail(email)) {
            this.showFormError(emailInput, 'Please enter a valid email address');
            return;
        }
        
        if (!password) {
            this.showFormError(passwordInput, 'Password is required');
            return;
        }
        
        // Show loading state
        const submitBtn = this.loginForm.querySelector('.btn-auth-submit');
        DOMUtils.setLoading(submitBtn, true);
        
        try {
            // In production, this would be an API call
            await this.simulateApiCall(1500);
            
            // For demo purposes - accept any non-empty password
            if (password.length > 0) {
                const user = {
                    id: 'user_' + Date.now(),
                    email: email,
                    firstName: email.split('@')[0],
                    lastName: 'User',
                    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
                    subscription: 'free'
                };
                
                // Save user state
                if (rememberMe && rememberMe.checked) {
                    localStorage.setItem('hmw_user_remember', 'true');
                }
                
                this.appState.saveUserState(user);
                this.updateAuthUI();
                this.closeAuthModal();
                
                DOMUtils.showToast('Successfully logged in!', 'success');
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            this.showFormError(passwordInput, 'Invalid email or password');
        } finally {
            DOMUtils.setLoading(submitBtn, false);
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        
        const firstName = document.getElementById('registerFirstName').value.trim();
        const lastName = document.getElementById('registerLastName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const acceptTerms = document.getElementById('acceptTerms');
        const newsletterOptIn = document.getElementById('newsletterOptIn');
        
        // Validation
        if (!firstName) {
            this.showFormError(document.getElementById('registerFirstName'), 'First name is required');
            return;
        }
        
        if (!lastName) {
            this.showFormError(document.getElementById('registerLastName'), 'Last name is required');
            return;
        }
        
        if (!email) {
            this.showFormError(document.getElementById('registerEmail'), 'Email is required');
            return;
        }
        
        if (!this.validateEmail(email)) {
            this.showFormError(document.getElementById('registerEmail'), 'Please enter a valid email address');
            return;
        }
        
        if (!password) {
            this.showFormError(document.getElementById('registerPassword'), 'Password is required');
            return;
        }
        
        if (!this.validatePassword(password)) {
            this.showFormError(document.getElementById('registerPassword'), 
                'Password must be at least 8 characters with uppercase, lowercase, and number');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showFormError(document.getElementById('registerConfirmPassword'), 'Passwords do not match');
            return;
        }
        
        if (!acceptTerms || !acceptTerms.checked) {
            DOMUtils.showToast('Please accept the Terms of Service and Privacy Policy', 'warning');
            return;
        }
        
        // Show loading state
        const submitBtn = this.registerForm.querySelector('.btn-auth-submit');
        DOMUtils.setLoading(submitBtn, true);
        
        try {
            // Simulate API call
            await this.simulateApiCall(2000);
            
            const user = {
                id: 'user_' + Date.now(),
                email: email,
                firstName: firstName,
                lastName: lastName,
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
                subscription: 'free',
                newsletterOptIn: newsletterOptIn && newsletterOptIn.checked
            };
            
            this.appState.saveUserState(user);
            this.updateAuthUI();
            this.closeAuthModal();
            
            DOMUtils.showToast('Account created successfully!', 'success');
            
            // Auto-login after registration
            this.switchAuthTab('login');
            
        } catch (error) {
            DOMUtils.showToast('Registration failed. Please try again.', 'error');
        } finally {
            DOMUtils.setLoading(submitBtn, false);
        }
    }

    async handleResetPassword(event) {
        event.preventDefault();
        
        const emailInput = document.getElementById('resetEmail');
        const email = emailInput.value.trim();
        
        if (!email) {
            this.showFormError(emailInput, 'Email is required');
            return;
        }
        
        if (!this.validateEmail(email)) {
            this.showFormError(emailInput, 'Please enter a valid email address');
            return;
        }
        
        const submitBtn = this.resetForm.querySelector('.btn-auth-submit');
        DOMUtils.setLoading(submitBtn, true);
        
        try {
            await this.simulateApiCall(1500);
            
            DOMUtils.showToast('Password reset link sent to your email', 'success');
            this.resetForm.reset();
            this.switchAuthTab('login');
            
        } catch (error) {
            this.showFormError(emailInput, 'Error sending reset link. Please try again.');
        } finally {
            DOMUtils.setLoading(submitBtn, false);
        }
    }

    handleSocialLogin(event) {
        const button = event.currentTarget;
        const provider = button.classList.contains('google') ? 'google' : 'facebook';
        
        DOMUtils.setLoading(button, true);
        
        // Simulate social login
        setTimeout(() => {
            const user = {
                id: 'user_social_' + Date.now(),
                email: `user_${provider}@example.com`,
                firstName: provider === 'google' ? 'Google' : 'Facebook',
                lastName: 'User',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
                subscription: 'free',
                provider: provider
            };
            
            this.appState.saveUserState(user);
            this.updateAuthUI();
            this.closeAuthModal();
            DOMUtils.showToast(`Signed in with ${provider === 'google' ? 'Google' : 'Facebook'}`, 'success');
            
            DOMUtils.setLoading(button, false);
        }, 1500);
    }

    handleLogout() {
        DOMUtils.confirmDialog('Are you sure you want to logout?', 'Logout', 'Cancel')
            .then(confirmed => {
                if (confirmed) {
                    this.appState.saveUserState(null);
                    this.updateAuthUI();
                    DOMUtils.showToast('Successfully logged out', 'info');
                }
            });
    }

    updateAuthUI() {
        const userActions = document.querySelector('.user-actions');
        const accountDropdown = document.getElementById('accountDropdown');
        const loginTrigger = document.getElementById('loginTrigger');
        const subscribeTrigger = document.getElementById('subscribeTrigger');
        
        if (this.appState.isAuthenticated && this.appState.currentUser) {
            // Show account dropdown, hide login button
            DOMUtils.showElement(accountDropdown);
            if (loginTrigger) DOMUtils.hideElement(loginTrigger);
            
            // Update account dropdown with user info
            const accountBtn = accountDropdown.querySelector('.btn-account');
            if (accountBtn) {
                const icon = accountBtn.querySelector('i');
                if (icon) {
                    // Could update with user avatar
                    icon.className = 'fas fa-user-circle';
                }
            }
            
            // Update dashboard link with user name
            const dashboardLink = document.querySelector('[data-action="dashboard"]');
            if (dashboardLink && this.appState.currentUser.firstName) {
                dashboardLink.innerHTML = `<i class="fas fa-tachometer-alt"></i> ${this.appState.currentUser.firstName}'s Dashboard`;
            }
            
        } else {
            // Show login button, hide account dropdown
            if (loginTrigger) DOMUtils.showElement(loginTrigger);
            DOMUtils.hideElement(accountDropdown);
        }
        
        // Update subscription trigger based on user subscription
        if (subscribeTrigger && this.appState.currentUser) {
            if (this.appState.currentUser.subscription && this.appState.currentUser.subscription !== 'free') {
                subscribeTrigger.innerHTML = `<i class="fas fa-crown"></i><span class="action-text">Premium</span>`;
                subscribeTrigger.classList.add('premium');
            }
        }
    }

    simulateApiCall(duration) {
        return new Promise((resolve) => {
            setTimeout(resolve, duration);
        });
    }
}

// ================================================
// CONTENT INTERACTION MODULE
// ================================================

class ContentInteractionManager {
    constructor(appState) {
        this.appState = appState;
        this.currentArticle = null;
        this.comments = new Map();
        
        this.initialize();
    }

    initialize() {
        this.bindArticleEvents();
        this.bindSocialInteractions();
        this.bindCommentSystem();
        this.bindPollSystem();
        this.bindReaderEvents();
        this.bindSubmissionEvents();
    }

    bindArticleEvents() {
        // Article click handlers for story cards
        const storyCards = document.querySelectorAll('.story-card:not(.live-update)');
        storyCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking interactive elements
                if (e.target.closest('.btn-interaction, .author-info, .story-tag, button, a')) {
                    return;
                }
                
                const articleId = card.getAttribute('data-article-id');
                const articleType = card.getAttribute('data-article-type');
                this.openArticleReader(articleId, articleType, card);
            });
        });

        // Read more buttons
        const readMoreButtons = document.querySelectorAll('.btn-read-more, [data-action="read"]');
        readMoreButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = btn.closest('.story-card');
                if (card) {
                    const articleId = card.getAttribute('data-article-id');
                    const articleType = card.getAttribute('data-article-type');
                    this.openArticleReader(articleId, articleType, card);
                }
            });
        });
    }

    openArticleReader(articleId, articleType, sourceCard) {
        const modal = document.getElementById('articleReaderModal');
        if (!modal) return;

        // Load article data based on type and ID
        this.loadArticleData(articleId, articleType, sourceCard);
        
        // Show modal
        DOMUtils.showElement(modal);
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        // Close button
        const closeBtn = modal.querySelector('.article-reader-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.closeArticleReader();
        }

        // Overlay click to close
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeArticleReader();
            }
        };

        // Escape key to close
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeArticleReader();
            }
        };
        document.addEventListener('keydown', escapeHandler);
        modal.dataset.escapeHandler = 'true';

        // Update reading progress tracking
        this.setupReadingProgress(articleId);
    }

    loadArticleData(articleId, articleType, sourceCard) {
        const modal = document.getElementById('articleReaderModal');
        if (!modal) return;

        // For demo purposes, we'll use data from the source card
        // In production, this would fetch from an API
        if (sourceCard) {
            // Extract data from card
            const category = sourceCard.querySelector('.category-label')?.textContent || 'Culture & Arts';
            const title = sourceCard.querySelector('.story-headline')?.textContent || 'Article Title';
            const excerpt = sourceCard.querySelector('.story-excerpt')?.textContent || '';
            const authorName = sourceCard.querySelector('.author-name')?.textContent || 'Author';
            const authorTitle = sourceCard.querySelector('.author-title')?.textContent || 'Correspondent';
            const authorAvatar = sourceCard.querySelector('.author-avatar')?.src || 
                'https://images.unsplash.com/photo-1494790108755-2616b786d49f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80';
            const image = sourceCard.querySelector('.story-image img')?.src || 
                'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
            const date = sourceCard.querySelector('.metadata-item time')?.textContent || '2 hours ago';
            const readTime = sourceCard.querySelector('.metadata-item:nth-child(2)')?.textContent || '7 min read';

            // Update modal with data
            const categoryEl = modal.querySelector('.reader-category');
            if (categoryEl) categoryEl.textContent = category;

            const titleEl = modal.querySelector('#articleReaderTitle');
            if (titleEl) titleEl.textContent = title;

            const excerptEl = modal.querySelector('.reader-content p:first-child');
            if (excerptEl) excerptEl.textContent = excerpt;

            const authorAvatarEl = modal.querySelector('.author-avatar');
            if (authorAvatarEl) authorAvatarEl.src = authorAvatar;

            const authorNameEl = modal.querySelector('.author-name');
            if (authorNameEl) authorNameEl.textContent = authorName;

            const authorTitleEl = modal.querySelector('.author-title');
            if (authorTitleEl) authorTitleEl.textContent = authorTitle;

            const dateEl = modal.querySelector('.article-date');
            if (dateEl) dateEl.innerHTML = `<i class="far fa-clock"></i> ${date} • ${readTime}`;

            const featuredImage = modal.querySelector('.reader-featured-image img');
            if (featuredImage) featuredImage.src = image;

            // Update article ID in modal for interaction tracking
            modal.setAttribute('data-article-id', articleId);
        }

        // Load comments for this article
        this.loadComments(articleId);
    }

    closeArticleReader() {
        const modal = document.getElementById('articleReaderModal');
        if (!modal) return;

        DOMUtils.hideElement(modal);
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';

        // Remove escape handler
        if (modal.dataset.escapeHandler) {
            document.removeEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.closeArticleReader();
            });
            delete modal.dataset.escapeHandler;
        }

        // Save reading progress
        const articleId = modal.getAttribute('data-article-id');
        if (articleId) {
            const progress = this.calculateReadingProgress();
            this.appState.updateReadingProgress(articleId, progress);
        }
    }

    setupReadingProgress(articleId) {
        const modal = document.getElementById('articleReaderModal');
        if (!modal) return;

        const content = modal.querySelector('.reader-content');
        const progressBar = modal.querySelector('.reading-progress-indicator .progress-fill');
        
        if (!content || !progressBar) return;

        const updateProgress = () => {
            const scrollTop = content.scrollTop;
            const scrollHeight = content.scrollHeight - content.clientHeight;
            const progress = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
            
            progressBar.style.width = `${progress}%`;
            
            const percentageEl = modal.querySelector('.progress-percentage');
            if (percentageEl) {
                percentageEl.textContent = `${progress}%`;
            }

            // Save to state
            this.appState.updateReadingProgress(articleId, progress);
        };

        content.addEventListener('scroll', updateProgress);
        
        // Initial update
        setTimeout(updateProgress, 100);
    }

    calculateReadingProgress() {
        const modal = document.getElementById('articleReaderModal');
        if (!modal) return 0;

        const content = modal.querySelector('.reader-content');
        if (!content) return 0;

        const scrollTop = content.scrollTop;
        const scrollHeight = content.scrollHeight - content.clientHeight;
        
        return scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
    }

    bindSocialInteractions() {
        // Like buttons
        const likeButtons = document.querySelectorAll('.like-btn, .reader-like, [data-action="like"]');
        likeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleLike(btn);
            });
        });

        // Save/bookmark buttons
        const saveButtons = document.querySelectorAll('.save-btn, [data-action="save"], .reader-action .fa-bookmark');
        saveButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleSave(btn);
            });
        });

        // Share buttons
        const shareButtons = document.querySelectorAll('.share-btn, .reader-share, [data-action="share"]');
        shareButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleShare(btn);
            });
        });

        // Follow buttons
        const followButtons = document.querySelectorAll('.follow-btn, .btn-follow-author, [data-action="follow"]');
        followButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleFollow(btn);
            });
        });

        // Reaction buttons
        const reactionButtons = document.querySelectorAll('.reaction-btn');
        reactionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleReaction(btn);
            });
        });

        // Share dropdowns
        const shareDropdowns = document.querySelectorAll('.share-dropdown');
        shareDropdowns.forEach(dropdown => {
            const shareBtn = dropdown.querySelector('.share-btn');
            const shareOptions = dropdown.querySelector('.share-options');
            
            if (shareBtn && shareOptions) {
                shareBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    shareOptions.classList.toggle('show');
                });

                // Close when clicking outside
                document.addEventListener('click', (e) => {
                    if (!dropdown.contains(e.target)) {
                        shareOptions.classList.remove('show');
                    }
                });
            }
        });

        // Collection dropdowns
        const collectionDropdowns = document.querySelectorAll('.collection-dropdown');
        collectionDropdowns.forEach(dropdown => {
            const collectionBtn = dropdown.querySelector('.collection-btn');
            const collectionOptions = dropdown.querySelector('.collection-options');
            
            if (collectionBtn && collectionOptions) {
                collectionBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    collectionOptions.classList.toggle('show');
                });

                document.addEventListener('click', (e) => {
                    if (!dropdown.contains(e.target)) {
                        collectionOptions.classList.remove('show');
                    }
                });
            }
        });
    }

    handleLike(button) {
        const articleCard = button.closest('.story-card');
        const articleId = articleCard ? articleCard.getAttribute('data-article-id') : null;
        
        if (!articleId) {
            // Handle reader modal likes
            const modal = document.getElementById('articleReaderModal');
            if (modal) {
                articleId = modal.getAttribute('data-article-id');
            }
        }

        // Toggle like state
        const isLiked = button.classList.contains('liked');
        
        if (isLiked) {
            button.classList.remove('liked');
            if (button.querySelector('i')) {
                button.querySelector('i').className = 'far fa-heart';
            }
            
            // Update count
            this.updateLikeCount(button, -1);
        } else {
            button.classList.add('liked');
            if (button.querySelector('i')) {
                button.querySelector('i').className = 'fas fa-heart';
            }
            
            // Update count
            this.updateLikeCount(button, 1);
        }

        // Show feedback
        if (!isLiked) {
            DOMUtils.showToast('Article liked!', 'success', 2000);
        }

        // In production, this would send to API
        this.recordInteraction('like', articleId, !isLiked);
    }

    updateLikeCount(button, change) {
        const countSpan = button.querySelector('span');
        if (countSpan && !isNaN(parseInt(countSpan.textContent))) {
            let currentCount = parseInt(countSpan.textContent);
            currentCount = Math.max(0, currentCount + change);
            countSpan.textContent = currentCount;
        }
    }

    handleSave(button) {
        const articleCard = button.closest('.story-card');
        const articleId = articleCard ? articleCard.getAttribute('data-article-id') : null;
        
        if (!articleId) {
            const modal = document.getElementById('articleReaderModal');
            if (modal) {
                articleId = modal.getAttribute('data-article-id');
            }
        }

        if (!articleId) return;

        const isSaved = this.appState.toggleSavedArticle(articleId);
        
        // Update button UI
        if (isSaved) {
            button.classList.add('saved');
            if (button.querySelector('i')) {
                button.querySelector('i').className = 'fas fa-bookmark';
            }
            DOMUtils.showToast('Article saved to your collection!', 'success', 2000);
        } else {
            button.classList.remove('saved');
            if (button.querySelector('i')) {
                button.querySelector('i').className = 'far fa-bookmark';
            }
            DOMUtils.showToast('Article removed from saved', 'info', 2000);
        }

        // Update count if present
        const countSpan = button.querySelector('span');
        if (countSpan && !isNaN(parseInt(countSpan.textContent))) {
            let currentCount = parseInt(countSpan.textContent);
            currentCount = isSaved ? currentCount + 1 : Math.max(0, currentCount - 1);
            countSpan.textContent = currentCount;
        }
    }

    handleShare(button) {
        const articleCard = button.closest('.story-card');
        let articleId, articleTitle, articleUrl;

        if (articleCard) {
            articleId = articleCard.getAttribute('data-article-id');
            articleTitle = articleCard.querySelector('.story-headline')?.textContent || '';
            articleUrl = window.location.origin + '/article/' + articleId;
        } else {
            const modal = document.getElementById('articleReaderModal');
            if (modal) {
                articleId = modal.getAttribute('data-article-id');
                articleTitle = modal.querySelector('#articleReaderTitle')?.textContent || '';
                articleUrl = window.location.origin + '/article/' + articleId;
            }
        }

        // Check if it's a specific share option
        if (button.classList.contains('whatsapp') || button.closest('.whatsapp')) {
            this.shareViaWhatsApp(articleTitle, articleUrl);
        } else if (button.classList.contains('facebook') || button.closest('.facebook')) {
            this.shareViaFacebook(articleUrl);
        } else if (button.classList.contains('twitter') || button.closest('.twitter')) {
            this.shareViaTwitter(articleTitle, articleUrl);
        } else if (button.classList.contains('copy-link') || button.closest('.copy-link')) {
            this.copyLinkToClipboard(articleUrl);
        } else {
            // Open generic share dialog
            this.openShareDialog(articleTitle, articleUrl);
        }
    }

    shareViaWhatsApp(title, url) {
        const text = `${title} - Read more: ${url}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    }

    shareViaFacebook(url) {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    }

    shareViaTwitter(title, url) {
        const text = `${title}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    }

    async copyLinkToClipboard(url) {
        try {
            await navigator.clipboard.writeText(url);
            DOMUtils.showToast('Link copied to clipboard!', 'success', 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            DOMUtils.showToast('Link copied to clipboard!', 'success', 2000);
        }
    }

    openShareDialog(title, url) {
        if (navigator.share) {
            navigator.share({
                title: title,
                text: 'Check out this inspiring story:',
                url: url
            }).catch(console.error);
        } else {
            // Fallback: show custom share options
            const shareOptions = document.querySelector('.share-options');
            if (shareOptions) {
                shareOptions.classList.add('show');
            }
        }
    }

    handleFollow(button) {
        const authorInfo = button.closest('.author-info');
        let authorId, authorName;

        if (authorInfo) {
            authorId = authorInfo.querySelector('.author-name')?.textContent || 'unknown';
            authorName = authorId;
        } else {
            // Handle topic follow
            const tagContainer = button.closest('.story-tags');
            if (tagContainer) {
                const topic = button.previousElementSibling?.textContent || 'Unknown Topic';
                authorId = `topic_${topic.toLowerCase().replace(/\s+/g, '_')}`;
                authorName = topic;
            }
        }

        if (!authorId) return;

        const isFollowing = this.appState.toggleFollowAuthor(authorId);
        
        // Update button UI
        if (isFollowing) {
            button.classList.add('following');
            if (button.querySelector('i')) {
                button.querySelector('i').className = 'fas fa-user-check';
            }
            button.querySelector('span').textContent = 'Following';
            DOMUtils.showToast(`Following ${authorName}`, 'success', 2000);
        } else {
            button.classList.remove('following');
            if (button.querySelector('i')) {
                button.querySelector('i').className = 'fas fa-user-plus';
            }
            button.querySelector('span').textContent = 'Follow';
            DOMUtils.showToast(`Unfollowed ${authorName}`, 'info', 2000);
        }
    }

    handleReaction(button) {
        const reaction = button.textContent || button.getAttribute('aria-label') || 'reaction';
        const articleCard = button.closest('.story-card');
        const articleId = articleCard ? articleCard.getAttribute('data-article-id') : null;

        // Visual feedback
        button.classList.add('reacted');
        setTimeout(() => button.classList.remove('reacted'), 300);

        // Show toast
        DOMUtils.showToast(`Reacted with ${reaction}`, 'success', 1500);

        // Record interaction
        this.recordInteraction('reaction', articleId, reaction);
    }

    recordInteraction(type, targetId, data) {
        // In production, this would send to analytics API
        const interaction = {
            type: type,
            targetId: targetId,
            data: data,
            timestamp: new Date().toISOString(),
            userId: this.appState.currentUser?.id || 'anonymous'
        };

        console.log('Interaction recorded:', interaction);
        
        // Store locally for demo
        const interactions = JSON.parse(localStorage.getItem('hmw_interactions') || '[]');
        interactions.push(interaction);
        localStorage.setItem('hmw_interactions', JSON.stringify(interactions.slice(-100))); // Keep last 100
    }

    bindCommentSystem() {
        // Comment buttons
        const commentButtons = document.querySelectorAll('.comment-btn, .reader-comment, [data-action="comment"]');
        commentButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.focusCommentInput(btn);
            });
        });

        // Post comment buttons
        const postButtons = document.querySelectorAll('.btn-post-comment');
        postButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.postComment(btn);
            });
        });

        // Reply buttons
        const replyButtons = document.querySelectorAll('.comment-action.reply');
        replyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showReplyInput(btn);
            });
        });

        // Comment reactions
        const commentReactions = document.querySelectorAll('.comment-reaction');
        commentReactions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleCommentReaction(btn);
            });
        });

        // Comment like buttons
        const commentLikes = document.querySelectorAll('.comment-action.like');
        commentLikes.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleCommentLike(btn);
            });
        });
    }

    focusCommentInput(button) {
        const articleCard = button.closest('.story-card');
        let commentInput;

        if (articleCard) {
            commentInput = articleCard.querySelector('.comment-textarea');
        } else {
            // In reader modal
            const modal = document.getElementById('articleReaderModal');
            if (modal) {
                commentInput = modal.querySelector('.comment-textarea');
            }
        }

        if (commentInput) {
            commentInput.focus();
            commentInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    async postComment(button) {
        const form = button.closest('.comment-input-container') || button.closest('form');
        const textarea = form ? form.querySelector('textarea') : null;
        const commentText = textarea ? textarea.value.trim() : '';

        if (!commentText) {
            DOMUtils.showToast('Please write a comment first', 'warning');
            return;
        }

        // Check if user is logged in
        if (!this.appState.isAuthenticated) {
            DOMUtils.showToast('Please login to comment', 'warning');
            return;
        }

        DOMUtils.setLoading(button, true);

        try {
            await this.simulateApiCall(1000);

            const comment = {
                id: 'comment_' + Date.now(),
                text: commentText,
                author: {
                    name: this.appState.currentUser.firstName + ' ' + this.appState.currentUser.lastName,
                    avatar: this.appState.currentUser.avatar
                },
                timestamp: new Date().toISOString(),
                likes: 0,
                replies: []
            };

            // Add comment to UI
            this.addCommentToUI(comment, form);

            // Clear textarea
            if (textarea) textarea.value = '';

            // Update comment count
            this.updateCommentCount(1);

            DOMUtils.showToast('Comment posted successfully!', 'success');

        } catch (error) {
            DOMUtils.showToast('Failed to post comment. Please try again.', 'error');
        } finally {
            DOMUtils.setLoading(button, false);
        }
    }

    addCommentToUI(comment, form) {
        const commentsList = form ? form.closest('.comment-section')?.querySelector('.comments-list') : null;
        if (!commentsList) return;

        const commentEl = DOMUtils.createElement('article', {
            className: 'comment-item',
            'data-comment-id': comment.id
        });

        commentEl.innerHTML = `
            <div class="comment-author">
                <img src="${comment.author.avatar}" alt="${comment.author.name}" class="comment-avatar">
                <div class="author-info">
                    <div class="author-name-verified">
                        <span class="author-name">${comment.author.name}</span>
                        <span class="verification-badge">
                            <i class="fas fa-check-circle"></i> Verified Reader
                        </span>
                    </div>
                    <span class="comment-time">
                        <i class="far fa-clock"></i> Just now
                    </span>
                </div>
            </div>
            <div class="comment-content">
                <p>${this.escapeHtml(comment.text)}</p>
            </div>
            <div class="comment-actions">
                <button class="comment-action like" aria-label="Like comment">
                    <i class="far fa-heart"></i>
                    <span>0</span>
                </button>
                <button class="comment-action reply" aria-label="Reply to comment">
                    <i class="fas fa-reply"></i>
                    Reply
                </button>
                <button class="comment-action share" aria-label="Share comment">
                    <i class="fas fa-share"></i>
                </button>
            </div>
        `;

        // Add event listeners to new buttons
        commentEl.querySelector('.comment-action.like').addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleCommentLike(e.currentTarget);
        });

        commentEl.querySelector('.comment-action.reply').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showReplyInput(e.currentTarget);
        });

        commentsList.insertBefore(commentEl, commentsList.firstChild);
    }

    updateCommentCount(change) {
        const commentCounts = document.querySelectorAll('.comment-count');
        commentCounts.forEach(el => {
            const current = parseInt(el.textContent) || 0;
            el.textContent = Math.max(0, current + change);
        });

        // Also update metrics
        const metricItems = document.querySelectorAll('.metric-item:nth-child(3) .metric-value');
        metricItems.forEach(el => {
            const current = parseInt(el.textContent) || 0;
            el.textContent = Math.max(0, current + change);
        });
    }

    showReplyInput(button) {
        const commentItem = button.closest('.comment-item');
        if (!commentItem) return;

        // Check if reply input already exists
        let replyInput = commentItem.querySelector('.reply-input-container');
        
        if (!replyInput) {
            replyInput = DOMUtils.createElement('div', {
                className: 'reply-input-container'
            });

            replyInput.innerHTML = `
                <textarea placeholder="Write a reply..." aria-label="Write a reply"></textarea>
                <button class="btn-post-reply">Post Reply</button>
            `;

            // Add event listener to reply button
            replyInput.querySelector('.btn-post-reply').addEventListener('click', (e) => {
                e.preventDefault();
                this.postReply(e.currentTarget, commentItem);
            });

            commentItem.appendChild(replyInput);
        }

        DOMUtils.showElement(replyInput);
        replyInput.querySelector('textarea').focus();
    }

    async postReply(button, commentItem) {
        const replyInput = button.closest('.reply-input-container');
        const textarea = replyInput ? replyInput.querySelector('textarea') : null;
        const replyText = textarea ? textarea.value.trim() : '';

        if (!replyText) {
            DOMUtils.showToast('Please write a reply first', 'warning');
            return;
        }

        if (!this.appState.isAuthenticated) {
            DOMUtils.showToast('Please login to reply', 'warning');
            return;
        }

        DOMUtils.setLoading(button, true);

        try {
            await this.simulateApiCall(800);

            const reply = {
                id: 'reply_' + Date.now(),
                text: replyText,
                author: {
                    name: this.appState.currentUser.firstName + ' ' + this.appState.currentUser.lastName,
                    avatar: this.appState.currentUser.avatar
                },
                timestamp: new Date().toISOString(),
                likes: 0
            };

            // Add reply to UI
            this.addReplyToUI(reply, commentItem);

            // Clear textarea and hide input
            if (textarea) textarea.value = '';
            DOMUtils.hideElement(replyInput);

            DOMUtils.showToast('Reply posted!', 'success');

        } catch (error) {
            DOMUtils.showToast('Failed to post reply. Please try again.', 'error');
        } finally {
            DOMUtils.setLoading(button, false);
        }
    }

    addReplyToUI(reply, commentItem) {
        let repliesContainer = commentItem.querySelector('.comment-replies');
        if (!repliesContainer) {
            repliesContainer = DOMUtils.createElement('div', {
                className: 'comment-replies'
            });
            commentItem.appendChild(repliesContainer);
        }

        const replyEl = DOMUtils.createElement('article', {
            className: 'reply-item',
            'data-reply-id': reply.id
        });

        replyEl.innerHTML = `
            <div class="reply-author">
                <img src="${reply.author.avatar}" alt="${reply.author.name}" class="reply-avatar">
                <div class="author-info">
                    <div class="author-name-verified">
                        <span class="author-name">${reply.author.name}</span>
                        <span class="verification-badge author-badge">
                            <i class="fas fa-check-circle"></i> Author
                        </span>
                    </div>
                    <span class="reply-time">
                        <i class="far fa-clock"></i> Just now
                    </span>
                </div>
            </div>
            <div class="reply-content">
                <p>${this.escapeHtml(reply.text)}</p>
            </div>
            <div class="reply-actions">
                <button class="comment-action like" aria-label="Like reply">
                    <i class="far fa-heart"></i>
                    <span>0</span>
                </button>
                <button class="comment-action reply" aria-label="Reply to reply">
                    <i class="fas fa-reply"></i>
                    Reply
                </button>
            </div>
        `;

        // Add event listeners
        replyEl.querySelector('.comment-action.like').addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleCommentLike(e.currentTarget);
        });

        repliesContainer.appendChild(replyEl);
    }

    handleCommentLike(button) {
        const isLiked = button.classList.contains('liked');
        const countSpan = button.querySelector('span');
        
        if (isLiked) {
            button.classList.remove('liked');
            button.querySelector('i').className = 'far fa-heart';
            if (countSpan) {
                const current = parseInt(countSpan.textContent) || 0;
                countSpan.textContent = Math.max(0, current - 1);
            }
        } else {
            button.classList.add('liked');
            button.querySelector('i').className = 'fas fa-heart';
            if (countSpan) {
                const current = parseInt(countSpan.textContent) || 0;
                countSpan.textContent = current + 1;
            }
        }
    }

    handleCommentReaction(button) {
        const reaction = button.textContent || 'reaction';
        button.classList.add('reacted');
        setTimeout(() => button.classList.remove('reacted'), 300);
        DOMUtils.showToast(`Reacted with ${reaction}`, 'success', 1500);
    }

    loadComments(articleId) {
        // In production, this would fetch comments from API
        // For demo, we'll simulate loading
        setTimeout(() => {
            const commentsList = document.querySelector('#articleReaderModal .comments-list');
            if (commentsList && commentsList.children.length <= 2) {
                // Simulate loading more comments
                this.simulateApiCall(500).then(() => {
                    // Comments would be added here
                });
            }
        }, 500);
    }

    bindPollSystem() {
        // Poll option buttons
        const pollOptions = document.querySelectorAll('.poll-option:not(.active)');
        pollOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handlePollVote(option);
            });
        });

        // Share poll buttons
        const sharePollButtons = document.querySelectorAll('.btn-share-poll, [data-action="share-poll"]');
        sharePollButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.sharePoll(btn);
            });
        });
    }

    handlePollVote(option) {
        const poll = option.closest('.community-poll, .quick-poll');
        if (!poll) return;

        const pollId = poll.getAttribute('data-poll-id') || 'poll_' + Date.now();

        // Check if already voted
        if (this.appState.hasVoted(pollId)) {
            DOMUtils.showToast('You have already voted in this poll', 'warning');
            return;
        }

        // Mark as voted
        this.appState.recordPollVote(pollId);

        // Update UI
        const allOptions = poll.querySelectorAll('.poll-option');
        allOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');

        // Update vote count
        const voteCountEl = poll.querySelector('.poll-count, .poll-total');
        if (voteCountEl) {
            const text = voteCountEl.textContent;
            const match = text.match(/\d+/);
            if (match) {
                const current = parseInt(match[0]);
                voteCountEl.textContent = text.replace(/\d+/, current + 1);
            }
        }

        // Show results if available
        this.showPollResults(poll);

        DOMUtils.showToast('Vote recorded!', 'success');
    }

    showPollResults(poll) {
        const resultsContainer = poll.querySelector('.poll-results');
        if (resultsContainer) {
            resultsContainer.style.display = 'block';
        }
    }

    sharePoll(button) {
        const poll = button.closest('.community-poll, .quick-poll');
        if (!poll) return;

        const question = poll.querySelector('.poll-question')?.textContent || 'Community Poll';
        const url = window.location.href;

        if (navigator.share) {
            navigator.share({
                title: 'Poll: ' + question,
                text: 'What do you think?',
                url: url
            }).catch(console.error);
        } else {
            this.copyLinkToClipboard(url);
        }
    }

    bindReaderEvents() {
        // Reader modal actions
        const readerActions = document.querySelectorAll('.reader-action');
        readerActions.forEach(action => {
            action.addEventListener('click', (e) => {
                e.stopPropagation();
                const icon = action.querySelector('i');
                
                if (icon.classList.contains('fa-bookmark')) {
                    this.handleSave(action);
                } else if (icon.classList.contains('fa-share-alt')) {
                    this.handleShare(action);
                } else if (icon.classList.contains('fa-print')) {
                    this.printArticle();
                }
            });
        });

        // Ask AI button
        const askAIButton = document.querySelector('.btn-ask-ai');
        if (askAIButton) {
            askAIButton.addEventListener('click', () => {
                this.handleAIQuestion();
            });
        }

        // Quote share button
        const quoteShareButtons = document.querySelectorAll('.btn-quote-share');
        quoteShareButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.shareQuote(btn);
            });
        });

        // Follow topic button
        const followTopicButtons = document.querySelectorAll('.btn-follow-topic');
        followTopicButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleFollowTopic(btn);
            });
        });
    }

    printArticle() {
        const modal = document.getElementById('articleReaderModal');
        if (!modal) return;

        const printContent = modal.querySelector('.article-reader-body');
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Article - HMW Beyond Borders</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
                        h1 { color: #004D99; border-bottom: 2px solid #004D99; padding-bottom: 10px; }
                        .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
                        .author { font-style: italic; margin: 10px 0; }
                        img { max-width: 100%; height: auto; margin: 10px 0; }
                        .caption { font-size: 12px; color: #666; text-align: center; margin-bottom: 20px; }
                        blockquote { border-left: 4px solid #004D99; padding-left: 15px; margin: 20px 0; font-style: italic; }
                        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>${modal.querySelector('#articleReaderTitle')?.textContent || 'Article'}</h1>
                    <div class="meta">
                        ${modal.querySelector('.reader-category')?.textContent || ''} | 
                        ${modal.querySelector('.article-date')?.textContent || ''}
                    </div>
                    <div class="author">
                        By ${modal.querySelector('.author-name')?.textContent || 'Author'}
                    </div>
                    ${printContent.innerHTML}
                    <div class="footer">
                        Printed from HMW Beyond Borders - Bringing The Unseen to Light<br>
                        ${window.location.href}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
    }

    handleAIQuestion() {
        if (!this.appState.isAuthenticated) {
            DOMUtils.showToast('Please login to use AI features', 'warning');
            return;
        }

        const question = prompt('What would you like to know about this article?');
        if (question && question.trim()) {
            DOMUtils.setLoading(document.querySelector('.btn-ask-ai'), true);
            
            setTimeout(() => {
                DOMUtils.setLoading(document.querySelector('.btn-ask-ai'), false);
                DOMUtils.showToast('AI is analyzing your question... Feature coming soon!', 'info');
            }, 1500);
        }
    }

    shareQuote(button) {
        const quoteBlock = button.closest('.quote-share-block')?.querySelector('.story-quote');
        if (!quoteBlock) return;

        const quoteText = quoteBlock.textContent?.trim() || '';
        const articleTitle = document.querySelector('#articleReaderTitle')?.textContent || 'Inspiring Story';
        const url = window.location.href;

        const shareText = `"${quoteText}"\n\n— From "${articleTitle}" on HMW Beyond Borders\n${url}`;

        if (navigator.share) {
            navigator.share({
                title: 'Quote from HMW Beyond Borders',
                text: shareText,
                url: url
            }).catch(console.error);
        } else {
            this.copyLinkToClipboard(shareText);
        }
    }

    handleFollowTopic(button) {
        const topic = button.previousElementSibling?.textContent || 'Unknown Topic';
        const topicId = `topic_${topic.toLowerCase().replace(/\s+/g, '_')}`;

        const isFollowing = this.appState.toggleFollowTopic(topicId);

        if (isFollowing) {
            button.innerHTML = '<i class="fas fa-check"></i> Following Topic';
            button.classList.add('following');
            DOMUtils.showToast(`Now following "${topic}"`, 'success');
        } else {
            button.innerHTML = '<i class="fas fa-plus"></i> Follow Topic';
            button.classList.remove('following');
            DOMUtils.showToast(`Unfollowed "${topic}"`, 'info');
        }
    }

    bindSubmissionEvents() {
        const submitTriggers = document.querySelectorAll('#submitStoryTrigger, #sidebarSubmitStory, #submitStoryLink');
        submitTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.openSubmissionModal();
            });
        });

        const submissionForm = document.getElementById('articleSubmissionForm');
        if (submissionForm) {
            submissionForm.addEventListener('submit', (e) => this.handleStorySubmission(e));
        }

        const browseImagesBtn = document.getElementById('browseImages');
        if (browseImagesBtn) {
            browseImagesBtn.addEventListener('click', () => {
                document.getElementById('submissionImages').click();
            });
        }

        const imageUpload = document.getElementById('submissionImages');
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        const saveDraftBtn = document.querySelector('.btn-save-draft');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => this.saveStoryAsDraft());
        }

        const previewBtn = document.querySelector('.btn-preview-article');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.previewStory());
        }

        // Editor toolbar buttons
        const editorButtons = document.querySelectorAll('.editor-btn');
        editorButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const command = btn.getAttribute('data-command');
                this.executeEditorCommand(command);
            });
        });
    }

    openSubmissionModal() {
        if (!this.appState.isAuthenticated) {
            DOMUtils.showToast('Please login to submit a story', 'warning');
            return;
        }

        const modal = document.getElementById('articleSubmissionModal');
        if (!modal) return;

        DOMUtils.showElement(modal);
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Set focus to first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input, textarea');
            if (firstInput) firstInput.focus();
        }, 100);

        // Load draft if exists
        this.loadStoryDraft();
    }

    closeSubmissionModal() {
        const modal = document.getElementById('articleSubmissionModal');
        if (!modal) return;

        DOMUtils.hideElement(modal);
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    executeEditorCommand(command) {
        const textarea = document.getElementById('submissionContent');
        if (!textarea) return;

        textarea.focus();
        document.execCommand(command, false, null);
    }

    handleImageUpload(event) {
        const files = event.target.files;
        const preview = document.getElementById('imagePreview');
        if (!preview) return;

        preview.innerHTML = '';

        Array.from(files).slice(0, 5).forEach(file => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const imgContainer = DOMUtils.createElement('div', {
                    className: 'image-preview-item',
                    style: {
                        position: 'relative',
                        display: 'inline-block',
                        margin: '5px'
                    }
                });

                const img = DOMUtils.createElement('img', {
                    src: e.target.result,
                    style: {
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                    }
                });

                const removeBtn = DOMUtils.createElement('button', {
                    className: 'remove-image',
                    innerHTML: '<i class="fas fa-times"></i>',
                    style: {
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        fontSize: '10px'
                    }
                });

                removeBtn.addEventListener('click', () => imgContainer.remove());

                imgContainer.appendChild(img);
                imgContainer.appendChild(removeBtn);
                preview.appendChild(imgContainer);
            };

            reader.readAsDataURL(file);
        });
    }

    async handleStorySubmission(event) {
        event.preventDefault();
        
        const form = event.target;
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        // Validate required fields
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('input-error');
            } else {
                field.classList.remove('input-error');
            }
        });

        if (!isValid) {
            DOMUtils.showToast('Please fill in all required fields', 'warning');
            return;
        }

        // Check terms agreement
        const termsCheckbox = document.getElementById('submissionOriginal');
        const consentCheckbox = document.getElementById('submissionConsent');
        
        if (!termsCheckbox?.checked || !consentCheckbox?.checked) {
            DOMUtils.showToast('Please agree to the terms and conditions', 'warning');
            return;
        }

        const submitBtn = form.querySelector('.btn-submit-article');
        DOMUtils.setLoading(submitBtn, true);

        try {
            // Simulate API submission
            await this.simulateApiCall(2000);

            // Get form data
            const formData = {
                title: document.getElementById('submissionTitle').value,
                category: document.getElementById('submissionCategory').value,
                excerpt: document.getElementById('submissionExcerpt').value,
                content: document.getElementById('submissionContent').value,
                tags: document.getElementById('submissionTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
                author: document.getElementById('submissionAuthor').value,
                email: document.getElementById('submissionEmail').value,
                timestamp: new Date().toISOString()
            };

            // Clear form
            form.reset();
            document.getElementById('imagePreview').innerHTML = '';
            
            // Close modal
            this.closeSubmissionModal();

            // Show success message
            DOMUtils.showToast('Story submitted successfully! Our editors will review it shortly.', 'success', 5000);

            // Clear draft
            localStorage.removeItem('hmw_story_draft');

        } catch (error) {
            DOMUtils.showToast('Failed to submit story. Please try again.', 'error');
        } finally {
            DOMUtils.setLoading(submitBtn, false);
        }
    }

    saveStoryAsDraft() {
        const draft = {
            title: document.getElementById('submissionTitle')?.value || '',
            category: document.getElementById('submissionCategory')?.value || '',
            excerpt: document.getElementById('submissionExcerpt')?.value || '',
            content: document.getElementById('submissionContent')?.value || '',
            tags: document.getElementById('submissionTags')?.value || '',
            author: document.getElementById('submissionAuthor')?.value || '',
            email: document.getElementById('submissionEmail')?.value || '',
            savedAt: new Date().toISOString()
        };

        localStorage.setItem('hmw_story_draft', JSON.stringify(draft));
        DOMUtils.showToast('Draft saved locally', 'success', 2000);
    }

    loadStoryDraft() {
        try {
            const draft = JSON.parse(localStorage.getItem('hmw_story_draft'));
            if (draft) {
                document.getElementById('submissionTitle').value = draft.title || '';
                document.getElementById('submissionCategory').value = draft.category || '';
                document.getElementById('submissionExcerpt').value = draft.excerpt || '';
                document.getElementById('submissionContent').value = draft.content || '';
                document.getElementById('submissionTags').value = draft.tags || '';
                document.getElementById('submissionAuthor').value = draft.author || '';
                document.getElementById('submissionEmail').value = draft.email || '';
                
                const loadDraft = confirm('You have a saved draft. Load it?');
                if (!loadDraft) {
                    localStorage.removeItem('hmw_story_draft');
                }
            }
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    }

    previewStory() {
        const content = document.getElementById('submissionContent')?.value;
        if (!content) {
            DOMUtils.showToast('Please write some content first', 'warning');
            return;
        }

        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(`
            <html>
                <head>
                    <title>Story Preview - HMW Beyond Borders</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
                        h1 { color: #004D99; }
                        .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
                        .content { margin-top: 30px; }
                        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
                    </style>
                </head>
                <body>
                    <h1>${document.getElementById('submissionTitle')?.value || 'Story Preview'}</h1>
                    <div class="meta">
                        Category: ${document.getElementById('submissionCategory')?.value || 'Not specified'} | 
                        Author: ${document.getElementById('submissionAuthor')?.value || 'Anonymous'}
                    </div>
                    <div class="content">
                        ${content}
                    </div>
                    <div class="footer">
                        Preview - HMW Beyond Borders Story Submission
                    </div>
                </body>
            </html>
        `);
        previewWindow.document.close();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    simulateApiCall(duration) {
        return new Promise((resolve) => {
            setTimeout(resolve, duration);
        });
    }
}

// ================================================
// NAVIGATION & UI MODULE
// ================================================

class UIManager {
    constructor(appState) {
        this.appState = appState;
        this.isMobile = window.innerWidth <= 768;
        this.scrollPosition = 0;
        
        this.initialize();
    }

    initialize() {
        this.bindNavigationEvents();
        this.bindSearchEvents();
        this.bindThemeToggle();
        this.bindUtilityEvents();
        this.bindBreakingNewsTicker();
        this.bindMobileNavigation();
        this.setupLiveClock();
        this.setupWeatherWidget();
        this.setupLanguageSelector();
        this.setupBackToTop();
        this.setupCookieConsent();
        this.setupNotifications();
        this.setupLiveUpdates();
        this.setupPodcastPlayer();
        this.setupAdIntegration();
        
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Handle scroll events
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    bindNavigationEvents() {
        // Mobile hamburger menu
        const hamburger = document.querySelector('.hamburger-menu');
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Mega menu dropdown
        const moreCategories = document.getElementById('moreCategories');
        const megaMenu = document.getElementById('megaMenu');
        
        if (moreCategories && megaMenu) {
            moreCategories.addEventListener('click', (e) => {
                e.preventDefault();
                megaMenu.classList.toggle('show');
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!moreCategories.contains(e.target) && !megaMenu.contains(e.target)) {
                    megaMenu.classList.remove('show');
                }
            });
        }

        // Category dropdown arrows
        const categoryArrows = document.querySelectorAll('.category-arrow');
        categoryArrows.forEach(arrow => {
            arrow.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const categoryLink = arrow.closest('.category-link');
                categoryLink?.classList.toggle('expanded');
            });
        });

        // Local toggle buttons
        const localSwitches = document.querySelectorAll('.local-switch');
        localSwitches.forEach(switchBtn => {
            switchBtn.addEventListener('click', () => {
                localSwitches.forEach(btn => btn.classList.remove('active'));
                switchBtn.classList.add('active');
                
                const region = switchBtn.getAttribute('data-region');
                this.switchEdition(region);
            });
        });
    }

    toggleMobileMenu() {
        const hamburger = document.querySelector('.hamburger-menu');
        const navCategories = document.querySelector('.nav-categories');
        
        if (hamburger && navCategories) {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', (!isExpanded).toString());
            navCategories.classList.toggle('show');
            
            // Update hamburger animation
            hamburger.classList.toggle('active');
        }
    }

    switchEdition(region) {
        // Update edition badge
        const editionBadge = document.querySelector('.edition-badge span');
        if (editionBadge) {
            if (region === 'national') {
                editionBadge.textContent = 'Africa Edition';
            } else if (region === 'global') {
                editionBadge.textContent = 'Global Edition';
            } else {
                editionBadge.textContent = 'Local Edition';
            }
        }

        // Store preference
        localStorage.setItem('hmw_edition', region);
        
        // Refresh content based on edition
        this.loadEditionContent(region);
    }

    loadEditionContent(region) {
        // In production, this would fetch region-specific content
        console.log(`Loading content for ${region} edition`);
        
        // Show loading indicator
        DOMUtils.showToast(`Switching to ${region} edition...`, 'info', 1500);
    }

    bindSearchEvents() {
        const searchToggle = document.querySelector('.search-toggle');
        const searchOverlay = document.getElementById('searchOverlay');
        const searchClose = document.querySelector('.search-close');
        const mobileSearchToggle = document.querySelector('.search-mobile');
        const mobileSearchOverlay = document.getElementById('mobileSearch');
        const mobileSearchClose = document.querySelector('.mobile-search-close');
        
        // Desktop search
        if (searchToggle && searchOverlay) {
            searchToggle.addEventListener('click', () => {
                this.openSearchOverlay(searchOverlay);
            });
            
            if (searchClose) {
                searchClose.addEventListener('click', () => {
                    this.closeSearchOverlay(searchOverlay);
                });
            }
            
            searchOverlay.addEventListener('click', (e) => {
                if (e.target === searchOverlay) {
                    this.closeSearchOverlay(searchOverlay);
                }
            });
        }

        // Mobile search
        if (mobileSearchToggle && mobileSearchOverlay) {
            mobileSearchToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.openSearchOverlay(mobileSearchOverlay);
            });
            
            if (mobileSearchClose) {
                mobileSearchClose.addEventListener('click', () => {
                    this.closeSearchOverlay(mobileSearchOverlay);
                });
            }
        }

        // Search input handling
        const searchInputs = document.querySelectorAll('.search-input-full, .mobile-search-input');
        searchInputs.forEach(input => {
            input.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(input.value);
                }
            });
        });

        const searchButtons = document.querySelectorAll('.search-button-full');
        searchButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.closest('.search-input-group')?.querySelector('input');
                if (input) {
                    this.performSearch(input.value);
                }
            });
        });

        // Search suggestions
        const suggestionTags = document.querySelectorAll('.suggestion-tags a');
        suggestionTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.preventDefault();
                const searchTerm = tag.textContent;
                this.performSearch(searchTerm);
            });
        });
    }

    openSearchOverlay(overlay) {
        DOMUtils.showElement(overlay);
        document.body.style.overflow = 'hidden';
        
        // Focus on search input
        setTimeout(() => {
            const input = overlay.querySelector('input[type="search"]');
            if (input) {
                input.focus();
                input.select();
            }
        }, 100);
    }

    closeSearchOverlay(overlay) {
        DOMUtils.hideElement(overlay);
        document.body.style.overflow = '';
        
        // Clear search inputs
        const inputs = overlay.querySelectorAll('input[type="search"]');
        inputs.forEach(input => input.value = '');
    }

    performSearch(query) {
        if (!query.trim()) return;

        // Close search overlay
        const searchOverlays = document.querySelectorAll('.search-overlay, .mobile-search');
        searchOverlays.forEach(overlay => this.closeSearchOverlay(overlay));

        // Store search history
        this.saveSearchHistory(query);

        // Show loading
        DOMUtils.showToast(`Searching for "${query}"...`, 'info');

        // In production, this would redirect to search results page
        // For now, simulate search
        setTimeout(() => {
            const results = this.simulateSearch(query);
            this.displaySearchResults(results, query);
        }, 1000);
    }

    saveSearchHistory(query) {
        try {
            const history = JSON.parse(localStorage.getItem('hmw_search_history') || '[]');
            // Remove if already exists
            const index = history.indexOf(query);
            if (index > -1) history.splice(index, 1);
            // Add to beginning
            history.unshift(query);
            // Keep only last 10 searches
            localStorage.setItem('hmw_search_history', JSON.stringify(history.slice(0, 10)));
            
            // Update recent searches UI
            this.updateRecentSearchesUI();
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    }

    updateRecentSearchesUI() {
        try {
            const history = JSON.parse(localStorage.getItem('hmw_search_history') || '[]');
            const recentList = document.querySelector('.recent-list');
            
            if (recentList) {
                recentList.innerHTML = '';
                history.forEach(term => {
                    const link = DOMUtils.createElement('a', {
                        href: '#',
                        innerHTML: `<i class="fas fa-history"></i> ${term}`,
                        style: {
                            display: 'block',
                            padding: '8px 0',
                            color: '#004D99',
                            textDecoration: 'none'
                        }
                    });
                    
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.performSearch(term);
                    });
                    
                    recentList.appendChild(link);
                });
            }
        } catch (error) {
            console.error('Error updating recent searches UI:', error);
        }
    }

    simulateSearch(query) {
        // Mock search results
        const mockResults = [
            { id: 1, title: 'Traditional African Weaving Techniques', category: 'Culture & Arts', match: 'weaving' },
            { id: 2, title: 'Women Leaders in Modern Africa', category: 'Women in Leadership', match: 'women' },
            { id: 3, title: 'Ancient African Civilizations', category: 'History & Heritage', match: 'ancient' },
            { id: 4, title: 'Community Development Success Stories', category: 'Human Interest', match: 'community' },
            { id: 5, title: 'Bizarre Natural Phenomena in Africa', category: 'Bizarre & Unusual', match: 'bizarre' }
        ];

        const lowerQuery = query.toLowerCase();
        return mockResults.filter(result => 
            result.title.toLowerCase().includes(lowerQuery) || 
            result.category.toLowerCase().includes(lowerQuery) ||
            result.match.toLowerCase().includes(lowerQuery)
        );
    }

    displaySearchResults(results, query) {
        if (results.length === 0) {
            DOMUtils.showToast(`No results found for "${query}"`, 'warning');
            return;
        }

        // In production, this would show a results page
        // For demo, show toast with result count
        DOMUtils.showToast(`Found ${results.length} results for "${query}"`, 'success');
        
        // Could open a modal with results here
        // this.showSearchResultsModal(results, query);
    }

    bindThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        // Set initial theme
        this.applyTheme(this.appState.darkMode);

        themeToggle.addEventListener('click', () => {
            this.appState.darkMode = !this.appState.darkMode;
            this.applyTheme(this.appState.darkMode);
            this.appState.saveThemePreference();
        });
    }

    applyTheme(isDark) {
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        
        if (isDark) {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                themeToggle.setAttribute('aria-label', 'Switch to light mode');
            }
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                themeToggle.setAttribute('aria-label', 'Switch to dark mode');
            }
        }

        // Update theme-color meta tag
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.setAttribute('content', isDark ? '#121212' : '#004D99');
        }
    }

    bindUtilityEvents() {
        // Notification bell
        const notificationBell = document.getElementById('notificationBell');
        if (notificationBell) {
            notificationBell.addEventListener('click', () => {
                this.showNotificationsPanel();
            });
        }

        // Subscribe button
        const subscribeTrigger = document.getElementById('subscribeTrigger');
        if (subscribeTrigger) {
            subscribeTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.openSubscriptionModal();
            });
        }

        // Dashboard links
        const dashboardLinks = document.querySelectorAll('[data-action="dashboard"]');
        dashboardLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.openDashboard();
            });
        });

        // Account dropdown
        const accountDropdown = document.getElementById('accountDropdown');
        if (accountDropdown) {
            const accountBtn = accountDropdown.querySelector('.btn-account');
            const dropdownMenu = accountDropdown.querySelector('.dropdown-menu');
            
            if (accountBtn && dropdownMenu) {
                accountBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdownMenu.classList.toggle('show');
                });

                // Close when clicking outside
                document.addEventListener('click', (e) => {
                    if (!accountDropdown.contains(e.target)) {
                        dropdownMenu.classList.remove('show');
                    }
                });
            }
        }
    }

    showNotificationsPanel() {
        // In production, this would show actual notifications
        // For demo, show a toast
        DOMUtils.showToast('You have 3 unread notifications', 'info');
        
        // Clear notification badge
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.style.display = 'none';
        }
    }

    openSubscriptionModal() {
        const modal = document.getElementById('paywallModal');
        if (!modal) return;

        // Check if user already has subscription
        if (this.appState.currentUser?.subscription && this.appState.currentUser.subscription !== 'free') {
            DOMUtils.showToast('You already have an active subscription!', 'info');
            return;
        }

        DOMUtils.showElement(modal);
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Bind plan selection
        const planButtons = modal.querySelectorAll('.btn-plan-select');
        planButtons.forEach(button => {
            button.addEventListener('click', () => {
                const plan = button.getAttribute('data-plan');
                this.selectSubscriptionPlan(plan);
            });
        });

        // Close button
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.closeSubscriptionModal();
        }

        // Overlay click to close
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeSubscriptionModal();
            }
        };
    }

    closeSubscriptionModal() {
        const modal = document.getElementById('paywallModal');
        if (!modal) return;

        DOMUtils.hideElement(modal);
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    selectSubscriptionPlan(plan) {
        if (!this.appState.isAuthenticated) {
            DOMUtils.showToast('Please login to subscribe', 'warning');
            this.closeSubscriptionModal();
            // Open auth modal
            setTimeout(() => {
                const authManager = window.app?.authManager;
                if (authManager) {
                    authManager.openAuthModal('login');
                }
            }, 500);
            return;
        }

        DOMUtils.showToast(`Processing ${plan} subscription...`, 'info');

        // Simulate subscription process
        setTimeout(() => {
            // Update user subscription
            if (this.appState.currentUser) {
                this.appState.currentUser.subscription = plan;
                this.appState.saveUserState(this.appState.currentUser);
            }

            this.closeSubscriptionModal();
            DOMUtils.showToast(`Successfully subscribed to ${plan} plan!`, 'success');
            
            // Update UI
            const authManager = window.app?.authManager;
            if (authManager) {
                authManager.updateAuthUI();
            }
        }, 2000);
    }

    openDashboard() {
        if (!this.appState.isAuthenticated) {
            DOMUtils.showToast('Please login to access dashboard', 'warning');
            return;
        }

        const dashboard = document.getElementById('membershipDashboard');
        if (!dashboard) return;

        DOMUtils.showElement(dashboard);
        
        // Load dashboard content
        this.loadDashboardContent();
    }

    loadDashboardContent() {
        const dashboardMain = document.querySelector('.dashboard-main');
        if (!dashboardMain) return;

        // Load profile content by default
        this.loadProfileSection();
        
        // Bind dashboard navigation
        const navItems = document.querySelectorAll('.dashboard-nav .nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Load corresponding section
                const icon = item.querySelector('i');
                if (icon.classList.contains('fa-user-circle')) {
                    this.loadProfileSection();
                } else if (icon.classList.contains('fa-bookmark')) {
                    this.loadSavedStoriesSection();
                } else if (icon.classList.contains('fa-history')) {
                    this.loadReadingHistorySection();
                } else if (icon.classList.contains('fa-credit-card')) {
                    this.loadSubscriptionSection();
                } else if (icon.classList.contains('fa-bell')) {
                    this.loadNotificationsSection();
                } else if (icon.classList.contains('fa-cog')) {
                    this.loadSettingsSection();
                }
            });
        });

        // Close button
        const closeBtn = document.querySelector('.dashboard-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                DOMUtils.hideElement(document.getElementById('membershipDashboard'));
            });
        }
    }

    loadProfileSection() {
        const dashboardMain = document.querySelector('.dashboard-main');
        if (!dashboardMain || !this.appState.currentUser) return;

        const user = this.appState.currentUser;
        
        dashboardMain.innerHTML = `
            <div class="dashboard-section profile-section">
                <h3><i class="fas fa-user-circle"></i> My Profile</h3>
                <div class="profile-header">
                    <img src="${user.avatar}" alt="${user.firstName}" class="profile-avatar">
                    <div class="profile-info">
                        <h4>${user.firstName} ${user.lastName}</h4>
                        <p class="profile-email">${user.email}</p>
                        <div class="profile-badges">
                            <span class="badge ${user.subscription === 'free' ? 'badge-free' : 'badge-premium'}">
                                <i class="fas ${user.subscription === 'free' ? 'fa-user' : 'fa-crown'}"></i>
                                ${user.subscription === 'free' ? 'Free Reader' : 'Premium Member'}
                            </span>
                            <span class="badge badge-verified">
                                <i class="fas fa-check-circle"></i> Verified
                            </span>
                        </div>
                    </div>
                </div>
                <div class="profile-stats">
                    <div class="stat-card">
                        <i class="fas fa-bookmark"></i>
                        <div class="stat-info">
                            <span class="stat-value">${this.appState.savedArticles.size}</span>
                            <span class="stat-label">Saved Stories</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-heart"></i>
                        <div class="stat-info">
                            <span class="stat-value">24</span>
                            <span class="stat-label">Liked Stories</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-comment"></i>
                        <div class="stat-info">
                            <span class="stat-value">12</span>
                            <span class="stat-label">Comments</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-calendar-alt"></i>
                        <div class="stat-info">
                            <span class="stat-value">${new Date().getFullYear() - 2023}</span>
                            <span class="stat-label">Years with us</span>
                        </div>
                    </div>
                </div>
                <div class="profile-actions">
                    <button class="btn btn-edit-profile">
                        <i class="fas fa-edit"></i> Edit Profile
                    </button>
                    <button class="btn btn-change-password">
                        <i class="fas fa-key"></i> Change Password
                    </button>
                </div>
            </div>
        `;
    }

    loadSavedStoriesSection() {
        const dashboardMain = document.querySelector('.dashboard-main');
        if (!dashboardMain) return;

        const savedCount = this.appState.savedArticles.size;
        
        dashboardMain.innerHTML = `
            <div class="dashboard-section saved-section">
                <div class="section-header">
                    <h3><i class="fas fa-bookmark"></i> Saved Stories</h3>
                    <span class="section-count">${savedCount} stories</span>
                </div>
                ${savedCount > 0 ? `
                    <div class="saved-list">
                        <p>Your saved stories will appear here.</p>
                        <p class="small-text">This feature is under development.</p>
                    </div>
                ` : `
                    <div class="empty-state">
                        <i class="fas fa-bookmark fa-3x"></i>
                        <h4>No saved stories yet</h4>
                        <p>Save stories you love by clicking the bookmark icon</p>
                        <button class="btn btn-explore-stories">
                            <i class="fas fa-compass"></i> Explore Stories
                        </button>
                    </div>
                `}
            </div>
        `;
    }

    loadReadingHistorySection() {
        const dashboardMain = document.querySelector('.dashboard-main');
        if (!dashboardMain) return;

        dashboardMain.innerHTML = `
            <div class="dashboard-section history-section">
                <div class="section-header">
                    <h3><i class="fas fa-history"></i> Reading History</h3>
                    <button class="btn-clear-history">
                        <i class="fas fa-trash"></i> Clear All
                    </button>
                </div>
                <div class="empty-state">
                    <i class="fas fa-history fa-3x"></i>
                    <h4>No reading history yet</h4>
                    <p>Your reading history will appear here as you read stories</p>
                </div>
            </div>
        `;
    }

    loadSubscriptionSection() {
        const dashboardMain = document.querySelector('.dashboard-main');
        if (!dashboardMain) return;

        const user = this.appState.currentUser;
        const isPremium = user?.subscription && user.subscription !== 'free';
        
        dashboardMain.innerHTML = `
            <div class="dashboard-section subscription-section">
                <h3><i class="fas fa-credit-card"></i> Subscription</h3>
                <div class="subscription-card ${isPremium ? 'premium' : 'free'}">
                    <div class="subscription-header">
                        <h4>${isPremium ? 'Premium Membership' : 'Free Reader'}</h4>
                        <span class="subscription-badge ${isPremium ? 'badge-premium' : 'badge-free'}">
                            ${isPremium ? 'ACTIVE' : 'FREE'}
                        </span>
                    </div>
                    <div class="subscription-details">
                        ${isPremium ? `
                            <p><i class="fas fa-check"></i> Current Plan: ${user.subscription}</p>
                            <p><i class="fas fa-calendar"></i> Renewal: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                        ` : `
                            <p><i class="fas fa-check"></i> Access to free stories</p>
                            <p><i class="fas fa-times"></i> No premium content</p>
                            <p><i class="fas fa-times"></i> With advertisements</p>
                        `}
                    </div>
                    <div class="subscription-actions">
                        ${isPremium ? `
                            <button class="btn btn-manage-subscription">
                                <i class="fas fa-cog"></i> Manage Subscription
                            </button>
                            <button class="btn btn-cancel-subscription">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        ` : `
                            <button class="btn btn-upgrade">
                                <i class="fas fa-crown"></i> Upgrade to Premium
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    loadNotificationsSection() {
        const dashboardMain = document.querySelector('.dashboard-main');
        if (!dashboardMain) return;

        dashboardMain.innerHTML = `
            <div class="dashboard-section notifications-section">
                <div class="section-header">
                    <h3><i class="fas fa-bell"></i> Notifications</h3>
                    <div class="notification-settings">
                        <label class="switch">
                            <input type="checkbox" ${this.appState.notificationsEnabled ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                        <span>Push Notifications</span>
                    </div>
                </div>
                <div class="notifications-list">
                    <div class="notification-item unread">
                        <i class="fas fa-newspaper"></i>
                        <div class="notification-content">
                            <h5>New story published</h5>
                            <p>"The Last Storytellers" is now available to read</p>
                            <span class="notification-time">2 hours ago</span>
                        </div>
                    </div>
                    <div class="notification-item">
                        <i class="fas fa-user-plus"></i>
                        <div class="notification-content">
                            <h5>New follower</h5>
                            <p>James Kariuki started following you</p>
                            <span class="notification-time">1 day ago</span>
                        </div>
                    </div>
                    <div class="notification-item">
                        <i class="fas fa-comment"></i>
                        <div class="notification-content">
                            <h5>New comment</h5>
                            <p>Amina Hassan replied to your comment</p>
                            <span class="notification-time">2 days ago</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    loadSettingsSection() {
        const dashboardMain = document.querySelector('.dashboard-main');
        if (!dashboardMain) return;

        dashboardMain.innerHTML = `
            <div class="dashboard-section settings-section">
                <h3><i class="fas fa-cog"></i> Settings</h3>
                <div class="settings-grid">
                    <div class="settings-group">
                        <h5><i class="fas fa-user"></i> Account Settings</h5>
                        <div class="setting-item">
                            <label>Email Notifications</label>
                            <label class="switch">
                                <input type="checkbox" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>Newsletter</label>
                            <label class="switch">
                                <input type="checkbox" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="settings-group">
                        <h5><i class="fas fa-eye"></i> Display</h5>
                        <div class="setting-item">
                            <label>Dark Mode</label>
                            <label class="switch">
                                <input type="checkbox" ${this.appState.darkMode ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>Font Size</label>
                            <select class="font-size-select">
                                <option value="small">Small</option>
                                <option value="medium" selected>Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                    </div>
                    <div class="settings-group">
                        <h5><i class="fas fa-shield-alt"></i> Privacy</h5>
                        <div class="setting-item">
                            <label>Public Profile</label>
                            <label class="switch">
                                <input type="checkbox">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>Show Reading Activity</label>
                            <label class="switch">
                                <input type="checkbox" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="settings-actions">
                    <button class="btn btn-save-settings">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                    <button class="btn btn-export-data">
                        <i class="fas fa-download"></i> Export Data
                    </button>
                    <button class="btn btn-delete-account">
                        <i class="fas fa-trash"></i> Delete Account
                    </button>
                </div>
            </div>
        `;
    }

    bindBreakingNewsTicker() {
        const ticker = document.querySelector('.breaking-news-ticker');
        if (!ticker) return;

        const tickerContent = ticker.querySelector('.ticker-content');
        if (!tickerContent) return;

        // Clone content for seamless scrolling
        const content = tickerContent.innerHTML;
        tickerContent.innerHTML = content + content;

        let isPaused = false;
        let animationId;

        const animateTicker = () => {
            if (isPaused) return;

            const scrollAmount = 1;
            tickerContent.scrollLeft += scrollAmount;

            // Reset to start for seamless loop
            if (tickerContent.scrollLeft >= tickerContent.scrollWidth / 2) {
                tickerContent.scrollLeft = 0;
            }

            animationId = requestAnimationFrame(animateTicker);
        };

        // Start animation
        animateTicker();

        // Pause on hover/touch
        ticker.addEventListener('mouseenter', () => {
            isPaused = true;
        });

        ticker.addEventListener('mouseleave', () => {
            isPaused = false;
            if (!animationId) {
                animateTicker();
            }
        });

        // Touch events for mobile
        ticker.addEventListener('touchstart', () => {
            isPaused = true;
        });

        ticker.addEventListener('touchend', () => {
            setTimeout(() => {
                isPaused = false;
                if (!animationId) {
                    animateTicker();
                }
            }, 1000);
        });
    }

    bindMobileNavigation() {
        const mobileNavItems = document.querySelectorAll('.mobile-bottom-nav .nav-item');
        mobileNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update active state
                mobileNavItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Handle navigation
                const icon = item.querySelector('i');
                if (icon.classList.contains('fa-search')) {
                    this.openSearchOverlay(document.getElementById('mobileSearch'));
                } else if (icon.classList.contains('fa-user')) {
                    if (this.appState.isAuthenticated) {
                        this.openDashboard();
                    } else {
                        const authManager = window.app?.authManager;
                        if (authManager) {
                            authManager.openAuthModal('login');
                        }
                    }
                }
                // Other nav items would navigate to different pages
            });
        });
    }

    setupLiveClock() {
        const liveClock = document.getElementById('liveClock');
        const currentTime = document.getElementById('currentTime');
        const currentDate = document.getElementById('currentDate');
        
        if (!liveClock || !currentTime || !currentDate) return;

        const updateClock = () => {
            const now = new Date();
            
            // Nairobi time (UTC+3)
            const nairobiTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
            
            // Format time
            const timeString = nairobiTime.toLocaleTimeString('en-KE', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'Africa/Nairobi'
            });
            
            // Format date
            const dateString = nairobiTime.toLocaleDateString('en-KE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'Africa/Nairobi'
            });
            
            currentTime.textContent = timeString;
            currentDate.textContent = dateString;
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    setupWeatherWidget() {
        const weatherWidget = document.getElementById('weatherWidget');
        if (!weatherWidget) return;

        // Mock weather data for Nairobi
        const weatherData = {
            temp: '24°C',
            location: 'Nairobi',
            condition: 'Partly Cloudy',
            icon: 'fa-cloud-sun'
        };

        // Update widget
        const tempSpan = weatherWidget.querySelector('.weather-temp');
        const locationSpan = weatherWidget.querySelector('.weather-location');
        const icon = weatherWidget.querySelector('i');
        
        if (tempSpan) tempSpan.textContent = weatherData.temp;
        if (locationSpan) locationSpan.textContent = weatherData.location;
        if (icon) icon.className = `fas ${weatherData.icon}`;

        // Refresh button
        const refreshBtn = document.querySelector('.btn-refresh-weather');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                DOMUtils.setLoading(refreshBtn, true);
                
                setTimeout(() => {
                    // Simulate new weather data
                    const newTemp = Math.floor(Math.random() * 10) + 20;
                    if (tempSpan) tempSpan.textContent = `${newTemp}°C`;
                    
                    // Rotate through conditions
                    const conditions = ['fa-sun', 'fa-cloud-sun', 'fa-cloud', 'fa-cloud-rain'];
                    const randomIcon = conditions[Math.floor(Math.random() * conditions.length)];
                    if (icon) icon.className = `fas ${randomIcon}`;
                    
                    DOMUtils.setLoading(refreshBtn, false);
                    DOMUtils.showToast('Weather updated', 'success', 1500);
                }, 1000);
            });
        }
    }

    setupLanguageSelector() {
        const languageSelector = document.querySelector('.language-selector select');
        if (!languageSelector) return;

        // Load saved language preference
        const savedLanguage = localStorage.getItem('hmw_language') || 'en';
        languageSelector.value = savedLanguage;

        languageSelector.addEventListener('change', (e) => {
            const language = e.target.value;
            localStorage.setItem('hmw_language', language);
            
            // Show loading message
            DOMUtils.showToast(`Switching to ${this.getLanguageName(language)}...`, 'info');
            
            // In production, this would reload page with new language
            // For demo, just update UI text
            this.updateLanguageUI(language);
        });
    }

    getLanguageName(code) {
        const languages = {
            en: 'English',
            sw: 'Kiswahili',
            fr: 'Français',
            ar: 'العربية'
        };
        return languages[code] || 'English';
    }

    updateLanguageUI(language) {
        // This would update all text on the page in production
        // For demo, just update a few elements
        const elementsToUpdate = {
            'site-title': {
                en: 'HMW Beyond Borders',
                sw: 'HWB Zaidi ya Mipaka',
                fr: 'HWB Au-Delà des Frontières',
                ar: 'إتش إم دبليو ما وراء الحدود'
            },
            'site-tagline': {
                en: 'Bringing The Unseen to Light',
                sw: 'Kuletea Usioonekana Kwenye Mwanga',
                fr: 'Mettre en Lumière l\'Invisible',
                ar: 'جلب غير المرئي إلى النور'
            }
        };

        Object.entries(elementsToUpdate).forEach(([selector, translations]) => {
            const element = document.querySelector(`.${selector}`);
            if (element && translations[language]) {
                element.textContent = translations[language];
            }
        });
    }

    setupBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        const backToTopSidebar = document.getElementById('backToTopSidebar');
        const backToTopFooter = document.getElementById('backToTopFooter');

        const scrollToTop = () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        };

        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', scrollToTop);
        }

        if (backToTopSidebar) {
            backToTopSidebar.addEventListener('click', scrollToTop);
        }

        if (backToTopFooter) {
            backToTopFooter.addEventListener('click', scrollToTop);
        }

        // Show/hide based on scroll
        const toggleBackToTop = () => {
            const shouldShow = window.scrollY > 500;
            
            if (backToTopBtn) {
                backToTopBtn.style.opacity = shouldShow ? '1' : '0';
                backToTopBtn.style.visibility = shouldShow ? 'visible' : 'hidden';
            }
        };

        window.addEventListener('scroll', toggleBackToTop);
        toggleBackToTop(); // Initial check
    }

    setupCookieConsent() {
        const cookieConsent = document.getElementById('cookieConsent');
        if (!cookieConsent) return;

        // Check if consent already given
        if (this.appState.cookieConsent) {
            DOMUtils.hideElement(cookieConsent);
            return;
        }

        // Show consent banner after delay
        setTimeout(() => {
            DOMUtils.showElement(cookieConsent);
        }, 1000);

        // Bind consent buttons
        const acceptBtn = document.getElementById('acceptCookies');
        const rejectBtn = document.getElementById('rejectCookies');
        const settingsBtn = document.getElementById('cookieSettings');

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                this.appState.saveCookieConsent('all');
                DOMUtils.hideElement(cookieConsent);
                DOMUtils.showToast('Cookies accepted', 'success');
                
                // Load analytics scripts here in production
                this.loadAnalyticsScripts();
            });
        }

        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => {
                this.appState.saveCookieConsent('essential');
                DOMUtils.hideElement(cookieConsent);
                DOMUtils.showToast('Non-essential cookies rejected', 'info');
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showCookieSettings();
            });
        }
    }

    loadAnalyticsScripts() {
        // In production, this would load Google Analytics, Facebook Pixel, etc.
        console.log('Loading analytics scripts...');
    }

    showCookieSettings() {
        // Simplified cookie settings modal
        DOMUtils.confirmDialog(
            'Cookie Settings: We use cookies for essential functionality and analytics. You can manage your preferences here.',
            'Accept All',
            'Essential Only'
        ).then(acceptAll => {
            if (acceptAll) {
                this.appState.saveCookieConsent('all');
                this.loadAnalyticsScripts();
            } else {
                this.appState.saveCookieConsent('essential');
            }
            DOMUtils.hideElement(document.getElementById('cookieConsent'));
            DOMUtils.showToast('Cookie preferences saved', 'success');
        });
    }

    setupNotifications() {
        const notificationPermission = document.getElementById('notificationPermission');
        const allowBtn = document.getElementById('allowNotifications');
        const denyBtn = document.getElementById('denyNotifications');

        if (!notificationPermission || !allowBtn || !denyBtn) return;

        // Check if already asked
        const notificationAsked = localStorage.getItem('hmw_notification_asked');
        if (notificationAsked) {
            DOMUtils.hideElement(notificationPermission);
            return;
        }

        // Show after delay
        setTimeout(() => {
            if (!this.appState.isAuthenticated) return;
            
            DOMUtils.showElement(notificationPermission);
        }, 3000);

        allowBtn.addEventListener('click', async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    this.appState.notificationsEnabled = true;
                    DOMUtils.showToast('Notifications enabled!', 'success');
                    
                    // Subscribe to push notifications in production
                    this.subscribeToPushNotifications();
                }
            } catch (error) {
                console.error('Error requesting notification permission:', error);
            } finally {
                localStorage.setItem('hmw_notification_asked', 'true');
                DOMUtils.hideElement(notificationPermission);
            }
        });

        denyBtn.addEventListener('click', () => {
            localStorage.setItem('hmw_notification_asked', 'true');
            DOMUtils.hideElement(notificationPermission);
            DOMUtils.showToast('You can enable notifications later in settings', 'info');
        });
    }

    subscribeToPushNotifications() {
        // In production, this would use the Push API
        console.log('Subscribing to push notifications...');
    }

    setupLiveUpdates() {
        const liveFeed = document.getElementById('liveFeed');
        const pauseLiveBtn = document.getElementById('pauseLive');
        const refreshLiveBtn = document.getElementById('refreshLive');
        const refreshAutoStoriesBtn = document.getElementById('refreshAutoStories');

        let liveUpdatesActive = true;
        let liveUpdateInterval;

        // Live feed updates
        if (liveFeed) {
            const updateLiveFeed = () => {
                if (!liveUpdatesActive) return;

                const now = new Date();
                const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                                 now.getMinutes().toString().padStart(2, '0');

                // Sample updates
                const updates = [
                    "Cultural festival enters final day with record attendance",
                    "New archaeological discovery announced in Egypt",
                    "Women entrepreneurs conference launches mentorship program",
                    "Community garden project receives international funding",
                    "Traditional music performance live streaming now"
                ];

                const randomUpdate = updates[Math.floor(Math.random() * updates.length)];

                const updateItem = DOMUtils.createElement('div', {
                    className: 'update-item'
                });

                updateItem.innerHTML = `
                    <span class="update-time">${timeString}</span>
                    <span class="update-text">${randomUpdate}</span>
                    <span class="update-badge">UPDATE</span>
                `;

                liveFeed.insertBefore(updateItem, liveFeed.firstChild);

                // Keep only last 5 items
                while (liveFeed.children.length > 5) {
                    liveFeed.removeChild(liveFeed.lastChild);
                }
            };

            // Start updates
            liveUpdateInterval = setInterval(updateLiveFeed, 30000); // Every 30 seconds

            // Pause/play button
            if (pauseLiveBtn) {
                pauseLiveBtn.addEventListener('click', () => {
                    liveUpdatesActive = !liveUpdatesActive;
                    
                    if (liveUpdatesActive) {
                        pauseLiveBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Updates';
                        DOMUtils.showToast('Live updates resumed', 'success', 1500);
                    } else {
                        pauseLiveBtn.innerHTML = '<i class="fas fa-play"></i> Resume Updates';
                        DOMUtils.showToast('Live updates paused', 'info', 1500);
                    }
                });
            }
        }

        // Refresh buttons
        if (refreshLiveBtn) {
            refreshLiveBtn.addEventListener('click', () => {
                DOMUtils.setLoading(refreshLiveBtn, true);
                
                setTimeout(() => {
                    // Simulate new content
                    if (liveFeed) {
                        const now = new Date();
                        const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                                         now.getMinutes().toString().padStart(2, '0');

                        const updateItem = DOMUtils.createElement('div', {
                            className: 'update-item'
                        });

                        updateItem.innerHTML = `
                            <span class="update-time">${timeString}</span>
                            <span class="update-text">Live feed refreshed with latest updates</span>
                            <span class="update-badge">REFRESHED</span>
                        `;

                        liveFeed.insertBefore(updateItem, liveFeed.firstChild);
                    }

                    DOMUtils.setLoading(refreshLiveBtn, false);
                    DOMUtils.showToast('Live feed refreshed', 'success', 1500);
                }, 1000);
            });
        }

        if (refreshAutoStoriesBtn) {
            refreshAutoStoriesBtn.addEventListener('click', () => {
                DOMUtils.setLoading(refreshAutoStoriesBtn, true);
                
                setTimeout(() => {
                    // Simulate fetching new stories
                    this.loadAutoFetchedStories();
                    DOMUtils.setLoading(refreshAutoStoriesBtn, false);
                    DOMUtils.showToast('Stories refreshed', 'success', 1500);
                }, 1500);
            });
        }
    }

    loadAutoFetchedStories() {
        const autoGrid = document.getElementById('autoArticlesGrid');
        if (!autoGrid) return;

        // Clear placeholder
        const placeholder = autoGrid.querySelector('.api-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }

        // Sample auto-fetched stories
        const sampleStories = [
            {
                id: 'auto_1',
                title: 'Climate Change Adaptation in Rural Communities',
                excerpt: 'How traditional knowledge is helping communities adapt to changing weather patterns.',
                category: 'Environment',
                source: 'UN News',
                image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                time: '1 hour ago'
            },
            {
                id: 'auto_2',
                title: 'Digital Literacy Programs Transforming Education',
                excerpt: 'Non-profits are bringing digital skills to remote areas, creating new opportunities.',
                category: 'Education',
                source: 'TechAfrica',
                image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                time: '2 hours ago'
            },
            {
                id: 'auto_3',
                title: 'Urban Farming Revolution in Major Cities',
                excerpt: 'Residents are turning rooftops and vacant lots into productive green spaces.',
                category: 'Urban Development',
                source: 'CityNews',
                image: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                time: '3 hours ago'
            },
            {
                id: 'auto_4',
                title: 'Youth-led Conservation Efforts Gain Momentum',
                excerpt: 'Young activists are leading the charge to protect endangered species and habitats.',
                category: 'Conservation',
                source: 'EcoWatch',
                image: 'https://images.unsplash.com/photo-1539136788836-5699e78bfc75?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                time: '4 hours ago'
            }
        ];

        // Clear existing stories (keep template)
        const existingStories = autoGrid.querySelectorAll('.story-card.auto-fetched');
        existingStories.forEach(story => {
            if (!story.classList.contains('template')) {
                story.remove();
            }
        });

        // Add new stories
        sampleStories.forEach((story, index) => {
            const template = document.getElementById('autoArticleTemplate');
            if (!template) return;

            const storyEl = template.content.cloneNode(true);
            const article = storyEl.querySelector('.story-card');
            
            article.setAttribute('data-article-id', story.id);
            article.setAttribute('data-api-source', story.source.toLowerCase().replace(/\s+/g, '_'));
            
            // Fill in data
            const categoryLabel = article.querySelector('.category-label');
            if (categoryLabel) categoryLabel.textContent = story.category;
            
            const timeText = article.querySelector('.time-text');
            if (timeText) timeText.textContent = story.time;
            
            const sourceName = article.querySelector('.source-name');
            if (sourceName) sourceName.textContent = story.source;
            
            const img = article.querySelector('.story-image img');
            if (img) {
                img.src = story.image;
                img.alt = story.title;
            }
            
            const headline = article.querySelector('.story-headline');
            if (headline) headline.textContent = story.title;
            
            const excerpt = article.querySelector('.story-excerpt');
            if (excerpt) excerpt.textContent = story.excerpt;
            
            const authorName = article.querySelector('.author-name');
            if (authorName) authorName.textContent = story.source;
            
            // Add event listeners
            const interactionButtons = article.querySelectorAll('.btn-interaction');
            interactionButtons.forEach(btn => {
                const btnClone = btn.cloneNode(true);
                btn.parentNode.replaceChild(btnClone, btn);
            });

            autoGrid.appendChild(storyEl);
        });
    }

    setupPodcastPlayer() {
        const player = document.querySelector('.podcast-player');
        if (!player) return;

        const playBtn = player.querySelector('.play');
        const progressFill = player.querySelector('.progress-fill');
        const currentTimeEl = player.querySelector('.progress-time span:first-child');
        const totalTimeEl = player.querySelector('.progress-time span:last-child');
        const volumeBtn = player.querySelector('.player-btn:nth-child(4)');
        const speedBtn = player.querySelector('.player-btn:nth-child(5)');

        let isPlaying = false;
        let currentTime = 1215; // 20:15 in seconds
        const totalTime = 2700; // 45:00 in seconds

        const updateDisplay = () => {
            const progressPercent = (currentTime / totalTime) * 100;
            if (progressFill) progressFill.style.width = `${progressPercent}%`;
            
            if (currentTimeEl) {
                const minutes = Math.floor(currentTime / 60);
                const seconds = Math.floor(currentTime % 60);
                currentTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            if (totalTimeEl) {
                const totalMinutes = Math.floor(totalTime / 60);
                const totalSeconds = Math.floor(totalTime % 60);
                totalTimeEl.textContent = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
            }
        };

        updateDisplay();

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                isPlaying = !isPlaying;
                
                if (isPlaying) {
                    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    playBtn.setAttribute('aria-label', 'Pause');
                    
                    // Simulate playback
                    const interval = setInterval(() => {
                        if (!isPlaying) {
                            clearInterval(interval);
                            return;
                        }
                        
                        currentTime += 1;
                        if (currentTime >= totalTime) {
                            currentTime = 0;
                            isPlaying = false;
                            playBtn.innerHTML = '<i class="fas fa-play"></i>';
                            playBtn.setAttribute('aria-label', 'Play');
                            clearInterval(interval);
                        }
                        
                        updateDisplay();
                    }, 1000);
                    
                    playBtn.dataset.intervalId = interval;
                } else {
                    playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    playBtn.setAttribute('aria-label', 'Play');
                    
                    if (playBtn.dataset.intervalId) {
                        clearInterval(parseInt(playBtn.dataset.intervalId));
                        delete playBtn.dataset.intervalId;
                    }
                }
            });
        }

        if (volumeBtn) {
            volumeBtn.addEventListener('click', () => {
                const volumes = ['fa-volume-mute', 'fa-volume-down', 'fa-volume-up'];
                const currentIcon = volumeBtn.querySelector('i').className;
                const currentIndex = volumes.findIndex(vol => currentIcon.includes(vol));
                const nextIndex = (currentIndex + 1) % volumes.length;
                
                volumeBtn.innerHTML = `<i class="fas ${volumes[nextIndex]}"></i>`;
                volumeBtn.setAttribute('aria-label', `${['Mute', 'Low', 'High'][nextIndex]} volume`);
            });
        }

        if (speedBtn) {
            speedBtn.addEventListener('click', () => {
                const speeds = ['1.0x', '1.25x', '1.5x', '2.0x'];
                const currentSpeed = speedBtn.textContent || '1.0x';
                const currentIndex = speeds.indexOf(currentSpeed);
                const nextIndex = (currentIndex + 1) % speeds.length;
                
                speedBtn.textContent = speeds[nextIndex];
                speedBtn.setAttribute('aria-label', `Playback speed: ${speeds[nextIndex]}`);
            });
        }

        // Progress bar click to seek
        const progressBar = player.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                const rect = progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                currentTime = Math.floor(totalTime * percent);
                updateDisplay();
            });
        }
    }

    setupAdIntegration() {
        // Lazy load ads
        const ads = document.querySelectorAll('.ad-content img');
        ads.forEach(img => {
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const lazyImage = entry.target;
                            lazyImage.src = lazyImage.dataset.src;
                            observer.unobserve(lazyImage);
                        }
                    });
                });
                
                observer.observe(img);
            }
        });

        // Ad click tracking
        const adButtons = document.querySelectorAll('.btn-ad-cta, .btn-native-ad, .btn-advertise');
        adButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Track ad click
                console.log('Ad clicked:', btn.textContent);
                
                // In production, this would send to analytics
                // For demo, just show toast
                DOMUtils.showToast('Redirecting to advertiser...', 'info', 2000);
            });
        });

        // Rotate native ads
        const nativeAd = document.getElementById('nativeAd');
        if (nativeAd) {
            setInterval(() => {
                // In production, this would fetch new ads from server
                // For demo, just update text occasionally
                if (Math.random() > 0.7) {
                    const adText = nativeAd.querySelector('.native-ad-text h4');
                    if (adText) {
                        const ads = [
                            'Support Cultural Preservation',
                            'Join Our Storytelling Workshop',
                            'Become a Community Contributor',
                            'Explore Traditional Crafts'
                        ];
                        const randomAd = ads[Math.floor(Math.random() * ads.length)];
                        adText.textContent = randomAd;
                    }
                }
            }, 30000); // Every 30 seconds
        }
    }

    handleResize() {
        this.isMobile = window.innerWidth <= 768;
        
        // Adjust UI based on screen size
        if (this.isMobile) {
            // Mobile-specific adjustments
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
            
            // Ensure mobile menu is closed
            const navCategories = document.querySelector('.nav-categories');
            if (navCategories) navCategories.classList.remove('show');
            
            const hamburger = document.querySelector('.hamburger-menu');
            if (hamburger) {
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        }
    }

    handleScroll() {
        this.scrollPosition = window.scrollY;
        
        // Sticky header behavior
        const header = document.querySelector('.main-navigation');
        if (header) {
            if (this.scrollPosition > 100) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        }
        
        // Reading progress for current article
        const articleReader = document.getElementById('articleReaderModal');
        if (articleReader && !articleReader.hasAttribute('hidden')) {
            const articleId = articleReader.getAttribute('data-article-id');
            if (articleId) {
                const progress = this.calculateScrollProgress();
                window.app?.appState.updateReadingProgress(articleId, progress);
            }
        }
    }

    calculateScrollProgress() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        
        const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
        return Math.min(100, Math.max(0, progress));
    }
}

// ================================================
// PWA & PERFORMANCE MODULE
// ================================================

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        
        this.initialize();
    }

    initialize() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOfflineDetection();
        this.setupPerformanceMonitoring();
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('ServiceWorker registration successful:', registration);
                        
                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New update available
                                    this.showUpdateNotification();
                                }
                            });
                        });
                    })
                    .catch(error => {
                        console.error('ServiceWorker registration failed:', error);
                    });
            });
        }
    }

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            
            // Show install button
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            // Clear the deferredPrompt
            this.deferredPrompt = null;
            
            // Hide install button
            this.hideInstallButton();
            
            // Log installation
            console.log('PWA installed successfully');
            
            // Show welcome message
            DOMUtils.showToast('App installed successfully!', 'success');
        });
    }

    showInstallButton() {
        // Check if we're already in standalone mode
        if (this.isStandalone) return;

        // Create install button if not exists
        let installBtn = document.getElementById('pwaInstallButton');
        if (!installBtn) {
            installBtn = DOMUtils.createElement('button', {
                id: 'pwaInstallButton',
                className: 'pwa-install-btn',
                innerHTML: '<i class="fas fa-download"></i> Install App',
                style: {
                    position: 'fixed',
                    bottom: '80px',
                    right: '20px',
                    background: '#004D99',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    zIndex: '1000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }
            });

            installBtn.addEventListener('click', () => {
                this.promptInstall();
            });

            document.body.appendChild(installBtn);
        }
    }

    hideInstallButton() {
        const installBtn = document.getElementById('pwaInstallButton');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    async promptInstall() {
        if (!this.deferredPrompt) return;

        // Show the install prompt
        this.deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const choiceResult = await this.deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        
        // Clear the deferredPrompt
        this.deferredPrompt = null;
        this.hideInstallButton();
    }

    showUpdateNotification() {
        const updateNotification = DOMUtils.createElement('div', {
            className: 'update-notification',
            style: {
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                right: '20px',
                background: '#004D99',
                color: 'white',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                zIndex: '1001',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }
        });

        updateNotification.innerHTML = `
            <div>
                <i class="fas fa-sync-alt"></i>
                <span>New update available!</span>
            </div>
            <button id="refreshApp" style="
                background: 'white',
                color: '#004D99',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
            ">Update Now</button>
        `;

        document.body.appendChild(updateNotification);

        document.getElementById('refreshApp').addEventListener('click', () => {
            window.location.reload();
        });

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (updateNotification.parentNode) {
                updateNotification.style.opacity = '0';
                setTimeout(() => updateNotification.remove(), 300);
            }
        }, 10000);
    }

    setupOfflineDetection() {
        // Update UI based on online/offline status
        const updateOnlineStatus = () => {
            if (navigator.onLine) {
                document.body.classList.remove('offline');
                // Remove offline notification if exists
                const offlineNotice = document.getElementById('offlineNotice');
                if (offlineNotice) offlineNotice.remove();
            } else {
                document.body.classList.add('offline');
                this.showOfflineNotice();
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus(); // Initial check
    }

    showOfflineNotice() {
        // Check if notice already exists
        if (document.getElementById('offlineNotice')) return;

        const notice = DOMUtils.createElement('div', {
            id: 'offlineNotice',
            style: {
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                background: '#ff9800',
                color: 'white',
                textAlign: 'center',
                padding: '10px',
                zIndex: '1002',
                fontSize: '14px'
            }
        });

        notice.innerHTML = `
            <i class="fas fa-wifi"></i>
            <span>You are currently offline. Some features may be limited.</span>
        `;

        document.body.appendChild(notice);
    }

    setupPerformanceMonitoring() {
        // Monitor page load performance
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfEntries = performance.getEntriesByType('navigation');
                    if (perfEntries.length > 0) {
                        const navEntry = perfEntries[0];
                        const loadTime = navEntry.loadEventEnd - navEntry.startTime;
                        
                        // Log performance metrics
                        console.log(`Page loaded in ${Math.round(loadTime)}ms`);
                        
                        // Store for analytics
                        this.trackPerformance(loadTime);
                    }
                }, 0);
            });
        }

        // Monitor Core Web Vitals (simplified)
        if ('PerformanceObserver' in window) {
            try {
                // Largest Contentful Paint
                const lcpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('LCP:', lastEntry.startTime);
                });

                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

                // First Input Delay
                const fidObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        console.log('FID:', entry.processingStart - entry.startTime);
                    });
                });

                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.log('Performance monitoring not supported:', e);
            }
        }
    }

    trackPerformance(loadTime) {
        // Store performance data
        const perfData = {
            loadTime: Math.round(loadTime),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink
            } : null
        };

        // Save locally
        try {
            const existingData = JSON.parse(localStorage.getItem('hmw_perf_metrics') || '[]');
            existingData.push(perfData);
            // Keep only last 50 entries
            localStorage.setItem('hmw_perf_metrics', JSON.stringify(existingData.slice(-50)));
        } catch (error) {
            console.error('Error saving performance metrics:', error);
        }
    }
}

// ================================================
// MAIN APPLICATION INITIALIZATION
// ================================================

class HMWApplication {
    constructor() {
        this.appState = null;
        this.authManager = null;
        this.contentManager = null;
        this.uiManager = null;
        this.pwaManager = null;
        
        this.initialize();
    }

    initialize() {
        // Initialize core components
        this.appState = new AppState();
        this.authManager = new AuthenticationManager(this.appState);
        this.contentManager = new ContentInteractionManager(this.appState);
        this.uiManager = new UIManager(this.appState);
        this.pwaManager = new PWAManager();
        
        // Make globally available for debugging
        window.app = this;
        
        // Initialize additional features
        this.setupAnalytics();
        this.setupErrorHandling();
        this.setupIdleDetection();
        
        // Mark as loaded
        document.body.classList.add('js-loaded');
        
        console.log('HMW Beyond Borders application initialized');
    }

    setupAnalytics() {
        // Basic page view tracking
        this.trackPageView();
        
        // Interaction tracking
        document.addEventListener('click', (e) => {
            const target = e.target;
            const articleCard = target.closest('.story-card');
            
            if (articleCard) {
                const articleId = articleCard.getAttribute('data-article-id');
                if (articleId) {
                    this.trackEvent('article_click', { articleId });
                }
            }
        });
    }

    trackPageView() {
        const pageData = {
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString(),
            userId: this.appState.currentUser?.id || 'anonymous'
        };

        // Store locally
        try {
            const pageViews = JSON.parse(localStorage.getItem('hmw_page_views') || '[]');
            pageViews.push(pageData);
            localStorage.setItem('hmw_page_views', JSON.stringify(pageViews.slice(-100)));
        } catch (error) {
            console.error('Error tracking page view:', error);
        }
    }

    trackEvent(eventName, data = {}) {
        const eventData = {
            event: eventName,
            data: data,
            timestamp: new Date().toISOString(),
            userId: this.appState.currentUser?.id || 'anonymous'
        };

        console.log('Event tracked:', eventData);
        
        // Store locally
        try {
            const events = JSON.parse(localStorage.getItem('hmw_events') || '[]');
            events.push(eventData);
            localStorage.setItem('hmw_events', JSON.stringify(events.slice(-200)));
        } catch (error) {
            console.error('Error tracking event:', error);
        }
    }

    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            
            // Don't show error toast for production (would be logged to service)
            if (window.location.hostname === 'localhost') {
                DOMUtils.showToast(`Error: ${event.error.message}`, 'error', 5000);
            }
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
    }

    setupIdleDetection() {
        let idleTimeout;
        let isIdle = false;

        const resetIdleTimer = () => {
            clearTimeout(idleTimeout);
            
            if (isIdle) {
                isIdle = false;
                document.body.classList.remove('user-idle');
                // User is active again
                this.trackEvent('user_active');
            }
            
            idleTimeout = setTimeout(() => {
                isIdle = true;
                document.body.classList.add('user-idle');
                // User is idle
                this.trackEvent('user_idle');
            }, 300000); // 5 minutes
        };

        // Events that reset idle timer
        ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetIdleTimer, { passive: true });
        });

        resetIdleTimer(); // Start the timer
    }
}

// ================================================
// APPLICATION BOOTSTRAP
// ================================================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new HMWApplication();
    });
} else {
    // DOM already loaded
    new HMWApplication();
}

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        HMWApplication,
        AppState,
        AuthenticationManager,
        ContentInteractionManager,
        UIManager,
        PWAManager,
        DOMUtils
    };
}
