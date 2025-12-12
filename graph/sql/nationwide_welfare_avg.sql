-- Query the true Nationwide Per Capita Social Welfare Expenditure Average (2020-2024)
SELECT 
    year,
    AVG(spending) AS avg_nationwide_spending
FROM SocialWelfareSpending
GROUP BY year
ORDER BY year;