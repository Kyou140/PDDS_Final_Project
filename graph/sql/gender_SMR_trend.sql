-- Query Male + Female SMR for selected city
SELECT 
    year,
    gender,
    suicide_rate
FROM CitySuicideRate
WHERE city_code = ?
  AND gender IN ('Male', 'Female')
ORDER BY year, gender;