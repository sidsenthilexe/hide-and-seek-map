# [Hide and Seek Map](https://hide-and-seek-map.vercel.app/)
This is a project inspired by Jet Lag The Game's Hide and Seek, built for Hack Club's Horizons   

<a href="https://hide-and-seek-map.vercel.app/">
<img width="1435" height="728" alt="Screenshot 2026-06-18 at 00 14 38" src="https://github.com/user-attachments/assets/082ba313-238b-45b0-a968-898ec29299ce"  />  
</a>

## Features implemented so far
* Choose between imperial and metric measurements
* Create a custom playing area anywhere in the world
* Create radar, latitude, and longitude questions to narrow down where the hider is
* All questions have a live preview
* Previously asked questions are displayed and can be edited

## Usage
* Use the `Settings` button to switch between imperial and metric measurements
* Select `Set Playing Area` to start drawing the game area
* Click on the map to draw the playing area
* After placing at least 3 points, click on the initial point or select `Finish area` to close the shape
* Select `Ask Question` -> `Radar` to ask a radar question
* Select the radius of the radar and whether the hider is in or out of the area
* Click on the map to place the center of the radar and then click `Save`
* Select `Ask Question` -> `Latitude` or `Longitude` to ask a Latitude or Longitude question
* Select where you are on the map, and whether the hider is above, below, left, or right of you on the map, and hit `Save`
* Continue asking questions to narrow down the search area or select `Edit` to change the details of a previously asked quetsion

<sup>As this was my first project in typescript, some AI was used for reference.</sup>
