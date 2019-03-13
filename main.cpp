#include <stdlib.h>
#include "pxt.h"

using namespace std;

namespace ESP8266 {

    //%
    void setSerialBuffer(int size) {
        uBit.serial.setRxBufferSize(size);
        uBit.serial.setTxBufferSize(size);
    }
} 
