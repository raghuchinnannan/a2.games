/**
 * Game Filter System - Optimized for Performance
 * Handles category filtering and search functionality efficiently
 */

class GameFilter {
    constructor() {
        this.gameCards = [];
        this.filteredGames = [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.isInitialized = false;
        
        // Performance optimization: cache DOM elements
        this.filterButtons = null;
        this.searchInput = null;
        this.gamesContainer = null;
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        try {
            // Cache DOM elements for better performance
            this.filterButtons = document.querySelectorAll('.filter-tag');
            this.searchInput = document.getElementById('gameSearch');
            this.gamesContainer = document.querySelector('.games');
            this.gameCards = Array.from(document.querySelectorAll('.game-card'));

            if (!this.gameCards.length) {
                console.warn('No game cards found');
                return;
            }

            // Initialize game data for faster filtering
            this.initGameData();
            
            // Ensure "All Games" filter is active by default
            this.setActiveFilter('all');
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initial render - show all games
            this.filteredGames = [...this.gameCards]; // Show all games initially
            this.renderGames();
            this.updateGameCount();
            
            this.isInitialized = true;
            // console.log(`Game filter initialized with ${this.gameCards.length} games`);
            
        } catch (error) {
            console.error('Error initializing game filter:', error);
        }
    }

    initGameData() {
        // Pre-process game data for faster filtering
        this.gameCards.forEach((card, index) => {
            const tags = (card.dataset.tags || '').toLowerCase().split(',').map(tag => tag.trim());
            const name = (card.dataset.name || '').toLowerCase();
            // Auto-detect platform support from the visual platforms element (if present)
            // This ensures filters for 'mobile' and 'desktop' work even if HTML wasn't updated.
            const platformsEl = card.querySelector('.platforms');
            if (platformsEl) {
                const platformsText = platformsEl.textContent || '';
                if (/📱/.test(platformsText) && !tags.includes('mobile')) tags.push('mobile');
                if (/🖥️|💻/.test(platformsText) && !tags.includes('desktop')) tags.push('desktop');
            }
            
            // Store processed data on the element for quick access
            card._filterData = {
                tags,
                name,
                originalIndex: index,
                isVisible: true
            };
        });
    }

    setActiveFilter(filter) {
        // Set the active filter
        this.currentFilter = filter;
        
        // Update button states
        if (this.filterButtons) {
            this.filterButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === filter);
            });
        }
    }

    setupEventListeners() {
        // Filter button click handlers
        if (this.filterButtons) {
            this.filterButtons.forEach(button => {
                button.addEventListener('click', (e) => this.handleFilterClick(e));
            });
        }

        // Search input handler with debouncing for performance
        if (this.searchInput) {
            let searchTimeout;
            this.searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentSearch = e.target.value.toLowerCase().trim();
                    this.filterAndRender();
                }, 150); // 150ms debounce for better performance
            });
        }

        // Optional: Clear search functionality
        const searchIcon = document.querySelector('.search-icon');
        if (searchIcon) {
            searchIcon.addEventListener('click', () => {
                if (this.searchInput) {
                    this.searchInput.value = '';
                    this.currentSearch = '';
                    this.filterAndRender();
                    this.searchInput.focus();
                }
            });
        }
    }

    handleFilterClick(e) {
        e.preventDefault();
        
        // Update active filter button
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Update current filter and re-render
        this.currentFilter = e.target.dataset.filter;
        this.filterAndRender();
    }

    filterAndRender() {
        // Filter games based on current criteria
        this.filteredGames = this.gameCards.filter(card => {
            const data = card._filterData;
            
            // Check category filter
            const matchesFilter = this.currentFilter === 'all' || 
                                 data.tags.includes(this.currentFilter);
            
            // Check search filter
            const matchesSearch = this.currentSearch === '' || 
                                 data.name.includes(this.currentSearch);
            
            return matchesFilter && matchesSearch;
        });

        // Render the filtered results
        this.renderGames();
        
        // Update game count in hero stats
        this.updateGameCount();
    }

    renderGames() {
        // Efficient rendering: only show/hide without DOM manipulation
        this.gameCards.forEach(card => {
            const shouldShow = this.filteredGames.includes(card);
            
            if (shouldShow) {
                // Show the game card
                card.style.display = '';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                card.classList.remove('hidden');
                card.classList.add('visible');
            } else {
                // Hide the game card
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                card.classList.remove('visible');
                card.classList.add('hidden');
                
                // Hide after animation completes
                setTimeout(() => {
                    if (card.classList.contains('hidden')) {
                        card.style.display = 'none';
                    }
                }, 400);
            }
        });

        // Log filter results for debugging
        // console.log(`Filtered: ${this.filteredGames.length}/${this.gameCards.length} games`);
    }

    updateGameCount() {
        const visibleCount = this.filteredGames.length;
        
        // Update the hero stats only when explicitly opted-in.
        // To enable dynamic updates for a stat, add the attribute
        // `data-auto-count` to the corresponding `.stat-number` element in HTML.
        const statNumbers = document.querySelectorAll('.stat-number[data-auto-count]');
        statNumbers.forEach(stat => {
            const text = stat.textContent;
            if (text.includes('+') && parseInt(text) > 0) {
                stat.textContent = visibleCount + '+';
            }
        });

        // Update filter header if needed
        const filterHeader = document.querySelector('.filter-header p');
        if (filterHeader && this.currentFilter !== 'all') {
            const categoryName = this.currentFilter.charAt(0).toUpperCase() + this.currentFilter.slice(1);
            filterHeader.textContent = `Showing ${visibleCount} ${categoryName} games`;
        } else if (filterHeader) {
            filterHeader.textContent = `Filter games by category or search by name`;
        }
    }

    // Public methods for external use
    resetFilters() {
        if (!this.isInitialized) return;
        
        // Reset to show all games
        this.currentFilter = 'all';
        this.currentSearch = '';
        
        // Update UI
        if (this.searchInput) this.searchInput.value = '';
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === 'all');
        });
        
        // Re-render
        this.filterAndRender();
    }

    getVisibleGames() {
        return this.filteredGames;
    }

    getGamesByCategory(category) {
        return this.gameCards.filter(card => 
            card._filterData.tags.includes(category.toLowerCase())
        );
    }
}

// Initialize the game filter system
const gameFilter = new GameFilter();

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameFilter;
}