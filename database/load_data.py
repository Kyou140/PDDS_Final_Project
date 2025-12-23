import sqlalchemy
import pandas as pd

# Connect to SQLite database
engine = sqlalchemy.create_engine("sqlite:///database/database.db")

# Load each dataset file
city_df = pd.read_csv("database/data_csv/01_County&City_Info.csv")
happiness_df = pd.read_csv("database/data_csv/02_Happiness_Index.csv")
suicide_city_df = pd.read_csv("database/data_csv/03_City_Suicide_Rate.csv")
nation_suicide_df = pd.read_csv("database/data_csv/04_Nationwide_Suicide_Data_by_Age_Group.csv")
facility_df = pd.read_csv("database/data_csv/05_Mental_Health_Service_Facilities.csv")
remote_df = pd.read_csv("database/data_csv/06_Remote_Counseling_Facility_Units.csv")
welfare_df = pd.read_csv("database/data_csv/07_Per_Capita_Social_Welfare_Spending.csv")

# Select the dataset
city_df = city_df[['city_code', 'city_name', 'population', 'area', 'region', 'latitude', 'longitude', 'special_municipality']]
happiness_df = happiness_df[['city_code', 'year', 'special_municipality', 'happiness_ranking', 'happiness_score']]
suicide_city_df = suicide_city_df[['city_code', 'gender', 'year', 'suicide_rate']]
nation_suicide_df = nation_suicide_df[['year', 'age_group', 'suicide_death_count', 'crude_suicide_rate']]
facility_df = facility_df[['city_code', 'service_facility']]
remote_df = remote_df[['city_code', 'counseling_unit']]
welfare_df = welfare_df[['city_code', 'year', 'spending']]

# Insert into database
city_df.to_sql("CityInfo", con=engine, if_exists="replace", index=False)
happiness_df.to_sql("HappinessIndex", con=engine, if_exists="replace", index=False)
suicide_city_df.to_sql("CitySuicideRate", con=engine, if_exists="replace", index=False)
nation_suicide_df.to_sql("NationSuicideRate", con=engine, if_exists="replace", index=False)
facility_df.to_sql("ServiceFacility", con=engine, if_exists="replace", index=False)
remote_df.to_sql("RemoteFacility", con=engine, if_exists="replace", index=False)
welfare_df.to_sql("SocialWelfareSpending", con=engine, if_exists="replace", index=False)

print("Data import complete!")