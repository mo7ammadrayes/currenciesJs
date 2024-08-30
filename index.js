const choicesDiv = document.getElementById("choicesDiv");
const cityInput = document.getElementById("convertedAmount");
const resultsDiv = document.getElementById("resultsDiv");
const fromSelect = document.getElementById('from');
const intoSelect = document.getElementById('into');
const lastUpdated = document.getElementById('lastUpdated');
const nextUpdated = document.getElementById('nextUpdated');
const headerTime = document.getElementById('time');
const switchBtn = document.getElementById('switch');
const convertBtn = document.getElementById('convert');
const convertAmount = document.getElementById('convertAmount');
const favBtn = document.getElementById('favBtn'); // `Make` sure this element exists in your HTML
const apiKey = "";// enter you API key here

async function fetchCurrencies() {
    const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error("Error fetching currencies");
        }
        
        const data = await response.json();
        const currencies = Object.keys(data.conversion_rates);

        populateSelectOptions(currencies, fromSelect);
        populateSelectOptions(currencies, intoSelect);
        
        const lastUpdatedSate = data.time_last_update_utc;
        const nextUpdatedSate = data.time_next_update_utc;

        const normalizedLastUpdated = lastUpdatedSate.substring(0, lastUpdatedSate.indexOf("+") - 1);
        const normalizedNextUpdated = nextUpdatedSate.substring(0, nextUpdatedSate.indexOf("+") - 1);
        lastUpdated.textContent = `Last data update: ${normalizedLastUpdated}`;
        nextUpdated.textContent = `Next data update: ${normalizedNextUpdated}`;

        function updateTime() {
            let date = new Date();
            let hours = String(date.getHours()).padStart(2, '0') + ":";
            let min = String(date.getMinutes()).padStart(2, '0') + ":";
            let sec = String(date.getSeconds()).padStart(2, '0');
            const time = hours + min + sec;
            headerTime.textContent = time;
        }
        
        // Initial call to set the time immediately
        updateTime();
        // Update the time every second
        setInterval(updateTime, 1000);
        
    } catch (error) {
        console.error("Error:", error);
        resultsDiv.textContent = "Failed to load currencies. Please try again later.";
    }
}

function populateSelectOptions(currencies, selectElement) {
    const fragment = document.createDocumentFragment();

    currencies.forEach(currency => {
        const option = document.createElement('option');
        option.value = currency;
        option.textContent = currency;
        fragment.appendChild(option);
    });

    selectElement.appendChild(fragment);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchCurrencies();
    loadFavorites();
});

async function convert(amount, from, to) {
    // Input validation
    if (isNaN(amount) || amount <= 0) {
        resultsDiv.textContent = "Please enter a valid amount greater than 0.";
        return;
    }

    if (from === "other" || to === "other") {
        resultsDiv.textContent = "Please select both currencies.";
        return;
    }

    const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}`;
    
    try {
        // Disable the button to prevent multiple submissions
        convertBtn.disabled = true;
        resultsDiv.textContent = "Converting..."; // Provide feedback

        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error("Error fetching currencies");
        }
        
        const data = await response.json();
        const rate = data.conversion_rate;
        const convertedAmount = (rate * amount).toFixed(2);
        const convertdRate = `1 ${from} = ${rate} ${to}`;
        const convertdFin = `${amount} ${from} = ${convertedAmount} ${to}`;
        resultsDiv.innerHTML = convertdRate + "<br>" + convertdFin;

        favBtn.style.disabled = 'block';
        favBtn.onclick = () => saveToFavorites(from, to);

    } catch (error) {
        console.error(error);
        resultsDiv.textContent = "Failed to convert.";
    } finally {
        // Re-enable the button after the process is complete
        convertBtn.disabled = false;
    }
}

convertBtn.addEventListener("click", () => {
    convert(convertAmount.value, fromSelect.value, intoSelect.value);
});

const FAVORITES_KEY = 'currency_converter_favorites';

function saveToFavorites(from, to) {
    try {
        let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
        const pair = `${from}/${to}`;

        if (!favorites.includes(pair)) {
            favorites.push(pair);
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
            alert(`${pair} added to favorites!`);
        } else {
            alert(`${pair} is already in your favorites.`);
        }
        loadFavorites();
    } catch (error) {
        console.error('Error saving to favorites:', error);
    }
}

function removeFromFavorites(pair) {
    try {
        let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
        favorites = favorites.filter(favPair => favPair !== pair);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        loadFavorites(); // Refresh the favorites list display
    } catch (error) {
        console.error('Error removing from favorites:', error);
    }
}

function loadFavorites() {
    const favoritesList = document.getElementById('favorites');
    const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

    favoritesList.innerHTML = ''; // Clear the list first
    favorites.forEach(pair => {
        const li = document.createElement('li');
        li.textContent = pair;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = (event) => {
            event.stopPropagation(); // Prevent the parent `li` click event
            removeFromFavorites(pair);
        };
        li.appendChild(deleteButton);

        // Set up click event to perform conversion with the selected pair
        li.onclick = () => {
            const [from, to] = pair.split('/');
            fromSelect.value = from;
            intoSelect.value = to;
            convert(convertAmount.value, from, to); // Assuming you have a convert function
        };
        favoritesList.appendChild(li);
    });
}
switchBtn.addEventListener("click",()=>{
    const from=fromSelect.value
    const to=  intoSelect.value
    if (from === "other" || to === "other") {
    window.alert("choose both currencies to be able to switch") 
       return;
    }
    else{
        fromSelect.value=to;
        intoSelect.value=from;
    }
})