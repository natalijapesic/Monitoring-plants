using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using command.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using command.Responses;
using command.Actuators;

namespace command.Controllers
{
    [ApiController]
    [Route("/api/[controller]")]
    public class CommandController : ControllerBase
    {
        private static BaseActuator humidifier = new BaseActuator(5, 100, 0);

        private static BaseActuator waterPump = new BaseActuator(1, 80, 0);

        private static BaseActuator airCooler = new BaseActuator(0.5f, 30 , -30);
        public CommandController()
        {
        }

        [HttpGet("getCommands")] 
        public ActionResult<string> Get() 
        {
            List<string> commandText = new List<string>();
            commandText.Add("INCREASE");
            commandText.Add("DECREASE");
            commandText.Add("ON");
            commandText.Add("OFF");
            commandText.Add("SET");

            List<string> commandType = new List<string>();
            commandType.Add("AIRCOOLER");
            commandType.Add("WATERPUMP");
            commandType.Add("HUMIDIFIER");

            string response = JsonConvert.SerializeObject(new CommandInfoModel(commandType, commandText, humidifier, waterPump, airCooler));
                  
            return new JsonResult(
                new 
                {
                    message = response 
                }
            );
        }

        private string GetActuatorCommandParameters(BaseActuator actuator) 
        {
            return JsonConvert.SerializeObject(actuator);
        }

        [HttpGet("getHumidifierParameters")] 
        public ActionResult<string> GetHumidifierParameters() 
        {
            return new JsonResult(
                new 
                {
                    message = GetActuatorCommandParameters(humidifier) 
                }
            );
        }

        [HttpGet("getWaterPumpParameters")] 
        public ActionResult<string> GetWaterPumpParameters() 
        {
            return new JsonResult(
                new 
                {
                    message = GetActuatorCommandParameters(waterPump) 
                }
            );
        }

        [HttpGet("getAirCoolerParameters")] 
        public ActionResult<string> GetAirCoolerParameters() 
        {
            return new JsonResult(
                new 
                {
                    message = GetActuatorCommandParameters(airCooler) 
                }
            );
        }

        private string determineRequestUri(string commandText, string commandType)
        {
            string requestUri = "http://gateway:3000/";

            switch(commandText) {
                case "ON":
                case "OFF":
                    requestUri += "turnOnOrOff";
                    break;
                case "INCREASE":
                case "DECREASE":
                    requestUri += "addOffset";
                    break;
                case "SET":
                    requestUri += "setValue";
                    break;
                default: 
                    break;
            }

            switch(commandType) {
                case "HUMIDIFIER":
                    requestUri += "/humidifier";
                    break;
                case "AIRCOOLER":
                    requestUri += "/airCooler";
                    break;
                case "WATERPUMP":
                    requestUri += "/waterPump";
                    break;
                default: 
                    break;
            }

            return requestUri;

        }

        private bool goodCommandFormat(string commandText, string commandType)
        {   
            bool goodText = false;
            bool goodType = false;

             switch(commandText) {
                case "ON":
                case "OFF":
                case "INCREASE":
                case "DECREASE":
                case "SET":
                    goodText = true;
                    break;
                default: 
                    break;
            }
            
            switch(commandType) {
                case "HUMIDIFIER":
                case "AIRCOOLER":
                case "WATERPUMP":
                    goodType = true;
                    break;
                default: 
                    break;
            }

            if(goodType && goodText)
                return true;

            return false;

        }

       private Response getResponseValues(int sensorId, string commandText, string commandType, float value)
       {
            string json = null;
                
            BaseActuator actuator = null;

            if(!goodCommandFormat(commandText, commandType))
                return new Response("Bad command format!", "Command not recognized", false, "");

            string requestUri = determineRequestUri(commandText, commandType);

            float offset = 0;

            switch(commandType) {
                case "HUMIDIFIER":
                    actuator = humidifier;
                    break;
                case "AIRCOOLER":
                    actuator = airCooler;
                    break;
                case "WATERPUMP":
                    actuator = waterPump;
                    break;
                default: 
                    break;
            }

            offset = actuator.Offset;
                
            switch(commandText) {
                case "ON":
                case "OFF":
                    bool actuatorOn = false;
                    if(commandText.Equals("ON"))
                        actuatorOn = true;
                    else if (commandText.Equals("OFF"))
                        actuatorOn = false;

                    json = JsonConvert.SerializeObject(new TurnOnOrOffCommandModel(sensorId, actuatorOn));
                    break;
                case "DECREASE":
                case "INCREASE":
                    if(commandText == "DECREASE")
                        offset *= -1;
                    if(!actuator.valueInBounds(value))
                        return new Response("New value not in [MIN, MAX] bounds", "Command not sent (new value out of bounds)", false, "");
                        json = JsonConvert.SerializeObject(new AddOffsetCommandModel(sensorId, offset));
                    break;
                case "SET":
                    json = JsonConvert.SerializeObject(new SetValueCommandModel(sensorId, value));
                    break;
                default:
                    break;
            }
            return new Response("Command OK!", json, true, requestUri);
        }

        [HttpPost("commands")]
        public async Task<IActionResult> Post(AnalyticsData data)
        {
            
            Console.WriteLine("Received POST request with payload:");
            Console.WriteLine(JsonConvert.SerializeObject(data));

            Response responseValues = getResponseValues(data.SensorId, data.CommandText, data.CommandType, data.SetValue);

            if(responseValues.SendData)
            { 
                using (var httpClient = new HttpClient())
                    {
                        using (var response = await httpClient.PutAsync(responseValues.RequestUri, responseValues.Data))
                        {
                            string apiResponse = await response.Content.ReadAsStringAsync();
                            Console.WriteLine(apiResponse);
                            return new JsonResult(new { message = responseValues.ResponseText});
                        }
                    }
            }
            
            Console.WriteLine(responseValues.Data.ToString());

            return new JsonResult(
                new 
                {
                    message = responseValues.ResponseText 
                }
            );
        }

        private void ModifyData(BaseActuator actuator, string parameter, float value)
        {
            switch(parameter) {
                case "OFFSET":
                    actuator.Offset = value;
                    break;
                case "MIN":
                    actuator.MinValue = value;
                    break;
                case "MAX":
                    actuator.MaxValue = value;
                    break;
                default:
                    break;
            }
        }

        private JsonResult PutRequest(BaseActuator actuator, string parameter, SetCommandParameterModel data) 
        {
            Console.WriteLine("Received PUT request with payload:");
            Console.WriteLine(JsonConvert.SerializeObject(data));

            ModifyData(actuator, parameter, data.Value);

            return new JsonResult(
                new 
                {
                    message = "Parameter set!" 
                }
            );
        }

        [HttpPut("setOffset/humidifier")]
        public ActionResult<string> PutHumidifierOffset (SetCommandParameterModel data)
        {
            return PutRequest(humidifier, "OFFSET", data);
        }
 
        [HttpPut("setOffset/waterPump")]
        public ActionResult<string> PutWaterPumpOffset (SetCommandParameterModel data)
        {
            return PutRequest(waterPump, "OFFSET", data);
        }

        [HttpPut("setOffset/airCooler")]
        public ActionResult<string> PutAirCoolerOffset (SetCommandParameterModel data)
        {
            return PutRequest(airCooler, "OFFSET", data);
        }

        [HttpPut("setMax/humidifier")]
        public ActionResult<string> PutHumidifierMax (SetCommandParameterModel data)
        {
           return PutRequest(humidifier, "MAX", data);
        }

        [HttpPut("setMax/waterPump")]
        public ActionResult<string> PutWaterPumpMax (SetCommandParameterModel data)
        {
            return PutRequest(waterPump, "MAX", data);
        }

        [HttpPut("setMax/airCooler")]
        public ActionResult<string> PutAirCoolerMax (SetCommandParameterModel data)
        {
            return PutRequest(airCooler, "MAX", data);
        }

        [HttpPut("setMin/humidifier")]
        public ActionResult<string> PutHumidifierMin (SetCommandParameterModel data)
        {
            return PutRequest(humidifier, "MIN", data);
        }
       
        [HttpPut("setMin/waterPump")]
        public ActionResult<string> PutWaterPumpMin (SetCommandParameterModel data)
        {
            return PutRequest(waterPump, "MIN", data);
        }

        [HttpPut("setMin/airCooler")]
        public ActionResult<string> PutAirCoolerMin (SetCommandParameterModel data)
        {
            return PutRequest(airCooler, "MIN", data);
        }
    }
}