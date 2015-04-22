solveforall-example-plugins
===========================

[![Join the chat at https://gitter.im/jtsay362/solveforall-example-plugins](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/jtsay362/solveforall-example-plugins?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Example plugins for Solve for All

[![Join the chat at https://gitter.im/jtsay362/solveforall-example-plugins](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/jtsay362/solveforall-example-plugins?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This repository contains the source code for the actual plugins by Solve for All used on the site. Pull requests for fixes, more features, and more plugins are very welcome! Also keep in mind you can upload your own plugins to Solve for All without our approval. You can also continue to run your own plugins and publish them to the the Solve for All community. 

## Building

This project uses Sass to preprocess SCSS files into CSS, and uglify to minify Javascript. It can also concatenate
JS files together for client-side JS included in trusted inline content. To be able to process the files, install `npm` and `gulp` if you haven't already, then

    npm install

To process the files, type:

    gulp
    
which will output the processed files in `build`.    

## Testing

This project contains a test harness for EJS or Javascript plugins. To run the tests, install Apache Ant and type:

    ant

See the files in `test` to see how to add tests.

## Pull Requests

Pull requests are accepted for the following reasons:

* Changes to the official Solve for All plugins (which more users are likely to have installed already): modify or add code to the `src` directory
* Requested additions to the set of available CommonJS modules: modify or add code to the `test_harness/modules` directory, add a sample to `src` that shows it working. Note that these are preferred over built-ins.
* Requested additions to the built-in Javascript environment: modify or add code to the `test_harness/builtins` directory, add a sample to `src` that shows it working.
 

