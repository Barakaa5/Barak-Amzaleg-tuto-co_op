//-------Setup Project---------------//
let express = require("express"),
	app = express(),
	bodyParser = require('body-parser'),
	request = require('request');

app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
//-------Setup Project---------------//

let favorites = [{ "city": "tel aviv", key: "215854" }];//inital favorites array of cities.

app.get("/", function (req, res) {
	res.render("landing", { city: req.params.cityName, error: "" });
});

app.get("/favorites", function (req, res) {
	let temperatures = [];// future array of temperatures of the favorites cities.

	favorites.forEach(async function(fav) {
		await request(
			// api request of 'CurrentCondition' in each city in favorites
			'http://dataservice.accuweather.com/currentconditions/v1/' + fav.key + '?apikey=eQiLmDbqwGiTAVhL04IkNdvCePwAuP54',
			function (error, response, body) {
				// handaling Errors
				if (response.statusCode != 200) {
					console.log('---------------------------------------------------');
					console.log('There is an error and this is what happend:');
					console.log('---------------------------------------------------');
					console.log(error);
					res.redirect("/");
				} else {
					if (response.statusCode == 200) {
						let parsedData1 = JSON.parse(body);
						if (parsedData1.length == 0) {
							return res.render("landing", { city: "", favorites: favorites, error: "ERROR! Search for a legal city again" });
						} else {
							temperatures.push(parsedData1[0].Temperature.Metric.Value);// adding each city temperatures to the array
							res.render("favorites", { favorites: favorites, temperatures: temperatures});
						}
					}
				}
			}
		)
	});
});


app.post('/favorites', function (req, res) {

	let cityName = req.body.hiddenInput2;

	request(
		// api request of 'CitySearch' in each city in favorites
		'http://dataservice.accuweather.com/locations/v1/cities/search?apikey=eQiLmDbqwGiTAVhL04IkNdvCePwAuP54&q=' + cityName,
		function (error, response, body) {
			// handaling Errors
			if (response.statusCode != 200) {
				console.log('---------------------------------------------------');
				console.log('There is an error and this is what happend:');
				console.log('---------------------------------------------------');
				console.log(error);
				res.redirect("/");
			} else {
				if (response.statusCode == 200) {
					let parsedData1 = JSON.parse(body);
					if (parsedData1.length == 0) {
						return res.render("landing", { city: "", favorites: favorites, error: "ERROR! your favorite city must be legal"});
					} else {
						let cityKey = parsedData1[0].Key;
						favorites.push({ "city": cityName, "key": cityKey })// adding new favorites city to the 'favorites array'
						res.redirect("/");
					}
				}
			}
		}
	)
});

app.post('/', function (req, res) {

	let cityName = req.body.hiddenInput;

	request(
		// api request of 'CitySearch' in each city in favorites
		'http://dataservice.accuweather.com/locations/v1/cities/search?apikey=eQiLmDbqwGiTAVhL04IkNdvCePwAuP54&q=' + cityName,
		function (error, response, body) {
			// handaling Errors
			if (response.statusCode != 200) {
				console.log('---------------------------------------------------');
				console.log('There is an error and this is what happend:');
				console.log('---------------------------------------------------');
				console.log(error);
				res.redirect("/");
			} else {
				if (response.statusCode == 200) {
					let parsedData1 = JSON.parse(body);
					if (parsedData1.length == 0) {
						return res.render("landing", { city: "", favorites: favorites, error: "ERROR! Search for a legal city again" });
					}
					let cityKey = parsedData1[0].Key;

					request.post(
						// api request of '5-dayDailyForecasts' in each city in favorites
						'http://dataservice.accuweather.com/forecasts/v1/daily/5day/' + cityKey + "?apikey=eQiLmDbqwGiTAVhL04IkNdvCePwAuP54&metric=true",
						function (error, response, body) {
							// handaling Errors
							if (response.statusCode != 200) {
								console.log('---------------------------------------------------');
								console.log('Barak, there is an error and this is what happend:');
								console.log('---------------------------------------------------');
								console.log(error);
							} else {
								if (response.statusCode == 200) {
									let parsedData2 = JSON.parse(body);
									// Taking each day forcast of the next 5 days, and calculate the average of it's min an max temperature
									let day1Forcast = Math.ceil(parsedData2.DailyForecasts[0].Temperature.Minimum.Value + parsedData2.DailyForecasts[0].Temperature.Maximum.Value) / 2;
									let day2Forcast = Math.ceil(parsedData2.DailyForecasts[1].Temperature.Minimum.Value + parsedData2.DailyForecasts[1].Temperature.Maximum.Value) / 2;
									let day3Forcast = Math.ceil(parsedData2.DailyForecasts[2].Temperature.Minimum.Value + parsedData2.DailyForecasts[2].Temperature.Maximum.Value) / 2;
									let day4Forcast = Math.ceil(parsedData2.DailyForecasts[3].Temperature.Minimum.Value + parsedData2.DailyForecasts[3].Temperature.Maximum.Value) / 2;
									let day5Forcast = Math.ceil(parsedData2.DailyForecasts[4].Temperature.Minimum.Value + parsedData2.DailyForecasts[4].Temperature.Maximum.Value) / 2;

									const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
									// conclude the name of the day according to it's date that was receive from the api request
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


//Syntax Suitable for Heroku:
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`app is running on port ${PORT}`);
});
