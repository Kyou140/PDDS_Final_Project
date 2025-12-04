-- Query for Service Accessibility Map with Bubble Chart
-- Calculates Total Facilities (for bubble size) and Density (for bubble color)
SELECT
    CI.city_code,
    CI.city_name,
    
    -- NOTE: Add latitude and longitude columns here once available in CityInfo
    -- CI.latitude AS latitude, 
    -- CI.longitude AS longitude,
    
    -- 1. Metric for Bubble Size: Total number of unique service facilities
    COALESCE(COUNT(SF.service_facility), 0) AS total_facilities,
    
    -- 2. Metric for Color/Opacity: Density (Facilities per Area)
    CASE
        WHEN CI.area > 0 
        THEN CAST(COALESCE(COUNT(SF.service_facility), 0) AS REAL) / CI.area
        ELSE 0 
    END AS density_per_area
    
FROM
    CityInfo CI
LEFT JOIN
    -- Count the number of unique facilities listed in the ServiceFacility table
    ServiceFacility SF ON CI.city_code = SF.city_code
GROUP BY
    CI.city_code, CI.city_name, CI.area
ORDER BY
    density_per_area DESC;