'use strict';

const objInfoWindows = {};
const markers = {};

async function initMap() {
    const mapProps = {
        center: {
            lat: 15,
            lng: 0
        },
        zoom: 2
    };
    const map = new google.maps.Map(document.getElementById('map'), mapProps);
    let globalData = null;
    let countriesData = null;
    let countryNamesES = null;

    await showModal('#modalLoading');
    try {
        const globalRes = await fetch(`${BASE_API_URL}/all`);
        globalData = await globalRes.json();
        cacheAPIData('globalData', globalData);

        const countriesRes = await fetch(`${BASE_API_URL}/countries?sort=cases`);
        countriesData = await countriesRes.json();
        cacheAPIData('countryData', countriesData);

        const countryNamesESRes = await fetch('https://raw.githubusercontent.com/umpirsky/country-list/master/data/es_MX/country.json');
        countryNamesES = await countryNamesESRes.json();
    }
    catch (error) {
        globalData = retrieveCachedAPIData('globalData');
        countriesData = retrieveCachedAPIData('countryData');
        await hideModal('#modalLoading');
        if (!globalData || !countriesData) {
            await showModal('#modalError');
        }
    }

    updateInfoCards(globalData, countriesData, countryNamesES);
    addCountryMarkers(countriesData, countryNamesES, map);

    await hideModal('#modalLoading');

    const markerCluster = new MarkerClusterer(map, markers,
        {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
            gridSize: 35,
            maxZoom: 10
        }
    );
}

function generateCountryInfoHTML(country, countryES) {
    const markerContainer = document.querySelector('.googleMapMarkerContainer');
    const img = markerContainer.querySelector('.countryFlag');
    const cases = markerContainer.querySelector('#cases');
    const deaths = markerContainer.querySelector('#deaths');
    const recovered = markerContainer.querySelector('#recovered');

    img.src = country.countryInfo.flag;
    img.alt = `Bandera de ${countryES[country.countryInfo.iso2] || country.country}`;

    cases.textContent = country.cases.toLocaleString('en');
    deaths.textContent = country.deaths.toLocaleString('en');
    recovered.textContent = country.recovered.toLocaleString('en');

    return markerContainer.innerHTML;
}

function generateFullCountryInfoHTML(country, countryES) {
    const markerContainer = document.querySelector('.googleMapRightControlContainer');
    const img = markerContainer.querySelector('.countryFlag');
    const countryName = markerContainer.querySelector('#countryName');
    const casesCell = markerContainer.querySelector('#casesCell');
    const todayCasesCell = markerContainer.querySelector('#todayCasesCell');
    const deathsCell = markerContainer.querySelector('#deathsCell');
    const todayDeathsCell = markerContainer.querySelector('#todayDeathsCell');
    const recoveredCell = markerContainer.querySelector('#recoveredCell');
    const activeCasesCell = markerContainer.querySelector('#activeCasesCell');
    const criticalCasesCell = markerContainer.querySelector('#criticalCasesCell');
    const casesPerMillionCell = markerContainer.querySelector('#casesPerMillionCell');

    img.src = country.countryInfo.flag;
    img.alt = `Bandera de ${country.countryInfo.flag}`;

    countryName.textContent = countryES[country.countryInfo.iso2] || country.country;

    casesCell.textContent = country.cases.toLocaleString('en');
    todayCasesCell.textContent = country.todayCases.toLocaleString('en');
    deathsCell.textContent = country.deaths.toLocaleString('en');
    todayDeathsCell.textContent = country.todayDeaths.toLocaleString('en');
    recoveredCell.textContent = country.recovered.toLocaleString('en');
    activeCasesCell.textContent = country.active.toLocaleString('en');
    criticalCasesCell.textContent = country.critical.toLocaleString('en');
    casesPerMillionCell.textContent = country.casesPerOneMillion.toLocaleString('en');

    return markerContainer.innerHTML;
}

function makeControl(controlDiv, country, countryES) {
    // Set up the control border.
    const controlUI = document.createElement('div');
    controlUI.title = countryES[country.countryInfo.iso2] || country.country;
    controlUI.className = 'controlUI';
    controlDiv.appendChild(controlUI);

    // Set up the inner control.
    const controlText = document.createElement('div');
    controlText.innerHTML = generateFullCountryInfoHTML(country, countryES);
    controlText.className = 'controlText';
    controlUI.appendChild(controlText);
}

function updateInfoCards(globalData, countriesData, countryNamesES) {
    // For each country add a row to the 'Casos confirmados por país' card
    countriesData.forEach((country, i) => {
        const tdPosicion = document.createElement('td');
        const tdPais = document.createElement('td');
        const tdCasos = document.createElement('td');

        tdPosicion.textContent = i + 1;
        tdPais.textContent = countryNamesES[country.countryInfo.iso2] || country.country;

        const spanCasos = document.createElement('span');
        spanCasos.textContent = country.cases.toLocaleString('en');
        spanCasos.className = 'badge badge-pill badge-warning';

        tdCasos.appendChild(spanCasos);

        const tr = document.createElement('tr');
        tr.id = country.country;
        tr.appendChild(tdPosicion);
        tr.appendChild(tdPais);
        tr.appendChild(tdCasos);

        tr.addEventListener('click', evt => {
            const country = evt.currentTarget.id;
            closeAllInfoWindows();
            google.maps.event.trigger(markers[country], 'click');
        });

        tblCountryCases.appendChild(tr);
    });

    // Show the remaining statistics (last update, confirmed, active, closed cases) in the other cards
    divLastUpdated.textContent = new Date(globalData.updated).toLocaleString('es-us', { hour12: true });
    divGlobalConfirmedCases.textContent = globalData.cases.toLocaleString('en');
    divGlobalActiveCases.textContent = globalData.active.toLocaleString('en');
    divGlobalRecovered.textContent = globalData.recovered.toLocaleString('en');
    divGlobalDeaths.textContent = globalData.deaths.toLocaleString('en');
}

function addCountryMarkers(countriesData, countryNamesES, map) {
    const icon = {
        url: 'https://image.flaticon.com/icons/png/128/2659/2659980.png',
        scaledSize: new google.maps.Size(24, 24),
        origin: new google.maps.Point(0, 0)
    };

    for (const country of countriesData) {
        const info = generateCountryInfoHTML(country, countryNamesES);
        const infoWindow = new google.maps.InfoWindow({
            content: info
        });

        const marker = new google.maps.Marker({
            map: map,
            icon: icon,
            position: new google.maps.LatLng(country.countryInfo.lat, country.countryInfo.long),
            title: `${countryNamesES[country.countryInfo.iso2] || country.country}`
        });

        markers[country.country] = marker;
        marker.addListener('click', () => {
            closeAllInfoWindows();
            infoWindow.open(map, marker);
            const divName = document.createElement('div');
            new makeControl(divName, country, countryNamesES);

            let fullInfoWindow = setInterval(() => {
                if (!infoWindow.getMap()) {
                    clearInterval(fullInfoWindow);
                    map.controls[google.maps.ControlPosition.RIGHT_CENTER].pop();
                }
                else if (map.controls[google.maps.ControlPosition.RIGHT_CENTER].length === 0) {
                    map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(divName);
                }
            }, 100);
        });

        objInfoWindows[country.country] = infoWindow;
    }
}

function closeAllInfoWindows() {
    for (const infoWinKey in objInfoWindows) {
        objInfoWindows[infoWinKey].close();
    }
}
