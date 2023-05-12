from pysurfline import SpotForecast
from pysurfline import SurfReport

# import matplotlib
# matplotlib.use('Agg')
# import matplotlib.pyplot as plt

params={
    "spotId":"5842041f4e65fad6a7708890",
    "days":1,
    "intervalHours":3,
    }
# spot=SpotForecast(params,verbose=True)

report = SurfReport(params)

report.api_log
# print(spot)

# waves=spot.get_dataframe("wave")
# print(waves.head())

# tides=spot.get_dataframe("tides")
# print(tides.head())

# weather=spot.get_dataframe("weather")
# print(weather.head())

# print(spot.get_dataframe("sunlightTimes"))
f=report.plot()

f.savefig('surf_report.png')

