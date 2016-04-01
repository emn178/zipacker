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
var zip = new Zipacker({
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
zip.add(['http://host/file1.jpg', 'rel/path/file2.jpg']);         // put in root 
zip.add(['http://host/file1.jpg', 'rel/path/file2.jpg'], 'dir');  // put in 'dir' folder
zip.add('file3.jpg');     // file3.jpg in root

// add file or files to folder
zip.add('file4.jpg', 'folder/in/zip/');   // folder/in/zip/file4.jpg
zip.add('file4.jpg', 'path/to/new.jpg');  // path/to/new.jpg

// add files and rename
zip.add({
  'http://host/file5.jpg': 'new.jpg',     // new.jpg in root
  'file6.jpg': 'folder/in/zip/new2.jpg',  // folder/in/zip/new2.jpg
  'file7.jpg': 'folder/in/zip/'           // folder/in/zip/file7.jpg
});

// add blob
zip.add(blob, 'file.bin');
zip.addBlob(blob, 'file.bin');

// add text
zip.addText('Hello zip', 'file.txt');

// add addData64URI
zip.addData64URI('data:image/png;base64,...', 'file.png');

zip.download();
```

## License
The project is released under the [MIT license](http://www.opensource.org/licenses/MIT).

## Contact
The project's website is located at https://github.com/emn178/zipacker  
Author: Chen, Yi-Cyuan (emn178@gmail.com)
