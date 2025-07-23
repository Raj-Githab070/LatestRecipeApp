/**

- Flavor Magic - Recipe Assistant App
- JavaScript functionality for mobile app interface
*/

class FlavorMagicApp {
constructor() {
this.currentScreen = 'home';
this.selectedIngredients = new Set();
this.userPreferences = {
mealType: null,
dietType: null,
peopleCount: 4,
cookingTime: 30
};
this.favoriteRecipes = new Set();

```
    this.init();
}

/**
 * Initialize the application
 */
init() {
    this.setupEventListeners();
    this.setupSliders();
    this.loadUserPreferences();
    this.showScreen('home');
}

/**
 * Setup all event listeners
 */
setupEventListeners() {
    // Screen navigation
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[onclick]');
        if (target) {
            const onclick = target.getAttribute('onclick');
            if (onclick.includes('showScreen')) {
                const screenId = onclick.match(/showScreen\\('([^']+)'\\)/)?.[1];
                if (screenId) {
                    e.preventDefault();
                    this.showScreen(screenId);
                }
            }
        }
    });

    // Recipe card clicks
    document.addEventListener('click', (e) => {
        if (e.target.closest('.recipe-card')) {
            this.showScreen('recipe-detail');
        }
    });

    // Ingredient selection
    this.setupIngredientSelection();

    // Filter options
    this.setupFilterOptions();

    // Bottom navigation
    this.setupBottomNavigation();

    // Search functionality
    this.setupSearchFunctionality();
}

/**
 * Show specific screen
 */
showScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));

    // Show selected screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        this.currentScreen = screenId;

        // Update navigation state
        this.updateNavigation(screenId);

        // Screen-specific actions
        this.onScreenShow(screenId);
    }
}

/**
 * Handle screen-specific actions when shown
 */
onScreenShow(screenId) {
    switch(screenId) {
        case 'ingredients':
            this.updateIngredientDisplay();
            break;
        case 'filters':
            this.updateFilterDisplay();
            break;
        case 'results':
            this.generateRecipeResults();
            break;
        case 'recipe-detail':
            this.loadRecipeDetail();
            break;
    }
}

/**
 * Setup slider functionality
 */
setupSliders() {
    const peopleSlider = document.getElementById('peopleSlider');
    const peopleValue = document.getElementById('peopleValue');
    const timeSlider = document.getElementById('timeSlider');
    const timeValue = document.getElementById('timeValue');

    if (peopleSlider && peopleValue) {
        peopleSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.userPreferences.peopleCount = value;
            peopleValue.textContent = value + ' people';
            this.saveUserPreferences();
        });
    }

    if (timeSlider && timeValue) {
        timeSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.userPreferences.cookingTime = value;

            if (value >= 60) {
                const hours = Math.floor(value / 60);
                const mins = value % 60;
                timeValue.textContent = hours + 'h ' + (mins > 0 ? mins + 'm' : '');
            } else {
                timeValue.textContent = value + ' minutes';
            }
            this.saveUserPreferences();
        });
    }
}

/**
 * Setup ingredient selection functionality
 */
setupIngredientSelection() {
    document.addEventListener('click', (e) => {
        const button = e.target.closest('[style*="border: 2px solid #e2e8f0"]');
        if (button && button.textContent.includes('🍅') ||
            button && button.textContent.includes('🧅') ||
            button && button.textContent.includes('🍚') ||
            button && button.textContent.includes('🥛') ||
            button && button.textContent.includes('🧄') ||
            button && button.textContent.includes('🌶️')) {

            this.toggleIngredient(button);
        }
    });

    // Handle textarea input
    const ingredientTextarea = document.querySelector('.ingredient-input textarea');
    if (ingredientTextarea) {
        ingredientTextarea.addEventListener('input', (e) => {
            this.processIngredientText(e.target.value);
        });
    }
}

/**
 * Toggle ingredient selection
 */
toggleIngredient(button) {
    const ingredient = button.textContent.trim();

    if (button.style.borderColor === 'rgb(102, 126, 234)') {
        // Deselect
        button.style.borderColor = '#e2e8f0';
        button.style.backgroundColor = 'white';
        this.selectedIngredients.delete(ingredient);
    } else {
        // Select
        button.style.borderColor = '#667eea';
        button.style.backgroundColor = '#f7fafc';
        this.selectedIngredients.add(ingredient);
    }

    this.updateIngredientCount();
}

/**
 * Process ingredient text input
 */
processIngredientText(text) {
    // Simple text processing to extract ingredients
    const ingredients = text.split(/[,\\n]/).map(item => item.trim()).filter(item => item.length > 0);

    // Clear previous text-based selections
    this.selectedIngredients.forEach(ing => {
        if (!ing.includes('🍅') && !ing.includes('🧅') && !ing.includes('🍚') &&
            !ing.includes('🥛') && !ing.includes('🧄') && !ing.includes('🌶️')) {
            this.selectedIngredients.delete(ing);
        }
    });

    // Add new ingredients
    ingredients.forEach(ing => this.selectedIngredients.add(ing));
    this.updateIngredientCount();
}

/**
 * Update ingredient count display
 */
updateIngredientCount() {
    const count = this.selectedIngredients.size;
    // Could update a counter in the UI if needed
    console.log(`Selected ingredients: ${count}`);
}

/**
 * Setup filter options
 */
setupFilterOptions() {
    // Meal type filters
    document.addEventListener('change', (e) => {
        if (e.target.name === 'meal') {
            this.userPreferences.mealType = e.target.value;
            this.saveUserPreferences();
        }

        if (e.target.name === 'diet') {
            this.userPreferences.dietType = e.target.value;
            this.saveUserPreferences();
        }
    });
}

/**
 * Setup bottom navigation
 */
setupBottomNavigation() {
    document.addEventListener('click', (e) => {
        const navItem = e.target.closest('.nav-item');
        if (navItem) {
            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });

            // Add active class to clicked item
            navItem.classList.add('active');

            // Handle navigation based on nav item
            const navText = navItem.querySelector('span').textContent;
            switch(navText) {
                case 'Home':
                    this.showScreen('home');
                    break;
                case 'Search':
                    this.showSearchScreen();
                    break;
                case 'Favorites':
                    this.showFavoritesScreen();
                    break;
                case 'Profile':
                    this.showProfileScreen();
                    break;
            }
        }
    });
}

/**
 * Setup search functionality
 */
setupSearchFunctionality() {
    // Could add search input handling here
    const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="search"]');
    searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
    });
}

/**
 * Handle search
 */
handleSearch(query) {
    if (query.length > 2) {
        // Implement search logic
        console.log(`Searching for: ${query}`);
        // Could filter recipes, ingredients, etc.
    }
}

/**
 * Update navigation state
 */
updateNavigation(screenId) {
    // Update bottom navigation active state based on current screen
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    if (screenId === 'home') {
        navItems[0]?.classList.add('active');
    }
}

/**
 * Generate recipe results based on current preferences and ingredients
 */
generateRecipeResults() {
    const results = this.getFilteredRecipes();
    this.displayRecipeResults(results);
}

/**
 * Get filtered recipes based on user preferences
 */
getFilteredRecipes() {
    // Sample recipe data - in a real app, this would come from an API
    const sampleRecipes = [
        {
            id: 1,
            name: "Vegetable Biryani",
            time: 45,
            serves: 6,
            diet: "veg",
            meal: "lunch",
            cuisine: "South Indian",
            tags: ["Family Gathering", "Traditional"],
            ingredients: ["rice", "vegetables", "spices"],
            description: "Aromatic rice dish with mixed vegetables, perfect for family occasions"
        },
        {
            id: 2,
            name: "Butter Chicken",
            time: 40,
            serves: 4,
            diet: "nonveg",
            meal: "dinner",
            cuisine: "North Indian",
            tags: ["Special", "Creamy"],
            ingredients: ["chicken", "tomatoes", "cream", "spices"],
            description: "Rich and creamy chicken curry with tomatoes and spices"
        },
        {
            id: 3,
            name: "Masala Dosa",
            time: 30,
            serves: 3,
            diet: "veg",
            meal: "breakfast",
            cuisine: "South Indian",
            tags: ["Traditional", "Crispy"],
            ingredients: ["rice", "lentils", "potatoes"],
            description: "Crispy crepe with spiced potato filling, served with chutney"
        },
        {
            id: 4,
            name: "Paneer Tikka",
            time: 25,
            serves: 4,
            diet: "veg",
            meal: "dinner",
            cuisine: "North Indian",
            tags: ["Birthday Special", "Appetizer"],
            ingredients: ["paneer", "spices", "onions", "peppers"],
            description: "Perfect appetizer for celebrations"
        }
    ];

    // Filter recipes based on preferences
    return sampleRecipes.filter(recipe => {
        let matches = true;

        if (this.userPreferences.mealType && recipe.meal !== this.userPreferences.mealType) {
            matches = false;
        }

        if (this.userPreferences.dietType && recipe.diet !== this.userPreferences.dietType) {
            matches = false;
        }

        // Check if recipe uses available ingredients
        if (this.selectedIngredients.size > 0) {
            const hasIngredients = recipe.ingredients.some(ingredient =>
                Array.from(this.selectedIngredients).some(selected =>
                    selected.toLowerCase().includes(ingredient.toLowerCase()) ||
                    ingredient.toLowerCase().includes(selected.toLowerCase())
                )
            );
            if (!hasIngredients) matches = false;
        }

        return matches;
    });
}

/**
 * Display recipe results
 */
displayRecipeResults(recipes) {
    const resultsContainer = document.querySelector('#results .content');
    if (!resultsContainer) return;

    // Clear existing results except for static elements
    const recipeCards = resultsContainer.querySelectorAll('.recipe-card');
    recipeCards.forEach(card => card.remove());

    // Add new recipe cards
    recipes.forEach(recipe => {
        const recipeCard = this.createRecipeCard(recipe);
        resultsContainer.appendChild(recipeCard);
    });

    if (recipes.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #718096;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                <h3>No recipes found</h3>
                <p>Try adjusting your filters or ingredients</p>
            </div>
        `;
        resultsContainer.appendChild(noResults);
    }
}

/**
 * Create recipe card element
 */
createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.recipeId = recipe.id;

    const dietIcon = recipe.diet === 'veg' ? '🥗' : recipe.diet === 'nonveg' ? '🍖' : '🍰';
    const dietText = recipe.diet === 'veg' ? 'Vegetarian' : recipe.diet === 'nonveg' ? 'Non-Vegetarian' : 'Dessert';

    card.innerHTML = `
        <h3>${recipe.name}</h3>
        <div class="recipe-meta">
            <span>⏱️ ${recipe.time} mins</span>
            <span>👥 ${recipe.serves} people</span>
            <span>${dietIcon} ${dietText}</span>
        </div>
        <div class="recipe-tags">
            ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            <span class="tag">${recipe.cuisine}</span>
        </div>
        <p style="color: #718096; margin-top: 10px;">${recipe.description}</p>
    `;

    // Add click handler
    card.addEventListener('click', () => {
        this.loadRecipeDetail(recipe);
    });

    return card;
}

/**
 * Load recipe detail screen
 */
loadRecipeDetail(recipe = null) {
    if (recipe) {
        // Update recipe detail with selected recipe data
        this.currentRecipe = recipe;
        this.updateRecipeDetailDisplay(recipe);
    }
}

/**
 * Update recipe detail display
 */
updateRecipeDetailDisplay(recipe) {
    const detailScreen = document.getElementById('recipe-detail');
    if (!detailScreen || !recipe) return;

    // Update header
    const header = detailScreen.querySelector('.header h1');
    if (header) header.textContent = recipe.name;

    const subheader = detailScreen.querySelector('.header p');
    if (subheader) subheader.textContent = recipe.description || 'Perfect for celebrations!';

    // Update recipe stats would go here
    // In a real app, you'd have more detailed recipe data
}

/**
 * Toggle favorite recipe
 */
toggleFavorite(recipeId) {
    if (this.favoriteRecipes.has(recipeId)) {
        this.favoriteRecipes.delete(recipeId);
    } else {
        this.favoriteRecipes.add(recipeId);
    }
    this.saveFavorites();
    this.updateFavoriteUI(recipeId);
}

/**
 * Update favorite UI
 */
updateFavoriteUI(recipeId) {
    const favoriteBtn = document.querySelector(`[data-recipe-id="${recipeId}"] .favorite-btn`);
    if (favoriteBtn) {
        const isFavorite = this.favoriteRecipes.has(recipeId);
        favoriteBtn.innerHTML = isFavorite ? '❤️ Saved' : '🤍 Save Recipe';
        favoriteBtn.style.background = isFavorite ? '#48bb78' : '#667eea';
    }
}

/**
 * Show search screen
 */
showSearchScreen() {
    // Implement search screen logic
    console.log('Showing search screen');
}

/**
 * Show favorites screen
 */
showFavoritesScreen() {
    // Implement favorites screen logic
    console.log('Showing favorites screen');
}

/**
 * Show profile screen
 */
showProfileScreen() {
    // Implement profile screen logic
    console.log('Showing profile screen');
}

/**
 * Save user preferences to localStorage
 */
saveUserPreferences() {
    try {
        const preferences = {
            ...this.userPreferences,
            selectedIngredients: Array.from(this.selectedIngredients)
        };
        localStorage.setItem('flavorMagicPreferences', JSON.stringify(preferences));
    } catch (error) {
        console.warn('Could not save preferences:', error);
    }
}

/**
 * Load user preferences from localStorage
 */
loadUserPreferences() {
    try {
        const saved = localStorage.getItem('flavorMagicPreferences');
        if (saved) {
            const preferences = JSON.parse(saved);
            this.userPreferences = { ...this.userPreferences, ...preferences };
            if (preferences.selectedIngredients) {
                this.selectedIngredients = new Set(preferences.selectedIngredients);
            }
        }
    } catch (error) {
        console.warn('Could not load preferences:', error);
    }
}

/**
 * Save favorites to localStorage
 */
saveFavorites() {
    try {
        localStorage.setItem('flavorMagicFavorites', JSON.stringify(Array.from(this.favoriteRecipes)));
    } catch (error) {
        console.warn('Could not save favorites:', error);
    }
}

/**
 * Load favorites from localStorage
 */
loadFavorites() {
    try {
        const saved = localStorage.getItem('flavorMagicFavorites');
        if (saved) {
            this.favoriteRecipes = new Set(JSON.parse(saved));
        }
    } catch (error) {
        console.warn('Could not load favorites:', error);
    }
}

/**
 * Update ingredient display
 */
updateIngredientDisplay() {
    const textarea = document.querySelector('.ingredient-input textarea');
    if (textarea && this.selectedIngredients.size > 0) {
        const textIngredients = Array.from(this.selectedIngredients)
            .filter(ing => !ing.includes('🍅') && !ing.includes('🧅') && !ing.includes('🍚') &&
                          !ing.includes('🥛') && !ing.includes('🧄') && !ing.includes('🌶️'));
        textarea.value = textIngredients.join(', ');
    }
}

/**
 * Update filter display
 */
updateFilterDisplay() {
    // Update radio buttons based on saved preferences
    if (this.userPreferences.mealType) {
        const mealRadio = document.querySelector(`input[name="meal"][value="${this.userPreferences.mealType}"]`);
        if (mealRadio) mealRadio.checked = true;
    }

    if (this.userPreferences.dietType) {
        const dietRadio = document.querySelector(`input[name="diet"][value="${this.userPreferences.dietType}"]`);
        if (dietRadio) dietRadio.checked = true;
    }

    // Update sliders
    const peopleSlider = document.getElementById('peopleSlider');
    const timeSlider = document.getElementById('timeSlider');

    if (peopleSlider) {
        peopleSlider.value = this.userPreferences.peopleCount;
        const peopleValue = document.getElementById('peopleValue');
        if (peopleValue) peopleValue.textContent = this.userPreferences.peopleCount + ' people';
    }

    if (timeSlider) {
        timeSlider.value = this.userPreferences.cookingTime;
        const timeValue = document.getElementById('timeValue');
        if (timeValue) {
            const time = this.userPreferences.cookingTime;
            if (time >= 60) {
                const hours = Math.floor(time / 60);
                const mins = time % 60;
                timeValue.textContent = hours + 'h ' + (mins > 0 ? mins + 'm' : '');
            } else {
                timeValue.textContent = time + ' minutes';
            }
        }
    }
}

/**
 * Add smooth animations
 */
addSmoothAnimations() {
    // Add hover effects for interactive elements
    document.querySelectorAll('.action-card, .occasion-card, .cuisine-card, .recipe-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (this.classList.contains('occasion-card')) {
                this.style.transform = 'scale(1.05)';
            } else if (this.classList.contains('cuisine-card')) {
                this.style.transform = 'translateX(10px)';
            } else {
                this.style.transform = 'translateY(-2px)';
            }
        });

        card.addEventListener('mouseleave', function() {
            if (this.classList.contains('cuisine-card')) {
                this.style.transform = 'translateX(0)';
            } else if (this.classList.contains('occasion-card')) {
                this.style.transform = 'scale(1)';
            } else {
                this.style.transform = 'translateY(0)';
            }
        });
    });
}

```

}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
// Create global app instance
window.flavorMagicApp = new FlavorMagicApp();

```
// Legacy function support for onclick handlers in HTML
window.showScreen = function(screenId) {
    window.flavorMagicApp.showScreen(screenId);
};

console.log('Flavor Magic App initialized successfully!');

```

});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
module.exports = FlavorMagicApp;
}
