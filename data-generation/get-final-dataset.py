import json
import math
import statistics

def get_points(lat_rounded):

    # parks at the latitude
    parks = list(map(lambda y: [float(y['lon']), int(y['total'].replace(',', ''))],
                filter(lambda x: round(float(x['lat']) * 2) / 2 == lat_rounded, data)))

    # if parks exists get the line graph data
    if len(parks) == 0:
        return dict(lat_rounded = lat_rounded, base_lines=[x_domain])

    # array of each park triangle point
    parks_data = []

    # break points are the starting & +-0.5 around each park
    break_points = [x_domain[0]]

    # then add points around parks (+-0.5)
    ordered = sorted(parks, key=lambda x: x[0])
    # iterate each park
    for i in range(len(ordered)):
        lon = ordered[i][0]
        # add starting point, top of triangle, and end point
        park_points = [[lon - 0.5, 0], ordered[i], [lon + 0.5, 0]]
        # add break points - remove if the parks area (+-0.5 lon) is overlapped
        if lon - 0.5 > break_points[len(break_points) - 1]:
            break_points.append(lon - 0.5)
            break_points.append(lon + 0.5)
        else:
            break_points[len(break_points) - 1] = lon + 0.5
        # add each park data
        parks_data.append(park_points)

    # add the very end to the break points
    break_points.append(x_domain[1])

    # base lines are the group of lines that exclude each park
    # generate this from the breaking points (always even number)
    # each item is an array of [start, end] of line
    base_lines = []
    for i in range(len(break_points) - 1):
        if i % 2 == 0:
            base_lines.append([break_points[i], break_points[i + 1]])

    return dict(lat_rounded = lat_rounded, parks_data = parks_data, base_lines = base_lines)

def frange(start, stop, step, isReverse):
    val = start
    while val > stop if isReverse else val < stop:
        yield val
        val += step

with open('csv/national_parks_visitors.json', 'r', encoding='utf8') as f:
    file = json.load(f)
    data = file
    parks = list(map(lambda x: dict(
        id=x['id'],
        name=x['name'],
        state=x['state_abbr'],
        by_month=x['by_month'],
        lon=x['lon'],
        lat=x['lat'],
        total=int(x['total'].replace(',', '')),
        seasonal=statistics.stdev(x['by_month']) / statistics.mean(x['by_month'])
    ), data))

    # set graph x and y range
    lon_list = list(map(lambda x: float(x['lon']), data))
    lat_list = list(map(lambda y: float(y['lat']), data))
    x_domain = [math.floor(min(lon_list)), math.ceil(max(lon_list))]
    y_domain = [math.floor(min(lat_list)), 72] # Alaska top
    seasonals = list(map(lambda x: x['seasonal'], parks))
    seasonal_domain = list(frange(min(seasonals), max(seasonals), (max(seasonals) - min(seasonals)) / 6, False))

    # get line graph point data by rounded latitude
    by_latitude = list(map(lambda x: get_points(x), list(frange(y_domain[1], y_domain[0] - 0.5, -0.5, True))))

    max_total_visitors = max(list(map(lambda x: x['total'], parks)))

with open('csv/national_parks_weather.json', 'r', encoding='utf8') as f:
    weather = json.load(f)

# save as final dataset
file = open('../react-app/src/data/data.json', 'w', encoding='utf8')
json_data = json.dumps(dict(
    parks=parks,
    by_latittude=by_latitude,
    max_total_visitor=max_total_visitors,
    seasonal_domain=seasonal_domain,
    x_domain=x_domain,
    weather=weather),
    ensure_ascii=False)
file.write(json_data)
file.close()





