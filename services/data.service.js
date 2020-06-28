"use strict";

const request = require('request');
const Influx = require('influx');

module.exports = {
	name: "data",
	actions: {
		writeParametersToDatabase: {
			params: {
				sensorId: { type: "number" },
				soilTemperature: { type: "number" },
				airTemperature: { type: "number" },
				RHpercent: { type: "number" },
				waterContent: { type: "number" },
				timeStamp: { type: "string" }
			},
			async handler(ctx) {
				console.log(
					'Received "writeParametersToDatabase" post request with payload: ',
					ctx.params
				);
			 	this.influx.writePoints(
					 this.getWritePoints(ctx.params)
				 );
				this.sendParameters(ctx.params.airTemperature, ctx.params.soilTemperature, ctx.params.RHpercent, ctx.params.waterContent, ctx.params.sensorId); 
			
				return "Data saved to database";
			}
		},
		readSoilTemperature: {
			params: {
				sensorId: { type: "number" }
			},
			async handler(ctx) {
				try {
					const res = await this.influx.query(
						`select * from soilTemperature where sensorId=${ctx.params.sensorId}`
					);
					return { data: res };
				}
				catch(err) {
					console.log(err);
					return null;
				}
			}
        },
        readAirTemperature: {
			params: {
				sensorId: { type: "number" }
			},
			async handler(ctx) {
				try {
					const res = await this.influx.query(
						`select * from airTemperature where sensorId=${ctx.params.sensorId}`
					);
					return { data: res };
				}
				catch(err) {
					console.log(err);
					return null;
				}
			}
        },
        readRHPercent: {
			params: {
				sensorId: { type: "number" }
			},
			async handler(ctx) {
				try {
					const res = await this.influx.query(
						`select * from RHpercent where sensorId=${ctx.params.sensorId}`
					);
					return { data: res };
				}
				catch(err) {
					console.log(err);
					return null;
				}
			}
        },
        readWaterContent: {
			params: {
				sensorId: { type: "number" }
			},
			async handler(ctx) {
				try {
					const res = await this.influx.query(
						`select * from waterContent where sensorId=${ctx.params.sensorId}`
					);
					return { data: res };
				}
				catch(err) {
					console.log(err);
					return null;
				}
			}
		}
	},
	methods: {
		sendParameters(airTemperature, soilTemperature, RHpercent, waterContent, sensorId) {
			const body = {
				airTemperature: airTemperature,
				soilTemperature: soilTemperature,
                RHpercent: RHpercent,
                waterContent: waterContent,
                sensorId: sensorId
			};
			console.log(body);
			request.post(process.env.ANALYTICS_URL + '/receiveData', {
				json: body
			}, (err, res, body) => {
				if (err) {
					console.log(err);
					return;
				}
				console.log(res.statusCode);
				console.log(body);
			});
		},
		getWritePoints(payload) {
			const result = [
				{
					measurement: 'soilTemperature',
					fields: {
						soilTemperature: payload.soilTemperature,
						sensorId: payload.sensorId
					},
					time: payload.timeStamp
				},
				{
					measurement: 'airTemperature',
					fields: {
						airTemperature: payload.airTemperature,
						sensorId: payload.sensorId
					},
					time: payload.timeStamp
				},
				{
					measurement: 'RHpercent',
					fields: {
						RHpercent: payload.RHpercent,
						sensorId: payload.sensorId
					},
					time: payload.timeStamp
				},
				{
					measurement: 'waterContent',
					fields: {
						waterContent: payload.waterContent,
						sensorId: payload.sensorId
					},
					time: payload.timeStamp
				}
			]
			return result;
		}
	},
	events: {
		"device.parametersRead": {
			group: "other",
			handler(payload) {
			    console.log(
					'Received "device.parametersRead" event with payload: ',
					payload
				);
				this.influx.writePoints(
					this.getWritePoints(payload)
				);
				this.sendParameters(payload.airTemperature, payload.soilTemperature, payload.RHpercent, payload.waterContent, payload.sensorId);
			}
		}
	},
	created() {
		this.influx = new Influx.InfluxDB({
			host: process.env.INFLUXDB_HOST || 'influxdata',
			database: process.env.INFLUXDB_DATABASE || 'plants',
			username: process.env.ADMIN_USER || 'admin',
			password: process.env.ADMIN_PASSWORD || 'admin',
			schema: [
				{
					measurement: 'soilTemperature',
					fields: {
						sensorId: Influx.FieldType.INTEGER,
						soilTemperature: Influx.FieldType.FLOAT,
					},
					tags: ['host'],
                },
                {
					measurement: 'airTemperature',
					fields: {
						sensorId: Influx.FieldType.INTEGER,
						airTemperature: Influx.FieldType.FLOAT,
					},
					tags: ['host'],
                },
                {
					measurement: 'RHpercent',
					fields: {
						sensorId: Influx.FieldType.INTEGER,
						RHpercent: Influx.FieldType.FLOAT,
					},
					tags: ['host'],
                },
                {
					measurement: 'waterContent',
					fields: {
						sensorId: Influx.FieldType.INTEGER,
						waterContent: Influx.FieldType.FLOAT,
					},
					tags: ['host'],
				}
			]
		});
		this.influx.getDatabaseNames().then((names) => {
			if (!names.includes('plants')) {
			  return this.influx.createDatabase('plants');
			}
			return null;
		});
	}
};