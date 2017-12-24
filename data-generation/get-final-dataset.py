import json
import math

data = None
x_domain = None
y_domain = None
by_latitude = None
max_total_visitors = None

def get_points(lat_rounded):
    # parks at the latitude
    parks = list(map(lambda y: [float(y['lon']), int(y['total'].replace(',', ''))],
                filter(lambda x: round(float(x['lat'])) == lat_rounded, data)))
    # add the first graph point
    parks_data = [[x_domain[0], 0]]
    # if parks exists get the line graph data
    if len(parks) > 0:
        # then add points around parks (+-0.5)
        ordered = sorted(parks, key=lambda x: x[0])
        for i in range(len(ordered)):
            lon = ordered[i][0]
            # add string point (triangle left cornor)
            if lon > parks_data[len(parks_data) - 1][0] + 1:
                parks_data.append([lon - 0.5, 0])
            # add triangle top
            parks_data.append(ordered[i])
            # add ending triangle
            nextPoint = ordered[i + 1][0] if i < len(ordered) - 1 else x_domain[1]
            if lon + 1 < nextPoint:
                parks_data.append([lon + 0.5, 0])
    parks_data.append([x_domain[1], 0])

    return dict(lat_rounded = lat_rounded, parks_data = parks_data)

with open('csv/national_parks_visitors.json', 'r', encoding='utf8') as f:
    file = json.load(f)
    data = file

    # set graph x and y range
    lon_list = list(map(lambda x: float(x['lon']), data))
    lat_list = list(map(lambda y: float(y['lat']), data))
    x_domain = [math.floor(min(lon_list)), math.ceil(max(lon_list))]
    y_domain = [math.floor(min(lat_list)), math.ceil(max(lat_list))]

    # get line graph point data by rounded latitude
    by_latitude = list(map(lambda x: get_points(x), list(range(y_domain[1], y_domain[0] - 1, -1))))

    max_total_visitors = max(list(map(lambda x: int(x['total'].replace(',', '')), data)))

# save as final dataset
file = open('../react-app/src/data/data.json', 'w', encoding='utf8')
json_data = json.dumps(dict(parks=data, x_domain=x_domain, y_domain=y_domain, by_latittude=by_latitude, max_total_visitor=max_total_visitors), ensure_ascii=False)
file.write(json_data)
file.close()





