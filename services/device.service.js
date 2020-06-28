"use strict";

const fs = require('fs');

module.exports = {
    name: "device",
    actions: {
		getDeviceParameters: {
			async handler(ctx) {
				const res = {
                    sensorId: this.sensorId,
                    info: "Sensor for reading multiple parameters required for optimal monitoring of plants environment",
                    paramsNumber: this.paramsNumber,
                    paramsRead: ["airTemperature", "soilTemperature", "RHpercent", "soilWaterContent"],
                    interval: this.interval
                }
				return res;
			}
        },
        getActuatorsStatus: {
			async handler(ctx) {
				const res = {
                    sensorId: this.sensorId,
                    airCooler: { turnedOn: this.airCoolingOn, airCoolerTemperature: this.airCoolerTemperature},
                    waterPump: { turnedOn: this.waterPumpOn, waterPumpLitersPerMinute: this.waterPumpLitersPerMinute},
                    humidifier: { turnedOn: this.humidifierOn, humidifierHumidityLevel: this.humidifierHumidityLevel}
                }
				return res;
			}
        },
        increaseOrDecreaseWaterPumpLevel: {
            params: {
                sensorId: { type: "number" },
                offset: { type: "number" }
			},
            async handler(ctx) {
                console.log('Received "increaseOrDecreaseWaterPumpLevel" put request with payload: ', ctx.params);
                this.waterPumpLitersPerMinute += ctx.params.offset;
                return JSON.stringify('Success setting parameter!');
            }
        },
        increaseOrDecreaseHumidifierLevel: {
            params: {
                sensorId: { type: "number" },
                offset: { type: "number" }
			},
            async handler(ctx) {
               console.log('Received " increaseOrDecreaseHumidifierLevel" put request with payload: ', ctx.params);
               this.humidifierHumidityLevel += ctx.params.offset;
               return JSON.stringify('Success setting parameter!');
            }
        },
        inreaseOrDecreaseAirCoolerLevel: {
            params: {
                sensorId: { type: "number" },
                offset: { type: "number" }
			},
            async handler(ctx) {
               console.log('Received "inreaseOrDecreaseAirCoolerLevel" put request with payload: ', ctx.params);
               
               this.airCoolerTemperature += ctx.params.offset;
               return JSON.stringify('Success setting parameter!');
            }
        },
        turnWaterPumpOnOrOff: {
            params: {
                sensorId: { type: "number" },
                value: { type: "boolean" }
			},
            async handler(ctx) {
               console.log('Received "turnWaterPumpOnOrOff" put request with payload: ', ctx.params);
               this.waterPumpOn = ctx.params.value;
               return JSON.stringify('Success setting parameter!');
            }
        },
        turnAirCoolingOnOrOff: {
            params: {
                sensorId: { type: "number" },
                value: { type: "boolean" }
			},
            async handler(ctx) {
               console.log('Received "turnAirCoolingOnOrOff" put request with payload: ', ctx.params);
               this.airCoolingOn = ctx.params.value;
               return JSON.stringify('Success setting parameter!');
            }
        },
        turnHumidifierOnOrOff: {
            params: {
                sensorId: { type: "number" },
                value: { type: "boolean" }
			},
            async handler(ctx) {
               console.log('Received "turnHumidifierOnOrOff" put request with payload: ', ctx.params);
               this.humidifierOn = ctx.params.value;
               return JSON.stringify('Success setting parameter!');
            }
        },
        setHumidifierHumidityLevel: {
            params: {
                sensorId: { type: "number" },
                value: { type: "number" }
			},
            async handler(ctx) {
               console.log('Receieved "setHumidifierHumidityLevel" put request with payload: ', ctx.params);
               this.humidifierHumidityLevel = ctx.params.value;
               return JSON.stringify('Success setting parameter!');
            }
        },
        setWaterPumpLitersPerMinute: {
            params: {
                sensorId: { type: "number" },
                value: { type: "number" }
			},
            async handler(ctx) {
               console.log('Receieved "setWaterPumpLitersPerMinute" put request with payload: ', ctx.params);
               this.waterPumpLitersPerMinute = ctx.params.value;
               return JSON.stringify('Success setting parameter!');
            }
        },
        setAirCoolerTemperature: {
            params: {
                sensorId: { type: "number" },
                value: { type: "number" }
			},
            async handler(ctx) {
               console.log('Receieved "setAirCoolerTemperature" put request with payload: ', ctx.params);
               this.airCoolerTemperature = ctx.params.value;
               return JSON.stringify('Success setting parameter!');
            }
        },
        changeReadInterval: {
            params: {
                value: { type: "number" }
			},
            async handler(ctx) {
               console.log('Receieved "changeReadInterval" put request with payload: ', ctx.params);
               this.interval = ctx.params.value;
               return JSON.stringify('Success setting parameter!');
            }
        }
    },
    methods: {
        init() {
            setInterval(() => {

                let record = this.dataSet[this.dataIndex]
                this.dataIndex = (this.dataIndex + 1) % this.dataSet.length;

                this.broker.emit("device.parametersRead", {
                    sensorId: this.sensorId,
                    airTemperature: record.Tair,
                    soilTemperature: record.Tsoil,
                    RHpercent: record.RHpercent,
                    waterContent: record.VWC_m3_per_m3_hummock,
                    timeStamp: Date.now()
                });

            }, this.interval);
        },
        readData() {
            
            console.log(fs.existsSync('data/database.json'));
            fs.readFile('data/database.json', (error, data) => {
                this.dataSet = JSON.parse(data);
                console.log(this.data);
            });
        }
    },
    created() {
        // actuator
        this.airCoolingOn = false;
        this.waterPumpOn = false;
        this.humidifierOn = false;
        
        this.humidifierHumidityLevel = 75;
        this.waterPumpLitersPerMinute = 3;
        this.airCoolerTemperature = 25; // Celsius
        // sensor
        this.sensorId = 1;
        this.paramsNumber = 4;
        this.dataIndex = 0;
        this.interval = 5000;
        // init
        this.readData();
        this.init();
    }

};