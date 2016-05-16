let fs = require("fs");

var FileSystem = (function () {
  var _FileSystem = function () {

  };

  var storage = {
    cd: null
  };

  _FileSystem.prototype = {
    getFilesInDirectory: function (dir, callback) {
      storage.cd = dir;

      fs.readdir(storage.cd, function (err, data) {
        callback(err, data);
      });
    },
    getDirectory: function () {
      return storage.cd;
    },
    nextDirectory: function (dir, callback) {
      this.getFilesInDirectory(storage.cd + "/" + dir, callback);
    }
  };

  return _FileSystem;
})();
