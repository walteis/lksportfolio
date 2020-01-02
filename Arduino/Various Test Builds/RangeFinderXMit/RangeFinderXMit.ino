/*********************************************************************
Program to send output from Ultrasonic range finder over 433MHz link

 Transmitter    Prototype board
 ------------   ---------------
 VCC            5v
 GND            GND
 DA             D12

 SR-04          UNO
 ------------   ----------------
 VCC            5v
 GND            GND
 ECHO           D7
 TRIG           D6

 RF Link        UNO
 ------------   -----------------
 +5V            5v
 GND            GND
 Data           D13
 
**********************************************************************/

#include <RH_ASK.h>
#include <SPI.h>
#include <Wire.h>
#include "SR04.h"

// set constants for range finder
#define TRIG_PIN 6
#define ECHO_PIN 7

// initialize range finder
SR04 sr04 = SR04(ECHO_PIN,TRIG_PIN);
long a;   // global to hold distance

RH_ASK driver;

/*
 * Setup screen defaults and constants
 *  
 */
void setup() {                  
  Serial.begin(9600);
  if (!driver.init())
    Serial.println("init failed");
}

/*
 *  Processing Loop
 */
void loop() {
  
  long duration;
  
  // get rangefinder output
  duration = 0;
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  duration = pulseIn(ECHO_PIN, HIGH, PULSE_TIMEOUT);
  a = (duration/2) / 73.914;  // result in inches
  // a = (duration/2) / 29.1;  // result in cm

  String sMessage = String(a);
  sMessage.concat("              ");
  char message[sMessage.length()] = " ";

  sMessage.toCharArray(message, sMessage.length() );
  Serial.print(sMessage);

  char *msg = message;
  driver.send((uint8_t *)message, strlen(message));
  driver.waitPacketSent();
  delay(1000);
}
