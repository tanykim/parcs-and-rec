import csv
import urllib.request
from bs4 import BeautifulSoup

def get_park_data(id):
    url = 'https://www.nps.gov/' + id + '/index.htm'
    response = urllib.request.urlopen(url)
    bs = BeautifulSoup(response.read(), 'html.parser')
    type_dom = bs.find(attrs={'class' : 'Hero-designation'})
    if type_dom == None:
        print ('=======no type info')
    type = type_dom.get_text() if type_dom != None else 'N/A'

    return dict(type=type)

# returns error when there's no file, but it creates the file
def save_as_csv(data):
    with open('csv/parks_id_name_type.csv', 'a', encoding='utf-8') as f:
        writer = csv.writer(f)
        print (data)
        writer.writerow(data[0].keys())
        for datum in data:
            writer.writerow(datum.values())

with open('csv/parks_id_name.csv', newline='', encoding='utf-8', errors="replace") as f:
    found_types = []
    data = []
    for row in csv.DictReader(f):
        id = row['id']
        print (id, row['name'])
        result = get_park_data(id)
        if (result['type'] not in found_types):
            found_types.append(result['type'])
        row.update(result)
        data.append(row)
    # simply copy this output and save it as park_types.json
    print (found_types)
    save_as_csv(data)