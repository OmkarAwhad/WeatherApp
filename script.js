// Tabs ( For switching)
const userTab = document.querySelector('[data-userWeather]')
const searchTab = document.querySelector('[data-searchWeather]')

// main container
const userContainer = document.querySelector('.weather-container')

// all small small containers inside main container
const grantAccessContainer = document.querySelector('.grant-location-container')
const searchForm = document.querySelector('[data-searchForm]')
const loadingScreen = document.querySelector('.loading-container')
const userInfoContainer = document.querySelector('.user-info-container')


const API_KEY = 'bfd4e9978dcee6830a003484d1888296';
let currentTab = userTab;

// here 'current-tab' is properties(in css) of the tab at which we are standing
currentTab.classList.add('current-tab')

// pending kaam
// intially agar system mai lat lon present honge toh
getFromSessionStorage()

// function for switching thw tabs
function switchTab(clickedTab){
    if(clickedTab != currentTab){
        currentTab.classList.remove('current-tab');
        currentTab = clickedTab;
        currentTab.classList.add('current-tab');

        // search weather pr click kiya
        if(!searchForm.classList.contains('active')){
            grantAccessContainer.classList.remove('active')
            userInfoContainer.classList.remove('active')
            searchForm.classList.add('active')
        }
        else{
            // ab your weather pr jara hu
            searchForm.classList.remove("active")
            userInfoContainer.classList.remove('active')
            // ab mai your weather tab mai aagaya hu, toh weather bhi display karna hai 
            // so lets check local storage first for coordinates if we have saves them there
            getFromSessionStorage();
        }
    }

}
userTab.addEventListener('click',()=>{
    switchTab(userTab);
})
searchTab.addEventListener('click',()=>{
    switchTab(searchTab);
})

// local storage se coordinates lana
function getFromSessionStorage(){
    let localCoordinates = sessionStorage.getItem('user-coordinates')
    if(!localCoordinates){
        // local coordinates nahi mile
        grantAccessContainer.classList.add('active');
    }else{
        // mil gaye
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates)
    }
}

// API call for getting lat lon coordinates
async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;
    // api call hone se pehle grant access container ko invisible karna hoga
    //  aur loader ko chalana hoga
    grantAccessContainer.classList.remove('active')
    loadingScreen.classList.add('active')

    // API call
    try{
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        )
        const data = await response.json();
        // ab loader ko hata do
        loadingScreen.classList.remove('active')
        userInfoContainer.classList.add('active')
        // ab ek function banake sab data variable ko apne ui pn reflect karna hai
        renderWeatherInfo(data);
    }catch(e){
        // hw
        console.error("Error fetching user weather:", e);
    }
}


function renderWeatherInfo(weatherInfo){
    // saare info ko fetch karna padega mujhe pehle html se
    // jaise ki city country temp humidity wind,etc
    const cityName = document.querySelector('[data-cityName]')
    const countryIcon = document.querySelector('[data-countryIcon]')
    const weatherDesc = document.querySelector('[data-weatherDesc]')
    const weatherIcon = document.querySelector('[data-weatherIcon]')
    const temp = document.querySelector('[data-temp]')
    const wind = document.querySelector('[data-wind]')
    const humidity = document.querySelector('[data-humidity]')
    const cloud = document.querySelector('[data-cloud]')

    // weatherInfo ke values ui pe dalne hai ab ( main kaam )
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`
    weatherDesc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;

    let temp2 = weatherInfo?.main?.temp;
    let cel = temp2 - 273;
    temp.innerText = `${cel.toFixed(2)} °C `;

    wind.innerText =` ${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText =`${ weatherInfo?.main?.humidity} %`;
    cloud.innerText = `${weatherInfo?.clouds?.all} %`;
}

// ab jag grant access button pr click hoga tab apna current location usse milega
// toh api (geolocation) ka use karke current location nikalenge aur getSessionStorage mai daal denge

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition)
    }else{
        // alert('No geolocation support available')
        console.error('No geolocation support available');
    }
}

function showPosition(position){
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem('user-coordinates', JSON.stringify(userCoordinates));
    // coordinates toh mil gaye lekin ui pe dikhana bhi toh hai
    fetchUserWeatherInfo(userCoordinates)
}

const grantBtn = document.querySelector('[grant-access]')
grantBtn.addEventListener('click',getLocation);

// search
let searchInput = document.querySelector('[data-searchInput]')
searchForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === ""){
        return;
    }else{
        // woh upar wla alag fn hai woh fetchUser... hai aur ye fetchSearch..... hai
        fetchSearchWeatherInfo(cityName);
        searchInput.value = "";
    }
})

fetchUserWeatherInfo
async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add('active')
    userInfoContainer.classList.remove('active')
    grantAccessContainer.classList.remove('active')

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`)

        const data = await response.json();
        loadingScreen.classList.remove('active')
        userInfoContainer.classList.add('active')
        renderWeatherInfo(data);


    }catch(e){
        console.error("Error fetching search weather:", e);
    }
}