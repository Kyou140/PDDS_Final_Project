-- Query city details for the detail pannel
SELECT
    CI.population,
    CI.area,
    -- Count the number of rows in ServiceFacility for this city (CENTER NUMBER)
    (SELECT COUNT(SF.service_facility) FROM ServiceFacility SF WHERE SF.city_code = :city_code) AS center_number,
    -- Get the counseling_unit from RemoteFacility (ONLINE CENTER NUMBER)
    (SELECT RF.counseling_unit FROM RemoteFacility RF WHERE RF.city_code = :city_code) AS online_center_number
FROM
    CityInfo CI
WHERE
    CI.city_code = :city_code;