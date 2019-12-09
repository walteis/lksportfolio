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



#if (SSD1306_LCDHEIGHT != 32)
#error("Height incorrect, please fix Adafruit_SSD1306.h!");
#endif

// preform reset
Adafruit_SSD1306 display(OLED_RESET);

// initialize range finder
SR04 sr04 = SR04(ECHO_PIN,TRIG_PIN);
String a;   // global to hold distance

RH_ASK driver;

/*
 * Setup screen defaults and constants
 *  
 */
void setup()   {                  
  Serial.begin(9600);

  if (!driver.init())
      Serial.println("init failed");
  
  // by default, we'll generate the high voltage from the 3.3v line internally! (neat!)
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);  // initialize with the I2C addr 0x3C (for the 128x32)
  
  // Show image buffer on the display hardware.
  // Since the buffer is intialized with an Adafruit splashscreen
  // internally, this will display the splashscreen.
  //display.display();
  //delay(2000);
  
  // Clear the buffer.
  display.clearDisplay();
  
  // write header text
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.println("Range Finder v3.0");
  
  // write column headings
  display.setTextSize(1);
  display.setTextColor(BLACK, WHITE);
  display.setCursor(1,10);
  display.print("     Distance     ");
  //display.setTextSize(2);
  display.setFont(&FreeMonoOblique9pt7b);
  display.display();
}

/*
 *  Processing Loop
 */
void loop() {

  
  String message;
  // Clear last distance
  // I do this to reset the screen to background color.
  display.setTextColor(BLACK,WHITE);
  display.setCursor(7,31);
  display.print(a);

  
  // get rangefinder output

  uint8_t buf[12];
  uint8_t buflen = sizeof(buf);
  if (driver.recv(buf, &buflen)) // Non-blocking
    {
      int i;
      // Message with a good checksum received, dump it.
      a = (char*)buf;
      a = a.substring(0,a.length()-4);
      a.trim();
      a.concat(" in");
    } else
    { 
      display.print("No Link");
    }
         
  // refresh the display
  display.setTextColor(WHITE, BLACK);
  display.setCursor(7,31);
  display.print(a);
  Serial.println(message);

  display.display();
  delay(10);
  
}
