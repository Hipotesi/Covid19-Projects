'use strict';

/**
 * Saves a JSON string to the local storage
 * @param {String} key
 * @param {Object} jsonData
 */
function cacheAPIData(key, jsonData) {
    localStorage.setItem(key, JSON.stringify(jsonData));
}

/**
 * Gets an object saved in the local storage
 * @param {String} key
 */
function retrieveCachedAPIData(key) {
    return JSON.parse(localStorage.getItem(key));
}

async function showModal(modalId) {
    $(modalId).modal({ backdrop: 'static', keyboard: true, show: true });
    return new Promise((resolve, reject) => {
        $(modalId).on('shown.bs.modal', evt => {
            resolve();
        });
    });
}

async function hideModal(modalId) {
    $(modalId).modal('hide');
    return new Promise((resolve, reject) => {
        $(modalId).on('hidden.bs.modal', evt => {
            resolve();
        });
    });
}
