-- Query city codes and names for selection
SELECT DISTINCT city_code AS code, city_name AS name
FROM CityInfo
ORDER BY city_name