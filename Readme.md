<h1 style="margin-top: 2rem">
	<img src="./.github/yaml-db.svg" height="100" />
</h1>

# yaml-db

`yaml-db` is a simple YAML-based database with the ability to run as a service. It allows you to store data in the form of YAML files organized in folders. Each record is represented as a directory with `meta.yaml` and `data.yaml` files containing metadata and content.

## Installation

To install `yaml-db`, you can use npm:

```bash
npm i -g @ruslankonev/yaml-db
```

## Usage

After installation, you can use the `yaml-db` command-line interface to start the database server.

```bash
yaml-db start
```

### Options

- `-c, --config [path]`: Path to configuration file
- `-d, --dir [directory]`: File storage path (default: `./data`)
- `-p, --port [port]`: The port on which the server is raised (default: `5701`)

## Configuration

You can provide a configuration file in YAML format to customize the database and server settings. The following fields are supported:

```yaml
server:
  port: 5701 # The port on which the server is raised

database:
  dataPath: ./data # Path to the directory where data is stored
```


## Programmatic Usage

In addition to running `yaml-db` as a standalone server, you can also use the `Database` module programmatically in your Node.js projects. This allows you to interact with the database functionality directly within your application code.

### Installation

First, you need to install the required dependencies in your project:

```bash
npm install yaml
```

### Example Usage

To use the `Database` module in your project, you can require it and create an instance of the database:

```javascript
const fs = require('fs');
const { Database } = require('yaml-db');

const dataPath = './data/records'; // Change this to the appropriate data path
const db = new Database(dataPath);

// Initialize the database
db.init()
  .then(() => {
    // Create a new record
    const newRecordId = db.createRecord({ title: 'Sample Record' });

    // Upload a file to the record
    const fileBuffer = fs.readFileSync('path/to/your/file.pdf');
    db.uploadFile(newRecordId, fileBuffer, 'file.pdf');

    // Update a record
    db.updateRecord(newRecordId, { title: 'Updated Record Title' });

    // Retrieve record metadata
    const recordMeta = db.getRecordMeta(newRecordId);
    console.log('Record Metadata:', recordMeta);

    // Retrieve record data
    const recordData = db.getRecordData(newRecordId);
    console.log('Record Data:', recordData);
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });
```

Remember to adjust the `dataPath` and the paths to your actual files accordingly. This example demonstrates creating records, uploading files, updating records, and searching records by directory.

For more detailed information about the available methods and their parameters, refer to the [Documentation](#methods) section.

### Methods

- `init()`: Initialize the database.
- `createRecord(recordData)`: Create a new record with the specified data.
- `uploadFile(recordId, fileBuffer, filename)`: Upload a file to a record.
- `updateRecord(recordId, updatedData)`: Update the data of a record.
- `getRecordMeta(recordId)`: Retrieve the metadata of a record.
- `getRecordData(recordId)`: Retrieve the data of a record.

For more detailed documentation on each method, refer to the inline comments in the `/lib/database.js` file.


## Dependencies

- `body-parser`: Middleware to parse request bodies.
- `commander`: Command-line interface framework.
- `express`: Web application framework for the server.
- `lodash`: Utility library for working with data.
- `multer`: Middleware for handling file uploads.
- `nanoid`: Library for generating unique IDs.
- `yaml`: Library for working with YAML files.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Created by Ruslan Konev.

For inquiries, contact: konev.lincor@gmail.com
