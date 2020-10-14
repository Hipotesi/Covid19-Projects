'use strict';

const BASE_API_URL = 'https://disease.sh/v3/covid-19';

// DOM elements
const tblCountryCases = document.getElementById('countryCasesTable');
const divLastUpdated = document.getElementById('lastUpdated');
const divGlobalConfirmedCases = document.getElementById('globalConfirmedCases');
const divGlobalActiveCases = document.getElementById('globalActiveCases');
const divGlobalRecovered = document.getElementById('globalRecovered');
const divGlobalDeaths = document.getElementById('globalDeaths');