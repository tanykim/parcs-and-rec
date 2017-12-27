import json
import urllib.request
from bs4 import BeautifulSoup

def get_temp_vals(td):
    return list(map(lambda x: int(x.get_text().strip().replace('\xa0°F', '')), td.find_all('td')[1:]))

def get_prec_vals(td):
    vals = list(map(lambda x: x.get_text().strip().replace('\xa0in', ''), td.find_all('td')[1:]))[:-1]
    return list(map(lambda x: 0 if x == '-' else float(x), vals))

def get_weather_data(month, park):
    url = 'https://www.wunderground.com/history/airport/' + park['id'] + '/2017/' + str(month) + '/01/MonthlyHistory.html?reqdb.zip=' + park['zip']
    response = urllib.request.urlopen(url)
    bs = BeautifulSoup(response.read(), 'html.parser')
    table = bs.find('table', id='historyTable').find('tbody')

    # get temperature data
    temperature = table.find(string='Temperature').find_parents('tr')[0]
    max_temp = temperature.find_next_sibling()
    mean_temp = max_temp.find_next_sibling()
    min_temp = mean_temp.find_next_sibling()
    # in the order of max, average and min
    temperature_vals = dict(
        max=get_temp_vals(max_temp),
        mean=get_temp_vals(mean_temp),
        min=get_temp_vals(min_temp)
    )

    # get precipitation data
    precipitation = table.find(string='Precipitation').find_parents('tr')[0]
    prec = precipitation.find_next_sibling()
    snow = prec.find_next_sibling()
    precipitation_vals = dict(
        precipitation=get_prec_vals(prec),
        snow_depth= get_prec_vals(snow)
    )
    return dict(temperature=temperature_vals, precipitation=precipitation_vals)

def save_as_json(data):
    file = open('csv/national_parks_weather.json', 'w', encoding='utf8')
    json_data = json.dumps(data, ensure_ascii=False)
    file.write(json_data)
    file.close()

with open('csv/national_parks_station.json', 'r', encoding='utf8') as f:
    file = json.load(f)
    by_park = dict()
    for key in file:
        park = file[key]
        by_month = []
        for month in range(1, 13):
            print (park, month)
            by_month.append(dict(month=month, data=get_weather_data(month, park)))
        by_park[park['id']] = by_month
    save_as_json(by_park)