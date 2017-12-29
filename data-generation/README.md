# Data Generation

```parks_id_name.csv``` is the starting point file. This was manually generated scrapping park selection list from [this page](https://www.nps.gov/findapark/index.htm). All the following steps scraps HTML pages.

## Step 1. Get the park type

We want only National Parks, those find the correct park type first (i.e., national historical sites and other types of sites are not considered in this projects.)

Run ```get-park-type.py```. This produces ```csv/parks_id_name_type.csv```.

## Step 2. Get the park location information

Run ```get-national-parks-location.py```. This produces ```csv/national_parks_location.csv```.

## Step 3. Get the park visitor info

Run ```get-national-parks-visitors.py```. This produces ```csv/national_parks_visitors.json```.

## Step 4. Get weather data

We are scrapping the monthly weather data from [Weather Underground](http://www.wunderground.com), to retrieve the urls of each national park, we need to know the station code of each locaton. To do that we use its API and look up geo information. To acquire the API key, please visit [here](https://www.wunderground.com/weather/api).

Update ```keys.local``` file with the API key. Then run
```
cp keys.local keys.json
```

Run ```get-weather-station.py``` to get the station code of each national parks. No results are given for the four parks (care, glac, noca, romo), so their codes are manually entered. This provides ```csv/nationa_parks_station.json```.

Run ```get-weather-data.py``` to get the monthly weather data. This provides ```csv/national_parks_weather.json```.

## Step 5. Get park size

Park size info is ```csv/parks_size```. This file is from traced from this [original data source](https://irma.nps.gov/Stats/FileDownload/1297).

Run ```get-park-size.py```. This file generates ```national_parks_size.csv```.

## Step 6. Get the final dataset

Run ```get-final-dataset.py```. This produces the final json file in ```../react-app/src/data/data.json```.
