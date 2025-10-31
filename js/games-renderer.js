// Game card renderer
const GameRenderer = {
  // Tag display names and emojis
  tagConfig: {
    puzzle: { emoji: '🧩', label: 'Puzzle' },
    arcade: { emoji: '🕹️', label: 'Arcade' },
    action: { emoji: '⚡', label: 'Action' },
    strategy: { emoji: '🧠', label: 'Strategy' },
    casual: { emoji: '🎯', label: 'Casual' },
    classic: { emoji: '👾', label: 'Classic' }
  },

  // Platform icons
  platformIcons: {
    desktop: '🖥️',
    mobile: '📱'
  },

  // Create a single game card
  createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.setAttribute('data-tags', game.tags.join(','));
    card.setAttribute('data-name', game.name);
    
    // Add ID attribute if the game has one for specific targeting
    if (game.id === 'space-shooter') {
      card.id = 'spaceShooterCard';
    }

    // Platform icons
    const platformHTML = game.platforms.map(p => this.platformIcons[p]).join(' ');

    // Game tags
    const tagsHTML = game.tags.map(tag => {
      const config = this.tagConfig[tag];
      return `<span class="game-tag">${config.emoji} ${config.label}</span>`;
    }).join('');

    // Platform tags
    const platformTagsHTML = game.platforms.map(p => {
      const label = p.charAt(0).toUpperCase() + p.slice(1);
      return `<span class="game-tag">${this.platformIcons[p]} ${label}</span>`;
    }).join('');

    card.innerHTML = `
      <h3>${game.name}</h3>
      <div class="game-card-image-container">
        <img src="${game.image}" alt="${game.name}">
        <div class="platforms">${platformHTML}</div>
      </div>
      <div class="game-card-content">
        <p>${game.description}</p>
        <div class="game-tags">
          ${tagsHTML}
          ${platformTagsHTML}
        </div>
        <a href="${game.url}" class="play-now">Play Now</a>
      </div>
    `;

    return card;
  },

  // Render all games
  async renderGames(containerId = 'gamesContainer') {
    try {
      const response = await fetch('./data/games-data.json');
      const data = await response.json();
      
      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`Container with id "${containerId}" not found`);
        return;
      }

      // Clear existing content
      container.innerHTML = '';

      // Create and append game cards
      data.games.forEach(game => {
        const card = this.createGameCard(game);
        container.appendChild(card);
      });

      console.log(`✅ Rendered ${data.games.length} games successfully`);
      
      // Reinitialize the filter system after games are loaded
      if (window.gameFilter && window.gameFilter.reinitialize) {
        window.gameFilter.reinitialize();
      }

    } catch (error) {
      console.error('Error loading games:', error);
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">Failed to load games. Please refresh the page.</p>';
      }
    }
  }
};

// Auto-render on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    GameRenderer.renderGames('gamesContainer');
  });
} else {
  GameRenderer.renderGames('gamesContainer');
}