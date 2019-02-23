/*********************************************************************
Program to display state of button and which LED is on after button press

As designed, uses .96" display and Make "Maker" board.

Pinouts are:
Display     Prototype board
-------     ---------------
 VCC        3.3v
 GND        GND
 SCL        A5 (SCL)
 SDA        A4 (SDA)
 
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Based on example written by Limor Fried/Ladyada  for Adafruit Industries.  
BSD license, check license.txt for more information
All text above, and the splash screen must be included in any redistribution
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*********************************************************************/

#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Fonts/FreeSans12pt7b.h>
#include <Fonts/FreeSans9pt7b.h>

#define OLED_RESET 4

#define NUMFLAKES 10
#define XPOS 0
#define YPOS 1
#define DELTAY 2


#define LOGO16_GLCD_HEIGHT 16 
#define LOGO16_GLCD_WIDTH  16 
static const unsigned char PROGMEM logo16_glcd_bmp[] =
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
  B00000000, B00110000 };

#if (SSD1306_LCDHEIGHT != 32)
#error("Height incorrect, please fix Adafruit_SSD1306.h!");
#endif

// pin configs
const int buttonPin = 4;     // the number of the pushbutton pin
const int led_1_Pin =  2;      // the number of the LED pin
const int led_2_Pin =  3;      // the number of the LED pin

// preform reset
Adafruit_SSD1306 display(OLED_RESET);


// global vars:
int buttonState = 0;         // variable for reading the pushbutton status
int _col_2 = 0;
int _col_1 = 0;

/*
 * Setup screen defaults and constants
 *  
 */
void setup()   {  

  // initialize the LED pins as an output:
  pinMode(led_1_Pin, OUTPUT);
  pinMode(led_2_Pin, OUTPUT);
  
  // initialize the pushbutton pin as an input:
  pinMode(buttonPin, INPUT);
                
  Serial.begin(9600);

  // by default, we'll generate the high voltage from the 3.3v line internally! (neat!)
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);  // initialize with the I2C addr 0x3C (for the 128x32)
  // init done
  
  // Show image buffer on the display hardware.
  // Since the buffer is intialized with an Adafruit splashscreen
  // internally, this will display the splashscreen.
  display.display();
  delay(2000);

  // Clear the buffer.
  display.clearDisplay();

  // determine mid-point and column 2 start
  int mid_x = (display.width()-1) /2;
  _col_2 = mid_x + 4;
  
  // draw column divider
  display.drawLine(mid_x, display.height()-1, mid_x , 10, WHITE);
  display.display();

  // write header text
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.println("TOTZ AWESOME BUTTONS");
  
  // write column headings
  display.setTextSize(1);
  display.setTextColor(BLACK, WHITE);
  display.setCursor(1,10);
  display.print(" Button ");
  display.setCursor(_col_2 , 10);
  display.print("LED Color");
  display.setTextColor(WHITE, BLACK);
  display.setFont(&FreeSans9pt7b);
}


/*
 *  Processing Loop
 * 
 * 
 */
void loop() {
  
  buttonState = digitalRead(buttonPin);
  
  if (buttonState == HIGH) {

    // Clear last line of text
    display.setTextColor(BLACK,WHITE);
    display.setCursor(_col_1,31);
    display.print("ON ");

    // write new state text
    display.setTextColor(WHITE, BLACK);
    display.setCursor(_col_1,31);
    display.print("OFF ");

    // switch lights
    digitalWrite(led_1_Pin, HIGH);
    digitalWrite(led_2_Pin, LOW);

    // clear last color text
    display.setCursor(_col_2, 31);
    display.setTextColor(BLACK,WHITE);
    display.print("RED  ");

    // write new color text
    display.setCursor(_col_2, 31);
    display.setTextColor(WHITE, BLACK);
    display.print("GREEN");
    
  } else {
    
    // clear last message
    display.setCursor(_col_1,31);
    display.setTextColor(BLACK,WHITE);
    display.print("OFF ");

    // write new button state text
    display.setCursor(_col_1,31);
    display.setTextColor(WHITE, BLACK);
    display.print("ON  ");

    // clear last color text
    display.setCursor(_col_2, 31);
    display.setTextColor(BLACK,WHITE);
    display.print("GREEN");

    // write new color text
    display.setCursor(_col_2, 31);
    display.setTextColor(WHITE, BLACK);
    display.print("RED  ");

    // switch lights
    digitalWrite(led_2_Pin, HIGH);
    digitalWrite(led_1_Pin, LOW);

  }

  // refresh the display
  display.display();
}
