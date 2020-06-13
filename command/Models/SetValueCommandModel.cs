using Newtonsoft.Json;

namespace command.Models
{
    public class SetValueCommandModel
    {

        public SetValueCommandModel(int sensorId, float value)
        {
            this.SensorId = sensorId;
            this.Value = value;
        }

        [JsonProperty("sensorId")]
        public int SensorId { get; set; }
        
        [JsonProperty("value")]
        public float Value { get; set; }

    }
}