from flask import Flask, render_template, jsonify, request
from bokeh.plotting import figure
import requests
from bokeh.embed import components
from bokeh.models import AjaxDataSource, CustomJS
from sys import stderr
from bokeh.models.widgets import DataTable, TableColumn
from datetime import datetime
from bokeh.models.layouts import WidgetBox

# -------------------------------------------------------------------------------------------------

app = Flask(__name__)

TAIR_URL = 'http://gateway:3000/airTemperature?id=1'
TSOIL_URL = 'http://gateway:3000/soilTemperature?id=1'
RHPERCENT_URL = 'http://gateway:3000/RHpercent?id=1'
WATERCONTENT_URL = 'http://gateway:3000/waterContent?id=1'
NOTIFICATIONS_URL = 'http://gateway:3000/notifications'

# -------------------------------------------------------------------------------------------------

def print_log(*args, **kwargs):
    print(*args, file=stderr, **kwargs)

def getData(url, key, value):
    res = requests.get(url)
    pts = res.json()
    pts = pts[key]

    x = []
    y = []
    for i, data in enumerate(pts):
        y.append(data[value])
        x.append(i)
    return { 'x': x, 'y': y}
    
def makePlot(period, route, title, line_color):
    source = AjaxDataSource(data_url = request.url_root + route, polling_interval = period, method = 'GET', mode = 'replace')
    
    source.data = dict(x=[], y=[])
    
    plot = figure(plot_height = 200, plot_width = 500, sizing_mode = 'scale_width', title = title)
    
    plot.line('x', 'y', source = source, line_width = 4, line_color = line_color)  
    
    script, div = components(plot)
    
    return script, div

def makeTable(period, route):
    source = AjaxDataSource(data_url = request.url_root + route, polling_interval = period, method = 'GET', mode = 'replace')
    
    source.data = dict(x = [], y = [])
    colx = TableColumn(field = "x", title = "Time")
    coly = TableColumn(field = "y", title = "Info")
    table = DataTable(source = source, columns = [colx, coly], height = 300)
    
    script, div = components(table)
    
    return script, div

# -------------------------------------------------------------------------------------------------    

@app.route('/api/NotificationData', methods = ['GET'])
def GetNotificationData():
    if request.method == 'GET':
        x = []
        y = []
        
        res = requests.get(NOTIFICATIONS_URL)
        pts = res.json()
        pts = pts['data']['series'][0]['values']

        #print_log(pts)

        for notification in pts:
            x.append(notification[0])
            y.append(notification[1])

        return { 'x': x, 'y': y}

@app.route('/api/Dashboard', methods = ['GET'])
def ShowDashboard():
    if request.method == 'GET':
        #res = requests.get(TAIR_URL)
        #print_log(res.text)
        plots = []
        plots.append(makeAirTemperaturePlot())
        plots.append(makeSoilTemperaturePlot())
        plots.append(makeRHpercentPlot())
        plots.append(makeWaterContentPlot())
        table = makeTable(10000, '/api/NotificationData')
        
        return render_template('dashboard.html', plots = plots, table = table)

@app.route('/api/AirTemperature', methods = ['GET'])
def GetAirTemperature():
    if request.method == 'GET':
        return getData(TAIR_URL, 'data', 'airTemperature')

@app.route('/api/SoilTemperature', methods = ['GET'])
def GetSoilTemperature():
    if request.method == 'GET':
        return getData(TSOIL_URL, 'data', 'soilTemperature')

@app.route('/api/RHpercent', methods = ['GET'])
def GetRHpercent():
    if request.method == 'GET':
        return getData(RHPERCENT_URL, 'data', 'RHpercent')

@app.route('/api/WaterContent', methods = ['GET'])
def GetWaterContent():
    if request.method == 'GET':
        return getData(WATERCONTENT_URL, 'data', 'waterContent')

# -------------------------------------------------------------------------------------------------

def makeAirTemperaturePlot():
    return makePlot(10000, '/api/AirTemperature', "Air temperature on Y ", "gray")

def makeSoilTemperaturePlot():
    return makePlot(10000, '/api/SoilTemperature', "Soil temperature on Y ", "black")

def makeRHpercentPlot():
    return makePlot(10000, '/api/RHpercent', "RH percent on Y ", "red")

def makeWaterContentPlot():
    return makePlot(10000, '/api/WaterContent', "Water content on Y ", "blue")

# -------------------------------------------------------------------------------------------------

if __name__ == '__main__':
      app.run(debug = False, host = '0.0.0.0', port = 80)

