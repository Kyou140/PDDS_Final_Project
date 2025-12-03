async function loadCityList() {
    try {
        const response = await fetch("/cities");   // <-- now loads from Flask database
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const cities = await response.json();
        const select = document.getElementById("citySelect");

        // Clear old entries
        select.innerHTML = "";

        cities.forEach(city => {
            const option = document.createElement("option");
            option.value = city.code;        // backend: {code, name}
            option.textContent = city.name;
            select.appendChild(option);
        });

        // Auto-load first city chart
        if (cities.length > 0) {
            loadChart(cities[0].code);
        }

        // When user changes selection
        select.onchange = () => {
            loadChart(select.value);
        };

    } catch (err) {
        console.error("Error loading city list:", err);
        document.getElementById("error").textContent =
            "Failed to load city list from database.";
    }
}

async function loadChart(city_code) {
    try {
        const response = await fetch(`/city/${city_code}/gender`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const cityData = await response.json();

        // Ensure only Male & Female
        const filtered = cityData.data.filter(
            d => d.gender === "Male" || d.gender === "Female"
        );

        const male = filtered.filter(d => d.gender === "Male");
        const female = filtered.filter(d => d.gender === "Female");

        Plotly.newPlot("chart", [
            {
                x: male.map(d => d.year),
                y: male.map(d => d.suicide_rate),
                mode: "lines+markers",
                name: "Male"
            },
            {
                x: female.map(d => d.year),
                y: female.map(d => d.suicide_rate),
                mode: "lines+markers",
                name: "Female"
            }
        ], {
            title: `${city_code} — Gender SMR Trend`,
            xaxis: { title: "Year" },
            yaxis: { title: "SMR" }
        });

    } catch (err) {
        console.error("Error loading chart:", err);
        document.getElementById("error").textContent =
            "Failed to load chart data.";
    }
}

// Initialize
loadCityList();