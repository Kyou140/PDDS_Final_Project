SELECT HI.city_code, 
       HI.special_municipality, 
       HI.year, HI.happiness_score, 
       CSR.suicide_rate

FROM HappinessIndex AS HI

JOIN CitySuicideRate AS CSR ON 
HI.city_code = CSR.city_code AND 
HI.year = CSR.year

Where CSR.gender = 'Total'