let searchBtn = document.getElementById("search-btn");
let countryInp = document.getElementById("country-inp");
let result = document.getElementById("result");

// Create a div for autocomplete suggestions
let suggestionBox = document.createElement("div");
suggestionBox.setAttribute("id", "suggestions");
document.querySelector(".search-wrapper").appendChild(suggestionBox);

let countryList = [];
let selectedIndex = -1;

// Fetch country names when the page loads
fetch("https://restcountries.com/v3.1/all")
  .then(response => response.json())
  .then(data => {
    countryList = data.map(country => country.name.common).sort();
  })
  .catch(error => console.error("Error fetching country list:", error));

// Autocomplete function
countryInp.addEventListener("input", function () {
  let input = countryInp.value.toLowerCase();
  suggestionBox.innerHTML = "";
  selectedIndex = -1; // Reset selection index

  if (input.length === 0) {
    suggestionBox.style.display = "none";
    return;
  }

  let filteredCountries = countryList.filter(country =>
    country.toLowerCase().startsWith(input)
  );

  if (filteredCountries.length === 0) {
    suggestionBox.style.display = "none";
    return;
  }

  suggestionBox.style.display = "block";

  filteredCountries.slice(0, 5).forEach((country, index) => {
    let div = document.createElement("div");
    div.classList.add("suggestion-item");
    div.innerText = country;
    div.addEventListener("click", function () {
      countryInp.value = country;
      suggestionBox.innerHTML = "";
      suggestionBox.style.display = "none";
    });
    suggestionBox.appendChild(div);
  });
});

// Keyboard navigation for suggestions
countryInp.addEventListener("keydown", function (event) {
  let suggestions = document.querySelectorAll(".suggestion-item");

  if (event.key === "ArrowDown") {
    selectedIndex = (selectedIndex + 1) % suggestions.length;
  } else if (event.key === "ArrowUp") {
    selectedIndex = (selectedIndex - 1 + suggestions.length) % suggestions.length;
  } else if (event.key === "Enter") {
    event.preventDefault(); // Prevent form submission

    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      countryInp.value = suggestions[selectedIndex].innerText;
      suggestionBox.innerHTML = "";
      suggestionBox.style.display = "none";
    }
    searchCountry();
    return;
  }

  // Highlight selected suggestion
  suggestions.forEach((item, index) => {
    item.classList.toggle("selected", index === selectedIndex);
  });
});

// Hide suggestions when clicking outside
document.addEventListener("click", (e) => {
  if (!countryInp.contains(e.target) && !suggestionBox.contains(e.target)) {
    suggestionBox.style.display = "none";
  }
});

// Search function
function searchCountry() {
  let countryName = countryInp.value.trim();
  if (!countryName) {
    result.innerHTML = `<h3 class="error">The input field cannot be empty</h3>`;
    return;
  }

  let matchedCountry = countryList.find(c => c.toLowerCase() === countryName.toLowerCase());
  if (!matchedCountry) {
    result.innerHTML = `<h3 class="error">Country not found. Please check the spelling.</h3>`;
    return;
  }

  let finalURL = `https://restcountries.com/v3.1/name/${matchedCountry}?fullText=true`;
  result.innerHTML = `<h3>Loading...</h3>`;

  fetch(finalURL)
    .then(response => response.json())
    .then(data => {
      if (!data || data.status === 404) {
        result.innerHTML = `<h3 class="error">Country not found. Please try again.</h3>`;
        return;
      }

      let currencyKey = Object.keys(data[0].currencies)[0];
      let currencyName = data[0].currencies[currencyKey].name;

      result.innerHTML = `
        <img src="${data[0].flags.svg}" class="flag-img">
        <h2>${data[0].name.common}</h2>
        <div class="wrapper">
            <div class="data-wrapper"><h4>Capital:</h4><span>${data[0].capital[0]}</span></div>
        </div>
        <div class="wrapper">
            <div class="data-wrapper"><h4>Continent:</h4><span>${data[0].continents[0]}</span></div>
        </div>
        <div class="wrapper">
            <div class="data-wrapper"><h4>Population:</h4><span>${data[0].population}</span></div>
        </div>
        <div class="wrapper">
            <div class="data-wrapper"><h4>Currency:</h4><span>${currencyName} - ${currencyKey}</span></div>
        </div>
        <div class="wrapper">
            <div class="data-wrapper"><h4>Common Languages:</h4><span>${Object.values(data[0].languages).join(", ")}</span></div>
        </div>
      `;
    })
    .catch(() => {
      result.innerHTML = `<h3 class="error">API request failed. Try again later.</h3>`;
    });
}

// Trigger search on button click
searchBtn.addEventListener("click", searchCountry);
