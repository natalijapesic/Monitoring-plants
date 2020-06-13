using Newtonsoft.Json;

namespace command.Models
{
    public class TurnOnOrOffCommandModel
    {

        public TurnOnOrOffCommandModel(int sensorId, bool value)
        {
            this.SensorId = sensorId;
            this.Value = value;
        }

        [JsonProperty("sensorId")]
        public int SensorId { get; set; }
        
        [JsonProperty("value")]
        public bool Value { get; set; }

    }
}