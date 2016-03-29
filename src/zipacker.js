/**
 * [zipacker]{@link https://github.com/emn178/zipacker}
 *
 * @version 0.1.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2016
 * @license MIT
 */
(function () {
  var requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
  var temporaryStorage  = navigator.webkitTemporaryStorage;

  function Zipacker (options) {
    this.options = options || {};
    this.options.zipFile = this.options.zipFile || 'download.zip';
    this.options.quota = this.options.quota || 1073741824; // 1 GB
    this.tasks = {};

    ['onDownloading', 'onDownloaded', 'onRequestedQuota', 'onRequestedFileSystem',
     'onOpenedFile', 'onCreatedFile', 'onError', 'onZipping', 'onZipped', 'onZippedBlob'].forEach(function (event) {
      this[event] = this[event].bind(this);
    }.bind(this));
  }

  Zipacker.prototype.add = function (files, dir) {
    var tasks = this.tasks;
    dir = dir || '';
    if (!Array.isArray(files)) {
      if (typeof files == 'object') {
        for (var url in files) {
          if (!tasks[url]) {
            tasks[url] = [];
          }
          tasks[url].push(files[url]);
        }
        return;
      } else {
        files = [files];
      }
    }
    files.forEach(function (url) {
      var parts = url.split('/');
      var file = dir + parts[parts.length - 1];
      if (!tasks[url]) {
        tasks[url] = [];
      }
      tasks[url].push(file);
    });
  };

  Zipacker.prototype.createZipFileSystem = function () {
    var fs = new zip.fs.FS();
    for (var url in this.tasks) {
      var files = this.tasks[url];
      files.forEach(function (file) {
        fs.root.addHttpContent(file, url);
      });
    }
    return fs;
  };

  Zipacker.prototype.onError = function (e) {
    if (this.options.onError) {
      this.options.onError.call(this, e);
    }
  };

  Zipacker.prototype.onZipping = function (loaded, total) {
    if (this.options.onProgress) {
      this.options.onProgress.call(this, loaded, total, 'zip');
    }
    if (this.options.onZipping) {
      this.options.onZipping.call(this, loaded, total);
    }
  };

  Zipacker.prototype.onDone = function () {
    if (this.options.onZipped) {
      this.options.onZipped.call(this);
    }
    if (this.options.onDone) {
      this.options.onDone.call(this);
    }
  };

  Zipacker.prototype.onZipped = function () {
    this.onDone();
    location.href = this.fileEntry.toURL();
  };

  Zipacker.prototype.onZippedBlob = function (blob) {
    this.onDone();
    saveAs(blob, this.options.zipFile);
  };

  Zipacker.prototype.onCreatedFile = function (fileEntry) {
    var fs = this.createZipFileSystem();
    this.fileEntry = fileEntry;
    fs.exportFileEntry(fileEntry, this.onZipped, this.onZipping, this.onError);
  };

  Zipacker.prototype.onOpenedFile = function (fileEntry) {
    fileEntry.remove(function () {
      fileEntry.filesystem.root.getFile(this.options.zipFile, {create: true}, this.onCreatedFile);
    }.bind(this), this.onError);
  };

  Zipacker.prototype.onRequestedFileSystem = function (fs) {
    fs.root.getFile(this.options.zipFile, {create: true}, this.onOpenedFile);
  };

  Zipacker.prototype.onRequestedQuota = function (grantedBytes) {
    requestFileSystem(TEMPORARY , grantedBytes, this.onRequestedFileSystem, this.onError);
  };

  Zipacker.prototype.onDownloading = function (loaded, total) {
    if (this.options.onProgress) {
      this.options.onProgress.call(this, loaded, total, 'download');
    }
    if (this.options.onDownloading) {
      this.options.onDownloading.call(this, loaded, total);
    }
  };

  Zipacker.prototype.onDownloaded = function () {
    if (this.options.onDownloaded) {
      this.options.onDownloaded.call(this);
    }
    if (temporaryStorage) {
      temporaryStorage.requestQuota(this.options.quota, this.onRequestedQuota, this.onError);
    } else {
      var fs = this.createZipFileSystem();
      fs.exportBlob(this.onZippedBlob, this.onZipping, this.onError);
    }
  };

  Zipacker.prototype.download = function () {
    var urls = Object.keys(this.tasks);
    preload({
      files: urls,
      onProgress: this.onDownloading,
      onLoad: this.onDownloaded
    });
  };

  window.Zipacker = Zipacker;
})();
