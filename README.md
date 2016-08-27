# ACE API Scripts

This script authenticates and downloads weather report data from the ACE API LoopBack system and uploads them to a CKAN server.

## Prerequisites

Before you can use this script, you will need:

1. A running ACE API LoopBack server, set up with an "admin" user that's able to create and modify other users. The [ACE API Sandbox](https://github.com/cstephen/ace-api-sandbox) comes configured with everything you need to get started.

1. A CKAN server running with the [ckanext-loopback](https://github.com/gina-alaska/ckanext-loopback) extension to synchronize CKAN user accounts and organizations with the LoopBack server.

1. The [ACE mobile app](https://github.com/ua-snap/ace-cordova-app), to log into CKAN/LoopBack accounts and the submit weather report data to LoopBack, which this script will then copy into CKAN as GeoJSON files.

## Installation

1. Clone this repository and change into its directory:

   ```bash
   git clone https://github.com/gina-alaska/ace-api-scripts.git
   cd ace-api-scripts
   ```

1. Install the needed Node.js packages:

   ```bash
   npm install
   ```

## Usage

1. Create an organization on the CKAN server and add a user to it.

1. Log in as this user through the ACE mobile app and submit weather reports.

1. Run the `migrate.js` script, which will download all of the weather reports for a given time range and upload a separate GeoJSON file for each organization in CKAN.

   ```bash
   node migrate.js 2016-08-01 2016-09-01
   ```
