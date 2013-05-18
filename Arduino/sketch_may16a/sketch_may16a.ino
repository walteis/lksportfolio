/*
Adafruit Arduino - Lesson 5. Serial Monitor
 */

int latchPin = 5;
int clockPin = 6;
int dataPin = 4;
int eiPin = 0;

byte leds = 0;

void setup() 
{
  pinMode(latchPin, OUTPUT);
  pinMode(dataPin, OUTPUT);  
  pinMode(clockPin, OUTPUT);
  Serial.begin(9600);
  while (! Serial); // Wait untilSerial is ready - Leonardo
  Serial.println("Enter LED Number 0 to 7 or 'x' to clear");
}

void loop() 
{
  int reading  = analogRead(eiPin);
  Serial.println(reading);
  delay(3000);

}


