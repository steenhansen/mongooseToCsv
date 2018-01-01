# mongoose-to-csv-quotes
MongooseToCsvQuotes is a mongoose plugin that creates a [`CsvBuilder`](https://github.com/nickpisacane/CsvBuilder) instance for your Schema. Updated [`mongoose-to-csv`](https://www.npmjs.com/package/mongoose-to-csv) package that escapes commas by default. Only if options.show_headers is true, are headers put in first row.

## Usage
```js
const mongooseToCsvQuotes = require('mongoose-to-csv-quotes') 

var UserSchema = new mongoose.Schema({
  fullname: {type: String},
  email: {type: String},
  age: {type: Number},
  username: {type: String}
});

UserSchema.plugin(mongooseToCsvQuotes, {
  headers: 'Firstname Lastname Username Email Age',
  alias: {
    'Username': 'username',
    'Email': 'email',
    'Age': 'age'
  },
  virtuals: {
    'Firstname': function(doc) {
      return doc.fullname.split(' ')[0];
    },
    'Lastname': function(doc) {
      return doc.fullname.split(' ')[1];
    }
  }
});

var User = mongoose.model('Users', UserSchema);

// Query and stream
User.findAndStreamCsv({age: {$lt: 40}})
  .pipe(fs.createWriteStream('users_under_40.csv'));

// Create stream from query results
User.find({}).exec()
  .then(function(docs) {
    User.csvReadStream(docs)
      .pipe(fs.createWriteStream('users.csv'));
  });

// Transform mongoose streams
User.find({})
  .where('age').gt(20).lt(30)
  .limit(10)
  .sort('age')
  .stream()
  .pipe(User.csvTransformStream())
  .pipe(fs.createWriteStream('users.csv'));
```

## Installation
```sh
$ npm install mongoose-to-csv-quotes
```

## Testing
Running tests requires a local mongodb server, and mocha. While most likely not a namespace issue, the test script will create a database `__mongoose_to_csv_test__`, and drop the database when finished. You have been warned.
```sh
$ npm test
```

## API

#### Schema.plugin(mongooseToCsvQuotes, options)
The `options` argument is passed to the `CsvBuilder` instance, please refer to
the <a href="https://github.com/Nindaff/CsvBuilder">Docs</a> for more in-depth details. The only aditional property that can be included is the `virutals` property.
The `virtuals` have nothing to do with mongoose virtuals.

### Schema.csvReadStream([docs])
Creates a csv formated read stream from query results.
* docs Array<Model>

### Schema.csvTransformStream()
Transforms mongoose querystreams to csv formated streams.

### Schema.findAndStreamCsv(query)
* query Object Mongoose query
This is just a convenience method for:
```js
Schema.find(query).stream().pipe(Schema.csvTransformStream())
```
