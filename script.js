const cityInput=document.querySelector('.city-input')
const searchBtn=document.querySelector('.search-btn')

const weatherInfoSection=document.querySelector('.weather-info');
const searchCitySection=document.querySelector('.search-city');
const notFoundSection=document.querySelector('.not-found');

const countryText=document.querySelector('.country-txt');
const currentDateText=document.querySelector('.current-date-txt');
const tempValue=document.querySelector('.temp-txt');
const tempText=document.querySelector('.condition-txt');
const humidityvalue=document.querySelector('.humidity-value');
const windValue=document.querySelector('.wind-value');
const weatherSummaryImg=document.querySelector('.weather-img');
const forecastItemContainer=document.querySelector('.forecast-item-container')


const apiKey='57f8926506e27bb42de5990bdab44853'
searchBtn.addEventListener('click',() =>{
    if(cityInput.value.trim() !=''){ /*to trim the white spaces and check wheather there is a value */
        updateweatherInfo(cityInput.value)
    cityInput.value=''; /* After empty search bar*/
    }
    
})
cityInput.addEventListener('keydown', (event) =>{ /*after typing when we press enter it will work */
    if(event.key=='Enter' && cityInput.value.trim() !=''){
        updateweatherInfo(cityInput.value);
        cityInput.value='';
    }
})

/*async is used to obtain promise, i.e basically we are using then keyword to obtian i.e when the request is completed then only give output. here async 
and await are used for "The async keyword in JavaScript is  used to define asynchronous functions. When you declare a function with async, 
 it automatically returns a Promise and allows you to use  the await keyword within the function to wait for other 
 Promises to resolve."
--------- Always Returns a Promise:-------------
An async function wraps the return value (or any error) in a Promise.

---------Works with await:--------------
Inside async functions, you can use await to pause execution until a Promise is resolved.

---------Makes Code Cleaner:--------------
It helps write asynchronous code in a cleaner, sequential style that resembles synchronous code. */

async function updateweatherInfo(city){
    const weatherData=await getFetchData('weather',city);
    console.log(weatherData);
    if(weatherData.cod != '200'){ /*here weatherData.cod means the request status is succesful, 404 is not susseccsful */
        showDisplaysection(notFoundSection);/*here cod is an attribute of checking status. it will be shown when we print console.log(weatherData);*/
    }else{
        showDisplaysection(weatherInfoSection);
    }  

    const {
         name:country,
         main:{humidity,temp},
         weather:[{id,main}],
         wind: {speed}
    }=weatherData
    /*it is an array destructuring. name,main,weather,wind are the attributes in weather data, those are printed when we give 
    console.log(weatherData);. here the we change name into country, humidity and temp are sub attributes of main so we write like that,
    weather is an array id and main(bo mains are different) are present in that, speed is a seperate attribute in wind */

    countryText.textContent=country;
    tempValue.textContent=Math.round(temp) + " °C";
    tempText.textContent=main;
    humidityvalue.textContent=humidity+"%";
    windValue.textContent=speed+" M/S";
    
    currentDateText.textContent=getCurrentdate();
    weatherSummaryImg.src=`images/${getWeatherSummaryImg(id)}`
    
    await updateForecastInfo(city);
}

function getWeatherSummaryImg(id){
    if(id <=232) return 'thunderstorm.png'
    if(id <=321) return 'drizzle.avif'
    if(id <=531) return 'rainy.png'
    if(id <=622) return 'snow.png'
    if(id <=781) return 'atmosphere.png'
    if(id <=800) return 'clear.avif'
    else return 'clouds.png'

}

function getCurrentdate(){
      const currentDate=new Date();
     /*console.log(currentDate); & result= Wed Dec 18 2024 12:38:18 GMT+0530 (India Standard Time). so we take options to create our own format*/
      const options={
        weekday:'short',
        day:'2-digit',
        month: 'short'
      }
      return currentDate.toLocaleDateString('en-IN',options)/*toLocaleDateString. In JavaScript, toLocaleDateString() is a built-in method used to convert a Date object into a string representing the date portion of the object
      dateObj.toLocaleDateString([locales[, options]]); Locales:"en-US"(us), "fr-FR"(france), IN(india). weekday: "short", "long", or "narrow".year: "numeric" or "2-digit".month: "numeric", "2-digit", "long", "short", or "narrow".day: "numeric" or "2-digit".*/


}

function showDisplaysection(section){
    [weatherInfoSection, searchCitySection, notFoundSection]
    .forEach(sec =>sec.style.display='none');/*to make all the sections display none */
    section.style.display='block';/*it is to make to display the current section. whenever we disable the section then we use style.display
    to make it visisble angain, it will be block or flex based on our design */
}

async function updateForecastInfo(city) {
    const forecastData=await getFetchData('forecast',city);

    const timeTaken="12:00:00";/*to print at this time of remaining four days */
    const todayDate=new Date().toISOString().split('T')[0];
    /*toISOString() output is 2024-12-18T10:39:57.588Z, when we split function at T then ouput is ['2024-12-18' 'T10:39:57.588Z'], hence we take 
    first element of array by specifying split("T")[0] */
    console.log(todayDate);
    /* console.log(forecastData when we give this line we get list of forecasts of different dates. so we take foreach function to print all the
    list of forecast. when we access forecast daya it gives 5 days of forecast data including today.But we print only 4 days forecast data in forecast section ingnoring today.
     So here we apply filters to print 4 days data  "!forecastWeather.dt_txt.includes(todayDate)" */
    forecastItemContainer.innerHTML=''
    forecastData.list.forEach(forecastWeather =>{
        if(forecastWeather.dt_txt.includes(timeTaken)&&!forecastWeather.dt_txt.includes(todayDate)){
            updateForecastitems(forecastWeather);
        }
    })
}

function updateForecastitems(weatherData){
    console.log(weatherData)
    const {
       dt_txt:date,
        weather:[{id}],
        main:{temp} 
    } =weatherData
     const dateTaken=new Date(date);
     const dateOption={
        day:"2-digit",
        month:"short"
     }
     const dateresult=dateTaken.toLocaleDateString("en-IN",dateOption)
    const forecastitem=`
       <div class="forecast-item">
            <h5 class="forecast-item-date regular-text">${dateresult}</h5>
            <img src="images/${getWeatherSummaryImg(id)}" alt="#" class="forecast-item-img">
             <h5 class="forecast-iten-temp">${Math.round(temp)} °C</h5>
        </div>  
    `
    forecastItemContainer.insertAdjacentHTML('beforeend',forecastitem)
}

async function getFetchData(endpoint,city){
   const apiUrl=`https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=metric`;
  
  
   /* the actual url is    https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={apiId} but we replace with our actual attributes i.e 
   city name with city,apiId with apiKey. in the place of weather we can use weather or forecast. so we dynamically give endpoint 
   keyword there and we will pass weather or forecast when required. */
  
  
   const response=await fetch(apiUrl);
   return response.json();
}