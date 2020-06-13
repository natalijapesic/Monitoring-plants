using Newtonsoft.Json;

namespace command.Actuators
{
    public class BaseActuator
    {

        public BaseActuator(float offset, float max, float min)
        {
            Offset = offset;
            MaxValue = max;
            MinValue = min;
        }
        
        [JsonProperty("offset")]
        public float Offset { get; set; }
        
        [JsonProperty("maxValue")]
        public float MaxValue { get; set; }
        
        [JsonProperty("minValue")]
        public float MinValue { get; set; }

        public bool valueInBounds(float value)
        {

            float newValue = value + Offset;
            if (newValue > MaxValue || newValue < MinValue)
                return false;
            return true;
        }

    }

}