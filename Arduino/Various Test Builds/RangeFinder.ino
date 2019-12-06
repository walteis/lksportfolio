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

#include <SPI.h>
#include <Wire.h>
#include "SR04.h"
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Fonts/FreeSans12pt7b.h>
#include <Fonts/FreeSans9pt7b.h>
#include <Fonts/FreeSerif9pt7b.h>
#include <Fonts/FreeMonoOblique9pt7b.h>

// set constants for range finder
#define TRIG_PIN 6
#define ECHO_PIN 7

// set constants for display
#define OLED_RESET 4
#define LOGO16_GLCD_HEIGHT 16 
#define LOGO16_GLCD_WIDTH  16

// Adafruit logo 
/* static const unsigned char PROGMEM logo16_glcd_bmp[] =
{ B00000000, B11000000,
  B00000001, B11000000,
  B00000001, B11000000,
  B00000011, B11100000,
  B11110011, B11100000,
  B11111110, B11111000,
  B01111110, B11111111,
  B00110011, B10011111,
  B00011111, B11111100,
  B00001101, B01110000,
  B00011011, B10100000,
  B00111111, B11100000,
  B00111111, B11110000,
  B01111100, B11110000,
  B01110000, B01110000,
  B00000000, B00110000 }; */

#if (SSD1306_LCDHEIGHT != 32)
#error("Height incorrect, please fix Adafruit_SSD1306.h!");
#endif

// preform reset
Adafruit_SSD1306 display(OLED_RESET);

// initialize range finder
SR04 sr04 = SR04(ECHO_PIN,TRIG_PIN);
long a;   // global to hold distance

/*
 * Setup screen defaults and constants
 *  
 */
void setup()   {                  
  Serial.begin(9600);
  
  // by default, we'll generate the high voltage from the 3.3v line internally! (neat!)
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);  // initialize with the I2C addr 0x3C (for the 128x32)
  
  // Show image buffer on the display hardware.
  // Since the buffer is intialized with an Adafruit splashscreen
  // internally, this will display the splashscreen.
  //display.display();
  //delay(2000);
  
  // Clear the buffer.
  display.clearDisplay();
  //display.display();
  
  // write header text
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.println("Range Finder v2.0");
  
  // write column headings
  display.setTextSize(1);
  display.setTextColor(BLACK, WHITE);
  display.setCursor(1,10);
  display.print("     Distance     ");
  //display.setTextSize(2);
  display.setFont(&FreeMonoOblique9pt7b);
}

/*
 *  Processing Loop
 */
void loop() {
  
  long duration;
  // Clear last distance
  // I do this to reset the screen to background color.
  display.setTextColor(BLACK,WHITE);
  display.setCursor(7,31);
  display.print(a);
  display.print(" in");
  
  // get rangefinder output
  //a=sr04.Distance();
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

  // write new distance
  display.setTextColor(WHITE, BLACK);
  display.setCursor(7,31);
  display.print(a);
  display.print(" in");
        
  // refresh the display
  display.display();
}
