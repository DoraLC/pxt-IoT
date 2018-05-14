//% weight=100 color=#F59E20 icon="\uf1eb" block="esp8266"
namespace ESP8266 {
	let flag = true;
	
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
    	serial.writeLine("AT+CIPSTART=\"TCP\",\"api.thingspeak.com\",80");
    	serial.writeLine("AT+CIPSEND=" + message.length);
    	serial.writeLine("GET " + message);
    	serial.writeLine("AT+CIPCLOSE");
    }
	
    //% blockId=esp8266_set_ifttt
	//% block="Send IFTTT key %key|event_name %event|value1 %value1|value2 %value2"
	//% weight=60	
    export function sendIFTTT(key: string, eventname: string, value1: number, value2: number): void {
        serial.writeLine("(AT+ifttt?key=" + key+"&event="+eventname+"&value1="+value1+"&value2="+value2+")"); 
    }
	


}