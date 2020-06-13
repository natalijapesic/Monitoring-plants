using Newtonsoft.Json;
using System.Collections.Generic;
using command.Actuators;

namespace command.Models
{
    public class CommandInfoModel
    {
        
        public CommandInfoModel(List<string> commandType, List<string> commandText, BaseActuator humidifier, BaseActuator waterPump, BaseActuator airCooler)
        {
            CommandText = commandText;
            CommandType = commandType;

            Humidifier = humidifier;
            WaterPump = waterPump;
            AirCooler = airCooler;

        }

        [JsonProperty("commandType")]
        public List<string> CommandType { get; set; }
        
        [JsonProperty("commandText")]
        public List<string> CommandText { get; set; }

        [JsonProperty("humidifierActuatorParams")]
        public BaseActuator Humidifier { get; set; }

        [JsonProperty("waterPumpActuatorParams")]
        public BaseActuator WaterPump { get; set; }

        [JsonProperty("airCoolerActuatorParams")]
        public BaseActuator AirCooler { get; set; }

    }
}