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

1. If it everything worked, the `migrate.js` script should output something that looks like this:

   ```
   [ { id: '676c2560-455b-11e6-b3e2-f72b17ce0010',
    userId: '676aece0-455b-11e6-b3e2-f72b17ce0010',
    positionId: '676bd740-455b-11e6-b3e2-f72b17ce0010',
    cloudCover: '1/8th',
    precipitation: 'Light Rain',
    visibility: 'Mist',
    pressureTendency: null,
    pressureValue: null,
    temperatureValue: '59',
    temperatureUnits: ' ºF ',
    windValue: null,
    windUnits: null,
    windDirection: null,
    notes: null,
    other: null,
    attachment: null } ]
   ```

   This means `migrate.js` successfully logged into LoopBack and pulled out the one dummy weather report record (in JSON format).
