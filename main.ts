//% weight=100 color=#F59E20 icon="\uf1eb" block="esp8266"
namespace ESP8266 {
    // -------------- Initialization ----------------
    /**
     * Initialize the TX and RX pins for connecting the WiFi Module.
    */
    //%blockId=esp8266_initialize_wifi
    //%block="Initialize WiFi TX %tx|RX %rx"
    //% tx.fieldEditor="gridpicker" tx.fieldOptions.columns=3
    //% tx.fieldOptions.tooltips="false"
    //% rx.fieldEditor="gridpicker" rx.fieldOptions.columns=3
    //% rx.fieldOptions.tooltips="false"
    //% weight=82
    //% blockGap=7  
    export function initializeWifi(tx: SerialPin, rx:SerialPin): void {
        serial.redirect(tx,rx,BaudRate.BaudRate115200);
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), () => {});
    }
    
    // -------------- WiFi ----------------
    /**
     * Set the SSID and Password for the WiFi Module to connect.
    */
    //% blockId=esp8266_set_wifi
    //% block="Set WiFi to ssid %ssid| pwd %pwd"   
    //% weight=81  
    //% blockGap=7  
    export function setWifi(ssid: string, pwd: string): void {
        serial.writeString("AT+RST\r\n");
        serial.writeString("AT+CWMODE=1\r\n");
        serial.writeString("AT+CWJAP=\"" + ssid + "\",\"" + pwd + "\"\r\n");
    }

    // -------------- Cloud Services ----------------
    /**
     * Send single data to ThingSpeak.
    */
    //% blockId=esp8266_set_thingspeak
    //% block="Send ThingSpeak key %key| field1 %field1"
    //% weight=78
    //% blockGap=7  
    export function sendThingspeak(key: string, field1: number): void {
        let message = "GET /update?api_key=" + key + "&field1=" + field1 + "\r\n\r\n";
        serial.writeString("AT+CIPMUX=0\r\n");
        serial.writeString("AT+CIPSTART=\"TCP\",\"api.thingspeak.com\",80\r\n");
        basic.pause(1000);
        serial.writeString("AT+CIPSEND=" + message.length + "\r\n");
        serial.writeString(message);
        serial.writeString("AT+CIPCLOSE\r\n");
    }

    /**
     * Send an array of data (aka mutiple data) to ThingSpeak.
    */
    //% blockId=esp8266_set_thingspeak_list
    //% block="Send ThingSpeak key %key| array %fields"
    //% weight=77
    //% blockGap=7  
    export function sendThingspeakwithArray(key: string, fields: number[]): void {
        let message = "GET /update?api_key=" + key + "&";
        for(let i=0;i<fields.length;i++){
            if (i == fields.length-1){
                message = message + "field" + (i+1) + "=" + fields[i];
            }else{
                message = message + "field" + (i+1) + "=" + fields[i] + "&";
            }
        }
        message = message + "\r\n\r\n";
        serial.writeString("AT+CIPMUX=0\r\n");
        serial.writeString("AT+CIPSTART=\"TCP\",\"api.thingspeak.com\",80\r\n");
        basic.pause(1000);
        serial.writeString("AT+CIPSEND=" + message.length + "\r\n");
        serial.writeString(message);
        serial.writeString("AT+CIPCLOSE\r\n");
    }
    
    /**
     * Send single data to IFTTT Event Trigger.
    */
    //% blockId=esp8266_set_ifttt
    //% block="Send IFTTT key %key|event_name %eventname|value %value"
    //% weight=80   
    //% blockGap=7  
    export function sendIFTTT(key: string, eventname: string, value: number): void {
        let message = "GET /trigger/" + eventname + "/with/key/" + key + "?value1=" + value + " HTTP/1.1\r\nHost: maker.ifttt.com\r\nConnection: close\r\n\r\n";
        serial.writeString("AT+CIPMUX=0\r\n");
        serial.writeString("AT+CIPSTART=\"TCP\",\"maker.ifttt.com\",80\r\n");
        basic.pause(1000);
        serial.writeString("AT+CIPSEND=" + message.length + "\r\n");
        serial.writeString(message);
        serial.writeString("AT+CIPCLOSE\r\n");
    }

    /**
     * Send an array of data (aka mutiple data) to IFTTT Event Trigger.
    */
    //% blockId=esp8266_set_ifttt_list
    //% block="Send IFTTT key %key|event_name %eventname|array %values"
    //% weight=79
    //% blockGap=7  
    export function sendIFTTTwithArray(key: string, eventname: string, values: number[]): void {
        let message = "GET /trigger/" + eventname + "/with/key/" + key + "?";
        for(let i=0;i<values.length;i++){
            if (i == values.length-1){
                message = message + "value" + (i+1) + "=" + values[i];
            }else{
                message = message + "value" + (i+1) + "=" + values[i] + "&";
            }
        }
        message = message + " HTTP/1.1\r\nHost: maker.ifttt.com\r\nConnection: close\r\n\r\n";
        serial.writeString("AT+CIPMUX=0\r\n");
        serial.writeString("AT+CIPSTART=\"TCP\",\"maker.ifttt.com\",80\r\n");
        basic.pause(1000);
        serial.writeString("AT+CIPSEND=" + message.length + "\r\n");
        serial.writeString(message);
        serial.writeString("AT+CIPCLOSE\r\n");
    }

}