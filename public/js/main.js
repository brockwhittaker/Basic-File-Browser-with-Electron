(function () {
  var $container = $("#file_system");

  var drawFiles = function (arr = [], settings = {}) {
    $container.html("");

    arr = arr || [];

    let directory = $.create("<div class='working-dir'>" + filesystem.getDirectory() + "</div>");
    $container.append(directory);

    if (!settings.systemFiles) {
      arr = arr.filter(function (o) {
        return !/^\./.test(o);
      });
    }
    arr.forEach(function (o) {
      let child = $.create("<div class='file'>" + o + "</div>");
      $container.append(child);
    });
  };

  var filesystem = new FileSystem();

  filesystem.getFilesInDirectory("/", function (err, data) {
    drawFiles(data);
  });

  $("body").on("click", ".file", function () {
    filesystem.nextDirectory(this.innerText, function (err, data) {
      drawFiles(data);
    });
  });

})();
