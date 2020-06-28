using Newtonsoft.Json;

namespace command.Models
{
    public class SetCommandParameterModel
    {
        [JsonProperty("value")]
        public float Value { get; set; }
    }
}