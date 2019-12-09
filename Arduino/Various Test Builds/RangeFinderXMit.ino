/*********************************************************************
Program to display output from Ultrasonic range finder on a .96" OLED display.

As designed, uses .96" display and Make "Maker" board.

Pinouts are:
Display     Prototype board
-------     ---------------
 VCC        3.3v
 GND        GND
 SCL        A5 (SCL)
 SDA        A4 (SDA)

 Range Finder   Prototype board
 ------------   ---------------
 VCC            5v
 GND            GND
 TRIG           D6
 ECHO           D7
 
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Based on example written by Limor Fried/Ladyada  for Adafruit Industries.  
BSD license, check license.txt for more information
All text above, and the splash screen must be included in any redistribution
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*********************************************************************/
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
void setup()   {                  
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
  // a=sr04.Distance();
  duration = 0;
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  duration = pulseIn(ECHO_PIN, HIGH, PULSE_TIMEOUT);
  a = (duration/2) / 73.914;  // result in inches
  // distance = (duration/2) / 29.1;  // result in cm

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
