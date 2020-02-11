#!/usr/bin/env python
# -*- coding: utf-8 -*-

from paho.mqtt import client as mqtt
from pymodbus.client.sync import ModbusSerialClient
from threading import Thread
import ctypes
import time

quitCond = False
valuePusher = None


class ValuePusher(Thread):
    def __init__(self, connection, units):
        Thread.__init__(self)
        self.__connection = connection
        self.__units = units
        self.__client = ModbusSerialClient(
            method='rtu', port='/dev/ttyUSB0',
            baudrate=19200, parity='E', stopbits=1, bytesize=8)
        self.__client.connect()

    def run(self):
        while not quitCond:
            for u in self.__units:
                response = self.__client.read_holding_registers(
                    address=0x5B00, count=66, unit=u)
                activePowerTotal = ctypes.c_int32(
                    (response.registers[20] << 16) | response.registers[21]).value / 100
                apStr = (str(activePowerTotal) + " W")
                print(self.__units[u] + ": " + apStr)
                self.__connection.publish(
                    "/homeautomation/power/" + self.__units[u], apStr)
                time.sleep(.1)
            time.sleep(1)

    def __del__(self):
        self.__client.close()


def on_connect(client, userdata, flags, rc):
    global valuePusher
    print("Connected with result code "+str(rc))
    valuePusher = ValuePusher(client, {1: 'solar', 2: 'active'})
    valuePusher.start()


def main():
    global quitCond
    client = mqtt.Client()

    client.on_connect = on_connect

    client.connect("192.168.88.241", 1883, 60)
    try:
        client.loop_forever()
    except KeyboardInterrupt:
        quitCond = True


if __name__ == "__main__":
    main()
