// --- Core Chart Logic Functions ---

// Renders the Gender SMR Trend chart in the dedicated 'genderChart' div
async function renderGenderChart(city_code, cityName) {
    try {
        const response = await fetch(`/city/${city_code}/gender`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const cityData = await response.json();

        // Filter for Male & Female
        const filtered = cityData.data.filter(
            d => d.gender === "Male" || d.gender === "Female"
        );

        const male = filtered.filter(d => d.gender === "Male");
        const female = filtered.filter(d => d.gender === "Female");

        Plotly.newPlot("genderChart", [ 
            {
                x: male.map(d => d.year),
                y: male.map(d => d.suicide_rate),
                mode: "lines+markers",
                name: "Male",
                line: {color: 'skyblue'} // Set Male line color to sky blue
            },
            {
                x: female.map(d => d.year),
                y: female.map(d => d.suicide_rate),
                mode: "lines+markers",
                name: "Female",
                line: {color: 'pink'} // Set Female line color to pink
            }
        ], {
            title: `${cityName} — Gender SMR Trend`,
            xaxis: { title: "Year" },
            yaxis: { title: "SMR" }
        });
        document.getElementById("error").textContent = "";
    } catch (err) {
        console.error("Error loading gender chart:", err);
        document.getElementById("error").textContent =
            "Failed to load gender chart data."; 
    }
}

// Renders the Welfare Spending Trend chart in the dedicated 'welfareChart' div
async function renderWelfareChart(city_code, cityName) {
    try {
        const response = await fetch(`/city/${city_code}/welfare`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const cityData = await response.json();
        const data = cityData.data;

        Plotly.newPlot("welfareChart", [ 
            {
                x: data.map(d => d.year),
                y: data.map(d => d.spending), 
                mode: "lines+markers",
                name: "Welfare Expenditure",
                line: {color: 'orange'} // Set Welfare line color to orange
            }
        ], {
            title: `${cityName} — Per Capita Social Welfare Expenditure Trend`,
            xaxis: { title: "Year" },
            yaxis: { title: "Spending ($)" }
        });
        document.getElementById("error").textContent = "";
    } catch (err) {
        console.error("Error loading welfare chart:", err);
        document.getElementById("error").textContent =
            "Failed to load welfare chart data.";
    }
}


// --- Main Control Flow ---

// NEW function: Loads both charts for the selected city
function loadAllChartsForCity(city_code, cityName) {
    // Clear previous error message
    document.getElementById("error").textContent = "";

    if (!city_code || city_code === "Loading...") {
        return; 
    }
    
    // Call both rendering functions simultaneously
    renderGenderChart(city_code, cityName);
    renderWelfareChart(city_code, cityName);
}


async function loadCityList() {
    try {
        const response = await fetch("/cities");
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const cities = await response.json();
        const select = document.getElementById("citySelect");

        // Clear old entries
        select.innerHTML = "";

        cities.forEach(city => {
            const option = document.createElement("option");
            option.value = city.code;
            option.textContent = city.name;
            select.appendChild(option);
        });

        // Auto-load charts for the first city after list is loaded
        if (cities.length > 0) {
            // Use the new control function
            loadAllChartsForCity(cities[0].code, cities[0].name);
        }

    } catch (err) {
        console.error("Error loading city list:", err);
        document.getElementById("error").textContent =
            "Failed to load city list from database.";
    }
}

// Initialize application
loadCityList();