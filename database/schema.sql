-- 01. County & City Info
CREATE TABLE CityInfo (
    city_code VARCHAR(10) PRIMARY KEY,
    city_name VARCHAR(100),
    population INT,
    region VARCHAR(100),
    special_municipality BOOLEAN
);

-- 02. Happiness Index
CREATE TABLE HappinessIndex (
    city_code VARCHAR(10),
    year INT,
    special_municipality BOOLEAN,
    happiness_ranking INT,
    happiness_score DECIMAL(10,2),

    PRIMARY KEY (city_code, year),
    FOREIGN KEY (city_code) REFERENCES CityInfo(city_code)
);

-- 03. City Suicide Rate
CREATE TABLE CitySuicideRate (
    city_code VARCHAR(10),
    gender VARCHAR(20),
    year INT,
    suicide_rate DECIMAL(10,2),

    PRIMARY KEY (city_code, gender, year),
    FOREIGN KEY (city_code) REFERENCES CityInfo(city_code)
);

-- 04. Nationwide Suicide Data by Age Group
CREATE TABLE NationSuicideRate (
    year INT,
    age_group VARCHAR(50),
    suicide_death_count INT,
    crude_suicide_rate DECIMAL(10,2),

    PRIMARY KEY (year, age_group)
);

-- 05. Mental Health Service Facilities
CREATE TABLE ServiceFacility (
    city_code VARCHAR(10),
    service_facility INT,

    PRIMARY KEY (city_code, service_facility),
    FOREIGN KEY (city_code) REFERENCES CityInfo(city_code)
);

-- 06. Remote Counseling Facility Units
CREATE TABLE RemoteFacility (
    city_code VARCHAR(10),
    counseling_unit INT,

    PRIMARY KEY (city_code),
    FOREIGN KEY (city_code) REFERENCES CityInfo(city_code)
);

-- 07. Per Capita Social Welfare Spending
CREATE TABLE SocialWelfareSpending (
    city_code VARCHAR(10),
    year INT,
    spending DECIMAL(15,2),

    PRIMARY KEY (city_code, year),
    FOREIGN KEY (city_code) REFERENCES CityInfo(city_code)
);