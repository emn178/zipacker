# zipacker
Zip and download files in client side.

## Demo
[Demo](https://emn178.github.io/zipacker/samples/demo/)

## Download
[Compress](https://raw.github.com/emn178/zipacker/master/build/zipacker.min.js)  
[Uncompress](https://raw.github.com/emn178/zipacker/master/src/zipacker.js)

## Installation
You can also install zipacker by using Bower.
```
bower install zipacker
```

## Requirements
* [zip.js](https://gildas-lormeau.github.io/zip.js/index.html)  
* [FileSaver.js](https://github.com/eligrey/FileSaver.js)  
* [preloader](https://github.com/emn178/preloader)

## Usage
```JavaScript
var packer = new Zipacker({
  // download zip file name, default is 'download.zip'
  zipFile: 'download.zip',

  // request quota of temporary storage, default is 1073741824 (1 GB)
  quota: 1073741824,

  // events
  onDownloading: function (loaded, total) {},
  onDownloaded: function () {},
  onZipping: function (loaded, total) {},
  onDone: function () {},
  onError: function (e) {}
});

// add file or files to root
packer.add(['file1.jpg', 'file2.jpg']);
packer.add('file3.jpg');

// add file or files to folder
packer.add('file4.jpg', 'folder/path/');

// add files and rename
packer.add({
  'file5.jpg': 'new.jpg',
  'file6.jpg': 'folder/path/new2.jpg'
});

packer.download();
```

## License
The project is released under the [MIT license](http://www.opensource.org/licenses/MIT).

## Contact
The project's website is located at https://github.com/emn178/zipacker  
Author: Chen, Yi-Cyuan (emn178@gmail.com)
