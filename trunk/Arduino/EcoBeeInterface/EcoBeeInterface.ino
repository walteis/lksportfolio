/*
 
 */

#include "EmonLib.h"           // Include Emon Library

// Instanciate EnergyMonitors for Controls
EnergyMonitor emon_G;        // Fan (G)
EnergyMonitor emon_Y;        // Cool (Y)
EnergyMonitor emon_Acc1;     // Low Fan (Accessory 1) 
EnergyMonitor emon_W;        // Heat (W O/B)

// set pins for controlling relays 1 to 4
const int PIN_FAN_HIGH_RELAY =  7;
const int PIN_COMPRESSOR_RELAY =  6;
const int PIN_FAN_LOW_RELAY =  5;
const int PIN_HEAT_RELAY =  4;

// set analog pins for monitoring thermostat functions
const int PIN_G =  0;
const int PIN_Y =  1;
const int PIN_ACC1 =  2;
const int PIN_W =  3;

boolean relay_Fan_High_on =  false;
boolean relay_Compressor_on =  false;
boolean relay_Fan_Low_on =  false;
boolean relay_Heat_on =  false;

int pin_G_V = 0;
int pin_Y_V = 0;
int pin_Acc1_V = 0;
int pin_W_V = 0;

void setup() {

  initRelayStates();            // Set output pins and initial states

    // Set voltage monitors on analog pins
  emon_G.voltage(PIN_G, 220.0, 1.5);     // Voltage: input pin, calibration, phase_shift
  emon_Y.voltage(PIN_Y, 220.0, 1.5);     // Voltage: input pin, calibration, phase_shift
  emon_Acc1.voltage(PIN_ACC1, 220.0, 1.5);  // Voltage: input pin, calibration, phase_shift
  emon_W.voltage(PIN_W, 220.0, 1.5);     // Voltage: input pin, calibration, phase_shift

  // Open serial communications and wait for port to open:
  Serial.begin(9600);
  Serial.println("Arduino Controlled EcoBee (9600baud)");
}

void loop() {

  // Calculate all. No.of crossings, time-out
  emon_G.calcVI(10,100);          
  emon_Y.calcVI(10,100);          
  emon_Acc1.calcVI(10,100);          
  emon_W.calcVI(10,100);          

 

  pin_G_V = map(emon_G.Vrms,0,100,0,100);
  pin_Y_V = map(emon_Y.Vrms,0,100,0,100);
  pin_Acc1_V = map(emon_Acc1.Vrms,0,100,0,100);
  pin_W_V = map(emon_W.Vrms,0,100,0,100);

  if (pin_Y_V == 0 && pin_G_V == 0 && pin_Acc1_V != 0) {
    // When stage 1 cool is called for
    //  1. Turn off high fan
    //  2. Turn on low fan
    //  3. Turn off heat
    //  4. Turn on compressor

    // Make sure that high fan is off
    if (relay_Fan_High_on) {
      relay_Fan_High_on = false;
      setRelayState(PIN_FAN_HIGH_RELAY, relay_Fan_High_on);
    }
    // Make sure that low fan is on
    if (!relay_Fan_Low_on) {
      relay_Fan_Low_on = true;
      setRelayState(PIN_FAN_LOW_RELAY, relay_Fan_Low_on);
    }
    // Make sure that heat is off
    if (relay_Heat_on) {
      relay_Heat_on = false;
      setRelayState(PIN_HEAT_RELAY, relay_Heat_on);
    }
    // set compressor on
    if (!relay_Compressor_on) {
      relay_Compressor_on = true;  
      setRelayState(PIN_COMPRESSOR_RELAY, relay_Compressor_on);
      }
    }
  else if (pin_G_V == 0 && pin_Y_V != 0) {
    // If fan alone is called for, use low fan setting
    // 1. Turn on low fan
    // 2. Turn off high fan
    // 3. Turn off compressor
    // NOTE: HEAT can remain on with fan

    // Make sure that low fan is on
    if (!relay_Fan_Low_on) {
      relay_Fan_Low_on = true;
      setRelayState(PIN_FAN_LOW_RELAY, relay_Fan_Low_on);
    }
    // Make sure that high fan is off
    if (relay_Fan_High_on) {
      relay_Fan_High_on = false;
      setRelayState(PIN_FAN_HIGH_RELAY, relay_Fan_High_on);
    }
    // set compressor off
    if (relay_Compressor_on) {
      relay_Compressor_on = false;  
      setRelayState(PIN_COMPRESSOR_RELAY, relay_Compressor_on);
    }
  }
  else if (pin_Acc1_V == 0 && pin_G_V == 0 && pin_Y_V == 0) {
    // If stage 2 cool is called for
    //  1. Turn off low fan
    //  2. Turn on high fan
    //  3. Turn on compressor
    //  4. Turn off heat

    // Make sure that high fan is on
    if (!relay_Fan_High_on) {
      relay_Fan_High_on = true;
      setRelayState(PIN_FAN_HIGH_RELAY, relay_Fan_High_on);
    }
    // Make sure that low fan is off
    if (relay_Fan_Low_on) {
      relay_Fan_Low_on = false;
      setRelayState(PIN_FAN_LOW_RELAY, relay_Fan_Low_on);
    }
    // Make sure that heat is off
    if (relay_Heat_on) {
      relay_Heat_on = false;
      setRelayState(PIN_HEAT_RELAY, relay_Heat_on);
    }
    // set compressor on
    if (!relay_Compressor_on) {
      relay_Compressor_on = true;  
      setRelayState(PIN_COMPRESSOR_RELAY, relay_Compressor_on);
    }
  }
  else if (pin_W_V == 0 && pin_G_V == 0) {
    // If heat is called for
    //  1. Turn off high fan
    //  2. Turn off compressor
    //  3. Turn on heat
    //  NOTE: Low fan can remain on

    // Make sure that high fan is off
    if (relay_Fan_High_on) {
      relay_Fan_High_on = false;
      setRelayState(PIN_FAN_HIGH_RELAY, relay_Fan_High_on);
    }
    // Make sure that heat is on
    if (!relay_Heat_on) {
      relay_Heat_on = true;
      setRelayState(PIN_HEAT_RELAY, relay_Heat_on);
    }
    // set compressor of
    if (relay_Compressor_on) {
      relay_Compressor_on = false;  
      setRelayState(PIN_COMPRESSOR_RELAY, relay_Compressor_on);
    }
  }
  else if (pin_G_V != 0 && pin_Y_V != 0 && pin_Acc1_V != 0 && pin_W_V != 0) {
    // Make sure that heat is on
    if (relay_Heat_on) {
      relay_Heat_on = false;
      setRelayState(PIN_HEAT_RELAY, relay_Heat_on);
    }
    // set compressor on
    if (relay_Compressor_on) {
      relay_Compressor_on = false;  
      setRelayState(PIN_COMPRESSOR_RELAY, relay_Compressor_on);
    }
    // Make sure that high fan is off
    if (relay_Fan_High_on) {
      relay_Fan_High_on = false;
      setRelayState(PIN_FAN_HIGH_RELAY, relay_Fan_High_on);
    }
    // Make sure that low fan is off
    if (relay_Fan_Low_on) {
      relay_Fan_Low_on = false;
      setRelayState(PIN_FAN_LOW_RELAY, relay_Fan_Low_on);
    }
    
  }
} // end loop()



  void setRelayState(int pin,boolean on) {
    if (on) {
      digitalWrite(pin, HIGH);
    } 
    else {
      digitalWrite(pin, LOW);
    }  
  }

void initRelayStates() {
  // set the digital pins as output and write the initial state
  // initial state set at top of the file
  pinMode(PIN_FAN_HIGH_RELAY, OUTPUT);      
  setRelayState(PIN_FAN_HIGH_RELAY, relay_Fan_High_on);  
  pinMode(PIN_FAN_LOW_RELAY, OUTPUT);      
  setRelayState(PIN_FAN_LOW_RELAY, relay_Fan_Low_on);  
  pinMode(PIN_COMPRESSOR_RELAY, OUTPUT);      
  setRelayState(PIN_COMPRESSOR_RELAY, relay_Compressor_on);  
  pinMode(PIN_HEAT_RELAY, OUTPUT);      
  setRelayState(PIN_HEAT_RELAY, relay_Heat_on);  
}

















