-- Query for Service Accessibility Map with Bubble Chart
-- FIX: Includes string cleaning and casting for Population and Area to ensure correct density calculation.

SELECT
    CI.city_code,
    CI.city_name,
    CI.latitude AS latitude, 
    CI.longitude AS longitude,
    CI.population, -- Kept as original string for reference
    CI.area,       -- Kept as original string for reference
    
    -- Cleaned and Cast values for calculation (Define once for clarity)
    CAST(REPLACE(CI.population, ',', '') AS REAL) AS population_real,
    CAST(REPLACE(CI.area, ',', '') AS REAL) AS area_real,

    -- 1. Raw Data
    COALESCE(SF.total_service_facilities, 0) AS raw_physical_facilities,
    COALESCE(RF.total_remote_counseling_units, 0) AS raw_remote_units,

    -- 2. COMBINED DENSITY METRICS (Total of both physical and remote)
    (
        COALESCE(SF.total_service_facilities, 0) + COALESCE(RF.total_remote_counseling_units, 0)
    ) AS total_facilities, -- Combined raw count for bubble size
    
    (
        COALESCE(SF.total_service_facilities, 0) + COALESCE(RF.total_remote_counseling_units, 0)
    ) * 100000.0 / CAST(REPLACE(CI.population, ',', '') AS REAL) AS combined_facilities_per_100k_pop,
    
    (
        COALESCE(SF.total_service_facilities, 0) + COALESCE(RF.total_remote_counseling_units, 0)
    ) / CAST(REPLACE(CI.area, ',', '') AS REAL) AS combined_facility_density_per_area,

    -- 3. SEPARATE DENSITY METRICS (For more granular heatmaps)
    COALESCE(SF.total_service_facilities, 0) * 100000.0 / CAST(REPLACE(CI.population, ',', '') AS REAL) AS physical_per_100k_pop,
    COALESCE(RF.total_remote_counseling_units, 0) * 100000.0 / CAST(REPLACE(CI.population, ',', '') AS REAL) AS remote_per_100k_pop,
    COALESCE(SF.total_service_facilities, 0) / CAST(REPLACE(CI.area, ',', '') AS REAL) AS physical_density_per_area,
    COALESCE(RF.total_remote_counseling_units, 0) / CAST(REPLACE(CI.area, ',', '') AS REAL) AS remote_density_per_area
FROM
    CityInfo CI
LEFT JOIN (
    SELECT
        city_code,
        SUM(service_facility) AS total_service_facilities
    FROM
        ServiceFacility
    GROUP BY
        city_code
) SF ON CI.city_code = SF.city_code
LEFT JOIN (
    SELECT
        city_code,
        SUM(counseling_unit) AS total_remote_counseling_units
    FROM
        RemoteFacility
    GROUP BY
        city_code
) RF ON CI.city_code = RF.city_code
-- Ensure we only include cities with valid population and area data (now using cleaned, casted values)
WHERE 
    CAST(REPLACE(CI.population, ',', '') AS REAL) > 0 
    AND 
    CAST(REPLACE(CI.area, ',', '') AS REAL) > 0;