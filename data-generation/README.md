# Data Generation

```parks_id_name.csv``` is the starting point file. This was manually generated scrapping park selection list from [this page](https://www.nps.gov/findapark/index.htm). All the following steps scraps HTML pages.

## Step 1. Get the park type

We want only National Parks, those find the correct park type first (i.e., national historical sites and other types of sites are not considered in this projects.)

Run ```get-park-type.py```. This produces ```csv/parks_id_name_type.csv```.

## Step 2. Get the park location information

Run ```get-national-parks-location.py```. This produces ```csv/national_parks_location.csv```.

## Step 3. Get the park visitor info & finalize the data

Run ```get-national-parks-location.py```. This produces the fianl ```csv/data.json```.DS.DS_STore
