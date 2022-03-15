/**
 * [zipacker]{@link https://github.com/emn178/zipacker}
 *
 * @version 0.3.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2016-2022
 * @license MIT
 */
(function () {
  function Zipacker (options) {
    this.options = options || {};
    this.options.zipFile = this.options.zipFile || 'download.zip';
    this.tasks = {};
    this.fs = new zip.fs.FS();

    ['onError', 'onZipping', 'onZippedBlob'].forEach(function (event) {
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
    var tasks = this.tasks, rename = false, file;
    dir = dir || '';
    if (!Array.isArray(files)) {
      if (typeof files == 'object') {
        for (var url in files) {
          this.add(url, files[url]);
        }
        return;
      } else {
        rename = !this.isDir(dir);
        files = [files];
      }
    } else if (!this.isDir(dir)) {
      dir = dir + '/';
    }
    files.forEach(function (url) {
      if (rename) {
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

  Zipacker.prototype.onZippedBlob = function (blob) {
    if (this.options.onZipped) {
      this.options.onZipped.call(this);
    }
    saveAs(blob, this.options.zipFile);
    if (this.options.onDone) {
      this.options.onDone.call(this);
    }
  };

  Zipacker.prototype.zipInMemory = function () {
    this.doTasks();
    this.fs.exportBlob({
      onprogress: this.onZipping,
      password: this.options.password,
      zipCrypto: !!this.options.password
    }).then(this.onZippedBlob, this.onError);
  };

  Zipacker.prototype.download = function () {
    this.zipInMemory();
  };

  window.Zipacker = Zipacker;
})();
