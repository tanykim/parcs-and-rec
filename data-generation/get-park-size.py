import csv
import json

# get park size dasta from the csv file
parks = []
with open('csv/parks_size.csv', newline='', encoding='utf-8', errors="replace") as f:
    for row in csv.DictReader(f):
        parks.append(row)

def find_match(name):
    for park in parks:
        if name.upper() in park['name'] and 'NP' in park['name']:
            candidate = park
    return candidate['size']

data = dict()
with open('csv/national_parks_location.csv', newline='', encoding='utf-8', errors="replace") as f:
    for row in csv.DictReader(f):
        name = row['name'].split('National')[0].strip()
        if name is '':
            name = row['name'].split('National Park of')[1].strip()
        if 'Mount' in name:
            name = name.replace('Mountain', 'mt')
            name = name.replace('Mount', 'mt')
        if '&' in name:
            name = name.split('&')[0].strip()
        if 'of' in name:
            name = name.split('of')[0].strip()
        name = name.replace('Theodore', 'T')
        name = name.replace(' - ', '-')
        candidate = find_match(name)
        data[row['id']] = float(candidate.replace(',', ''))

file = open('csv/national_parks_size.json', 'w', encoding='utf8')
json_data = json.dumps(data, ensure_ascii=False)
file.write(json_data)
file.close()