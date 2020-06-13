using Newtonsoft.Json;

namespace command.Models
{
    public class SetCommandParameterModel
    {
        public SetCommandParameterModel(float value)
        {
            Value = value;
        }

        [JsonProperty("value")]
        public float Value { get; set; }
    }
}