// API endpoints
const JOKE_API_URL = 'https://official-joke-api.appspot.com/jokes';
const RANDOM_JOKE_URL = 'https://official-joke-api.appspot.com/random_joke';

// DOM elements
const jokeText = document.getElementById('joke-text');
const jokeType = document.getElementById('joke-type');
const newJokeBtn = document.getElementById('new-joke-btn');
const copyBtn = document.getElementById('copy-btn');
const favoriteBtn = document.getElementById('favorite-btn');
const loadingDiv = document.getElementById('loading');
const categorySelect = document.getElementById('category');
const jokeCountSpan = document.getElementById('joke-count');
const favoritesList = document.getElementById('favorites-list');
const clearFavoritesBtn = document.getElementById('clear-favorites-btn');

// State
let currentJoke = null;
let jokesGenerated = 0;
let favorites = JSON.parse(localStorage.getItem('jokesFavorites')) || [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    newJokeBtn.addEventListener('click', getJoke);
    copyBtn.addEventListener('click', copyToClipboard);
    favoriteBtn.addEventListener('click', addToFavorites);
    categorySelect.addEventListener('change', getJoke);
    clearFavoritesBtn.addEventListener('click', clearFavorites);
    
    updateJokeCount();
    renderFavorites();
    getJoke(); // Load initial joke
});

// Fetch and display a random joke
async function getJoke() {
    try {
        showLoading(true);
        newJokeBtn.disabled = true;
        copyBtn.disabled = true;
        favoriteBtn.disabled = true;

        const selectedCategory = categorySelect.value;
        let url;

        if (selectedCategory) {
            url = `${JOKE_API_URL}/${selectedCategory}/random`;
        } else {
            url = RANDOM_JOKE_URL;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        // Handle array response (from category endpoint)
        const joke = Array.isArray(data) ? data[0] : data;

        currentJoke = {
            setup: joke.setup || '',
            punchline: joke.punchline || '',
            type: joke.type || 'general'
        };

        displayJoke(currentJoke);
        jokesGenerated++;
        updateJokeCount();
        updateFavoriteButtonState();
        showLoading(false);
        newJokeBtn.disabled = false;
        copyBtn.disabled = false;
        favoriteBtn.disabled = false;

    } catch (error) {
        console.error('Error fetching joke:', error);
        jokeText.textContent = '😅 Oops! Could not load a joke. Please try again!';
        jokeType.textContent = 'Error';
        showLoading(false);
        newJokeBtn.disabled = false;
        copyBtn.disabled = false;
        favoriteBtn.disabled = false;
    }
}

// Display joke on screen
function displayJoke(joke) {
    const jokeContent = joke.setup ? `${joke.setup}\n\n${joke.punchline}` : joke.punchline;
    jokeText.textContent = jokeContent;
    jokeType.textContent = `Type: ${joke.type.toUpperCase()}`;
}

// Copy joke to clipboard
function copyToClipboard() {
    if (!currentJoke) return;

    const jokeContent = currentJoke.setup 
        ? `${currentJoke.setup}\n\n${currentJoke.punchline}` 
        : currentJoke.punchline;

    navigator.clipboard.writeText(jokeContent).then(() => {
        showCopyNotification('Joke copied to clipboard! 📋');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showCopyNotification('Failed to copy joke ❌');
    });
}

// Show/hide loading spinner
function showLoading(show) {
    if (show) {
        loadingDiv.classList.add('active');
    } else {
        loadingDiv.classList.remove('active');
    }
}

// Show copy notification
function showCopyNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Get joke string
function getJokeString(joke) {
    return joke.setup 
        ? `${joke.setup}\n${joke.punchline}` 
        : joke.punchline;
}

// Check if joke is in favorites
function isFavorite(joke) {
    const jokeString = getJokeString(joke);
    return favorites.includes(jokeString);
}

// Add joke to favorites
function addToFavorites() {
    if (!currentJoke) return;

    const jokeString = getJokeString(currentJoke);

    // Check if already in favorites
    if (!favorites.includes(jokeString)) {
        favorites.push(jokeString);
        saveFavorites();
        renderFavorites();
        updateFavoriteButtonState();
        showCopyNotification('Added to favorites! ❤️');
    } else {
        showCopyNotification('Already in favorites!');
    }
}

// Remove joke from favorites
function removeFromFavorites(index) {
    favorites.splice(index, 1);
    saveFavorites();
    renderFavorites();
    updateFavoriteButtonState();
    showCopyNotification('Removed from favorites');
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('jokesFavorites', JSON.stringify(favorites));
}

// Render favorites list
function renderFavorites() {
    favoritesList.innerHTML = '';

    if (favorites.length === 0) {
        favoritesList.innerHTML = '<li class="empty-favorites">No favorites yet. Add jokes you love! ❤️</li>';
        return;
    }

    favorites.forEach((joke, index) => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = joke.length > 100 ? joke.substring(0, 100) + '...' : joke;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-favorite';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => removeFromFavorites(index));

        li.appendChild(span);
        li.appendChild(removeBtn);
        favoritesList.appendChild(li);
    });
}

// Clear all favorites
function clearFavorites() {
    if (favorites.length === 0) {
        showCopyNotification('No favorites to clear');
        return;
    }

    if (confirm('Are you sure you want to clear all favorites?')) {
        favorites = [];
        saveFavorites();
        renderFavorites();
        updateFavoriteButtonState();
        showCopyNotification('Favorites cleared 🗑️');
    }
}

// Update joke count display
function updateJokeCount() {
    jokeCountSpan.textContent = jokesGenerated;
}

// Update favorite button state
function updateFavoriteButtonState() {
    if (currentJoke && isFavorite(currentJoke)) {
        favoriteBtn.textContent = '💚 Already Favorited';
        favoriteBtn.style.opacity = '0.7';
    } else {
        favoriteBtn.textContent = '❤️ Add to Favorites';
        favoriteBtn.style.opacity = '1';
    }
}
