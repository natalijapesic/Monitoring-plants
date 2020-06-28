"use strict";

const express = require("express");
const bodyParser = require('body-parser');
const request = require('request');
const cors = require("cors");

module.exports = {
    name: "gateway",
    settings: {
        port: process.env.PORT || 3000,
    },
    methods: {
        initRoutes(app) {
            app.get("/actuatorsStatus", this.getActuatorsStatus); // Device
            app.get("/soilTemperature", this.getSoilTemperature); // Data
            app.get("/airTemperature", this.getAirTemperature); // Data
            app.get("/RHpercent", this.getRHpercent); // Data
            app.get("/waterContent", this.getWaterContent); // Data
            app.get("/deviceInfo", this.getDeviceInfo); // Data
            app.get("/commandList", this.getCommandList); // Command
            app.get("/getWaterPumpParameters", this.getWaterPumpParameters); // Command
            app.get("/getAirCoolerParameters", this.getAirCoolerParameters); // Command
            app.get("/getHumidifierParameters", this.getHumidifierParameters); // Command
            app.get("/notifications", this.getNotifications); // Analytics
            app.put("/setOffset/waterPump", this.setWaterPumpOffset); // Command
            app.put("/setOffset/humidifier", this.setHumidifierOffset); // Command
            app.put("/setOffset/airCooler", this.setAirCoolerOffset); // Command
            app.put("/setMax/humidifier", this.setHumidifierMax); // Command
            app.put("/setMax/waterPump", this.setWaterPumpMax); // Command
            app.put("/setMax/airCooler", this.setAirCoolerMax); // Command
            app.put("/setMin/humidifier", this.setHumidifierMin); // Command
            app.put("/setMin/waterPump", this.setWaterPumpMin); // Command
            app.put("/setMin/airCooler", this.setAirCoolerMin); // Command
            app.put("/setValue/airCooler", this.setAirCoolerTemperature); // Device
            app.put("/setValue/waterPump", this.setWaterPumpLitersPerMinute); // Device
            app.put("/setValue/humidifier", this.setHumidifierHumidityLevel); // Device
            app.put("/addOffset/airCooler", this.addAirCoolerOffset); // Device
            app.put("/addOffset/waterPump", this.addWaterPumpOffset); // Device
            app.put("/addOffset/humidifier", this.addHumidifierOffset); // Device
            app.put("/changeReadInterval", this.changeReadInterval); // Device
            app.put("/turnOnOrOff/waterPump", this.turnWaterPumpOnOrOff); // Device
            app.put("/turnOnOrOff/airCooler", this.turnAirCoolingOnOrOff); // Device
            app.put("/turnOnOrOff/humidifier", this.turnHumidifierOnOrOff); // Device
            app.post("/writeParametersToDatabase", this.writeParametersToDatabase); // Data
        },
        getExternalData(req, res, url) {
            request.get(url, 
                (err, resp, body) => {
                    if (err) {
                        console.log(err);
                        res.status(err.code || 500).send(err);
                        return;
                    }
                    console.log(res.statusCode);
                    //console.log(body);
                    res.send(body)
			});
        },
        getWaterPumpParameters(req, res) {
            this.getExternalData(req, res, process.env.COMMAND_URL + '/getWaterPumpParameters');
        },
        getAirCoolerParameters(req, res) {
            this.getExternalData(req, res, process.env.COMMAND_URL + '/getAirCoolerParameters');
        },
        getHumidifierParameters(req, res) {
            this.getExternalData(req, res, process.env.COMMAND_URL + '/getHumidifierParameters');
        },
        getCommandList(req, res) {
            this.getExternalData(req, res, process.env.COMMAND_URL + '/getCommands');
        },
        getNotifications(req, res) {
            this.getExternalData(req, res, process.env.ANALYTICS_URL + '/queryAll');
        },
        setWaterPumpOffset(req, res) {
            this.putDataCommand(req, res, '/setOffset/waterPump');
        },
        setHumidifierOffset(req, res) {
            this.putDataCommand(req, res, '/setOffset/humidifier');
        }, 
        setAirCoolerOffset(req, res) {
            this.putDataCommand(req, res, '/setOffset/airCooler');
        },
        setHumidifierMax(req, res) {
            this.putDataCommand(req, res, '/setMax/humidifier');
        },
        setWaterPumpMax(req, res) {
            this.putDataCommand(req, res, '/setMax/waterPump');
        },
        setAirCoolerMax(req, res) {
            this.putDataCommand(req, res, '/setMax/airCooler');
        },
        setHumidifierMin(req, res) {
            this.putDataCommand(req, res, '/setMin/humidifier');
        },
        setWaterPumpMin(req, res) {
            this.putDataCommand(req, res, '/setMin/waterPump');
        },
        setAirCoolerMin(req, res) {
            this.putDataCommand(req, res, '/setMin/airCooler');
        },
        putDataCommand(req, res, url) {
            console.log(req.body);
            request.put(process.env.COMMAND_URL + url, {
				json: req.body
			}, (err, resp, body) => {
				if (err) {
                    console.log(err);
                    res.status(err.code || 500).send(err);
					return;
				}
				console.log(res.statusCode);
                //console.log(body);
                res.send(body)
			});
        },
        getActuatorsStatus(req, res) {
            return Promise.resolve()
            .then(() => {
                return this.broker.call('device.getActuatorsStatus').then(result => {
                    res.send(result);
                });
            })
            .catch(this.handleErr(res));
        },
        addAirCoolerOffset(req, res) {
            return this.modifyData(req, res, 'device.inreaseOrDecreaseAirCoolerLevel');
        },
        addWaterPumpOffset(req, res) {
            return this.modifyData(req, res, 'device.increaseOrDecreaseWaterPumpLevel');
        },
        addHumidifierOffset(req, res) {
            return this.modifyData(req, res, 'device.increaseOrDecreaseHumidifierLevel');
        },
        writeParametersToDatabase(req, res) {
            return this.modifyData(req, res, 'data.writeParametersToDatabase');
        },
        setAirCoolerTemperature(req, res) {
            return this.modifyData(req, res, 'device.setAirCoolerTemperature');
        },
        setWaterPumpLitersPerMinute(req, res) {
            return this.modifyData(req, res, 'device.setWaterPumpLitersPerMinute');
        },
        setHumidifierHumidityLevel(req, res) {
            return this.modifyData(req, res, 'device.setHumidifierHumidityLevel');
        },
        changeReadInterval(req, res) {
            return this.modifyData(req, res, 'device.changeReadInterval');
        },
        turnWaterPumpOnOrOff(req, res) {
            return this.modifyData(req, res, 'device.turnWaterPumpOnOrOff');
        },
        setAirCoolerTemperature(req, res) {
            return this.modifyData(req, res, 'device.setAirCoolerTemperature');
        },
        turnAirCoolingOnOrOff(req, res) {
            return this.modifyData(req, res, 'device.turnAirCoolingOnOrOff');
        },
        turnHumidifierOnOrOff(req, res) {
            return this.modifyData(req, res, 'device.turnHumidifierOnOrOff');
        },
        getDeviceInfo(req, res) {
            return Promise.resolve()
            .then(() => {
                return this.broker.call('device.getDeviceParameters').then(result => {
                    res.send(result);
                });
            })
            .catch(this.handleErr(res));
        },
        modifyData(req, res, url) {
            const body = req.body;
            console.log(body);
            return Promise.resolve()
            .then(() => {
                return this.broker.call(url, body).then(result =>
                    res.send(result)
                );
            })
            .catch(this.handleErr(res));
        },
        getSoilTemperature(req, res) {
            return this.getData(req, res, 'data.readSoilTemperature');
        },
        getAirTemperature(req, res) {
            return this.getData(req, res, 'data.readAirTemperature');
        },
        getRHpercent(req, res) {
            return this.getData(req, res, 'data.readRHPercent');
        },
        getWaterContent(req, res) {
            return this.getData(req, res, 'data.readWaterContent');
        },
        getData(req, res, url) {
            const sensorId = req.query.id ? Number(req.query.id) : 0;
            return Promise.resolve()
                .then(() => {
                    return this.broker.call(url, { sensorId: sensorId }).then(result => {
                        res.send(result);
                    });
                })
                .catch(this.handleErr(res));
        },
        handleErr(res) {
            return err => {
                res.status(err.code || 500).send(err.message);
            };
        }
    },
    created() {
        const app = express();
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.use(cors());
        app.listen(this.settings.port);
        this.initRoutes(app);
        this.app = app;
    }
};