/*
Simple Ethernet Cable tester using a '595, Uno R3, and .96" display.

Pinouts are:
Display     Uno
-------     ---------------
 VCC        3.3v
 GND        GND
 SCL        A5 (SCL)
 SDA        A4 (SDA)

  595       Uno
-------     ---------------
 VCC        5V
 GND        GND
 OE         GND
 MR         5V
 Clock      13
 Data       11
 Latch      12

 */
 
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Fonts/FreeSans12pt7b.h>
#include <Fonts/FreeSans9pt7b.h>
#include <Fonts/FreeSerif9pt7b.h>
#include <Fonts/FreeMonoOblique9pt7b.h>

// set constants for display
#define OLED_RESET 4

// preform reset
Adafruit_SSD1306 display(OLED_RESET);

// setup for 595
const int latchPin = 12;
const int clockPin = 13;
const int dataPin = 11;
byte leds = 0;

// Pins used to read 595 output
const int testPins[] = {2,3,5,6,7,8,9,10};

// Values read
int pinsIn[] = {0,0,0,0,0,0,0,0};

// Start button pin and initial value
const int buttonPin = A2;
bool buttonState = true;

// 
String cableType = "";


void setup() {

  // set register pins
  pinMode(latchPin, OUTPUT);
  pinMode(dataPin, OUTPUT);
  pinMode(clockPin, OUTPUT);

  // set test pins
  for (int i = 0; i < 8; i++) {
    pinMode(testPins[i], INPUT);    
    digitalRead(testPins[i]);
  }

  // set button pin
  pinMode(buttonPin, INPUT_PULLUP);

  // Init serial monitor in case we want to use it later
  Serial.begin(9600);
  
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);  // initialize with the I2C addr 0x3C (for the 128x32)
  
  display.display();
  delay(2000);
  
  // Clear the buffer.
  display.clearDisplay();
  
  // write header text
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.println("  Cable Tester v2.0");
  display.println("Press button to Start");
  display.display();
  delay(2000);
  display.clearDisplay();
  display.setTextWrap(false);

}

void loop() {

  // wait for button press to start test. At end display results and reset buttonState

  while (digitalRead(buttonPin) != LOW) {
    ;
  }
  
  if (buttonState) {
    //display.setFont(&FreeSans9pt7b);
    display.clearDisplay();
    display.setTextSize(2);
    display.setTextColor(WHITE, BLACK);
    display.setCursor(1,10);
    display.print("TESTING...");
    display.display();
    leds = 0;
    for (int i = 0; i < 8; i++) {
      pinsIn[i] = 0;
    }
    updateShiftRegister();
    
    delay(500);
    for (int i = 0; i < 8; i++) {
      bitSet(leds, i);
      updateShiftRegister();
      readInputPins(i);
      delay(500);
      bitClear(leds, i);
      display.print(i+1);
      display.display();
    }
    buttonState = !buttonState;
  }

  display.clearDisplay();
  display.setTextSize(1);
  
  display.setCursor(0,0);
  display.println("  Cable Tester v2.0");
  display.println("Press button to Start");
   
  // write column headings
  display.setTextColor(WHITE);
  display.setCursor(4,22);
  display.print("PORT      PINS");
  display.setCursor(5,32);
  display.setTextColor(BLACK, WHITE);
  display.print("A    1 2 3 4 5 6 7 8");
  
  displayResults(pinsIn);

  // Draw a nice box to display the results
  display.drawRect(0,20,SSD1306_LCDWIDTH, 31, WHITE);
  display.drawFastVLine(30,20,31,WHITE);
  display.display();
  
  buttonState = !buttonState;
}

// set the new shift register pin values, then lock until next cycle
void updateShiftRegister() {
  digitalWrite(latchPin, LOW);
  shiftOut(dataPin, clockPin, LSBFIRST, leds);
  digitalWrite(latchPin, HIGH);
}


// check each input pin for signal
void readInputPins(int pinOut) {
  for (int i = 0; i < 8; i++) {
    if (digitalRead(testPins[i]) == HIGH) {
      pinsIn[i] = pinOut + 1;
    }
  }
}

// determine result string and print
void displayResults(int testPins[]) {
  String message;
  bool cableGood = true;
  
  display.setTextColor(WHITE, BLACK);
  display.setCursor(5,42);
  
  // print pin test results
  display.print("B   ");
  for (int i = 0; i < 8; i++) {
    display.print(" " + (String)testPins[i]);
    if (testPins[i] == 0) {
      cableGood = false;
      message = "Miswired/Short";
    }
  }

  if (cableGood) {
    if (testPins[0] == 1 && testPins[1] == 2 && testPins[2] == 3) {
      message = "Straight-Through";
    } 
    else if (testPins[0] == 3 && testPins[1] == 6 && testPins[2] == 1 && testPins[5] == 2) {
      message = "Cross-Over";
    }
  }

  display.setTextColor(BLACK, WHITE);
  display.setTextSize(1);
  display.setCursor(3,54);
  display.println(message);
  display.display();
}
