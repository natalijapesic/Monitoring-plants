from flask import Flask, jsonify
from flask import request
import requests
from influxdb import InfluxDBClient
from datetime import datetime
from sys import stderr

# -------------------------------------------------------------------------------------------------

app = Flask(__name__)

COMMAND_URL = "http://command/api/Command/commands"

# -------------------------------------------------------------------------------------------------

def print_log(*args, **kwargs):
    print(*args, file=stderr, **kwargs)

def evaluateData(airTemperature, soilTemperature, RHpercent, waterContent, sensorId):
    command = { 'sensorId': sensorId,
                'commandType': 'HUMIDIFIER',
                'commandText': 'SET',
                'setValue': -1
    }
    
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")

    notificationInfo = "Temperature too high! Turning air cooler ON."

    notificationData = [{
            "measurement": "notificationData",
            "tags": {
                "type": "notifications"
            },
            "time": current_time,
            "fields": {
                "info": notificationInfo
            }
        }]
    
    return notificationData, command

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
        
        notificationData, command = evaluateData(request.json['airTemperature'], request.json['soilTemperature'], request.json['RHpercent'], request.json['waterContent'], request.json['sensorId'])

        res = requests.post(COMMAND_URL, json = command)
        print_log(res.text)

        result = client.write_points(notificationData)
        
        return jsonify({"Notification saved to database" : str(result), "message": str(res.json)})

# -------------------------------------------------------------------------------------------------

if __name__ == '__main__':
    client = InfluxDBClient(host="influxanalytics", port=8086, username='admin', password='admin')
    client.create_database('analytics')
    client.switch_database('analytics')
    app.run(debug=True, host='0.0.0.0', port=80)
