using Newtonsoft.Json;

namespace command.Models
{
    public class AnalyticsData
    {
        [JsonProperty("sensorId")]
        public int SensorId { get; set; }
        
        [JsonProperty("commandType")]
        public string CommandType { get; set; }

        [JsonProperty("commandText")]
        public string CommandText { get; set; }
      
        [JsonProperty("setValue")]
        public float SetValue { get; set; }
    }
}