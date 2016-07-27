# ACE API Scripts

## Installation

1. Set up the [ACE API Sandbox](https://github.com/cstephen/ace-api-sandbox) if you have not already done so.

1. Clone this repository and change into its directory:

   ```bash
   git clone https://github.com/cstephen/ace-api-scripts.git
   cd ace-api-scripts
   ```

1. Install the needed Node.js packages:

   ```bash
   npm install
   ```

1. Run the `migrate.js` script, which authenticates and downloads dummy data from the ACE API Sandbox LoopBack system:

   ```bash
   node migrate.js
   ```

   If everything worked, the `migrate.js` script should output something like this:

   ```
   Timestamp: 2016-06-08T20:19:04.151Z
   Latitude: 64.8592668
   Longitude: -147.8511062
   Cloud Cover: 1/8th
   Precipitation: Light Rain
   Visibility: Mist
   ```

   This means `migrate.js` successfully logged into LoopBack and pulled out the one dummy weather report.
