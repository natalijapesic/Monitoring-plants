from flask import Flask, render_template, jsonify, request
from bokeh.plotting import figure
import requests
from bokeh.embed import components
from bokeh.models import AjaxDataSource, CustomJS
from sys import stderr

# -------------------------------------------------------------------------------------------------

app = Flask(__name__)

TAIR_URL = 'http://gateway:3000/airTemperature?id=1'
TSOIL_URL = 'http://gateway:3000/soilTemperature?id=1'
RHPERCENT_URL = 'http://gateway:3000/RHpercent?id=1'
WATERCONTENT_URL = 'http://gateway:3000/waterContent?id=1'

# -------------------------------------------------------------------------------------------------

def print_log(*args, **kwargs):
    print(*args, file=stderr, **kwargs)

def getData(url, key, value):
    res = requests.get(url)
    pts = res.json()
    pts = pts[key]
    #print_log(pts)
    x = []
    y = []
    for i, data in enumerate(pts):
        y.append(data[value])
        x.append(i)
    return { 'x': x, 'y': y}

def makePlot(period, route):
    source = AjaxDataSource(data_url = request.url_root + route, polling_interval = period, method = 'GET', mode = 'replace')
    
    source.data = dict(x=[], y=[])
    
    plot = figure(plot_height = 300, sizing_mode = 'scale_width')
    
    plot.line('x', 'y', source = source, line_width = 4)  
    
    script, div = components(plot)
    
    return script, div
# -------------------------------------------------------------------------------------------------    

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
        return render_template('dashboard.html', plots = plots)

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
    return makePlot(10000, '/api/AirTemperature')

def makeSoilTemperaturePlot():
    return makePlot(10000, '/api/SoilTemperature')

def makeRHpercentPlot():
    return makePlot(10000, '/api/RHpercent')

def makeWaterContentPlot():
    return makePlot(10000, '/api/WaterContent')      

# -------------------------------------------------------------------------------------------------

if __name__ == '__main__':
    app.run(debug = True, host = '0.0.0.0', port = 80)
