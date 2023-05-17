 typical curl request for wave 


curl "https://services.surfline.com/kbyg/spots/forecasts/wave?spotId=5842041f4e65fad6a7708890&days=6&intervalHours=2"


Surfline v2 API URL is constructed with the two following arugments:

type

params

The base URL is the following.

https://services.surfline.com/kbyg/spots/forecasts/{type}?{params}

The available types are the following.

Type

Data

wave

array of min/max sizes & optimal scores

wind

array of wind directions/speeds & optimal scores

tides

array of types & heights

weather

array of sunrise/set times, array of temperatures/weather conditions

The available params are the following:

Param

Values

Note

spotId

string

Surfline spot id

days

integer

Number of forecast days to get (Max 6 w/o access token, Max 17 w/ premium token)

intervalHours

integer

Minimum of 1 (hour)

maxHeights

boolean

true seems to remove min & optimal values from the wave data output

sds

boolean

If true, use the new LOTUS forecast engine

accesstoken

string

Auth token to get premium data access (optional)


