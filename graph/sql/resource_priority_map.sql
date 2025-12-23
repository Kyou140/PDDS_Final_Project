SELECT 
    HI.city_code, 
    C.city_name,
    HI.special_municipality, 
    HI.year,
    HI.happiness_score, 
    CSR.suicide_rate

FROM 
    HappinessIndex AS HI

JOIN
    CitySuicideRate AS CSR ON 
    HI.city_code = CSR.city_code AND HI.year = CSR.year

JOIN 
    CityInfo AS C ON
    HI.city_code = C.city_code

Where 
    CSR.gender = 'Total';