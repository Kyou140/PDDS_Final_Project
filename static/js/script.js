// --- Global State ---
let selectedYear = '2024'; // Default year matches the button set as 'active'

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
                line: {color: 'skyblue'}
            },
            {
                x: female.map(d => d.year),
                y: female.map(d => d.suicide_rate),
                mode: "lines+markers",
                name: "Female",
                line: {color: 'pink'}
            }
        ], {
            title: `${cityName} — Gender Standardized Mortality Ratio`,
            xaxis: { title: "Year" },
            yaxis: { title: "Standardized Mortality Ratio" }
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
                line: {color: 'orange'}
            }
        ], {
            title: `${cityName} — Per Capita Social Welfare Expenditure`,
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

// Renders the Service Accessibility Map with Bubble Chart (New Function)
// FIX 1: Remove city_code and cityName arguments. This map is nationwide.
async function renderAccessibilityMap() {
    try {
        // FIX 2: Revert fetch URL to the correct nationwide route
        const response = await fetch(`/map/accessibility`); 
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const mapData = await response.json();
        const data = mapData.data;

        // NOTE: If your database query fails or lacks Lat/Lon, this map will not render correctly.
        // Assuming your data now includes 'latitude' and 'longitude' columns:
        const lats = data.map(d => d.latitude || 23.6); // Fallback to Taiwan center if missing
        const lons = data.map(d => d.longitude || 120.96); // Fallback to Taiwan center if missing
        const facility_counts = data.map(d => d.total_facilities);
        const densities = data.map(d => d.density_per_area);
        const city_names = data.map(d => d.city_name);

        // --- Plotly Layout ---
        const mapLayout = {
            // FIX 3: Set initial placeholder title. This will be updated dynamically later.
            title: 'Taiwan — Service Facility Density',
            height: 450, // Match the height of other charts
            geo: {
                scope: 'asia',
                center: { lat: 23.6, lon: 120.96 }, // Center over Taiwan
                lataxis: { range: [21.5, 26.5] }, 
                lonaxis: { range: [118.5, 122.5] },
                subunitcolor: 'rgba(0,0,0,0.3)',
                showland: true,
                landcolor: 'rgb(243, 243, 243)',
                // For accurate Taiwan borders, a GeoJSON or specific Mapbox setup is usually needed
            },
            autosize: true, 
            margin: { t: 40, b: 20, l: 20, r: 20 }
        };

        // --- Plotly Data Trace (Bubble Chart) ---
        const mapTrace = {
            type: 'scattergeo',
            mode: 'markers',
            lat: lats,
            lon: lons,
            marker: {
                // Scale the size based on facility count (Total Facilities)
                size: facility_counts.map(c => Math.sqrt(c + 1) * 7), 
                // Color based on density (Density per Area)
                color: densities, 
                colorscale: 'YlOrRd', 
                showscale: true,
                colorbar: { title: "Density (Fac./Area)" }
            },
            text: city_names.map((name, i) => 
                `${name}<br>Facilities: ${facility_counts[i]}<br>Density: ${densities[i].toFixed(4)}`
            ),
            hoverinfo: 'text'
        };

        Plotly.newPlot("accessibilityMapChart", [mapTrace], mapLayout, { responsive: true });
        
        document.getElementById("error").textContent = "";

    } catch (err) {
        console.error("Error loading accessibility map:", err);
        document.getElementById("error").textContent =
            "Failed to load map data. Check database connection and Lat/Lon data.";
    }
}


// --- Summary Panel Logic (No changes needed) ---

async function updateSummaryPanels(city_code, year) {
    // NOTE: This remains the same as previously defined for summary panels
    try {
        // 1. Fetch Gender Data (for High Risk/SMR metric)
        const genderResponse = await fetch(`/city/${city_code}/gender`);
        const genderData = await genderResponse.json();
        const allGenderData = genderData.data;

        // Find the average SMR for the selected year
        const yearData = allGenderData.filter(d => d.year.toString() === year);
        
        let avgSMR = 0;
        if (yearData.length > 0) {
            const totalSMR = yearData.reduce((sum, d) => sum + d.suicide_rate, 0); 
            avgSMR = totalSMR / yearData.length;
        }

        // 2. Fetch Welfare Data (for Resources Allocated)
        const welfareResponse = await fetch(`/city/${city_code}/welfare`);
        const welfareData = await welfareResponse.json();
        const allWelfareData = welfareData.data;

        // Find the spending for the selected year
        const yearSpending = allWelfareData.find(d => d.year.toString() === year);
        const spending = yearSpending ? yearSpending.spending : 0;


        // 3. Update the display panels
        document.getElementById('highRiskHighResourcesValue').textContent = avgSMR.toFixed(2);
        
        // Using welfare spending as a placeholder for Resources Allocated
        document.getElementById('highRiskLowResourcesValue').textContent = `$${spending.toLocaleString()}`; 
        
        // Placeholder for the "Generation Rate" metric. 
        document.getElementById('highRiskGenerationValue').textContent = year === '2024' ? '1.2%' : '1.5%';

    } catch (err) {
        console.error("Error updating summary panels:", err);
        document.getElementById('highRiskHighResourcesValue').textContent = 'N/A';
        document.getElementById('highRiskLowResourcesValue').textContent = 'N/A';
        document.getElementById('highRiskGenerationValue').textContent = 'N/A';
    }
}


// --- Year Selection Handler (No changes needed) ---

function handleYearSelection(event) {
    if (event.target.tagName !== 'BUTTON') return;

    const year = event.target.dataset.year;
    if (!year) return;

    // 1. Update active button styling
    document.querySelectorAll('#year-selector button').forEach(button => {
        button.classList.remove('active');
    });
    event.target.classList.add('active');

    // 2. Update global state
    selectedYear = year;

    // 3. Get current city and re-load summary panels
    const citySelect = document.getElementById("citySelect");
    const city_code = citySelect.value;

    if (city_code && city_code !== "Loading...") {
        updateSummaryPanels(city_code, selectedYear); 
    }
}

// --- Dynamic Map Title Update (NEW FUNCTION) ---
/**
 * Updates the title of the accessibility map chart to reflect the selected city name.
 * @param {string} cityName - The currently selected city/county name.
 */
function updateMapTitle(cityName) {
    const newTitle = `${cityName} — Service Facility Density`;
    
    // Check if the plot exists before attempting to update the layout
    const mapDiv = document.getElementById("accessibilityMapChart");
    if (mapDiv.data && mapDiv.data.length > 0) {
        Plotly.relayout('accessibilityMapChart', {
            title: newTitle
        });
    }
}

// --- Main Control Flow ---

function loadAllChartsForCity(city_code, cityName) {
    document.getElementById("error").textContent = "";

    if (!city_code || city_code === "Loading...") {
        return; 
    }
    
    // 1. Render both full trend charts
    renderGenderChart(city_code, cityName);
    renderWelfareChart(city_code, cityName);
    
    // 2. Update the summary panels with the currently selected year's data
    updateSummaryPanels(city_code, selectedYear);
    
    // FIX 4: Call the new function to dynamically update the map title
    updateMapTitle(cityName); 
}


async function loadCityList() {
    try {
        const response = await fetch("/cities");
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const cities = await response.json();
        const select = document.getElementById("citySelect");

        select.innerHTML = "";

        cities.forEach(city => {
            const option = document.createElement("option");
            option.value = city.code;
            option.textContent = city.name;
            select.appendChild(option);
        });

        // Set up event listener for the year buttons
        document.getElementById('year-selector').addEventListener('click', handleYearSelection);

        // *** Render the accessibility map once when the app loads ***
        renderAccessibilityMap(); // Correctly called without arguments

        // Auto-load charts for the first city after list is loaded
        if (cities.length > 0) {
            loadAllChartsForCity(cities[0].code, cities[0].name);
        }

    } catch (err) {
        console.error("Error loading city list:", err);
        document.getElementById("error").textContent =
            "Failed to load initial data.";
    }
}

// Initialize application
loadCityList();