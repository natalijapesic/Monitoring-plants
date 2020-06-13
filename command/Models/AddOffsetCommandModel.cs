using Newtonsoft.Json;

namespace command.Models
{
    public class AddOffsetCommandModel
    {

        public AddOffsetCommandModel(int sensorId, float offset)
        {
            this.SensorId = sensorId;
            this.Offset = offset;
        }

        [JsonProperty("sensorId")]
        public int SensorId { get; set; }
        
        [JsonProperty("offset")]
        public float Offset { get; set; }

    }
}