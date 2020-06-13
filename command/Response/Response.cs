using System.Net.Http;
using System.Text;
using command.Actuators;

namespace command.Responses
{
    public class Response
    {

        public Response(string response, string data, bool sendData, string requestUri)
        {
            ResponseText = response;
            Data = new StringContent(data, Encoding.UTF8, "application/json");
            SendData = sendData;
            RequestUri = requestUri;
        }

        public string ResponseText { get; set; }
        public StringContent Data { get; set; }

        // true - Send data
        // false - Don't send just log
        public bool SendData { get; set; }
        
        public string RequestUri { get; set; }

    }

}