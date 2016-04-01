/**
 * [zipacker]{@link https://github.com/emn178/zipacker}
 *
 * @version 0.1.1
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
    this.textTasks = {};
    this.fs = new zip.fs.FS();

    ['onDownloading', 'onDownloaded', 'onRequestedQuota', 'onRequestedFileSystem',
     'onOpenedFile', 'onCreatedFile', 'onError', 'onZipping', 'onZipped', 'onZippedBlob'].forEach(function (event) {
      this[event] = this[event].bind(this);
    }.bind(this));
  }

  Zipacker.prototype.addBlob = function (blob, file) {
    this.fs.root.addBlob(file, blob);
  };

  Zipacker.prototype.addData64URI = function (dataURI, file) {
    this.fs.root.addData64URI(file, dataURI);
  };

  Zipacker.prototype.addText = function (text, file) {
    this.fs.root.addText(file, text);
  };

  Zipacker.prototype.isDir = function (dir) {
    return dir === '' || dir.charAt(dir.length - 1) == '/';
  };

  Zipacker.prototype.add = function (files, dir) {
    if (files.constructor == Blob) {
      return this.addBlob(files, dir);
    }
    var tasks = this.tasks, renamable = false, file;
    dir = dir || '';
    if (!Array.isArray(files)) {
      if (typeof files == 'object') {
        for (var url in files) {
          this.add(url, files[url]);
        }
        return;
      } else {
        renamable = this.isDir(dir);
        files = [files];
      }
    } else if (!this.isDir(dir)) {
      dir = dir + '/';
    }
    files.forEach(function (url) {
      if (renamable) {
        file = dir;
      } else {
        var parts = url.split('/');
        file = parts[parts.length - 1];
        file = file.split('?')[0];
        file = dir + file;
      }
      if (!tasks[url]) {
        tasks[url] = [];
      }
      tasks[url].push(file);
    });
  };

  Zipacker.prototype.doTasks = function () {
    var fs = this.fs;
    for (var url in this.tasks) {
      var files = this.tasks[url];
      files.forEach(function (file) {
        fs.root.addHttpContent(file, url);
      });
    }
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
    this.doTasks();
    this.fileEntry = fileEntry;
    this.fs.exportFileEntry(fileEntry, this.onZipped, this.onZipping, this.onError);
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
      this.doTasks();
      this.fs.exportBlob(this.onZippedBlob, this.onZipping, this.onError);
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
