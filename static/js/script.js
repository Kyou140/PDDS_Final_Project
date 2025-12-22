// --- Global State ---
let selectedYear = '2024';
let ageTrendByYear = {}; 
let allResourceData = []; // Global storage for the nationwide resource priority data for all years
let nationwideWelfareAvg = {}; // NEW: Store Nationwide Average Spending by Year (e.g., {2020: 1200, 2021: 1250, ...})

// --- Core Chart Logic Functions ---

// Renders the Resource Priority Chart (Scatter Plot)
// This function is now completely independent of the city dropdown.
function renderResourceChart() {
    // 1. Filter the global data ONLY by the selectedYear.
    const dataForSelectedYear = allResourceData.filter(d => d.year.toString() === selectedYear);
    
    // *** DEBUG BLOCK: Check data structure and count ***
    console.log("--- RESOURCE CHART DEBUG (Render) ---");
    console.log(`Selected Year: ${selectedYear}`);
    console.log(`Total cities data loaded for this year: ${dataForSelectedYear.length}`);
    if (dataForSelectedYear.length > 0) {
        const keys = Object.keys(dataForSelectedYear[0]);
        console.log("First row keys (should be lowercase):", keys);
    }
    console.log("----------------------------");
    // *** END DEBUG BLOCK ***
    
    // Check if data for the selected year is available
    if (dataForSelectedYear.length === 0) {
        Plotly.newPlot("resourceChart", [], {
            title: `Resource Priority Map (No Data for ${selectedYear})`,
            annotations: [{
                text: `No data available for the year ${selectedYear}.`,
                xref: "paper",
                yref: "paper",
                showarrow: false,
                font: { size: 16, color: "#999" }
            }]
        });
        document.getElementById("error").textContent = "";
        return;
    }

    // Helper functions for clean data access (relying on Python to return lowercase keys)
    const getX = (d) => d.happiness_score;
    const getY = (d) => d.suicide_rate;
    const getName = (d) => d.city_name;
    const isSpecial = (d) => {
        const val = d.special_municipality;
        if (val == "Special Municipality") {
            return 1;
        }
    };

    // 1. Separate data into Special Municipality (Group 1) and Non-Special Municipality (Group 2)
    const specialMunicipalities = dataForSelectedYear.filter(isSpecial);
    const nonSpecialMunicipalities = dataForSelectedYear.filter(d => !isSpecial(d));

    const traces = [];

    // Trace 1: Special Municipalities (Blue/Highlight color)
    traces.push({
        x: specialMunicipalities.map(getX),
        y: specialMunicipalities.map(getY),
        mode: 'markers',
        type: 'scatter',
        name: 'Special Municipality',
        marker: {
            size: 10,
            color: '#8c4b00', // Blue
            line: { width: 1, color: '#331b00ff' }
        },
        text: specialMunicipalities.map(d => 
            `${getName(d)}<br>Suicide Rate: ${getY(d).toFixed(2)}<br>Happiness: ${getX(d).toFixed(2)}`
        ),
        hoverinfo: 'text'
    });

    // Trace 2: Non-Special Municipalities (Gray/Duller color)
    traces.push({
        x: nonSpecialMunicipalities.map(getX), 
        y: nonSpecialMunicipalities.map(getY),
        mode: 'markers',
        type: 'scatter',
        name: 'Non-Special Municipality',
        marker: {
            size: 10,
            color: '#d27914', 
            line: { width: 1, color: '#fa8e13ff' }
        },
        text: nonSpecialMunicipalities.map(d => 
            `${getName(d)}<br>Suicide Rate: ${getY(d).toFixed(2)}<br>Happiness: ${getX(d).toFixed(2)}`
        ),
        hoverinfo: 'text'
    });
    
    // NOTE: The highlight trace logic is completely REMOVED.
    
    // 4. Define the Layout
    const layout = {
        xaxis: { 
            title: "Resource (Happiness Score)",
            rangemode: 'tozero'
        },
        yaxis: { 
            title: "Suicide Rate (per 100,000)",
            rangemode: 'tozero'
        },
        shapes: [
            { type: 'line', xref: 'paper', yref: 'paper', x0: 0, y0: 1, x1: 1, y1: 0, line: { color: 'rgb(200, 200, 200)', width: 2, dash: 'dash' } }
        ],
        annotations: [
            { x: 0.1, y: 0.9, xref: 'paper', yref: 'paper', text: 'High Suicide, Low Resource', showarrow: false, font: { color: 'red', size: 10 } },
            { x: 0.9, y: 0.1, xref: 'paper', yref: 'paper', text: 'Low Suicide, High Resource', showarrow: false, font: { color: 'green', size: 10 } }
        ]
    };

    // 5. Render the chart
    Plotly.newPlot("resourceChart", traces, layout);
    document.getElementById("error").textContent = "";

}

// New function to handle initial fetch and subsequent year redraw
async function initResourceChart() {
    try {
        // Fetch nationwide data for the scatter plot (for ALL years)
        const response = await fetch("/chart/resource"); 
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const json = await response.json();
        allResourceData = json.data || []; // Store data globally
        
        // Render the chart for the current selectedYear
        renderResourceChart();

    } catch (err) {
        console.error("Error initializing Resource Priority Chart:", err);
        // Fallback to placeholder on error
        Plotly.newPlot("resourceChart", [], {
            title: `Resource Priority Chart (Initialization Error)`,
            annotations: [{
                text: "Chart data failed to initialize.",
                xref: "paper",
                yref: "paper",
                showarrow: false,
                font: { size: 16, color: "red" }
            }]
        });
    }
}


// --- Age Trend Analysis (Nationwide) ---
async function initAgeTrendChart() {
    try {
        const response = await fetch("/age_trend");
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const json = await response.json();
        const data = json.data || [];

        // Group data by year
        ageTrendByYear = {};
        data.forEach(row => {
            const y = row.year;  // number
            if (!ageTrendByYear[y]) {
                ageTrendByYear[y] = [];
            }
            ageTrendByYear[y].push(row);
        });

        // Render chart for default selectedYear
        const yearNum = parseInt(selectedYear, 10);
        renderAgeTrendForYear(yearNum);

    } catch (err) {
        console.error("Error initializing age trend chart:", err);
    }
}

function renderAgeTrendForYear(year) {
    const rows = ageTrendByYear[year];
    if (!rows || rows.length === 0) {
        console.warn("No age trend data for year:", year);
        return;
    }

    const ageLabels = rows.map(r => r.age_group);
    const suicideRates = rows.map(r => r.crude_suicide_rate);

    const trace = {
        x: ageLabels,
        y: suicideRates,
        type: "bar",
        marker: { color: "#ffd59a" }
    };

    const layout = {
        xaxis: { title: "Age Group" },
        yaxis: { title: "Suicide Rate (per 100,000)" },
        margin: { t: 50, l: 60, r: 20, b: 60 }
    };

    Plotly.react("ageTrendChart", [trace], layout);
}

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
            d => d.gender === "Male" || d.gender === "Female" || d.gender === "Total"
        );

        const male = filtered.filter(d => d.gender === "Male");
        const female = filtered.filter(d => d.gender === "Female");
        const total = filtered.filter(d => d.gender === "Total");

        Plotly.newPlot("genderChart", [ 
            {
                x: total.map(d => d.year),
                y: total.map(d => d.suicide_rate),
                mode: "lines+markers",
                name: `${cityName} Total SMR`,
                line: {color: 'lightgrey'}
            },
            {
                x: male.map(d => d.year),
                y: male.map(d => d.suicide_rate),
                mode: "lines+markers",
                name: `${cityName} Male SMR`,
                line: {color: '#005b96'}
            },
            {
                x: female.map(d => d.year),
                y: female.map(d => d.suicide_rate),
                mode: "lines+markers",
                name: `${cityName} Female SMR`,
                line: {color: '#e04040ff'}
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
        
        // MODIFIED: Calculate the nationwide average spending array for the city's years
        const nationwideAvgY = data.map(d => {
            const avg = nationwideWelfareAvg[d.year.toString()];
            // Provide a fallback if data for a year is missing
            return avg !== undefined ? avg : NaN; 
        });
        
        // Trace for the nationwide average spending line
        const avgTrace = {
            x: data.map(d => d.year),
            y: nationwideAvgY, // Use the new nationwide array
            mode: "lines+markers",
            name: "Nationwide Average Spending", // Updated name
            line: { color: 'lightgrey' }
        };

        Plotly.newPlot("welfareChart", [
            avgTrace, // Add the average line trace
            {
                x: data.map(d => d.year),
                y: data.map(d => d.spending), 
                mode: "lines+markers",
                name: `${cityName} Spending`,
                line: {color: '#d27914'}
            },
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

// --- New Function: Initialize Nationwide Welfare Average Data ---
async function initNationwideWelfareAvg() {
    try {
        // ASSUMPTION: This endpoint now exists on the backend
        const response = await fetch("/nationwide_welfare_avg"); 
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const json = await response.json();
        const data = json.data || [];
        
        // Convert the array into a year-indexed object for easy lookup
        nationwideWelfareAvg = data.reduce((acc, row) => {
            // Assuming the backend returns 'year' and 'avg_nationwide_spending'
            acc[row.year.toString()] = row.avg_nationwide_spending; 
            return acc;
        }, {});
        
    } catch (err) {
        console.error("Error initializing Nationwide Welfare Average:", err);
    }
}

// Renders the Service Accessibility Map with fixed-size dots, highlighting the selected city with a star.
async function renderAccessibilityMap(city_code, cityName) {
    try {
        const response = await fetch(`/map/accessibility`); 
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const mapData = await response.json();
        const data = mapData.data;

        // --- Data Access & Filtering ---
        const DEFAULT_LAT = 23.6;
        const DEFAULT_LON = 120.96;
        
        // Map all data properties for both traces
        const latsAll = data.map(d => d.latitude || DEFAULT_LAT); 
        const lonsAll = data.map(d => d.longitude || DEFAULT_LON); 
        const densityPopAll = data.map(d => d.combined_facilities_per_100k_pop); 
        const totalFacilitiesAll = data.map(d => d.total_facilities); 
        const cityCodesAll = data.map(d => d.city_code);
        const cityNamesAll = data.map(d => d.city_name);
        
        const allTraces = [];
        
        // --- 1. Trace for ALL Cities (Dots or Stars) ---
        // We will create one trace and use Plotly's 'symbol' and 'size' arrays
        // to assign different markers/sizes based on the city code.
        
        const symbolArray = cityCodesAll.map(code => (code === city_code) ? 'star' : 'circle');
        const sizeArray = cityCodesAll.map(code => (code === city_code) ? 15 : 10);
        
        const mapTrace = {
            name: 'City Accessibility',
            type: 'scattergeo',
            mode: 'markers',
            lat: latsAll, 
            lon: lonsAll, 
            marker: {
                // Apply the symbol and size arrays
                size: sizeArray, 
                symbol: symbolArray, 
                
                // Color is based on Density for ALL points
                color: densityPopAll, 
                colorscale: [
                    [0.0, '#FF0000'], // Red for 0
                    [0.5, '#FFFF00'], // Yellow for midpoint
                    [1.0, '#008000']  // Green for 100%
                ], 
                
                // Add a black line for selected city's star marker
                line: {
                    width: cityCodesAll.map(code => (code === city_code) ? 1.5 : 0.5),
                    color: cityCodesAll.map(code => (code === city_code) ? '#000000' : 'rgba(0,0,0,0.5)')
                },
                
                showscale: true,
                colorbar: { title: "Density (Fac./100k Pop)" } 
            },
            text: cityNamesAll.map((name, i) => 
                `${name}<br>Total Facilities: ${totalFacilitiesAll[i]}<br>Density/100k Pop: ${densityPopAll[i].toFixed(4)}`
            ),
            hoverinfo: 'text'
        };
        
        allTraces.push(mapTrace);


        // --- Plotly Layout (Remains the same) ---
        const mapLayout = {
            title: `${cityName} — Service Facility Density per 100,000 Population`, 
            height: 450, 
            geo: {
                scope: 'asia',
                center: { lat: 23.6, lon: 120.96 }, 
                lataxis: { range: [20, 26] }, 
                lonaxis: { range: [117, 123] },
                subunitcolor: 'rgba(0,0,0,0.3)',
                showland: true,
                landcolor: 'rgb(243, 243, 243)',
            },
            autosize: true, 
            margin: { t: 40, b: 20, l: 20, r: 20 }
        };

        Plotly.newPlot("accessibilityMapChart", allTraces, mapLayout, { responsive: true });
        
        document.getElementById("error").textContent = "";

    } catch (err) {
        console.error("Error loading accessibility map:", err);
        document.getElementById("error").textContent =
            "Failed to load map data. Check database connection and that all cities have valid Lat/Lon data.";
    }
}

// --- Control Panel Details Logic ---

async function updateCityDetailsPanel(city_code) {
    try {
        const response = await fetch(`/city/${city_code}/details`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const details = await response.json();
        
        // Helper function for formatting numbers
        const formatNumber = (value) => value !== undefined ? value.toLocaleString() : '--';
        const formatArea = (value) => value !== undefined ? value.toLocaleString() + ' km²' : '--';

        // Update the display spans on the controls panel
        document.getElementById('centerNumberDisplay').textContent = 
            formatNumber(details.center_number);
        
        document.getElementById('onlineCenterNumberDisplay').textContent = 
            formatNumber(details.online_center_number);
            
        document.getElementById('populationDisplay').textContent = 
            formatNumber(details.population);
            
        document.getElementById('areaDisplay').textContent = 
            formatArea(details.area);

    } catch (err) {
        console.error("Error updating city details panel:", err);
        // Fallback to placeholder on error
        document.getElementById('centerNumberDisplay').textContent = 'ERROR';
        document.getElementById('onlineCenterNumberDisplay').textContent = 'ERROR';
        document.getElementById('populationDisplay').textContent = 'ERROR';
        document.getElementById('areaDisplay').textContent = 'ERROR';
    }
}


// --- Summary Panel Logic ---

async function updateSummaryPanels(city_code, year) {
    // This remains the same as previously defined for summary panels
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
        document.getElementById('highRiskHighResourcesValueWithSpecialMunicipality').textContent =
            year === '2020' ? 'Taoyuan City' :
            year === '2021' ? 'Taichung City' :
            (year === '2022' || year === '2023' || year === '2024') ? 'Kaoshiung City' : 'N/A';
        document.getElementById('highRiskLowResourcesValueWithSpecialMunicipality').textContent = year === '2020' || year === '2021' ? 'Kaoshiung City' : 'New Taipei City';  
        document.getElementById('highRiskHighResourcesValueWithoutSpecialMunicipality').textContent =
            (year === '2020' || year === '2021' || year === '2022') ? 'Lienchiang County' :
            year === '2023' ? 'Taitung County' :
            year === '2024' ? 'Nantou County' : 'N/A';
        document.getElementById('highRiskLowResourcesValueWithoutSpecialMunicipality').textContent =
            (year === '2020' || year === '2023' || year === '2024') ? 'Keelung City' :
            year === '2022' ? 'Miaoli County' :
            year === '2021' ? 'Hsinchu County' : 'N/A';
        document.getElementById('highRiskGenerationValue').textContent = '65+';

    } catch (err) {
        console.error("Error updating summary panels:", err);
        document.getElementById('highRiskHighResourcesValue').textContent = 'N/A';
        document.getElementById('highRiskLowResourcesValue').textContent = 'N/A';
        document.getElementById('highRiskGenerationValue').textContent = 'N/A';
    }
}


// --- Year Selection Handler ---

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

    // 3. Get current city and re-load necessary charts
    const citySelect = document.getElementById("citySelect");
    const city_code = citySelect.value;

    if (city_code && city_code !== "Loading...") {
        updateSummaryPanels(city_code, selectedYear); 
        // FIX: Re-fetch and re-render the Resource Chart when the year changes
        initResourceChart(); 
    }

    // 4. Update Age Trend Chart (nationwide, always depends only on year)
    const yearNum = parseInt(selectedYear, 10);
    renderAgeTrendForYear(yearNum);
}

// --- Dynamic Map Title Update ---

function updateMapTitle(cityName) {
    const newTitle = `Taiwan — Service Facility Density (Focus on ${cityName})`;
    
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
    
    // 1. Update the summary panels with the currently selected year's data
    updateSummaryPanels(city_code, selectedYear);
    
    // 2. Update the Control Panel details for the selected city
    updateCityDetailsPanel(city_code); 
    
    // 3. Render the Resource Priority Chart (DO NOTHING - chart is independent of dropdown)
    // Removed the updateResourceChartHighlight() call entirely.

    // 4. Render the Gender SMR Trend and Welfare Spending Trend charts (Both dependent on city and year)
    renderGenderChart(city_code, cityName);
    renderWelfareChart(city_code, cityName);
    renderAccessibilityMap(city_code, cityName);
    
    // 5. Update the map title
    updateMapTitle(cityName);
}


async function loadCityList() { // MUST be async to use await
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

        // Init nationwide age trend chart (uses selectedYear)
        initAgeTrendChart();

        // *** Init the Resource Chart data on load (uses selectedYear) ***
        initResourceChart(); 
        
        // *** NEW: Init the Nationwide Welfare Average data ***
        await initNationwideWelfareAvg(); // <--- ADDED 'await' HERE to guarantee data loading

        // *** Render the accessibility map once when the app loads ***
        renderAccessibilityMap();

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