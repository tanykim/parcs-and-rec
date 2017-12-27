import csv
import json
import urllib.request
from bs4 import BeautifulSoup

# get visitors count
def get_visitor_counts(id):
    url = 'https://irma.nps.gov/Stats/SSRSReports/Park%20Specific%20Reports/Recreation%20Visitors%20By%20Month%20(1979%20-%20Last%20Calendar%20Year)?Park=' + id.upper()
    response = urllib.request.urlopen(url)
    bs = BeautifulSoup(response.read(), 'html.parser')

    # get the latest year, monthly visitor data is updated in the early time of the following month
    latest_year = bs.find('div', string='Year').parent.parent.next_sibling.contents
    total = latest_year[len(latest_year) - 1].get_text()
    data_by_month = []
    for month in latest_year[1:len(latest_year) - 1]:
        # if the data is not updated, set it 0
        count = 0 if month.get_text() == '\xa0' else int(month.get_text().replace(',', ''))
        data_by_month.append(count)
    return dict(by_month=data_by_month, total=total)

def save_as_json(data):
    file = open('csv/national_parks_visitors.json', 'w', encoding='utf8')
    json_data = json.dumps(data, ensure_ascii=False)
    file.write(json_data)
    file.close()

# MUST change kings canyon id to KICA in parks_id_name_type.csv
# the vistor info page is set with the old id
# Remove LACH due to its duplication with NOCA
with open('csv/national_parks_location.csv', newline='', encoding='utf-8', errors="replace") as f:
    data = []
    for row in csv.DictReader(f):
        print (row['id'], row['name'])
        result = get_visitor_counts(row['id'])
        row.update(result)
        data.append(row)
    save_as_json(data)