

const input = document.getElementById("searchInput");
const title = document.getElementById("searchTitle");
const button = document.querySelector(".search-wrapper");
const moviesContainer = document.querySelector(".content-wrap");
const API_KEY = "caf09072";

const minYear = document.getElementById("minYear");
const maxYear = document.getElementById("maxYear");

const minYearValue = document.getElementById("minYearValue");
const maxYearValue = document.getElementById("maxYearValue");
const yearRangeText = document.getElementById("yearRangeText");

let allMovies = [];

async function fetchMovies(searchTerm) {
    const moviesSection = document.getElementById("movies");

    if (!searchTerm) return;

    moviesSection.classList.add("loading__state");

    const startTime = Date.now();

try {
    let url;

    if (searchTerm.startsWith("tt")) {
        url = `https://www.omdbapi.com/?i=${searchTerm}&apikey=${API_KEY}`;
    } else {
        url = `https://www.omdbapi.com/?s=${searchTerm}&apikey=${API_KEY}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    let resultMovies;

    if (searchTerm.startsWith("tt")) {
        resultMovies = data.Response === "True" ? [data] : [];
    } else {
        resultMovies = data.Response === "True" ? data.Search : [];
    }

    const elapsed = Date.now() - startTime;
    const delay = Math.max(400 - elapsed, 0);

    setTimeout(() => {
        allMovies = resultMovies;
        displayMovies(allMovies);
        moviesSection.classList.remove("loading__state");
    }, delay);

} catch (error) {
    console.error("Fetch error:", error);

    setTimeout(() => {
        allMovies = [];
        displayMovies([]);
        moviesSection.classList.remove("loading__state");
    }, 400);
}
}

function displayMovies(movies = []) {
    moviesContainer.innerHTML = "";

    if (movies.length === 0) {
        moviesContainer.innerHTML = "<p>No results found</p>";
        return;
    }

    const min = parseInt(minYear.value);
    const max = parseInt(maxYear.value);

    const filtered = movies.filter(movie => {
        const year = parseInt(movie.Year.split("–")[0]);
        return year >= min && year <= max;
    });

    const limitedMovies = filtered.slice(0, 6);

    if (limitedMovies.length === 0) {
        moviesContainer.innerHTML = "<p>No movies in this year range</p>";
        return;
    }

    let html = "";

    limitedMovies.forEach(movie => {
        html += `
            <div class="movie-card">
                <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Image"}"
                onerror="this.onerror=null; this.src='https://via.placeholder.com/300x450?text=No+Image';"
                >
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
                <p>${movie.imdbID}</p>
            </div>
        `;
    });

    moviesContainer.innerHTML = html;
}

displayMovies();

function updateSearchTitle() {
    const value = input.value.trim();

    if (value) {
        title.textContent = `Search results for "${value}"`;
    } else {
        title.textContent = "Search results:";
    }
}

function updateYearUI() {
    let min = parseInt(minYear.value);
    let max = parseInt(maxYear.value);

    if (min > max) {
        minYear.value = max;
        min = max;
    }

    minYearValue.textContent = min;
    maxYearValue.textContent = max;
    yearRangeText.textContent = `${min} - ${max}`;
}

function updateSliderTrack() {
    let min = parseInt(minYear.value);
    let max = parseInt(maxYear.value);

    const lower = Math.min(min, max);
    const upper = Math.max(min, max);

    const range = minYear.max - minYear.min;

    const leftPercent = ((lower - minYear.min) / range) * 100;
    const rightPercent = ((upper - minYear.min) / range) * 100;

    document.querySelector(".slider-track").style.background = `
        linear-gradient(
            to right,
            #ddd 0%,
            #ddd ${leftPercent}%,
            #2271b1 ${leftPercent}%,
            #2271b1 ${rightPercent}%,
            #ddd ${rightPercent}%,
            #ddd 100%
        )
    `;
}

updateSliderTrack();

function syncSliders() {
    let min = parseInt(minYear.value);
    let max = parseInt(maxYear.value);

    if (min > max) {
        [min, max] = [max, min];
    }

    minYear.value = min;
    maxYear.value = max;
}

syncSliders();

function handleSliderChange() {
    syncSliders();
    updateYearUI();
    updateSliderTrack();
    displayMovies(allMovies);
}

handleSliderChange();

minYear.addEventListener("input", handleSliderChange);
maxYear.addEventListener("input", handleSliderChange);

input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        updateSearchTitle();
        fetchMovies(input.value.trim());
    }
});

button.addEventListener("click", () => {
    const value = input.value.trim();

    if (!value) return;

    updateSearchTitle();
    fetchMovies(value);
});


