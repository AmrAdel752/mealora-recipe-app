
let apiURL = "https://forkify-api.herokuapp.com/api/v2/recipes";
let apiKey = "ef8179b6-fc1c-47b8-8de1-240e907d5d4c";
const recipeRequestCache = {};

async function GetRecipes(recipeName,id,isAllShow) {
    recipeRequestCache[id] = { recipeName, id, isAllShow };
    if (!normalizeSearchTerm(recipeName)) {
        setRecipeEmptyState(id, 'search');
        return;
    }

    setRecipeLoadingState(id, isAllShow ? 6 : 3);
    try {
        let resp = await fetch(`${apiURL}?search=${recipeName}&key=${apiKey} `)
        if (!resp.ok) {
            throw new Error('Recipe request failed');
        }
        let result = await resp.json();
        let Recipes = isAllShow ? result.data.recipes : result.data.recipes.slice(1, 7);
        if (!Recipes || Recipes.length === 0) {
            setRecipeEmptyState(id, isAllShow ? 'search' : 'recipes');
            return;
        }
        showRecipes(Recipes, id);
    } catch (err) {
        console.log(err);
        setRecipeErrorState(id);
    }
}

function showRecipes(recipes, id) {
    $.ajax({
        contentType: "application/json; charset=utf-8", 
        dataType: 'html',
        type: 'POST',
        url: '/Recipe/GetRecipeCard',
        data: JSON.stringify(recipes),
        success: function (htmlResult) {
            setBusyState(id, false);
            $('#' + id).html(htmlResult);
            initializeFavorites();
        },
        error: function (err) {
            console.log(err);
            setRecipeErrorState(id);
        }
    });
}

function setRecipeLoadingState(id, count = 3) {
    setBusyState(id, true);
    let skeletons = Array.from({ length: count }, () => '<div class="recipe-skeleton" aria-hidden="true"></div>').join('');
    $('#' + id).html(`
        <div class="visually-hidden" role="status">Loading recipes...</div>
        ${skeletons}
    `);
}

function setRecipeEmptyState(id, type = 'search') {
    setBusyState(id, false);
    let state = type === 'search'
        ? mealoraStateMarkup({
            icon: 'fa-magnifying-glass',
            title: 'No search results',
            message: 'Try another recipe, ingredient, or spelling.',
            actionText: 'Clear Search',
            actionHref: '/Recipe'
        })
        : mealoraStateMarkup({
            icon: 'fa-utensils',
            title: 'No recipes found',
            message: 'Try searching for another recipe or ingredient.'
        });
    $('#' + id).html(state);
}

function setRecipeErrorState(id) {
    setBusyState(id, false);
    let retry = recipeRequestCache[id]
        ? `<button type="button" class="btn btn-primary" onclick="retryRecipeRequest('${escapeHtml(id)}')">Try Again</button>`
        : '';

    $('#' + id).html(mealoraStateMarkup({
        icon: 'fa-triangle-exclamation',
        title: 'Something went wrong',
        message: "We couldn't load recipes right now. Please try again.",
        className: 'mealora-state-error',
        actionHtml: retry
    }));
}

function retryRecipeRequest(id) {
    let request = recipeRequestCache[id];
    if (!request) {
        return;
    }

    GetRecipes(request.recipeName, request.id, request.isAllShow);
}

function setBusyState(id, isBusy) {
    $('#' + id).attr('aria-busy', isBusy ? 'true' : 'false');
}

function mealoraStateMarkup({ icon, title, message, actionText, actionHref, actionHtml, className = '' }) {
    let iconMarkup = icon ? `<i class="fa-solid ${icon} mealora-state-icon" aria-hidden="true"></i>` : '';
    let actionMarkup = actionHtml || (actionText && actionHref ? `<a class="btn btn-primary" href="${actionHref}">${actionText}</a>` : '');
    let alertRole = className.includes('error') ? ' role="alert"' : '';

    return `
        <section class="mealora-state recipe-state ${className}" aria-label="${escapeHtml(title)}"${alertRole}>
            ${iconMarkup}
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(message)}</p>
            ${actionMarkup}
        </section>
    `;
}

async function getOrderRecipe(id,showId) {
    setOrderLoadingState(showId);
    try {
        let resp = await fetch(`${apiURL}/${id}?key=${apiKey}`);
        if (!resp.ok) {
            throw new Error('Recipe details request failed');
        }
        let result = await resp.json();
        let recipe = result.data.recipe;
        MealoraStorage.addRecentlyViewed(normalizeRecipe(recipe, id));
        showOrderRecipeDetails(recipe, showId);
    } catch (err) {
        console.log(err);
        $('#' + showId).attr('aria-busy', 'false');
        $('#' + showId).html(mealoraStateMarkup({
            icon: 'fa-triangle-exclamation',
            title: 'Something went wrong',
            message: "We couldn't load recipes right now. Please try again.",
            className: 'mealora-state-error',
            actionHtml: `<button type="button" class="btn btn-primary" onclick="getOrderRecipe('${escapeHtml(id)}', '${escapeHtml(showId)}')">Try Again</button>`
        }));
    }
}

function showOrderRecipeDetails(orderRecipeDetails, showId) {
    $.ajax({
        url: '/Recipe/ShowOrder',
        data: orderRecipeDetails,
        dataType: 'html',
        type: 'POST',

        success: function (htmlResult) {
            $('#' + showId).attr('aria-busy', 'false');
            $('#' + showId).html(htmlResult);
            initializeFavorites();
        },
        error: function (err) {
            console.log(err);
            $('#' + showId).attr('aria-busy', 'false');
            $('#' + showId).html(mealoraStateMarkup({
                icon: 'fa-triangle-exclamation',
                title: 'Something went wrong',
                message: "We couldn't load recipes right now. Please try again.",
                className: 'mealora-state-error'
            }));
        }
    });
}

function setOrderLoadingState(id) {
    $('#' + id).attr('aria-busy', 'true').html(`
        <div class="order-detail">
            <div class="order-hero order-hero-skeleton" aria-hidden="true">
                <div class="recipe-skeleton"></div>
                <div class="recipe-skeleton"></div>
            </div>
            <div class="recipe-grid" aria-hidden="true">
                <div class="recipe-skeleton"></div>
                <div class="recipe-skeleton"></div>
                <div class="recipe-skeleton"></div>
            </div>
            <div class="visually-hidden" role="status">Loading recipe details...</div>
        </div>
    `);
}

const MealoraStorage = {
    keys: {
        favorites: 'mealoraFavorites',
        recentlyViewed: 'mealoraRecentlyViewed',
        recentSearches: 'mealoraRecentSearches'
    },
    limits: {
        recentlyViewed: 6,
        recentSearches: 6
    },
    read(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch (err) {
            console.log(err);
            return [];
        }
    },
    write(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    favorites() {
        return this.read(this.keys.favorites);
    },
    saveFavorites(favorites) {
        this.write(this.keys.favorites, favorites);
    },
    recentlyViewed() {
        return this.read(this.keys.recentlyViewed);
    },
    addRecentlyViewed(recipe) {
        if (!recipe.id) {
            return;
        }

        let viewed = this.recentlyViewed().filter(item => item.id !== recipe.id);
        viewed.unshift(recipe);
        this.write(this.keys.recentlyViewed, viewed.slice(0, this.limits.recentlyViewed));
    },
    recentSearches() {
        return this.read(this.keys.recentSearches);
    },
    addRecentSearch(term) {
        let cleanTerm = normalizeSearchTerm(term);
        if (!isStorableSearchTerm(cleanTerm)) {
            return;
        }

        let searches = this.recentSearches().filter(item => item.toLowerCase() !== cleanTerm.toLowerCase());
        searches.unshift(cleanTerm);
        this.write(this.keys.recentSearches, searches.slice(0, this.limits.recentSearches));
    },
    clearRecentSearches() {
        localStorage.removeItem(this.keys.recentSearches);
    }
};

function getFavorites() {
    return MealoraStorage.favorites();
}

function saveFavorites(favorites) {
    MealoraStorage.saveFavorites(favorites);
}

function normalizeRecipeFromButton(button) {
    return normalizeRecipe({
        id: button.attr('data-recipeId'),
        title: button.attr('data-recipe-title'),
        publisher: button.attr('data-recipe-publisher'),
        image_url: button.attr('data-recipe-image')
    });
}

function normalizeRecipe(recipe, fallbackId) {
    return {
        id: recipe?.id || recipe?.Id || fallbackId || '',
        title: recipe?.title || recipe?.Title || 'Untitled recipe',
        publisher: recipe?.publisher || recipe?.Publisher || '',
        image_url: recipe?.image_url || recipe?.Image_url || ''
    };
}

function favoriteToggle() {
    let button = $(this);
    let recipe = normalizeRecipeFromButton(button);
    if (!recipe.id) {
        return;
    }

    let favorites = getFavorites();
    let existingIndex = favorites.findIndex(item => item.id === recipe.id);
    let isFavorite = existingIndex === -1;

    if (isFavorite) {
        favorites.push(recipe);
        showMealoraToast('Saved to favorites');
    } else {
        favorites.splice(existingIndex, 1);
        showMealoraToast('Removed from favorites');
    }

    saveFavorites(favorites);
    updateFavoriteButtons();
    if ($('#favoritesContent').length) {
        renderFavoritesPage('favoritesContent');
    }
}

function initializeFavorites() {
    updateFavoriteButtons();
}

function updateFavoriteButtons() {
    let favoriteIds = getFavorites().map(item => item.id);
    $('.recipe-favorite').each((index, buttonElement) => {
        let button = $(buttonElement);
        let recipeId = button.attr('data-recipeId');
        setFavoriteButtonState(button, favoriteIds.includes(recipeId));
    });
}

function renderFavoritesPage(id) {
    let favorites = getFavorites();
    if (!favorites.length) {
        $('#' + id).html(mealoraStateMarkup({
            icon: 'fa-heart',
            title: 'Empty favorites',
            message: 'Save recipes you love and find them here later.',
            actionText: 'Explore Recipes',
            actionHref: '/Recipe',
            className: 'favorites-empty-state'
        }));
        return;
    }

    let cards = favorites.map(recipe => buildFavoriteCard(recipe)).join('');
    $('#' + id).html(`<div class="recipe-grid">${cards}</div>`);
    initializeFavorites();
}

function buildFavoriteCard(recipe) {
    return buildStoredRecipeCard(recipe);
}

function buildStoredRecipeCard(recipe) {
    let recipeId = escapeHtml(recipe.id || '');
    let recipeTitle = escapeHtml(recipe.title || 'Untitled recipe');
    let publisher = escapeHtml(recipe.publisher || 'Saved recipe');
    let imageUrl = escapeHtml(recipe.image_url || '');
    let recipeUrl = `/Recipe/Order?id=${encodeURIComponent(recipe.id || '')}`;
    let media = imageUrl
        ? `<a class="recipe-card-media" href="${recipeUrl}" aria-label="View ${recipeTitle}">
                <img src="${imageUrl}" alt="${recipeTitle}" loading="lazy" onerror="this.parentElement.classList.add('recipe-card-media-fallback'); this.remove();" />
           </a>`
        : `<a class="recipe-card-media recipe-card-media-fallback" href="${recipeUrl}" aria-label="View ${recipeTitle}"></a>`;

    return `
        <article class="recipe-card">
            ${media}
            <div class="recipe-card-body">
                <div class="recipe-card-copy">
                    <h3 title="${recipeTitle}">${recipeTitle}</h3>
                    <p>${publisher}</p>
                </div>
                <div class="recipe-card-actions">
                    <a href="${recipeUrl}" class="btn btn-primary">View Recipe</a>
                    <button type="button" class="addToCartIcon recipe-favorite" onclick="favoriteToggle.call(this)" data-recipeId="${recipeId}" data-recipe-title="${recipeTitle}" data-recipe-publisher="${publisher}" data-recipe-image="${imageUrl}" aria-label="Remove ${recipeTitle}" aria-pressed="true">
                        <i class="fa-solid fa-heart fs-4" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </article>
    `;
}

function initializeStorageFeatures() {
    initializeFeedbackSystem();
    initializeFavorites();
    initializeRecentSearches();
    renderRecentlyViewed('recentlyViewedRecipes', 'recentlyViewedSection');
}

function initializeRecentSearches() {
    $('.recipe-search-form, .home-search-form').off('submit.mealoraSearches').on('submit.mealoraSearches', function () {
        let term = $(this).find('input[type="search"][name="recipe"]').val();
        MealoraStorage.addRecentSearch(term);
    });

    renderRecentSearches('recentSearches');
    renderRecentSearches('homeRecentSearches');
}

function renderRecentSearches(id) {
    let container = $('#' + id);
    if (!container.length) {
        return;
    }

    let searches = MealoraStorage.recentSearches();
    if (!searches.length) {
        container.empty();
        return;
    }

    let chips = searches.map(term => {
        let safeTerm = escapeHtml(term);
        return `<a class="recent-search-chip" href="/Recipe/Search?recipe=${encodeURIComponent(term)}">${safeTerm}</a>`;
    }).join('');

    container.html(`
        <div class="recent-searches-header">
            <span>Recent searches</span>
            <button type="button" class="recent-searches-clear" onclick="clearRecentSearchHistory()">Clear</button>
        </div>
        <div class="recent-searches-list">${chips}</div>
    `);
}

function clearRecentSearchHistory() {
    MealoraStorage.clearRecentSearches();
    renderRecentSearches('recentSearches');
    renderRecentSearches('homeRecentSearches');
}

function normalizeSearchTerm(term) {
    return String(term || '').trim().replace(/\s+/g, ' ');
}

function isStorableSearchTerm(term) {
    return term.length > 0 && term.length <= 60 && !term.includes('@') && !/\d{6,}/.test(term);
}

function renderRecentlyViewed(listId, sectionId) {
    let list = $('#' + listId);
    let section = $('#' + sectionId);
    if (!list.length || !section.length) {
        return;
    }

    let viewed = MealoraStorage.recentlyViewed();
    if (!viewed.length) {
        list.html(mealoraStateMarkup({
            icon: 'fa-clock-rotate-left',
            title: 'No recent recipes',
            message: 'Open a recipe and it will show up here for quick access.',
            actionText: 'Explore Recipes',
            actionHref: '/Recipe'
        }));
        section.removeClass('d-none');
        return;
    }

    list.html(viewed.map(recipe => buildStoredRecipeCard(recipe)).join(''));
    section.removeClass('d-none');
    initializeFavorites();
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

function showMealoraToast(message) {
    if (!message) {
        return;
    }

    let container = $('#mealoraToastRegion');
    if (!container.length) {
        $('body').append('<div id="mealoraToastRegion" class="mealora-toast-region" role="log" aria-live="polite" aria-relevant="additions"></div>');
        container = $('#mealoraToastRegion');
    }

    let toast = $('<div class="mealora-toast" role="status" tabindex="0"></div>').text(message);
    let removeToast = () => {
        toast.removeClass('show');
        window.setTimeout(() => toast.remove(), 220);
    };
    let timer = window.setTimeout(removeToast, 3200);

    toast.on('mouseenter focusin', () => window.clearTimeout(timer));
    toast.on('mouseleave focusout', () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(removeToast, 1600);
    });

    container.append(toast);
    window.requestAnimationFrame(() => toast.addClass('show'));
}

function quantity(option) {
    let qty = $('#qty').val();
    let Price = parseInt($('#Price').val());
    let totalAmount = 0;
    if (option === 'inc') {
        qty = parseInt(qty) + 1;
    }
    else {
        qty = qty === 1 ? qty : qty - 1;
    }
    totalAmount = Price * qty;
    $('#qty').val(qty);
    $('#totalAmount').val(totalAmount);
}

function cartRequest(data, action, successMessage) {
    $.ajax({
        url: '/Cart/'+action,
        type: 'POST',
        data: data,
        success: function () {
            if (successMessage) {
                sessionStorage.setItem('mealoraToastMessage', successMessage);
            }
            location.reload();
        },
        error: function (err) {
            console.log(err);
            showMealoraToast('Something went wrong');
        }
    });
}

function addRecipeToCart(buttonElement) {
    let button = $(buttonElement);
    let data = {
        RecipeId: button.attr('data-recipeId'),
        Title: button.attr('data-recipe-title'),
        Publisher: button.attr('data-recipe-publisher'),
        Image_url: button.attr('data-recipe-image')
    };

    if (!data.RecipeId || !data.Title || !data.Publisher || !data.Image_url) {
        showMealoraToast('This recipe cannot be added right now');
        return;
    }

    button.prop('disabled', true).attr('aria-busy', 'true');
    $.ajax({
        url: '/Cart/SaveCart',
        type: 'POST',
        data: data,
        success: function () {
            showMealoraToast('Added to cart');
            if ($('#showCartList').length) {
                getCartList();
            }
        },
        error: function (err) {
            console.log(err);
            showMealoraToast('Something went wrong');
        },
        complete: function () {
            button.prop('disabled', false).removeAttr('aria-busy');
        }
    });
}

function setFavoriteButtonState(button, isFavorite) {
    let recipeTitle = button.attr('data-recipe-title') || 'recipe';
    let icon = button.children('i')[0];
    button.toggleClass('is-favorite', isFavorite);
    button.attr('aria-pressed', isFavorite ? 'true' : 'false');
    button.attr('aria-label', `${isFavorite ? 'Remove' : 'Save'} ${recipeTitle}`);
    $(icon).toggleClass('fa-solid', isFavorite);
    $(icon).toggleClass('fa-regular', !isFavorite);
}

function getCartList() {
    $('#showCartList').attr('aria-busy', 'true').html('<div class="cart-preview-empty"><strong>Loading cart...</strong></div>');
    $.ajax({
        url: '/Cart/GetCartList',
        type: 'GET',
        dataType: 'html',
        success: function (result) {
            $('#showCartList').attr('aria-busy', 'false').html(result);
        },
        error: function (err) {
            console.log(err);
            $('#showCartList').attr('aria-busy', 'false').html(mealoraStateMarkup({
                icon: 'fa-triangle-exclamation',
                title: 'Something went wrong',
                message: "We couldn't load recipes right now. Please try again.",
                className: 'mealora-state-error cart-preview-state',
                actionHtml: '<button type="button" class="btn btn-primary btn-sm" onclick="getCartList()">Try Again</button>'
            }));
        },
    });
}

function removeCartfromlist(id) {
    let data = {Id : id};
    cartRequest(data, 'RemoveCartFromList', 'Removed from cart');
}

function initializeFeedbackSystem() {
    initializeSearchLoadingFeedback();
    let pendingToast = sessionStorage.getItem('mealoraToastMessage');
    if (pendingToast) {
        sessionStorage.removeItem('mealoraToastMessage');
        showMealoraToast(pendingToast);
    }
}

function initializeSearchLoadingFeedback() {
    $('.recipe-search-form, .home-search-form').off('submit.mealoraFeedback').on('submit.mealoraFeedback', function () {
        let form = $(this);
        let button = form.find('button[type="submit"]');
        let term = normalizeSearchTerm(form.find('input[type="search"][name="recipe"]').val());

        if (!term) {
            return;
        }

        button.prop('disabled', true).attr('aria-busy', 'true').data('original-text', button.text()).text('Searching...');
        let visibleGrid = $('.recipe-grid[id]').first();
        if (visibleGrid.length) {
            setRecipeLoadingState(visibleGrid.attr('id'), 6);
        }
    });
}
