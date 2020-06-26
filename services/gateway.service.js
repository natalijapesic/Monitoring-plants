"use strict";

const express = require("express");
const bodyParser = require('body-parser');

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
            const body = req.body;
            console.log(body);
            return Promise.resolve()
            .then(() => {
                return this.broker.call('device.inreaseOrDecreaseAirCoolerLevel', body).then(result =>
                    res.send(result)
                );
            })
            .catch(this.handleErr(res));
        },
        addWaterPumpOffset(req, res) {
            const body = req.body;
            console.log(body);
            return Promise.resolve()
            .then(() => {
                return this.broker.call('device.increaseOrDecreaseWaterPumpLevel', body).then(result =>
                    res.send(result)
                );
            })
            .catch(this.handleErr(res));
        },
        addHumidifierOffset(req, res) {
            const body = req.body;
            console.log(body);
            return Promise.resolve()
            .then(() => {
                return this.broker.call('device.increaseOrDecreaseHumidifierLevel', body).then(result =>
                    res.send(result)
                );
            })
            .catch(this.handleErr(res));
        },
        writeParametersToDatabase(req, res) {
            const body = req.body;
            console.log(body);
            return Promise.resolve()
            .then(() => {
                return this.broker.call('data.writeParametersToDatabase', body).then(result =>
                    res.send(result)
                );
            })
            .catch(this.handleErr(res));
        },
        setAirCoolerTemperature(req, res) {
            const body = req.body;
            console.log(body);
            return Promise.resolve()
            .then(() => {
                return this.broker.call('device.setAirCoolerTemperature', body).then(result =>
                    res.send(result)
                );
            })
            .catch(this.handleErr(res));
        },
        setWaterPumpLitersPerMinute(req, res) {
            const body = req.body;
            console.log(body);
            return Promise.resolve()
            .then(() => {
                return this.broker.call('device.setWaterPumpLitersPerMinute', body).then(result =>
                    res.send(result)
                );
            })
            .catch(this.handleErr(res));
        },
        setHumidifierHumidityLevel(req, res) {
            const body = req.body;
            console.log(body);
            return Promise.resolve()
            .then(() => {
                return this.broker.call('device.setHumidifierHumidityLevel', body).then(result =>
                    res.send(result)
                );
            })
            .catch(this.handleErr(res));
        },
        changeReadInterval(req, res) {
            const body = req.body;
            console.log(body);
            return Promise.resolve()
            .then(() => {
                return this.broker.call('device.changeReadInterval', body).then(result =>
                    res.send(result)
                );
            })
            .catch(this.handleErr(res));
        },
        turnWaterPumpOnOrOff(req, res) {
            const body = req.body;
            console.log(body);
            return Promise.resolve()
            .then(() => {
                return this.broker.call('device.turnWaterPumpOnOrOff', body).then(result =>
                    res.send(result)
                );
            })
            .catch(this.handleErr(res));
        },
        setAirCoolerTemperature(req, res) {
            const body = req.body;
            console.log(body);
            return Promise.resolve()
            .then(() => {
                return this.broker.call('device.setAirCoolerTemperature', body).then(result =>
                    res.send(result)
                );
            })
            .catch(this.handleErr(res));
        },
        turnAirCoolingOnOrOff(req, res) {
            const body = req.body;
            console.log(body);
            return Promise.resolve()
            .then(() => {
                return this.broker.call('device.turnAirCoolingOnOrOff', body).then(result =>
                    res.send(result)
                );
            })
            .catch(this.handleErr(res));
        },
        turnHumidifierOnOrOff(req, res) {
            const body = req.body;
            console.log(body);
            return Promise.resolve()
            .then(() => {
                return this.broker.call('device.turnHumidifierOnOrOff', body).then(result =>
                    res.send(result)
                );
            })
            .catch(this.handleErr(res));
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
        getSoilTemperature(req, res) {
            const sensorId = req.query.id ? Number(req.query.id) : 0;
            return Promise.resolve()
                .then(() => {
                    return this.broker.call('data.readSoilTemperature', { sensorId: sensorId }).then(result => {
                        res.send(result);
                    });
                })
                .catch(this.handleErr(res));
        },
        getAirTemperature(req, res) {
            const sensorId = req.query.id ? Number(req.query.id) : 0;
            return Promise.resolve()
                .then(() => {
                    return this.broker.call('data.readAirTemperature', { sensorId: sensorId }).then(result => {
                        res.send(result);
                    });
                })
                .catch(this.handleErr(res));
        },
        getRHpercent(req, res) {
            const sensorId = req.query.id ? Number(req.query.id) : 0;
            return Promise.resolve()
                .then(() => {
                    return this.broker.call('data.readRHPercent', { sensorId: sensorId }).then(result => {
                        res.send(result);
                    });
                })
                .catch(this.handleErr(res));
        },
        getWaterContent(req, res) {
            const sensorId = req.query.id ? Number(req.query.id) : 0;
            return Promise.resolve()
                .then(() => {
                    return this.broker.call('data.readWaterContent', { sensorId: sensorId }).then(result => {
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
        app.listen(this.settings.port);
        this.initRoutes(app);
        this.app = app;
    }
};