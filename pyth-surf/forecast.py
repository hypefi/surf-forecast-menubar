from pysurfline import SpotForecast
import json

params={
    "spotId":"5842041f4e65fad6a7708cfb",
    "days":2,
    "intervalHours":3,
    }
spot=SpotForecast(params)

# print(spot)
print(len(spot.wave))
waves = spot.wave
print(spot.wave)

with open('waves.json', 'w') as f:
    json.dump(waves, f)
