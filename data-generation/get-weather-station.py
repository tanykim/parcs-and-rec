import csv
import json
import requests

#API keys for two services constant
WEATHER_API_KEY = ''
with open('keys.json', 'r', encoding='utf-8') as keys:
    keys = json.load(keys)
    WEATHER_API_KEY= keys['weather_key']

def get_station_code(zip):
    url = 'http://api.wunderground.com/api/' + WEATHER_API_KEY + '/geolookup/q/' + zip + '.json'
    data = requests.get(url).json()
    return data['location']['nearby_weather_stations']['airport']['station'][0]['icao']

def save_as_json(data):
    file = open('csv/national_parks_station.json', 'w', encoding='utf8')
    json_data = json.dumps(data, ensure_ascii=False)
    file.write(json_data)
    file.close()

with open('csv/national_parks_location.csv', newline='', encoding='utf-8', errors="replace") as f:
    data = dict()
    for row in csv.DictReader(f):
        id = row['id']
        zip = row['zip']
        result = get_station_code(zip)
        print ('"' + id + '": ' + '"' + result + '",')
        if id == 'care':
            result = 'KCNY'
        elif id == 'glac':
            result = 'KCTB'
        elif id == 'noca':
            result = 'KAWO'
        elif id == 'romo':
            result = 'KFNL'
        data[id] = dict(id=result, zip=zip)
    save_as_json(data)