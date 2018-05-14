//% weight=100 color=#F59E20 icon="\uf1eb" block="esp8266"
namespace ESP8266 {
	// -------------- 1. Initialization ----------------
    //%blockId=esp8266_initialize_wifi
    //%block="Initialize WiFi"
	//% weight=90	
	//% blockGap=7	
    export function initializeWifi(): void {
        serial.redirect(SerialPin.P16,SerialPin.P8,BaudRate.BaudRate115200);
    }
	
	// -------------- 2. WiFi ----------------
    //% blockId=esp8266_set_wifi
	//% block="Set wifi to ssid %ssid| pwd %pwd"   
	//% weight=80		
	//% blockGap=7	
    export function setWifi(ssid: string, pwd: string): void {
    	serial.writeString("AT+RST\r\n");
    	serial.writeString("AT+CWMODE=1\r\n");
        serial.writeString("AT+CWJAP=\"" + ssid + "\",\"" + pwd + "\"\r\n");
    }

	// -------------- 3. Cloud ----------------
    //% blockId=esp8266_set_thingspeak
	//% block="Send ThingSpeak key %key| field1 %field1"
	//% weight=70	
	//% blockGap=7	
    export function sendThingspeak(key: string, field1: number): void {
    	let message = "/update?api_key=" + key + "&field1=" + field1 + "\r\nHost: api.thingspeak.com\r\n\r\n";
    	serial.writeString("AT+CIPSTART=\"TCP\",\"api.thingspeak.com\",80\r\n");
    	serial.writeString("AT+CIPSEND=" + message.length + "\r\n");
    	serial.writeString("GET " + message);
    	serial.writeString("AT+CIPCLOSE\r\n");
    }
	
    //% blockId=esp8266_set_ifttt
	//% block="Send IFTTT key %key|event_name %event|value1 %value1|value2 %value2"
	//% weight=60	
    export function sendIFTTT(key: string, eventname: string, value1: number, value2: number): void {
    	let message = "/trigger/" + event_name + "/with/key/" + key + "?value1=" + value1 + "&value2=" + value2 + "\r\nHost: maker.ifttt.com\r\n\r\n";
    	serial.writeString("AT+CIPSTART=\"TCP\",\"maker.ifttt.com\",80\r\n");
    	serial.writeString("AT+CIPSEND=" + message.length + "\r\n");
    	serial.writeString("GET " + message);
    	serial.writeString("AT+CIPCLOSE\r\n");
    }

}