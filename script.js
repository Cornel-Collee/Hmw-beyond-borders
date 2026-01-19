// ===== MAIN APPLICATION MODULE =====
const HMWApp = (function() {
    // Configuration
    const config = {
        apiBase: 'https://api.hmwbeyondborders.com/v1',
        localStorageKey: 'hmw_reader_preferences',
        defaultSettings: {
            theme: 'light',
            fontSize: 'medium',
            notifications: true,
            autoPlayVideos: false,
            saveReadingHistory: true
        },
        socialColors: {
            facebook: '#1877f2',
            twitter: '#000000',
            instagram: '#e1306c',
            whatsapp: '#25d366',
            linkedin: '#0077b5',
            youtube: '#ff0000',
            telegram: '#0088cc',
            tiktok: '#000000'
        }
    };

    // Application State
    let state = {
        user: null,
        settings: {},
        readingHistory: [],
        savedArticles: [],
        currentArticle: null,
        notifications: [],
        liveUpdates: [],
        trendingTopics: [],
        weatherData: null,
        isDarkMode: false,
        isMobileMenuOpen: false,
        isSearchOpen: false,
        isNotificationsOpen: false,
        currentPage: 1,
        isLoading: false,
        liveUpdatesInterval: null,
        weatherUpdateInterval: null,
        breakingNewsInterval: null
    };

    // ===== DOM ELEMENTS =====
    const elements = {
        // Utility Bar
        liveClock: document.getElementById('liveClock'),
        currentDate: document.getElementById('currentDate'),
        weatherWidget: document.getElementById('weatherWidget'),
        
        // Navigation
        themeToggle: document.getElementById('themeToggle'),
        notificationBell: document.querySelector('.notification-bell'),
        hamburgerMenu: document.querySelector('.hamburger-menu'),
        mobileSearchBtn: document.querySelector('.search-mobile'),
        mobileBottomNav: document.querySelector('.mobile-bottom-nav'),
        
        // Search
        searchOverlay: document.getElementById('searchOverlay'),
        searchClose: document.querySelector('.search-close'),
        searchInputFull: document.querySelector('.search-input-full'),
        searchButtonFull: document.querySelector('.search-button-full'),
        
        // Cookie Consent
        cookieConsent: document.getElementById('cookieConsent'),
        acceptCookies: document.getElementById('acceptCookies'),
        rejectCookies: document.getElementById('rejectCookies'),
        
        // Social Interactions
        likeButtons: document.querySelectorAll('.like-btn'),
        commentButtons: document.querySelectorAll('.comment-btn'),
        shareButtons: document.querySelectorAll('.share-btn'),
        saveButtons: document.querySelectorAll('.btn-save-article'),
        
        // Live Updates
        liveFeed: document.getElementById('liveFeed'),
        pauseLive: document.getElementById('pauseLive'),
        
        // Back to Top
        backToTop: document.getElementById('backToTop'),
        backToTopSidebar: document.getElementById('backToTopSidebar'),
        backToTopFooter: document.getElementById('backToTopFooter'),
        
        // Modals
        loginModal: document.getElementById('loginModal'),
        subscribeModal: document.getElementById('subscribeModal'),
        
        // Notification
        notificationToast: document.getElementById('notificationToast'),
        
        // Breaking News
        breakingNewsTicker: document.querySelector('.breaking-news-ticker'),
        
        // Polls
        pollOptions: document.querySelectorAll('.poll-option'),
        
        // Newsletter Forms
        newsletterForms: document.querySelectorAll('.newsletter-form'),
        
        // Podcast Player
        podcastPlayer: document.querySelector('.podcast-player'),
        
        // Mobile Search
        mobileSearch: document.querySelector('.mobile-search'),
        mobileSearchInput: document.querySelector('.mobile-search-input'),
        mobileSearchClose: document.querySelector('.mobile-search-close'),
        
        // Contextual Bar
        localSwitches: document.querySelectorAll('.local-switch'),
        
        // Mega Menu
        megaMenu: document.getElementById('megaMenu'),
        moreCategories: document.getElementById('moreCategories'),
        
        // Loading
        loadingIndicator: document.getElementById('loadingIndicator'),
        loadMoreBtn: document.querySelector('.btn-load-more'),
        
        // Weather Refresh
        refreshWeather: document.querySelector('.btn-refresh-weather'),
        
        // Trending Refresh
        refreshTrending: document.querySelector('.btn-refresh-trending')
    };

    // ===== INITIALIZATION =====
    function init() {
        console.log('HMW Beyond Borders - Initializing Application');
        
        // Load saved state
        loadSavedState();
        
        // Initialize modules
        initClock();
        initWeather();
        initTheme();
        initEventListeners();
        initSocialInteractions();
        initLiveUpdates();
        initBreakingNews();
        initSearch();
        initMobileNavigation();
        initCookieConsent();
        initNotifications();
        initBackToTop();
        initNewsletter();
        initPolls();
        initPodcastPlayer();
        initInfiniteScroll();
        initLocalSwitcher();
        
        // Fetch initial data
        fetchTrendingTopics();
        fetchLatestNews();
        fetchLiveEvents();
        
        // Start auto updates
        startAutoUpdates();
        
        // Show welcome notification
        setTimeout(() => {
            showNotification('Welcome to HMW Beyond Borders!', 'Explore inspiring stories from around the world.', 'info');
        }, 2000);
        
        console.log('Application initialized successfully');
    }

    // ===== STATE MANAGEMENT =====
    function loadSavedState() {
        try {
            const saved = localStorage.getItem(config.localStorageKey);
            if (saved) {
                const data = JSON.parse(saved);
                state.settings = { ...config.defaultSettings, ...data.settings };
                state.savedArticles = data.savedArticles || [];
                state.readingHistory = data.readingHistory || [];
                state.isDarkMode = data.theme === 'dark';
                
                // Apply settings
                if (state.settings.theme === 'dark') {
                    enableDarkMode();
                }
            } else {
                state.settings = { ...config.defaultSettings };
                saveState();
            }
        } catch (error) {
            console.error('Error loading saved state:', error);
            state.settings = { ...config.defaultSettings };
        }
    }

    function saveState() {
        try {
            const data = {
                settings: state.settings,
                savedArticles: state.savedArticles,
                readingHistory: state.readingHistory,
                theme: state.isDarkMode ? 'dark' : 'light'
            };
            localStorage.setItem(config.localStorageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    function updateSetting(key, value) {
        state.settings[key] = value;
        saveState();
        
        // Apply setting if needed
        if (key === 'theme') {
            if (value === 'dark') {
                enableDarkMode();
            } else {
                disableDarkMode();
            }
        }
    }

    // ===== TIME AND DATE =====
    function initClock() {
        updateDateTime();
        setInterval(updateDateTime, 1000);
    }

    function updateDateTime() {
        const now = new Date();
        
        // Update time
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const timeString = now.toLocaleTimeString('en-US', timeOptions);
        if (elements.liveClock) {
            const timeSpan = elements.liveClock.querySelector('#currentTime');
            if (timeSpan) timeSpan.textContent = timeString;
        }
        
        // Update date
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateString = now.toLocaleDateString('en-US', dateOptions);
        if (elements.currentDate) {
            elements.currentDate.textContent = dateString;
        }
    }

    // ===== WEATHER WIDGET =====
    async function initWeather() {
        try {
            // Try to get user's location
            if (navigator.geolocation && state.settings.locationAccess) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        await fetchWeatherData(position.coords.latitude, position.coords.longitude);
                    },
                    async () => {
                        // Fallback to default location
                        await fetchWeatherData(-1.286389, 36.817223); // Nairobi coordinates
                    }
                );
            } else {
                await fetchWeatherData(-1.286389, 36.817223); // Nairobi
            }
        } catch (error) {
            console.error('Error initializing weather:', error);
            updateWeatherUI({
                temp: 24,
                condition: 'Sunny',
                location: 'Nairobi',
                humidity: 65,
                wind: 12,
                pressure: 1013,
                visibility: 10,
                forecast: []
            });
        }
    }

    async function fetchWeatherData(lat, lon) {
        try {
            // In production, this would be a real API call
            // For now, using mock data
            const mockWeather = {
                temp: Math.floor(Math.random() * 10) + 20, // 20-30°C
                condition: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
                location: 'Nairobi',
                humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
                wind: Math.floor(Math.random() * 10) + 5, // 5-15 km/h
                pressure: 1013,
                visibility: 10,
                forecast: [
                    { day: 'Mon', icon: 'fa-sun', high: 25, low: 18 },
                    { day: 'Tue', icon: 'fa-cloud-sun', high: 24, low: 17 },
                    { day: 'Wed', icon: 'fa-cloud-rain', high: 22, low: 16 },
                    { day: 'Thu', icon: 'fa-cloud', high: 23, low: 17 },
                    { day: 'Fri', icon: 'fa-sun', high: 26, low: 19 }
                ]
            };
            
            state.weatherData = mockWeather;
            updateWeatherUI(mockWeather);
            
        } catch (error) {
            console.error('Error fetching weather:', error);
        }
    }

    function updateWeatherUI(weather) {
        // Update main weather widget
        if (elements.weatherWidget) {
            const tempEl = elements.weatherWidget.querySelector('.weather-temp');
            const locationEl = elements.weatherWidget.querySelector('.weather-location');
            const iconEl = elements.weatherWidget.querySelector('i');
            
            if (tempEl) tempEl.textContent = `${weather.temp}°C`;
            if (locationEl) locationEl.textContent = weather.location;
            if (iconEl) {
                // Update icon based on condition
                const iconMap = {
                    'Sunny': 'fa-sun',
                    'Cloudy': 'fa-cloud',
                    'Partly Cloudy': 'fa-cloud-sun',
                    'Rainy': 'fa-cloud-rain'
                };
                iconEl.className = `fas ${iconMap[weather.condition] || 'fa-cloud-sun'}`;
            }
        }
        
        // Update detailed weather widget
        const detailedWidget = document.querySelector('.weather-detailed');
        if (detailedWidget) {
            const tempEl = detailedWidget.querySelector('.temp');
            const conditionEl = detailedWidget.querySelector('.condition');
            const locationEl = detailedWidget.querySelector('.location');
            
            if (tempEl) tempEl.textContent = `${weather.temp}°C`;
            if (conditionEl) conditionEl.textContent = weather.condition;
            if (locationEl) locationEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${weather.location}, KE`;
            
            // Update details
            const details = [
                { selector: '.detail-item:nth-child(1) .detail-value', value: `${weather.wind} km/h` },
                { selector: '.detail-item:nth-child(2) .detail-value', value: `${weather.humidity}%` },
                { selector: '.detail-item:nth-child(3) .detail-value', value: `${weather.visibility} km` },
                { selector: '.detail-item:nth-child(4) .detail-value', value: `${weather.pressure} hPa` }
            ];
            
            details.forEach(detail => {
                const el = detailedWidget.querySelector(detail.selector);
                if (el) el.textContent = detail.value;
            });
            
            // Update forecast
            const forecastDays = detailedWidget.querySelectorAll('.forecast-day');
            forecastDays.forEach((dayEl, index) => {
                if (weather.forecast[index]) {
                    const day = weather.forecast[index];
                    const daySpan = dayEl.querySelector('.day');
                    const icon = dayEl.querySelector('i');
                    const tempSpan = dayEl.querySelector('.temp-range');
                    
                    if (daySpan) daySpan.textContent = day.day;
                    if (icon) icon.className = `fas ${day.icon}`;
                    if (tempSpan) tempSpan.textContent = `${day.high}° / ${day.low}°`;
                }
            });
        }
    }

    // ===== THEME MANAGEMENT =====
    function initTheme() {
        if (state.isDarkMode) {
            enableDarkMode();
        }
    }

    function enableDarkMode() {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        state.isDarkMode = true;
        
        const themeIcon = elements.themeToggle?.querySelector('i');
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
        }
        
        updateSetting('theme', 'dark');
    }

    function disableDarkMode() {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        state.isDarkMode = false;
        
        const themeIcon = elements.themeToggle?.querySelector('i');
        if (themeIcon) {
            themeIcon.className = 'fas fa-moon';
        }
        
        updateSetting('theme', 'light');
    }

    function toggleTheme() {
        if (state.isDarkMode) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    }

    // ===== SOCIAL INTERACTIONS =====
    function initSocialInteractions() {
        // Like functionality
        elements.likeButtons?.forEach(btn => {
            btn.addEventListener('click', function() {
                const articleId = this.closest('.news-card, .side-article, .hero-main')?.dataset.id || 'default';
                handleLike(articleId, this);
            });
        });
        
        // Comment functionality
        elements.commentButtons?.forEach(btn => {
            btn.addEventListener('click', function() {
                const articleId = this.closest('.news-card, .side-article, .hero-main')?.dataset.id || 'default';
                openCommentSection(articleId);
            });
        });
        
        // Share functionality
        elements.shareButtons?.forEach(btn => {
            btn.addEventListener('click', function() {
                const articleElement = this.closest('.news-card, .side-article, .hero-main');
                const articleTitle = articleElement?.querySelector('.news-title, h3, .hero-title')?.textContent || 'HMW Beyond Borders Story';
                const articleUrl = window.location.href;
                shareArticle(articleTitle, articleUrl);
            });
        });
        
        // Save article functionality
        elements.saveButtons?.forEach(btn => {
            btn.addEventListener('click', function() {
                const articleElement = this.closest('.news-card, .side-article, .hero-main');
                const articleId = articleElement?.dataset.id || Date.now().toString();
                const articleTitle = articleElement?.querySelector('.news-title, h3, .hero-title')?.textContent || 'Untitled Story';
                const articleCategory = articleElement?.querySelector('.news-category, .category-label')?.textContent || 'General';
                
                saveArticle(articleId, articleTitle, articleCategory, this);
            });
        });
    }

    async function handleLike(articleId, button) {
        try {
            const countEl = button.querySelector('.like-count');
            let count = parseInt(countEl.textContent) || 0;
            
            // Check if already liked
            const isLiked = button.classList.contains('liked');
            
            if (isLiked) {
                // Unlike
                count--;
                button.classList.remove('liked');
                button.querySelector('i').className = 'far fa-heart';
                showNotification('Like removed', 'You unliked this story', 'info');
            } else {
                // Like
                count++;
                button.classList.add('liked');
                button.querySelector('i').className = 'fas fa-heart';
                showNotification('Story liked!', 'Thank you for your appreciation', 'success');
                
                // Add to user's liked articles
                if (state.user) {
                    // In production: API call to save like
                    console.log(`User ${state.user.id} liked article ${articleId}`);
                }
            }
            
            countEl.textContent = count;
            
            // Update total likes on server (simulated)
            setTimeout(() => {
                // Simulate server update
                console.log(`Updated likes for article ${articleId}: ${count}`);
            }, 500);
            
        } catch (error) {
            console.error('Error handling like:', error);
            showNotification('Error', 'Could not process your like', 'error');
        }
    }

    function openCommentSection(articleId) {
        // Create comment modal
        const commentModal = document.createElement('div');
        commentModal.className = 'comment-modal-overlay';
        commentModal.innerHTML = `
            <div class="comment-modal-content">
                <div class="comment-modal-header">
                    <h3>Comments</h3>
                    <button class="comment-modal-close">&times;</button>
                </div>
                <div class="comments-list">
                    <div class="comment-loading">Loading comments...</div>
                </div>
                <div class="comment-form">
                    <textarea placeholder="Share your thoughts..." rows="3"></textarea>
                    <div class="comment-form-actions">
                        <button class="btn-cancel">Cancel</button>
                        <button class="btn-submit-comment">Post Comment</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(commentModal);
        
        // Load comments
        loadComments(articleId, commentModal.querySelector('.comments-list'));
        
        // Event listeners
        commentModal.querySelector('.comment-modal-close').addEventListener('click', () => {
            document.body.removeChild(commentModal);
        });
        
        commentModal.querySelector('.btn-cancel').addEventListener('click', () => {
            document.body.removeChild(commentModal);
        });
        
        commentModal.querySelector('.btn-submit-comment').addEventListener('click', () => {
            const textarea = commentModal.querySelector('textarea');
            const comment = textarea.value.trim();
            
            if (comment) {
                postComment(articleId, comment, commentModal.querySelector('.comments-list'));
                textarea.value = '';
            }
        });
        
        // Close on overlay click
        commentModal.addEventListener('click', (e) => {
            if (e.target === commentModal) {
                document.body.removeChild(commentModal);
            }
        });
        
        // Add CSS for modal
        if (!document.querySelector('#comment-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'comment-modal-styles';
            style.textContent = `
                .comment-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    padding: 20px;
                }
                .comment-modal-content {
                    background: white;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 600px;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                }
                .comment-modal-header {
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .comment-modal-header h3 {
                    margin: 0;
                    font-size: 1.5rem;
                }
                .comment-modal-close {
                    background: none;
                    border: none;
                    font-size: 2rem;
                    cursor: pointer;
                    color: #666;
                }
                .comments-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }
                .comment-form {
                    padding: 20px;
                    border-top: 1px solid #eee;
                }
                .comment-form textarea {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    resize: vertical;
                    font-family: inherit;
                }
                .comment-form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 10px;
                }
                .btn-cancel, .btn-submit-comment {
                    padding: 8px 20px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                }
                .btn-cancel {
                    background: #f5f5f5;
                    color: #333;
                }
                .btn-submit-comment {
                    background: #004D99;
                    color: white;
                }
                .comment-item {
                    padding: 15px 0;
                    border-bottom: 1px solid #f5f5f5;
                }
                .comment-author {
                    font-weight: 600;
                    margin-bottom: 5px;
                }
                .comment-text {
                    color: #333;
                    line-height: 1.5;
                }
                .comment-time {
                    font-size: 0.8rem;
                    color: #999;
                    margin-top: 5px;
                }
            `;
            document.head.appendChild(style);
        }
    }

    async function loadComments(articleId, container) {
        try {
            // Simulate API call
            setTimeout(() => {
                const mockComments = [
                    { id: 1, author: 'John M.', text: 'This story is incredibly inspiring!', time: '2 hours ago' },
                    { id: 2, author: 'Sarah K.', text: 'Thank you for sharing these important stories.', time: '3 hours ago' },
                    { id: 3, author: 'Cultural Enthusiast', text: 'We need more coverage of cultural heritage!', time: '5 hours ago' }
                ];
                
                container.innerHTML = '';
                mockComments.forEach(comment => {
                    const commentEl = document.createElement('div');
                    commentEl.className = 'comment-item';
                    commentEl.innerHTML = `
                        <div class="comment-author">${comment.author}</div>
                        <div class="comment-text">${comment.text}</div>
                        <div class="comment-time">${comment.time}</div>
                    `;
                    container.appendChild(commentEl);
                });
                
                // Add comment count update
                const commentButtons = document.querySelectorAll(`[data-article="${articleId}"] .comment-count`);
                commentButtons.forEach(btn => {
                    if (btn.textContent === '0') {
                        btn.textContent = mockComments.length;
                    }
                });
                
            }, 1000);
        } catch (error) {
            console.error('Error loading comments:', error);
            container.innerHTML = '<div class="comment-error">Failed to load comments. Please try again.</div>';
        }
    }

    async function postComment(articleId, comment, container) {
        try {
            // Simulate API call
            setTimeout(() => {
                const newComment = {
                    id: Date.now(),
                    author: state.user?.name || 'Anonymous Reader',
                    text: comment,
                    time: 'Just now'
                };
                
                const commentEl = document.createElement('div');
                commentEl.className = 'comment-item';
                commentEl.innerHTML = `
                    <div class="comment-author">${newComment.author}</div>
                    <div class="comment-text">${newComment.text}</div>
                    <div class="comment-time">${newComment.time}</div>
                `;
                
                container.insertBefore(commentEl, container.firstChild);
                
                // Update comment count
                const commentButtons = document.querySelectorAll(`[data-article="${articleId}"] .comment-count`);
                commentButtons.forEach(btn => {
                    const currentCount = parseInt(btn.textContent) || 0;
                    btn.textContent = currentCount + 1;
                });
                
                showNotification('Comment posted!', 'Your comment has been published.', 'success');
                
            }, 500);
        } catch (error) {
            console.error('Error posting comment:', error);
            showNotification('Error', 'Failed to post comment. Please try again.', 'error');
        }
    }

    function shareArticle(title, url) {
        if (navigator.share) {
            // Use Web Share API if available
            navigator.share({
                title: title,
                text: 'Check out this inspiring story from HMW Beyond Borders',
                url: url
            }).then(() => {
                showNotification('Shared!', 'Story shared successfully.', 'success');
            }).catch(err => {
                console.error('Error sharing:', err);
                fallbackShare(title, url);
            });
        } else {
            fallbackShare(title, url);
        }
    }

    function fallbackShare(title, url) {
        // Create share modal
        const shareModal = document.createElement('div');
        shareModal.className = 'share-modal-overlay';
        shareModal.innerHTML = `
            <div class="share-modal-content">
                <div class="share-modal-header">
                    <h3>Share This Story</h3>
                    <button class="share-modal-close">&times;</button>
                </div>
                <div class="share-options">
                    <button class="share-option" data-platform="facebook">
                        <i class="fab fa-facebook-f"></i>
                        <span>Facebook</span>
                    </button>
                    <button class="share-option" data-platform="twitter">
                        <i class="fab fa-x-twitter"></i>
                        <span>Twitter</span>
                    </button>
                    <button class="share-option" data-platform="whatsapp">
                        <i class="fab fa-whatsapp"></i>
                        <span>WhatsApp</span>
                    </button>
                    <button class="share-option" data-platform="linkedin">
                        <i class="fab fa-linkedin-in"></i>
                        <span>LinkedIn</span>
                    </button>
                    <button class="share-option" data-platform="telegram">
                        <i class="fab fa-telegram-plane"></i>
                        <span>Telegram</span>
                    </button>
                    <button class="share-option" data-platform="copy">
                        <i class="fas fa-link"></i>
                        <span>Copy Link</span>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(shareModal);
        
        // Add CSS
        if (!document.querySelector('#share-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'share-modal-styles';
            style.textContent = `
                .share-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    padding: 20px;
                }
                .share-modal-content {
                    background: white;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 500px;
                    padding: 25px;
                }
                .share-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }
                .share-modal-header h3 {
                    margin: 0;
                    font-size: 1.3rem;
                }
                .share-modal-close {
                    background: none;
                    border: none;
                    font-size: 1.8rem;
                    cursor: pointer;
                    color: #666;
                }
                .share-options {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                }
                .share-option {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 20px 10px;
                    border: 1px solid #eee;
                    background: white;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .share-option:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .share-option i {
                    font-size: 1.8rem;
                    margin-bottom: 5px;
                }
                .share-option[data-platform="facebook"] i { color: #1877f2; }
                .share-option[data-platform="twitter"] i { color: #000000; }
                .share-option[data-platform="whatsapp"] i { color: #25d366; }
                .share-option[data-platform="linkedin"] i { color: #0077b5; }
                .share-option[data-platform="telegram"] i { color: #0088cc; }
                .share-option[data-platform="copy"] i { color: #666; }
                .share-option span {
                    font-size: 0.9rem;
                    font-weight: 600;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Event listeners
        shareModal.querySelector('.share-modal-close').addEventListener('click', () => {
            document.body.removeChild(shareModal);
        });
        
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                document.body.removeChild(shareModal);
            }
        });
        
        const shareOptions = shareModal.querySelectorAll('.share-option');
        shareOptions.forEach(option => {
            option.addEventListener('click', () => {
                const platform = option.dataset.platform;
                shareToPlatform(platform, title, url);
                document.body.removeChild(shareModal);
            });
        });
    }

    function shareToPlatform(platform, title, url) {
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);
        
        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
            linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
            telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
        };
        
        if (platform === 'copy') {
            navigator.clipboard.writeText(url).then(() => {
                showNotification('Link copied!', 'Story link copied to clipboard.', 'success');
            });
            return;
        }
        
        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
            showNotification('Sharing...', `Opening ${platform} to share story.`, 'info');
        }
    }

    function saveArticle(articleId, title, category, button) {
        const isSaved = button.classList.contains('saved');
        
        if (isSaved) {
            // Remove from saved
            state.savedArticles = state.savedArticles.filter(article => article.id !== articleId);
            button.classList.remove('saved');
            button.querySelector('i').className = 'far fa-bookmark';
            showNotification('Removed from saved', 'Story removed from your saved list', 'info');
        } else {
            // Add to saved
            state.savedArticles.push({
                id: articleId,
                title: title,
                category: category,
                savedAt: new Date().toISOString()
            });
            button.classList.add('saved');
            button.querySelector('i').className = 'fas fa-bookmark';
            showNotification('Story saved!', 'Added to your saved stories', 'success');
        }
        
        saveState();
    }

    // ===== LIVE UPDATES =====
    function initLiveUpdates() {
        if (elements.liveFeed) {
            fetchLiveUpdates();
            state.liveUpdatesInterval = setInterval(fetchLiveUpdates, 30000); // Update every 30 seconds
        }
    }

    async function fetchLiveUpdates() {
        try {
            // Simulate API call
            setTimeout(() => {
                const updates = [
                    { time: '14:45', text: 'Cultural festival in Ghana attracts record 50,000 visitors', badge: 'CULTURE' },
                    { time: '14:30', text: 'New archaeological discovery in Egypt reveals ancient trading route', badge: 'HISTORY' },
                    { time: '14:15', text: 'Women entrepreneurship grants announced for African startups', badge: 'LEADERSHIP' },
                    { time: '14:00', text: 'Community hero recognized for planting 100,000 trees', badge: 'INSPIRING' },
                    { time: '13:45', text: 'Rare cultural artifact returned to its country of origin', badge: 'HERITAGE' }
                ];
                
                state.liveUpdates = updates;
                renderLiveUpdates(updates);
                
            }, 1000);
        } catch (error) {
            console.error('Error fetching live updates:', error);
        }
    }

    function renderLiveUpdates(updates) {
        if (!elements.liveFeed) return;
        
        elements.liveFeed.innerHTML = '';
        updates.forEach(update => {
            const updateEl = document.createElement('div');
            updateEl.className = 'update-item';
            updateEl.innerHTML = `
                <span class="update-time">${update.time}</span>
                <span class="update-text">${update.text}</span>
                <span class="update-badge">${update.badge}</span>
            `;
            elements.liveFeed.appendChild(updateEl);
        });
    }

    // ===== BREAKING NEWS =====
    function initBreakingNews() {
        if (elements.breakingNewsTicker) {
            fetchBreakingNews();
            state.breakingNewsInterval = setInterval(fetchBreakingNews, 60000); // Update every minute
        }
    }

    async function fetchBreakingNews() {
        try {
            // Simulate API call
            setTimeout(() => {
                const breakingNews = [
                    'UNESCO adds 3 new African heritage sites to World Heritage List',
                    'Record-breaking women\'s conference concludes with major agreements',
                    'Historic climate agreement signed by African nations',
                    'Major cultural preservation project announced for West Africa'
                ];
                
                renderBreakingNews(breakingNews);
                
            }, 500);
        } catch (error) {
            console.error('Error fetching breaking news:', error);
        }
    }

    function renderBreakingNews(newsItems) {
        const tickerContent = elements.breakingNewsTicker?.querySelector('.ticker-content');
        if (!tickerContent) return;
        
        tickerContent.innerHTML = '';
        newsItems.forEach((item, index) => {
            const span = document.createElement('span');
            span.textContent = item;
            tickerContent.appendChild(span);
            
            if (index < newsItems.length - 1) {
                const separator = document.createElement('span');
                separator.className = 'ticker-separator';
                separator.textContent = '•';
                tickerContent.appendChild(separator);
            }
        });
    }

    // ===== SEARCH FUNCTIONALITY =====
    function initSearch() {
        // Search toggle
        document.querySelectorAll('.search-toggle, .search-mobile').forEach(btn => {
            btn.addEventListener('click', openSearch);
        });
        
        // Search close
        elements.searchClose?.addEventListener('click', closeSearch);
        elements.mobileSearchClose?.addEventListener('click', closeMobileSearch);
        
        // Search input
        elements.searchInputFull?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(elements.searchInputFull.value);
            }
        });
        
        elements.searchButtonFull?.addEventListener('click', () => {
            performSearch(elements.searchInputFull?.value || '');
        });
        
        // Mobile search
        elements.mobileSearchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(elements.mobileSearchInput.value);
                closeMobileSearch();
            }
        });
        
        // Close search on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeSearch();
                closeMobileSearch();
            }
        });
    }

    function openSearch() {
        state.isSearchOpen = true;
        if (window.innerWidth <= 768) {
            // Mobile search
            elements.mobileSearch?.classList.add('active');
            elements.mobileSearchInput?.focus();
        } else {
            // Desktop search overlay
            elements.searchOverlay.style.display = 'block';
            setTimeout(() => {
                elements.searchOverlay.style.opacity = '1';
                elements.searchInputFull?.focus();
            }, 10);
        }
    }

    function closeSearch() {
        state.isSearchOpen = false;
        elements.searchOverlay.style.opacity = '0';
        setTimeout(() => {
            elements.searchOverlay.style.display = 'none';
        }, 300);
    }

    function closeMobileSearch() {
        elements.mobileSearch?.classList.remove('active');
        state.isSearchOpen = false;
    }

    async function performSearch(query) {
        if (!query.trim()) return;
        
        showNotification('Searching...', `Looking for "${query}"`, 'info');
        
        try {
            // Simulate API call
            setTimeout(() => {
                const results = [
                    { title: 'Traditional Weaving Techniques', category: 'Culture & Arts', url: '#' },
                    { title: 'Women Leaders in Technology', category: 'Women in Leadership', url: '#' },
                    { title: 'Ancient African Civilizations', category: 'History & Heritage', url: '#' },
                    { title: 'Community Development Stories', category: 'Human Interest', url: '#' }
                ];
                
                displaySearchResults(results);
                
                // Add to search history
                addToSearchHistory(query);
                
            }, 1000);
        } catch (error) {
            console.error('Error performing search:', error);
            showNotification('Search failed', 'Please try again later', 'error');
        }
    }

    function displaySearchResults(results) {
        // In a real app, this would navigate to a search results page
        // For now, show notification
        showNotification('Search complete', `Found ${results.length} results`, 'success');
    }

    function addToSearchHistory(query) {
        const history = JSON.parse(localStorage.getItem('hmw_search_history') || '[]');
        history.unshift({
            query: query,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 searches
        localStorage.setItem('hmw_search_history', JSON.stringify(history.slice(0, 10)));
    }

    // ===== MOBILE NAVIGATION =====
    function initMobileNavigation() {
        // Hamburger menu
        elements.hamburgerMenu?.addEventListener('click', toggleMobileMenu);
        
        // Mobile bottom nav
        if (elements.mobileBottomNav) {
            elements.mobileBottomNav.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    if (this.classList.contains('search-mobile')) {
                        e.preventDefault();
                        openSearch();
                    }
                });
            });
        }
        
        // Close mobile menu on click outside
        document.addEventListener('click', (e) => {
            if (state.isMobileMenuOpen && !e.target.closest('.main-navigation')) {
                closeMobileMenu();
            }
        });
    }

    function toggleMobileMenu() {
        if (state.isMobileMenuOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    function openMobileMenu() {
        state.isMobileMenuOpen = true;
        document.querySelector('.nav-categories')?.classList.add('mobile-open');
        document.body.style.overflow = 'hidden';
        
        // Animate hamburger to X
        const lines = elements.hamburgerMenu?.querySelectorAll('.hamburger-line');
        if (lines) {
            lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            lines[1].style.opacity = '0';
            lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        }
    }

    function closeMobileMenu() {
        state.isMobileMenuOpen = false;
        document.querySelector('.nav-categories')?.classList.remove('mobile-open');
        document.body.style.overflow = '';
        
        // Reset hamburger
        const lines = elements.hamburgerMenu?.querySelectorAll('.hamburger-line');
        if (lines) {
            lines[0].style.transform = 'none';
            lines[1].style.opacity = '1';
            lines[2].style.transform = 'none';
        }
    }

    // ===== COOKIE CONSENT =====
    function initCookieConsent() {
        const consent = localStorage.getItem('hmw_cookie_consent');
        
        if (!consent) {
            elements.cookieConsent.style.display = 'block';
        }
        
        elements.acceptCookies?.addEventListener('click', () => {
            localStorage.setItem('hmw_cookie_consent', 'accepted');
            elements.cookieConsent.style.display = 'none';
            showNotification('Preferences saved', 'Thank you for accepting cookies', 'success');
        });
        
        elements.rejectCookies?.addEventListener('click', () => {
            localStorage.setItem('hmw_cookie_consent', 'rejected');
            elements.cookieConsent.style.display = 'none';
            showNotification('Preferences saved', 'Non-essential cookies rejected', 'info');
        });
    }

    // ===== NOTIFICATIONS =====
    function initNotifications() {
        // Load notifications
        fetchNotifications();
        
        // Notification bell click
        elements.notificationBell?.addEventListener('click', toggleNotifications);
        
        // Close notifications on click outside
        document.addEventListener('click', (e) => {
            if (state.isNotificationsOpen && !e.target.closest('.notification-bell')) {
                closeNotifications();
            }
        });
    }

    async function fetchNotifications() {
        try {
            // Simulate API call
            setTimeout(() => {
                state.notifications = [
                    { id: 1, title: 'New Story Published', message: 'Check out our latest feature on cultural heritage', read: false, time: '10 min ago' },
                    { id: 2, title: 'Your Comment Got a Reply', message: 'Someone replied to your comment on the weaving story', read: false, time: '1 hour ago' },
                    { id: 3, title: 'Trending Alert', message: 'The story you saved is now trending', read: true, time: '2 hours ago' }
                ];
                
                updateNotificationBadge();
                
            }, 500);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }

    function toggleNotifications() {
        if (state.isNotificationsOpen) {
            closeNotifications();
        } else {
            openNotifications();
        }
    }

    function openNotifications() {
        state.isNotificationsOpen = true;
        
        // Create notifications dropdown
        let dropdown = document.querySelector('.notifications-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.className = 'notifications-dropdown';
            document.body.appendChild(dropdown);
            
            // Add styles
            if (!document.querySelector('#notifications-styles')) {
                const style = document.createElement('style');
                style.id = 'notifications-styles';
                style.textContent = `
                    .notifications-dropdown {
                        position: absolute;
                        top: 60px;
                        right: 20px;
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
                        width: 350px;
                        max-height: 500px;
                        overflow-y: auto;
                        z-index: 1001;
                        border: 1px solid #eee;
                    }
                    .notifications-header {
                        padding: 20px;
                        border-bottom: 1px solid #eee;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .notifications-header h4 {
                        margin: 0;
                        font-size: 1.2rem;
                    }
                    .notifications-list {
                        padding: 10px 0;
                    }
                    .notification-item {
                        padding: 15px 20px;
                        border-bottom: 1px solid #f5f5f5;
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    .notification-item:hover {
                        background: #f9f9f9;
                    }
                    .notification-item.unread {
                        background: #f0f7ff;
                    }
                    .notification-title {
                        font-weight: 600;
                        margin-bottom: 5px;
                        color: #333;
                    }
                    .notification-message {
                        color: #666;
                        font-size: 0.9rem;
                        margin-bottom: 5px;
                    }
                    .notification-time {
                        font-size: 0.8rem;
                        color: #999;
                    }
                    .notifications-footer {
                        padding: 15px 20px;
                        text-align: center;
                        border-top: 1px solid #eee;
                    }
                    .btn-view-all-notifications {
                        background: #004D99;
                        color: white;
                        border: none;
                        padding: 8px 20px;
                        border-radius: 6px;
                        font-weight: 600;
                        cursor: pointer;
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        // Render notifications
        dropdown.innerHTML = `
            <div class="notifications-header">
                <h4>Notifications</h4>
                <span class="notification-count">${state.notifications.filter(n => !n.read).length} new</span>
            </div>
            <div class="notifications-list">
                ${state.notifications.map(notif => `
                    <div class="notification-item ${notif.read ? '' : 'unread'}" data-id="${notif.id}">
                        <div class="notification-title">${notif.title}</div>
                        <div class="notification-message">${notif.message}</div>
                        <div class="notification-time">${notif.time}</div>
                    </div>
                `).join('')}
            </div>
            <div class="notifications-footer">
                <button class="btn-view-all-notifications">View All Notifications</button>
            </div>
        `;
        
        // Event listeners
        dropdown.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                markNotificationAsRead(id);
            });
        });
        
        dropdown.querySelector('.btn-view-all-notifications').addEventListener('click', () => {
            showNotification('Coming soon', 'Full notifications page is under development', 'info');
            closeNotifications();
        });
        
        // Mark all as read when dropdown opens
        markAllNotificationsAsRead();
    }

    function closeNotifications() {
        state.isNotificationsOpen = false;
        const dropdown = document.querySelector('.notifications-dropdown');
        if (dropdown) {
            dropdown.remove();
        }
    }

    function markNotificationAsRead(id) {
        const notification = state.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            updateNotificationBadge();
        }
    }

    function markAllNotificationsAsRead() {
        state.notifications.forEach(notif => notif.read = true);
        updateNotificationBadge();
    }

    function updateNotificationBadge() {
        const unreadCount = state.notifications.filter(n => !n.read).length;
        const badge = elements.notificationBell?.querySelector('.notification-badge');
        
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    // ===== BACK TO TOP =====
    function initBackToTop() {
        // Show/hide back to top button on scroll
        window.addEventListener('scroll', toggleBackToTop);
        
        // Back to top functionality
        elements.backToTop?.addEventListener('click', scrollToTop);
        elements.backToTopSidebar?.addEventListener('click', scrollToTop);
        elements.backToTopFooter?.addEventListener('click', scrollToTop);
    }

    function toggleBackToTop() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (elements.backToTop) {
            if (scrollTop > 300) {
                elements.backToTop.classList.add('visible');
            } else {
                elements.backToTop.classList.remove('visible');
            }
        }
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // ===== NEWSLETTER =====
    function initNewsletter() {
        elements.newsletterForms?.forEach(form => {
            form.addEventListener('submit', handleNewsletterSubmit);
        });
    }

    async function handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const email = form.querySelector('input[type="email"]').value;
        const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
        const categories = Array.from(checkboxes).map(cb => cb.nextElementSibling.textContent);
        
        if (!email) {
            showNotification('Error', 'Please enter your email address', 'error');
            return;
        }
        
        try {
            // Simulate API call
            setTimeout(() => {
                showNotification('Subscribed!', 'Thank you for subscribing to our newsletter', 'success');
                form.reset();
                
                // Store subscription
                const subscriptions = JSON.parse(localStorage.getItem('hmw_newsletter_subs') || '[]');
                subscriptions.push({
                    email: email,
                    categories: categories,
                    subscribedAt: new Date().toISOString()
                });
                localStorage.setItem('hmw_newsletter_subs', JSON.stringify(subscriptions));
                
            }, 1000);
        } catch (error) {
            console.error('Error subscribing:', error);
            showNotification('Subscription failed', 'Please try again later', 'error');
        }
    }

    // ===== POLLS =====
    function initPolls() {
        elements.pollOptions?.forEach(option => {
            option.addEventListener('click', handlePollVote);
        });
    }

    async function handlePollVote(e) {
        const button = e.currentTarget;
        const poll = button.closest('.quick-poll, .live-poll');
        const question = poll?.querySelector('.poll-question')?.textContent || 'Poll';
        const optionText = button.textContent.trim();
        
        // Disable all options in this poll
        const options = poll?.querySelectorAll('.poll-option');
        options?.forEach(opt => {
            opt.disabled = true;
            opt.classList.remove('active');
        });
        
        // Mark selected option
        button.classList.add('active');
        
        try {
            // Simulate API call
            setTimeout(() => {
                showNotification('Vote recorded!', `You voted for "${optionText}" in "${question}"`, 'success');
                
                // Update poll results (simulated)
                if (poll.classList.contains('quick-poll')) {
                    updatePollResults(poll);
                }
                
            }, 500);
        } catch (error) {
            console.error('Error submitting vote:', error);
            showNotification('Vote failed', 'Please try again', 'error');
        }
    }

    function updatePollResults(poll) {
        const results = poll.querySelector('.poll-results');
        if (!results) return;
        
        // Simulate updated results
        const resultItems = results.querySelectorAll('.result-item');
        resultItems.forEach((item, index) => {
            const fill = item.querySelector('.result-fill');
            const percent = item.querySelector('.result-percent');
            
            if (fill && percent) {
                // Randomize results for demonstration
                const newWidth = [45, 35, 20][index] + Math.floor(Math.random() * 10);
                const newPercent = newWidth + '%';
                
                fill.style.width = newPercent;
                percent.textContent = newPercent;
            }
        });
        
        // Update total votes
        const totalEl = poll.querySelector('.poll-total');
        if (totalEl) {
            const currentTotal = parseInt(totalEl.textContent.replace(/[^\d]/g, '')) || 0;
            totalEl.innerHTML = `<i class="fas fa-users"></i> ${currentTotal + 1} votes`;
        }
    }

    // ===== PODCAST PLAYER =====
    function initPodcastPlayer() {
        if (!elements.podcastPlayer) return;
        
        const playBtn = elements.podcastPlayer.querySelector('.player-btn.play');
        const progressBar = elements.podcastPlayer.querySelector('.progress-fill');
        const progressTime = elements.podcastPlayer.querySelectorAll('.progress-time span');
        
        let isPlaying = false;
        let currentTime = 0;
        let totalTime = 2700; // 45 minutes in seconds
        
        playBtn?.addEventListener('click', function() {
            isPlaying = !isPlaying;
            const icon = this.querySelector('i');
            
            if (isPlaying) {
                icon.className = 'fas fa-pause';
                startPodcastPlayback();
            } else {
                icon.className = 'fas fa-play';
                stopPodcastPlayback();
            }
        });
        
        function startPodcastPlayback() {
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
                    playBtn.querySelector('i').className = 'fas fa-play';
                    clearInterval(interval);
                }
                
                // Update progress
                const progressPercent = (currentTime / totalTime) * 100;
                if (progressBar) {
                    progressBar.style.width = `${progressPercent}%`;
                }
                
                // Update time display
                if (progressTime[0]) {
                    progressTime[0].textContent = formatTime(currentTime);
                }
                
            }, 1000);
        }
        
        function stopPodcastPlayback() {
            // Playback stopped by user
        }
        
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        // Initialize time display
        if (progressTime[1]) {
            progressTime[1].textContent = formatTime(totalTime);
        }
    }

    // ===== INFINITE SCROLL =====
    function initInfiniteScroll() {
        if (elements.loadMoreBtn) {
            elements.loadMoreBtn.addEventListener('click', loadMoreStories);
        }
        
        // Also enable scroll-based loading
        window.addEventListener('scroll', handleScroll);
    }

    async function loadMoreStories() {
        if (state.isLoading) return;
        
        state.isLoading = true;
        elements.loadMoreBtn.style.display = 'none';
        elements.loadingIndicator.style.display = 'block';
        
        try {
            // Simulate API call
            setTimeout(() => {
                const newStories = [
                    { title: 'New Story 1', category: 'Culture', excerpt: 'Exciting new discovery...' },
                    { title: 'New Story 2', category: 'History', excerpt: 'Historical insights...' },
                    { title: 'New Story 3', category: 'Leadership', excerpt: 'Inspiring leadership...' }
                ];
                
                renderNewStories(newStories);
                state.currentPage++;
                
                elements.loadingIndicator.style.display = 'none';
                elements.loadMoreBtn.style.display = 'block';
                state.isLoading = false;
                
                showNotification('New stories loaded', `${newStories.length} more stories added`, 'success');
                
            }, 1500);
        } catch (error) {
            console.error('Error loading more stories:', error);
            elements.loadingIndicator.style.display = 'none';
            elements.loadMoreBtn.style.display = 'block';
            state.isLoading = false;
            showNotification('Error', 'Failed to load more stories', 'error');
        }
    }

    function renderNewStories(stories) {
        const newsGrid = document.querySelector('.news-grid');
        if (!newsGrid) return;
        
        stories.forEach(story => {
            const article = document.createElement('article');
            article.className = 'news-card';
            article.innerHTML = `
                <div class="news-image">
                    <img src="https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                         alt="${story.title}" 
                         loading="lazy">
                    <div class="news-badge">NEW</div>
                </div>
                <div class="news-content">
                    <div class="news-category">${story.category}</div>
                    <h3 class="news-title">${story.title}</h3>
                    <p class="news-excerpt">${story.excerpt}</p>
                    <div class="news-meta">
                        <div class="author-info">
                            <img src="https://images.unsplash.com/photo-1494790108755-2616b786d49f?ixlib=rb-4.0.3&auto=format&fit=crop&w=30&q=80" 
                                 alt="Author" 
                                 class="author-thumb">
                            <div class="author-details">
                                <span class="author">News Desk</span>
                                <span class="author-role">Correspondent</span>
                            </div>
                        </div>
                        <div class="meta-right">
                            <span class="time"><i class="far fa-clock"></i> Just now</span>
                            <span class="read-time">5 min read</span>
                            <button class="btn-save-article" aria-label="Save story">
                                <i class="far fa-bookmark"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="social-interaction">
                    <div class="interaction-group">
                        <button class="interaction-btn comment-btn">
                            <i class="far fa-comment"></i>
                            <span class="comment-count">0</span>
                            Comments
                        </button>
                        <button class="interaction-btn like-btn">
                            <i class="far fa-heart"></i>
                            <span class="like-count">0</span>
                            Likes
                        </button>
                    </div>
                    <button class="share-btn">
                        <i class="fas fa-share-alt"></i>
                        Share
                    </button>
                </div>
            `;
            
            newsGrid.appendChild(article);
        });
        
        // Re-initialize social interactions for new articles
        initSocialInteractions();
    }

    function handleScroll() {
        if (state.isLoading) return;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        
        // Load more when 80% scrolled
        if (scrollTop + clientHeight >= scrollHeight * 0.8) {
            loadMoreStories();
        }
    }

    // ===== LOCAL SWITCHER =====
    function initLocalSwitcher() {
        elements.localSwitches?.forEach(switchBtn => {
            switchBtn.addEventListener('click', function() {
                const region = this.dataset.region;
                switchLocalEdition(region);
                
                // Update active state
                elements.localSwitches?.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    function switchLocalEdition(region) {
        showNotification('Edition changed', `Switched to ${region} edition`, 'info');
        
        // In production, this would fetch region-specific content
        console.log(`Switched to ${region} edition`);
        
        // Update UI based on region
        const editionBadge = document.querySelector('.edition-badge span');
        if (editionBadge) {
            const regionNames = {
                nairobi: 'Nairobi Edition',
                national: 'Africa Edition',
                global: 'Global Edition'
            };
            editionBadge.textContent = regionNames[region] || 'Africa Edition';
        }
    }

    // ===== AUTO UPDATES =====
    function startAutoUpdates() {
        // Update weather every 30 minutes
        state.weatherUpdateInterval = setInterval(() => {
            initWeather();
        }, 30 * 60 * 1000);
        
        // Update trending every 5 minutes
        setInterval(() => {
            fetchTrendingTopics();
        }, 5 * 60 * 1000);
    }

    async function fetchTrendingTopics() {
        try {
            // Simulate API call
            setTimeout(() => {
                state.trendingTopics = [
                    '#CulturalHeritage',
                    '#WomenLeaders',
                    '#HumanStories',
                    '#InspiringPeople',
                    '#BizarreNews',
                    '#Lifestyle',
                    '#AfricanHistory'
                ];
                
                updateTrendingTopics();
                
            }, 500);
        } catch (error) {
            console.error('Error fetching trending topics:', error);
        }
    }

    function updateTrendingTopics() {
        const scroller = document.querySelector('.topics-scroller');
        if (!scroller) return;
        
        scroller.innerHTML = '';
        state.trendingTopics.forEach(topic => {
            const link = document.createElement('a');
            link.href = '#';
            link.className = 'topic-tag';
            link.textContent = topic;
            scroller.appendChild(link);
        });
    }

    async function fetchLatestNews() {
        try {
            // Simulate API call for latest news
            setTimeout(() => {
                console.log('Latest news updated');
            }, 1000);
        } catch (error) {
            console.error('Error fetching latest news:', error);
        }
    }

    async function fetchLiveEvents() {
        try {
            // Simulate API call for live events
            setTimeout(() => {
                console.log('Live events updated');
            }, 1000);
        } catch (error) {
            console.error('Error fetching live events:', error);
        }
    }

    // ===== NOTIFICATION SYSTEM =====
    function showNotification(title, message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                ${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Add styles if not present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    padding: 15px 20px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    max-width: 350px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                    border-left: 4px solid #004D99;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification-success {
                    border-left-color: #28a745;
                }
                .notification-error {
                    border-left-color: #dc3545;
                }
                .notification-info {
                    border-left-color: #004D99;
                }
                .notification-icon {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 1.2rem;
                }
                .notification-success .notification-icon {
                    background: #d4edda;
                    color: #155724;
                }
                .notification-error .notification-icon {
                    background: #f8d7da;
                    color: #721c24;
                }
                .notification-info .notification-icon {
                    background: #d1ecf1;
                    color: #0c5460;
                }
                .notification-content {
                    flex: 1;
                }
                .notification-title {
                    font-weight: 600;
                    margin-bottom: 4px;
                    color: #333;
                }
                .notification-message {
                    font-size: 0.9rem;
                    color: #666;
                    line-height: 1.4;
                }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: #999;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Auto remove after 5 seconds
        const autoRemove = setTimeout(() => {
            removeNotification(notification);
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(autoRemove);
            removeNotification(notification);
        });
        
        // Also remove on click
        notification.addEventListener('click', (e) => {
            if (!e.target.classList.contains('notification-close')) {
                clearTimeout(autoRemove);
                removeNotification(notification);
            }
        });
    }

    function removeNotification(notification) {
        notification.style.animation = 'slideOut 0.3s ease';
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // ===== EVENT LISTENERS INIT =====
    function initEventListeners() {
        // Theme toggle
        elements.themeToggle?.addEventListener('click', toggleTheme);
        
        // Live updates pause
        elements.pauseLive?.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-pause')) {
                icon.className = 'fas fa-play';
                this.innerHTML = '<i class="fas fa-play"></i> Resume Updates';
                clearInterval(state.liveUpdatesInterval);
            } else {
                icon.className = 'fas fa-pause';
                this.innerHTML = '<i class="fas fa-pause"></i> Pause Updates';
                initLiveUpdates();
            }
        });
        
        // Weather refresh
        elements.refreshWeather?.addEventListener('click', () => {
            initWeather();
            showNotification('Weather updated', 'Latest weather information loaded', 'info');
        });
        
        // Trending refresh
        elements.refreshTrending?.addEventListener('click', () => {
            fetchTrendingTopics();
            showNotification('Trending updated', 'Latest trending topics loaded', 'info');
        });
        
        // Mega menu hover
        elements.moreCategories?.addEventListener('mouseenter', () => {
            elements.megaMenu.style.display = 'block';
        });
        
        elements.moreCategories?.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (!elements.megaMenu.matches(':hover')) {
                    elements.megaMenu.style.display = 'none';
                }
            }, 200);
        });
        
        elements.megaMenu?.addEventListener('mouseleave', () => {
            elements.megaMenu.style.display = 'none';
        });
        
        // Reading progress
        window.addEventListener('scroll', updateReadingProgress);
        
        // Before unload
        window.addEventListener('beforeunload', () => {
            // Clean up intervals
            clearInterval(state.liveUpdatesInterval);
            clearInterval(state.weatherUpdateInterval);
            clearInterval(state.breakingNewsInterval);
        });
    }

    function updateReadingProgress() {
        const progressBar = document.querySelector('.progress-fill');
        if (!progressBar) return;
        
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
        progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
    }

    // ===== PUBLIC API =====
    return {
        init: init,
        getState: () => ({ ...state }),
        getUser: () => state.user,
        getSettings: () => ({ ...state.settings }),
        updateSetting: updateSetting,
        saveArticle: saveArticle,
        showNotification: showNotification,
        shareArticle: shareArticle,
        toggleTheme: toggleTheme,
        openSearch: openSearch,
        closeSearch: closeSearch,
        loadMoreStories: loadMoreStories,
        refreshWeather: () => initWeather(),
        refreshTrending: () => fetchTrendingTopics()
    };
})();

// ===== INITIALIZE APPLICATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Check for required elements
    if (!document.querySelector('.container')) {
        console.error('Required DOM elements not found');
        return;
    }
    
    // Initialize the application
    try {
        HMWApp.init();
        
        // Make app globally available for debugging
        window.HMWApp = HMWApp;
        
        console.log('HMW Beyond Borders - Ready for storytelling!');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        
        // Show error to user
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #dc3545;
            color: white;
            padding: 15px;
            text-align: center;
            z-index: 10000;
            font-family: 'Open Sans', sans-serif;
        `;
        errorDiv.textContent = 'We\'re experiencing technical difficulties. Please refresh the page.';
        document.body.appendChild(errorDiv);
    }
});

// ===== POLYFILLS FOR OLDER BROWSERS =====
if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame || 
                                  window.mozRequestAnimationFrame || 
                                  function(callback) {
                                      return window.setTimeout(callback, 1000 / 60);
                                  };
}

// ===== SERVICE WORKER FOR PWA =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }).catch(function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

// ===== OFFLINE DETECTION =====
window.addEventListener('online', function() {
    HMWApp.showNotification('Back online', 'Connection restored. Loading latest updates...', 'success');
    
    // Refresh data
    setTimeout(() => {
        HMWApp.refreshWeather();
        HMWApp.refreshTrending();
    }, 1000);
});

window.addEventListener('offline', function() {
    HMWApp.showNotification('You\'re offline', 'Some features may not be available', 'error');
});

// ===== PERFORMANCE MONITORING =====
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfEntries = performance.getEntriesByType('navigation');
            if (perfEntries.length > 0) {
                const navEntry = perfEntries[0];
                console.log('Page load time:', navEntry.loadEventEnd - navEntry.startTime, 'ms');
            }
        }, 0);
    });
}
