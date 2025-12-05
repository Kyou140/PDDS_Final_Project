-- Query Per Capita Social Welfare Expenditure for selected city (2020-2024)
SELECT 
    year,
    spending
FROM SocialWelfareSpending
WHERE city_code = ?
ORDER BY year;