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




=====

for the location :

curl "https://services.surfline.com/search/site?q=bouznika&querySize=10&suggestionSize=10&newsSearch=true" | jq



conditions 5 days, the small boxes with conditions 

❯ curl "https://services.surfline.com/kbyg/regions/forecasts/conditions?subregionId=58581a836630e24c4487906a&days=5" | jq


Ratings FAIT, NOT FAIR ...

curl "https://services.surfline.com/kbyg/spots/forecasts/rating?spotId=5842041f4e65fad6a7708cfb&days=5&intervalHours=1"
