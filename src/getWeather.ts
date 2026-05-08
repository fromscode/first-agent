const apiKey = process.env.WEATHER_API_KEY;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  export async function getWeather(place = "New York", day: number = 0) {
    console.log("weather function called with place " + place);
    try {
      const response = await fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${place}?unitGroup=metric&elements=datetime%2CdatetimeEpoch%2Ctempmax%2Ctempmin%2Ctemp%2Cfeelslike%2Chumidity%2Cprecipprob%2Cwindspeed%2Cpressure%2Cvisibility%2Cuvindex%2Cconditions%2Cicon&include=days%2Chours&key=${apiKey}&contentType=json`,
      );
      const result = await response.json();
      const days = result.days[day];
      delete result.days;
      result.days = days;
      return result;
    }
    catch (err) {
      return err;
    }
}