# Writing Stats

Writing Stats is a [simple app](https://tkonopka.github.io/writingstats/) to 
help with writing. 



## Features

 - Load text from local files or URLs.
 - Isolate and display problem sentences and paragraphs.
 - Automatically remove latex and knitr components from the analysis, i.e. focus
on natural language components of the input text.
 - Perform analysis on sections of large documents using %start% and %end% tags.
 - Save revised changes using a file download.

See the [about](https://tkonopka.github.io/writingstats/about/) page for a 
user's guide.


## Development

The app is written in javascript. The code is split into parts:

 - ws.js - core functions for manipulating strings (paragraphs, sentences, etc.)
 - ws-web.js - logic for running the web page UI
 - ws-plot.js - graphics.

The test folder contains unit tests for the core library (ws.js). 
See the README in the test folder for additional details.



## Acknowledgments

 - [d3](https://github.com/d3/d3) document manipulation and graphics
 - [underscore.js](http://underscorejs.org/) general purpose js tools
 - [sanitize-html](https://github.com/punkave/sanitize-html) cleaning of user input
 - [filesaver](https://github.com/eligrey/FileSaver.js) saving files 
 - [bootstrap](http://getbootstrap.com/) responsive HTML
 - [Google fonts](https://fonts.google.com/)

