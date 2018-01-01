/**
 * Module Dependencies
 */

 var CsvBuilder = require('csv-builder');


// If options.quoted == true OR undefined then only use quotes where needed 
 function deleteUselessQuotes_(arr){
   const quoted_arr = this.oldNormalizeArray_(arr)
   const filtered_arr = quoted_arr.map(
    column_data => { 
      const column_text =  column_data.substring(1, column_data.length-1)
      if (column_text.includes(',') || column_text.includes('\n') || column_text.includes('"')){
        return column_data
      }else{
        return column_text
      }
    }
    )
   return filtered_arr
 }

// If options.show_headers == false OR undefined then do not return header names in output
 function forgetHeader_(){
    return ''
 }

/**
 * Create csv streams from a mongoose schema
 * @param {mongoose.Schema} schema
 * @param {Object} options CsvBuilder options
 * @param {String|Array} options.headers Space separated headers, or array of headers
 * @param {String} [options.delimiter = ','] Value delimiter for csv data
 * @param {String} [options.terminator = '\n'] Line terminator for csv data
 * @param {Object} options.constraints {"header": "prop"}
 * @param {Object} options.virtuals Virtual properties.
 */

 module.exports = function mongooseToCsv(schema, options) {
  // need options.headers
  if (!options.headers) throw new Error('MongooseToCsv requires the `headers` option');
  var builder = new CsvBuilder(options);

  // Only if options.quoted == false ignore extra quotes
  if (typeof options.quoted ==='undefined' || options.quoted) {
    builder.oldNormalizeArray_ = builder._normalizeArray
    builder._normalizeArray = deleteUselessQuotes_
  }

  // Only if options.show_headers == true produce header cells
  if (typeof options.show_headers ==='undefined' || !options.show_headers) {
    builder.getHeaders = forgetHeader_  
  }

  if (options.virtuals) {
    for (var v in options.virtuals) {
      builder.virtual(v, options.virtuals[v]);
    }
  }

  /**
   * Static Method `csvReadStream`
   * @param {Array<Documents>} docs Array of mongoose documents
   * @return {Stream} Csv read stream.
   */

   schema.static('csvReadStream', function(docs) {
    if (!docs) {
      throw new Error('[Model].csvReadStream requires an array of documents.');
    }
    var data = docs.map(function(obj) {
      return obj._doc;
    });
    return builder.createReadStream(data);
  });

  /**
   * Create a Csv stream from a query Object.
   * @param {Object} query Mongoose query
   * @return {Stream} Csv transform stream
   */

   schema.static('findAndStreamCsv', function(query) {
    query = query || {};

    return this.find(query).cursor().pipe(builder.createTransformStream());
  });

  /**
   * Create a transform stream
   * @return {Stream} transform stream
   */

   schema.static('csvTransformStream', function() {
    return builder.createTransformStream();
  });
 };
