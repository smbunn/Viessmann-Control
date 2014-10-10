#!/usr/bin/env python
 
import os
import xively
import subprocess
import time
import datetime
import requests
 
# extract feed_id and api_key from environment variables
FEED_ID = os.environ["FEED_ID"]
API_KEY = os.environ["API_KEY"]
DEBUG = os.environ["DEBUG"] or false
 
# initialize api client
api = xively.XivelyAPIClient(API_KEY)
 
# function to read 1 minute load average from system uptime command
def read_values():
  if DEBUG:
    print "Reading outside temperature"
    subprocess.call(["/usr/local/bin/vclient -m --host localhost --port 3002 getOutsideTemp getBoilerTemp getWaterTemp getTemp17B getHotWaterTemp1 > temp"], shell=True)
    time.sleep(20)
    fo = open("temp", "rw+")
    value1 = fo.readline() 
    v1 = value1[21:-4]
    value2 = fo.readline() 
    v2 = value2[20:-4]
    value3 = fo.readline() 
    v3 = value3[19:-4]
    value4 = fo.readline() 
    v4 = value4[17:-4]
    value5 = fo.readline() 
    v5 = value5[23:-4]
    fo.close()	
  return (v1, v2, v3, v4, v5)
 
# function to return a datastream object. This either creates a new datastream,
# or returns an existing one
def get_datastream(feed):
  try:
    datastream = feed.datastreams.get("Boiler_Ctrl")
    if DEBUG:
      print "Found existing datastream"
    return datastream
  except:
    if DEBUG:
      print "Creating new datastream"
    datastream = feed.datastreams.create("Boiler_Ctrl", tags="OutsideTemp, BoilerTemp, WaterTemp, Temp17B, HotWaterTemp")
  return datastream
 
# main program entry point - runs continuously updating our datastream with the
# current 1 minute load average
def run():
  print "Starting Xively tutorial script"
 
  feed = api.feeds.get(FEED_ID)
 
  datastream = get_datastream(feed)
  datastream.max_value = None
  datastream.min_value = None
 
  while True:
    Outside, Boiler, Water, Temp17B, HotWater = read_values()
  
    if DEBUG:
		print "Outside=: %s" % Outside
		print "Boiler=: %s" % Boiler
		print "Water=: %s" % Water
		print "Temp17B=: %s" % Temp17B
		print "Hot Water=: %s" % HotWater
    now = datetime.datetime.utcnow() 	
    feed.datastreams = [
        xively.Datastream(id='OutsideTemp', current_value=Outside, at=now),
        xively.Datastream(id='BoilerTemp', current_value=Boiler, at=now),
        xively.Datastream(id='WaterTemp', current_value=Water, at=now),
        xively.Datastream(id='Temp17B', current_value=Temp17B, at=now),
        xively.Datastream(id='HotWaterTemp', current_value=HotWater, at=now),
    ]		
    try:
         feed.update()
    except requests.HTTPError as e:
         print "HTTPError({0}): {1}".format(e.errno, e.strerror)
 
    time.sleep(300)
 
run()
