import csv
import urllib.request
from bs4 import BeautifulSoup
from pygeocoder import Geocoder

# {"id": "npsa", "name": "National Park of American Samoa", "type": "National Park", "street": "National Park of American Samoa MHJ Building, 2nd Floor", "city": "Pago Pago", "state_abbr": "AS", "zip": "96799", "lat": "-14.2583333", "lon": "-170.6833333", "by_month": [4788, 3817, 4838, 7497, 4667, 5181, 6090, 4421, 4218, 11494, 7666, 0], "total": "64,677"}

def get_coordinates(address):
    result = Geocoder.geocode(address)
    return result.coordinates if result else [0, 0]

def get_park_data(id):
    url = 'https://www.nps.gov/' + id + '/planyourvisit/basicinfo.htm'
    response = urllib.request.urlopen(url)

    bs = BeautifulSoup(response.read(), 'html.parser')

    street_dom = bs.find(attrs={'itemprop' : 'streetAddress'})
    pobox_dom = bs.find(attrs={'itemprop' : 'postOfficeBoxNumber'})
    if street_dom != None:
        street = street_dom.get_text().strip()
    else:
        street = pobox_dom.get_text().strip()
    city = bs.find(attrs={'itemprop': 'addressLocality'}).get_text().strip()
    state_abbr = bs.find(attrs={'itemprop': 'addressRegion'}).get_text().strip()
    zip = bs.find(attrs={'itemprop': 'postalCode'}).get_text().strip()

    coordinates = get_coordinates(street + ', ' + city + ', ' + state_abbr + ' ' + zip)

    return dict(street=street, city=city, state_abbr=state_abbr, zip=zip, lon=coordinates[0], lat=coordinates[1])

# returns error when there's no file, but it creates the file
def save_as_csv(data):
    with open('csv/national_parks_location.csv', 'a', encoding='utf-8') as f:
        writer = csv.writer(f)
        print (data)
        writer.writerow(data[0].keys())
        for datum in data:
            writer.writerow(datum.values())

with open('csv/parks_id_name_type.csv', newline='', encoding='utf-8', errors="replace") as f:
    data = []
    for row in csv.DictReader(f):
        if ('National Park' in row['type']):
            print (row['name'])
            result = get_park_data(row['id'])
            row.update(result)
            data.append(row)
    save_as_csv(data)
