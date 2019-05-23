//%color=#0B0B61 icon="\uf1eb" block="IoT"
namespace ESP8266 {

    //% shim=ESP8266::setSerialBuffer
    function setSerialBuffer(size: number): void {
        return null;
    }
    setSerialBuffer(128);

    // -------------- Initialization ----------------
    /**
     * Initialize the TX and RX pins for connecting the WiFi Module.
    */
    //%blockId=esp8266_initialize_wifi
    //%block="Initialize WiFi TX %tx|RX %rx|Baud rate %baudrate"
    //%baudrate.defl=BaudRate.BaudRate115200
    //% tx.fieldEditor="gridpicker" tx.fieldOptions.columns=3
    //% tx.fieldOptions.tooltips="false"
    //% rx.fieldEditor="gridpicker" rx.fieldOptions.columns=3
    //% rx.fieldOptions.tooltips="false"
    //% weight=82
    export function initializeWifi(tx: SerialPin, rx: SerialPin, baudrate: BaudRate): void {
        serial.redirect(tx, rx, baudrate);
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), () => {
            serial_str = serial.readString();

            if (serial_str.includes("WIFI GOT IP\r\n") && wificonn) {
                wificonnected();
            }
            if (serial_str.includes("WIFI DISCONNECT\r\n") && wifidisconn) {
                wifidisconnected();
            }
            if (serial_str.includes("+MQSTATUS:MQTT CONNECTED\r\n") && mqttconn) {
                mqttconnected();
            }
            if (serial_str.includes("+MQSTATUS:MQTT CLOSED\r\n") && mqttdisconn) {
                mqttdisconnected();
            }
            if (serial_str.includes("+MQD") && mqttOn) {
                if (serial_str.includes(mqtt_topic)) mqttflag = true;
            }
            if (serial_str.includes("AT+") && ATcommend) {
                let AT_pos: number = serial_str.indexOf("AT+");
                let AT_str: string = serial_str.substr(AT_pos, 32); // to be modified
                ATmessage(AT_str);
            }
            if (messaging) {
                tmpmessage(serial_str);
            }
            if (mqttflag) {
                let mqttmeg_pos: number = serial_str.indexOf(mqtt_topic)
                let mqttmeg: string = serial_str.substr(mqttmeg_pos + 3, )
                mqttmessage(serial_str);
                mqttflag = false;
            }
        })
    }

    // -------------- WiFi ----------------
    /**
     * Set the SSID and Password for the WiFi Module to connect.
    */
    //% blockId=esp8266_set_wifi
    //% block="Set WiFi to ssid %ssid| pwd %pwd | MQTT? %mqtton"
    //% mqtton.shadow="toggleOnOff"
    //% weight=81
    export function setWifi(ssid: string, pwd: string, mqtton: boolean): void {
        if (mqtton) {
            serial.writeString("AT+MQRES\r\n");
            basic.pause(1500);
            serial.writeString("AT+MQVER=4\r\n");
        }
        else {
            serial.writeString("AT+RST\r\n");
        }
        basic.pause(1500);
        serial.writeString("AT+CWMODE=1\r\n");
        basic.pause(100);
        serial.writeString("AT+CWJAP=\"" + ssid + "\",\"" + pwd + "\"\r\n");
        basic.pause(2000);
    }

    // -------------- Cloud Services ----------------
    /**
     * Send single data to ThingSpeak.
    */
    //% blockId=esp8266_set_thingspeak
    //% block="Send ThingSpeak key %key| field1 %field1"
    //% weight=78
    //%subcategory=ThingSpeak
    export function sendThingspeak(key: string, field1: string): void {
        let message = "GET /update?api_key=" + key + "&field1=" + field1 + "\r\n\r\n";
        serial.writeString("AT+CIPMUX=0\r\n");
        basic.pause(500);
        serial.writeString("AT+CIPSTART=\"TCP\",\"api.thingspeak.com\",80\r\n");
        basic.pause(1000);
        serial.writeString("AT+CIPSEND=" + message.length + "\r\n");
        basic.pause(500);
        serial.writeString(message);
        basic.pause(1000);
        serial.writeString("AT+CIPCLOSE\r\n");
    }

    /**
     * Send an array of data (aka mutiple data) to ThingSpeak.
    */
    //% blockId=esp8266_set_thingspeak_list
    //% block="Send ThingSpeak key %key| array %fields"
    //% weight=77
    //%subcategory=ThingSpeak
    export function sendThingspeakwithArray(key: string, fields: string[]): void {
        let message2 = "GET /update?api_key=" + key + "&";
        for (let i = 0; i < fields.length; i++) {
            if (i == fields.length - 1) {
                message2 = message2 + "field" + (i + 1) + "=" + fields[i];
            } else {
                message2 = message2 + "field" + (i + 1) + "=" + fields[i] + "&";
            }
        }
        message2 = message2 + "\r\n\r\n";
        serial.writeString("AT+CIPMUX=0\r\n");
        basic.pause(500);
        serial.writeString("AT+CIPSTART=\"TCP\",\"api.thingspeak.com\",80\r\n");
        basic.pause(1000);
        serial.writeString("AT+CIPSEND=" + message2.length + "\r\n");
        basic.pause(500);
        serial.writeString(message2);
        basic.pause(3000);
        serial.writeString("AT+CIPCLOSE\r\n");
    }

    //%block="test key %key| array %fields"
    export function testingMessage(key: string, fields: string[]): void {
        let message2 = "GET //test/ivan/iot/data_receive/?groupKey=" + key + "&";
        for (let i = 0; i < fields.length; i++) {
            if (i == fields.length - 1) {
                message2 = message2 + "valueAry[]" + (i + 1) + "=" + fields[i];
            } else {
                message2 = message2 + "valueAry[]" + (i + 1) + "=" + fields[i] + "&";
            }
        }
        message2 = message2 + "\r\n\r\n";
        serial.writeString("AT+CIPMUX=0\r\n");
        basic.pause(500);
        serial.writeString("AT+CIPSTART=\"TCP\",\"192.168.0.146\",31002\r\n");
        basic.pause(1000);
        serial.writeString("AT+CIPSEND=" + message2.length + "\r\n");
        basic.pause(500);
        serial.writeString(message2);
        basic.pause(3000);
        serial.writeString("AT+CIPCLOSE\r\n");
    }

    /**
     * Send single data to IFTTT Event Trigger.
    */
    //% blockId=esp8266_set_ifttt
    //% block="Send IFTTT key %key|event_name %eventname|value %value"
    //% weight=80
    //%subcategory=IFTTT
    export function sendIFTTT(key: string, eventname: string, value: string): void {
        let message3 = "GET /trigger/" + eventname + "/with/key/" + key + "?value1=" + value + " HTTP/1.1\r\nHost: maker.ifttt.com\r\nConnection: close\r\n\r\n";
        serial.writeString("AT+CIPMUX=0\r\n");
        basic.pause(500);
        serial.writeString("AT+CIPSTART=\"TCP\",\"maker.ifttt.com\",80\r\n");
        basic.pause(1000);
        serial.writeString("AT+CIPSEND=" + message3.length + "\r\n");
        basic.pause(500);
        serial.writeString(message3);
        basic.pause(1000);
        serial.writeString("AT+CIPCLOSE\r\n");
    }

    /**
     * Send an array of data (aka mutiple data) to IFTTT Event Trigger.
    */
    //% blockId=esp8266_set_ifttt_list
    //% block="Send IFTTT key %key|event_name %eventname|array %values"
    //% weight=79
    //%subcategory=IFTTT
    export function sendIFTTTwithArray(key: string, eventname: string, values: string[]): void {
        let message4 = "GET /trigger/" + eventname + "/with/key/" + key + "?";
        for (let j = 0; j < values.length; j++) {
            if (j == values.length - 1) {
                message4 = message4 + "value" + (j + 1) + "=" + values[j];
            } else {
                message4 = message4 + "value" + (j + 1) + "=" + values[j] + "&";
            }
        }
        message4 = message4 + " HTTP/1.1\r\nHost: maker.ifttt.com\r\nConnection: close\r\n\r\n";
        serial.writeString("AT+CIPMUX=0\r\n");
        basic.pause(500);
        serial.writeString("AT+CIPSTART=\"TCP\",\"maker.ifttt.com\",80\r\n");
        basic.pause(1000);
        serial.writeString("AT+CIPSEND=" + message4.length + "\r\n");
        basic.pause(500);
        serial.writeString(message4);
        basic.pause(3000);
        serial.writeString("AT+CIPCLOSE\r\n");
    }

    // -------------- MQTT & Event ----------------

    let serial_str: string = "";
    let mqtt_topic: string = "";
    let ATcommend: boolean = false;
    let wificonn: boolean = false;
    let wifidisconn: boolean = false;
    let mqttconn: boolean = false;
    let mqttdisconn: boolean = false;
    let messaging: boolean = false;
    let mqttOn: boolean = false;
    let mqttflag: boolean = false;

    type EvtStr = (data: string) => void;
    type EvtAct = () => void;

    let wificonnected: EvtAct = null;
    let wifidisconnected: EvtAct = null;
    let mqttconnected: EvtAct = null;
    let mqttdisconnected: EvtAct = null;
    let ATmessage: EvtStr = null;
    let tmpmessage: EvtStr = null;
    let mqttmessage: EvtStr = null;

    //%block="MQTT connected"
    //%subcategory=MQTT
    export function MQTTconnected(body: () => void) {
        mqttconn = true;
        mqttconnected = body;
    }

    //%block="MQTT disconnected"
    //%subcategory=MQTT
    export function MQTTdisconnected(body: () => void) {
        mqttdisconn = true;
        mqttdisconnected = body;
    }

    //%block="AT message"
    //%draggableParameters
    export function ATreceive(body: (ReceivedATMessage: string) => void) {
        ATcommend = true;
        ATmessage = body;
    }

    //%block="MQTT receive from topic %topic"
    //%subcategory=MQTT
    //%draggableParameters
    export function mqttreceive(topic: string, body: (ReceivedMQTTMessage: string) => void) {
        mqttOn = true;
        mqtt_topic = topic;
        mqttmessage = body;

    }

    //%block="Serial read message"
    //%draggableParameters
    export function messager(body: (message: string) => void) {
        messaging = true;
        tmpmessage = body;
    }

    //%block="MQTT connect server %server | port %port | ID %ID | user %name | password %pwd"
    //%blockExternalInputs=true
    //%subcategory=MQTT
    export function mqttstart(server: string, port: string, ID: string, name: string, pwd: string): void {
        serial.writeString("AT+MQIPPORT=\"" + server + "\"," + port + "\r\n");
        basic.pause(1000);
        serial.writeString("AT+MQCLIENTID=\"" + ID + "\"\r\n");
        basic.pause(1000);
        serial.writeString("AT+MQUSERPWD=\"" + name + "\",\"" + pwd + "\"\r\n");
        basic.pause(1000);
        serial.writeString("AT+RST\r\n");
        basic.pause(10000);
        serial.writeString("AT+MQSTART\r\n");
        basic.pause(500);
    }

    //%block="MQTT send topic %topic| message %message"
    //%subcategory=MQTT
    export function mqttsend(topic: string, message: string): void {
        let strlen: number = message.length + 1;
        serial.writeString("AT+MQPUBLISH=\"" + topic + "\"," + strlen + "\r\n");
        basic.pause(500);
        serial.writeString(message + "\r\n");
        basic.pause(1000);
    }

    //%block="MQTT subscribe to topic %topic"
    //%subcategory=MQTT
    export function mqttsub(topic: string): void {
        serial.writeString("AT+MQSUBSCRIBE=\"" + topic + "\",1\r\n");
        basic.pause(1000);
    }

    //%block="On Wifi connected"
    export function Wificonnected(body: () => void) {
        wificonn = true;
        wificonnected = body;
    }

    //%block="On Wifi disconnected"
    export function Wifidisconnected(body: () => void) {
        wifidisconn = true;
        wifidisconnected = body;
    }

    /** Convert a number to a string. */
    //%blockId=make_string
    //%block="number to string %target"
    //%weight=0
    export function make_string(target: number): string {
        return target.toString();
    }

}
