from flask import Flask, jsonify
from flask import request
import requests
from influxdb import InfluxDBClient
from datetime import datetime
from sys import stderr

# -------------------------------------------------------------------------------------------------

app = Flask(__name__)

COMMAND_URL = "http://command/api/Command/commands"

MIN_TAIR = 0
MAX_TAIR = 15 

MIN_TSOIL = 0
MAX_TSOIL = 7

MIN_RHPERCENT = 40
MAX_RHPERCENT = 80

MIN_WATERCONTENT = 0.05
MAX_WATERCONTENT = 0.15

# -------------------------------------------------------------------------------------------------

def print_log(*args, **kwargs):
    print(*args, file=stderr, **kwargs)

def turnWaterPumpOnOrOff(commandList, notificationList, sensorId, value, min, max):
    commandText = 'OFF'
    commandType = 'WATERPUMP'
    info = None

    if value < min:
        commandText = 'ON'
        info = 'Soil water content is too low'
    
    if value > max:
        commandText = 'OFF'
        info = 'Soil water content is too high'

    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")

    commandList.append({
        'sensorId': sensorId,
        'commandType': commandType,
        'commandText': commandText,
        'setValue': value
    })

    if info is not None:
        notificationList.append({
            "measurement": "notificationData",
            "tags": {
                "type": "notifications"
            },
            "time": current_time,
            "fields": {
                "info": info
            }
        })

def inreaseOrDecreaseLevel(commandList, notificationList, sensorId, value, commandType, min, max, paramName):
    commandText = None
    info = None

    if value < min:
        commandText = 'INCREASE'
        info = paramName + ' value is too low'
    elif value > max:
        commandText = 'DECREASE'
        info = paramName + ' value is too high'
    else:
        return
    
    now = datetime.now()
    current_time = str(now)

    commandList.append({
        'sensorId': sensorId,
        'commandType': commandType,
        'commandText': commandText,
        'setValue': value
    })

    if info is not None:
        notificationList.append({
            "measurement": "notificationData",
            "tags": {
                "type": "notifications"
            },
            "time": current_time,
            "fields": {
                "info": info
            }
        })

def evaluateData(airTemperature, soilTemperature, RHpercent, waterContent, sensorId):
    
    commandList = []
    notificationList = []

    inreaseOrDecreaseLevel(commandList, notificationList, sensorId, airTemperature, 'AIRCOOLER', MIN_TAIR, MAX_TAIR, 'Air temperature')

    inreaseOrDecreaseLevel(commandList, notificationList, sensorId, RHpercent, 'HUMIDIFIER', MIN_RHPERCENT, MAX_RHPERCENT, 'Relative humidity')

    turnWaterPumpOnOrOff(commandList, notificationList, sensorId, waterContent, MIN_WATERCONTENT, MAX_WATERCONTENT)
    
    return commandList, notificationList

# -------------------------------------------------------------------------------------------------

@app.route('/api/Analysis/getDatabaseName', methods = ['GET'])
def GetDatabaseName():
    if request.method == 'GET':
        return jsonify(client.get_list_database())

@app.route('/api/Analysis/queryAll', methods = ['GET'])
def GetData():
    if request.method == 'GET':
        results = client.query('SELECT * FROM "analytics"."autogen"."notificationData"')
        return jsonify(results)
    
@app.route('/api/Analysis/receiveData', methods = ['POST'])
def Post():
    if request.method == 'POST':

        print_log(request.json)
        
        commands, notificationData = evaluateData(request.json['airTemperature'], request.json['soilTemperature'], request.json['RHpercent'], request.json['waterContent'], request.json['sensorId'])

        for command in commands:
            res = requests.post(COMMAND_URL, json = command)
            print_log(res.text)

        result = client.write_points(notificationData)
        
        return jsonify({"Notifications saved to database" : str(result)})

# -------------------------------------------------------------------------------------------------

if __name__ == '__main__':
    client = InfluxDBClient(host = "influxanalytics", port = 8086, username = 'admin', password = 'admin')
    client.create_database('analytics')
    client.switch_database('analytics')
    app.run(debug = True, host = '0.0.0.0', port = 80)
