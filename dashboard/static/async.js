"use strict";

function init() {
    
    let periodButton = document.getElementById("periodButton");
    let airButton = document.getElementById("airButton");
    let waterButton = document.getElementById("waterButton");
    let humidifierButton = document.getElementById("humidifierButton");

    periodButton.onclick = (ev) => {
        this.sendData("http://localhost:3000/changeReadInterval", "period")
    }

    airButton.onclick = (ev) => {
        this.sendData("http://localhost:3000/setOffset/airCooler", "air")
    }

    waterButton.onclick = (ev) => {
        this.sendData("http://localhost:3000/setOffset/waterPump", "water")
    }

    humidifierButton.onclick = (ev) => {
        this.sendData("http://localhost:3000/setOffset/humidifier", "humidifier")
    }

}

function sendData(url, inputId) {

    let inputElement = document.getElementById(inputId);

    let data = { "value": parseInt(inputElement.value, 10)}

    console.log(data);

    fetch(url, {
      method: 'PUT', // or 'POST'
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

this.init();