let express = require("express"),
	app = express(),
	bodyParser = require('body-parser'),
	request = require('request');
//Favorites = require('./views/Favorites.js');


//console.log(Favorites.favorites[0].city);
/*Favorites.favorites.push({"city":"test"})
console.log(Favorites);*/


app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));


let favorites = [{ "city": "tel aviv", key: "215854" }, { "city": "new york", key: "" }, { "city": "haifa", key: "" }];
console.log(favorites)



app.get("/", function (req, res) {
	res.render("landing", { city: req.params.cityName, error: "" });
});

app.get("/favorites", function (req, res) {
	let temperatures = [];

	favorites.forEach(fav => {
		request(
			'http://dataservice.accuweather.com/currentconditions/v1/' + fav.key + '?apikey=LGXJTWuOUcsc1Zt5Gj24dQV8aiPe42DO',
			function (error, response, body) {
				//console.log("1 response:" + response.statusCode);
				if (response.statusCode != 200) {
					console.log('---------------------------------------------------');
					console.log('There is an error and this is what happend:');
					console.log('---------------------------------------------------');
					console.log(response);
					res.redirect("/");
				} else {
					if (response.statusCode == 200) {
						let parsedData1 = JSON.parse(body);
						if (parsedData1.length == 0) {
							return res.render("landing", { city: "", favorites: favorites, error: "ERROR! Search for a legal city again" });
						} else {
							temperatures.push(Temperature.Metric.Value);
							res.render("favorites", { favorites: favorites, temperatures: temperatures });
						}
					}
				}
			}
		)
	});


	/*let cityKey = parsedData1[0].Key;
								console.log("before change fav:")
								console.log(favorites)
								favorites.push({ "city": cityName, "key": cityKey });
								console.log("new fav:")
								console.log(favorites)
								res.render("favorites", { favorites: favorites });*/
});


app.post('/favorites', function (req, res) {
	let cityName = req.body.hiddenInput2;

	request(
		'http://dataservice.accuweather.com/locations/v1/cities/search?apikey=LGXJTWuOUcsc1Zt5Gj24dQV8aiPe42DO&q=' + cityName,
		function (error, response, body) {
			//console.log("1 response:" + response.statusCode);
			if (response.statusCode != 200) {
				console.log('---------------------------------------------------');
				console.log('There is an error and this is what happend:');
				console.log('---------------------------------------------------');
				console.log(response);
				res.redirect("/");
			} else {
				if (response.statusCode == 200) {
					let parsedData1 = JSON.parse(body);
					if (parsedData1.length == 0) {
						return res.render("landing", { city: "", favorites: favorites, error: "ERROR! Search for a legal city again" });
					} else {
						let cityKey = parsedData1[0].Key;
						favorites.push({ "city": "cityName", "key": cityKey })
						res.redirect("/favorites");
					}
				}
			}
		}
	)
});

app.post('/', function (req, res) {

	let cityName = req.body.hiddenInput;

	request(
		'http://dataservice.accuweather.com/locations/v1/cities/search?apikey=LGXJTWuOUcsc1Zt5Gj24dQV8aiPe42DO&q=' + cityName,
		function (error, response, body) {
			//console.log("1 response:" + response.statusCode);
			if (response.statusCode != 200) {
				console.log('---------------------------------------------------');
				console.log('There is an error and this is what happend:');
				console.log('---------------------------------------------------');
				console.log(response);
				res.redirect("/");
			} else {
				if (response.statusCode == 200) {
					let parsedData1 = JSON.parse(body);
					if (parsedData1.length == 0) {
						return res.render("landing", { city: "", favorites: favorites, error: "ERROR! Search for a legal city again" });
					}
					let cityKey = parsedData1[0].Key;

					request.post(
						'http://dataservice.accuweather.com/forecasts/v1/daily/5day/' + cityKey + "?apikey=LGXJTWuOUcsc1Zt5Gj24dQV8aiPe42DO&metric=true",
						function (error, response, body) {
							//console.log("2 response:" + response.statusCode);
							if (response.statusCode != 200) {
								console.log('---------------------------------------------------');
								console.log('Barak, there is an error and this is what happend:');
								console.log('---------------------------------------------------');
								console.log(response);
							} else {
								if (response.statusCode == 200) {
									let parsedData2 = JSON.parse(body);
									//console.log(parsedData2);
									let day1Forcast = Math.ceil(parsedData2.DailyForecasts[0].Temperature.Minimum.Value + parsedData2.DailyForecasts[0].Temperature.Maximum.Value) / 2;
									let day2Forcast = Math.ceil(parsedData2.DailyForecasts[1].Temperature.Minimum.Value + parsedData2.DailyForecasts[1].Temperature.Maximum.Value) / 2;
									let day3Forcast = Math.ceil(parsedData2.DailyForecasts[2].Temperature.Minimum.Value + parsedData2.DailyForecasts[2].Temperature.Maximum.Value) / 2;
									let day4Forcast = Math.ceil(parsedData2.DailyForecasts[3].Temperature.Minimum.Value + parsedData2.DailyForecasts[3].Temperature.Maximum.Value) / 2;
									let day5Forcast = Math.ceil(parsedData2.DailyForecasts[4].Temperature.Minimum.Value + parsedData2.DailyForecasts[4].Temperature.Maximum.Value) / 2;

									const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
									let day1Name = days[(new Date(parsedData2.DailyForecasts[0].Date)).getDay()];
									let day2Name = days[(new Date(parsedData2.DailyForecasts[1].Date)).getDay()];
									let day3Name = days[(new Date(parsedData2.DailyForecasts[2].Date)).getDay()];
									let day4Name = days[(new Date(parsedData2.DailyForecasts[3].Date)).getDay()];
									let day5Name = days[(new Date(parsedData2.DailyForecasts[4].Date)).getDay()];

									let day1 = [day1Name, day1Forcast];
									let day2 = [day2Name, day2Forcast];
									let day3 = [day3Name, day3Forcast];
									let day4 = [day4Name, day4Forcast];
									let day5 = [day5Name, day5Forcast];

									let dayData = [day1, day2, day3, day4, day5];
									res.render("forcast", { city: cityName, favorites: favorites, dayData: dayData });
								}
							}
						}
					);



				}
			}
		}
	);
});

let telAvivKey = [
	{
		Version: 1,
		Key: '215854',
		Type: 'City',
		Rank: 31,
		LocalizedName: 'Tel Aviv',
		EnglishName: 'Tel Aviv',
		PrimaryPostalCode: '',
		Region: {
			ID: 'MEA',
			LocalizedName: 'Middle East',
			EnglishName: 'Middle East'
		},
		Country: { ID: 'IL', LocalizedName: 'Israel', EnglishName: 'Israel' },
		AdministrativeArea: {
			ID: 'TA',
			LocalizedName: 'Tel Aviv',
			EnglishName: 'Tel Aviv',
			Level: 1,
			LocalizedType: 'District',
			EnglishType: 'District',
			CountryID: 'IL'
		},
		TimeZone: {
			Code: 'IST',
			Name: 'Asia/Jerusalem',
			GmtOffset: 2,
			NextOffsetChange: '2021-03-26T00:00:00Z'
		},
		IsAlias: false,
		SupplementalAdminAreas: [],
		DataSets: [
			'AirQualityForecasts',
			'Alerts',
			'ForecastConfidence'
		]
	}
];

let telAviv5DayWeather = {
	"Headline": {
		"EffectiveDate": "2021-03-26T01:00:00+02:00",
		"EffectiveEpochDate": 1616713200,
		"Severity": 3,
		"Text": "Expect showery weather late Thursday night through Friday morning",
		"Category": "rain",
		"EndDate": "2021-03-26T13:00:00+02:00",
		"EndEpochDate": 1616756400,
		"MobileLink": "http://m.accuweather.com/en/il/tel-aviv/215854/extended-weather-forecast/215854?unit=c&lang=en-us",
		"Link": "http://www.accuweather.com/en/il/tel-aviv/215854/daily-weather-forecast/215854?unit=c&lang=en-us"
	},
	"DailyForecasts": [
		{
			"Date": "2021-03-25T07:00:00+02:00",
			"EpochDate": 1616648400,
			"Temperature": {
				"Minimum": {
					"Value": 11.7,
					"Unit": "C",
					"UnitType": 17
				},
				"Maximum": {
					"Value": 17.4,
					"Unit": "C",
					"UnitType": 17
				}
			},
			"Day": {
				"Icon": 14,
				"IconPhrase": "Partly sunny w/ showers",
				"HasPrecipitation": true,
				"PrecipitationType": "Rain",
				"PrecipitationIntensity": "Light"
			},
			"Night": {
				"Icon": 39,
				"IconPhrase": "Partly cloudy w/ showers",
				"HasPrecipitation": true,
				"PrecipitationType": "Rain",
				"PrecipitationIntensity": "Moderate"
			},
			"Sources": [
				"AccuWeather"
			],
			"MobileLink": "http://m.accuweather.com/en/il/tel-aviv/215854/daily-weather-forecast/215854?day=1&unit=c&lang=en-us",
			"Link": "http://www.accuweather.com/en/il/tel-aviv/215854/daily-weather-forecast/215854?day=1&unit=c&lang=en-us"
		},
		{
			"Date": "2021-03-26T07:00:00+02:00",
			"EpochDate": 1616734800,
			"Temperature": {
				"Minimum": {
					"Value": 11.5,
					"Unit": "C",
					"UnitType": 17
				},
				"Maximum": {
					"Value": 17.7,
					"Unit": "C",
					"UnitType": 17
				}
			},
			"Day": {
				"Icon": 14,
				"IconPhrase": "Partly sunny w/ showers",
				"HasPrecipitation": true,
				"PrecipitationType": "Rain",
				"PrecipitationIntensity": "Light"
			},
			"Night": {
				"Icon": 35,
				"IconPhrase": "Partly cloudy",
				"HasPrecipitation": false
			},
			"Sources": [
				"AccuWeather"
			],
			"MobileLink": "http://m.accuweather.com/en/il/tel-aviv/215854/daily-weather-forecast/215854?day=2&unit=c&lang=en-us",
			"Link": "http://www.accuweather.com/en/il/tel-aviv/215854/daily-weather-forecast/215854?day=2&unit=c&lang=en-us"
		},
		{
			"Date": "2021-03-27T07:00:00+02:00",
			"EpochDate": 1616821200,
			"Temperature": {
				"Minimum": {
					"Value": 10.1,
					"Unit": "C",
					"UnitType": 17
				},
				"Maximum": {
					"Value": 17.9,
					"Unit": "C",
					"UnitType": 17
				}
			},
			"Day": {
				"Icon": 4,
				"IconPhrase": "Intermittent clouds",
				"HasPrecipitation": false
			},
			"Night": {
				"Icon": 34,
				"IconPhrase": "Mostly clear",
				"HasPrecipitation": false
			},
			"Sources": [
				"AccuWeather"
			],
			"MobileLink": "http://m.accuweather.com/en/il/tel-aviv/215854/daily-weather-forecast/215854?day=3&unit=c&lang=en-us",
			"Link": "http://www.accuweather.com/en/il/tel-aviv/215854/daily-weather-forecast/215854?day=3&unit=c&lang=en-us"
		},
		{
			"Date": "2021-03-28T07:00:00+02:00",
			"EpochDate": 1616907600,
			"Temperature": {
				"Minimum": {
					"Value": 11.1,
					"Unit": "C",
					"UnitType": 17
				},
				"Maximum": {
					"Value": 18.1,
					"Unit": "C",
					"UnitType": 17
				}
			},
			"Day": {
				"Icon": 1,
				"IconPhrase": "Sunny",
				"HasPrecipitation": false
			},
			"Night": {
				"Icon": 34,
				"IconPhrase": "Mostly clear",
				"HasPrecipitation": false
			},
			"Sources": [
				"AccuWeather"
			],
			"MobileLink": "http://m.accuweather.com/en/il/tel-aviv/215854/daily-weather-forecast/215854?day=4&unit=c&lang=en-us",
			"Link": "http://www.accuweather.com/en/il/tel-aviv/215854/daily-weather-forecast/215854?day=4&unit=c&lang=en-us"
		},
		{
			"Date": "2021-03-29T07:00:00+02:00",
			"EpochDate": 1616994000,
			"Temperature": {
				"Minimum": {
					"Value": 13.4,
					"Unit": "C",
					"UnitType": 17
				},
				"Maximum": {
					"Value": 19.9,
					"Unit": "C",
					"UnitType": 17
				}
			},
			"Day": {
				"Icon": 2,
				"IconPhrase": "Mostly sunny",
				"HasPrecipitation": false
			},
			"Night": {
				"Icon": 34,
				"IconPhrase": "Mostly clear",
				"HasPrecipitation": false
			},
			"Sources": [
				"AccuWeather"
			],
			"MobileLink": "http://m.accuweather.com/en/il/tel-aviv/215854/daily-weather-forecast/215854?day=5&unit=c&lang=en-us",
			"Link": "http://www.accuweather.com/en/il/tel-aviv/215854/daily-weather-forecast/215854?day=5&unit=c&lang=en-us"
		}
	]
};






//Syntax Suitable for Heroku:
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`app is running on port ${PORT}`);
});
