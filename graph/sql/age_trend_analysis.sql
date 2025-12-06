SELECT
    year,
    age_group,
    crude_suicide_rate
FROM
    NationSuicideRate
ORDER BY
    year,
    CASE age_group
        WHEN 'Under 15' THEN 1
        WHEN '15-24' THEN 2
        WHEN '25-44' THEN 3
        WHEN '45-64' THEN 4
        WHEN '65 and Above' THEN 5
        ELSE 99
    END;