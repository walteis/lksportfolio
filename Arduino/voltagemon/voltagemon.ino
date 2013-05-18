#include "EmonLib.h"              // Include Emon Library
EnergyMonitor emon1; // Create an instance
EnergyMonitor emon2;



void setup()
{  
  Serial.begin(9600);
  while (! Serial); //
  pinMode(8,OUTPUT);

  emon1.voltage(2, 234.26, 1.7);  // Voltage: input pin, calibration, phase_shift
  emon2.voltage(4, 234.26, 1.7);  // Voltage: input pin, calibration, phase_shift

}

void loop()
{
  emon1.calcVI(20,500);          // Calculate all. No.of crossings, time-out
  emon2.calcVI(20,500);          // Calculate all. No.of crossings, time-out
  Serial.print(emon1.Vrms); 
  Serial.print("  :  ");
  Serial.println(emon2.Vrms);     

  if (emon1.Vrms < 1.00 && emon2.Vrms < 1.00)
  {
    digitalWrite(8,HIGH);
  }
  else
  {
    digitalWrite(8,LOW);
  }
  //emon1.serialprint();
}

