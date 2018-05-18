solr-proxy
==========

Reverse proxy to make a Solr instance read-only, rejecting requests that have the potential to modify the Solr index.

This is a rewrite of [solr-security-proxy](https://github.com/dergachev/solr-security-proxy) with some bug fixes and additional features.

[![Build Status](https://secure.travis-ci.org/Trott/solr-proxy.png)](http://travis-ci.org/Trott/solr-proxy)

Installation
------------

For use from the command line:

```bash
npm install -g solr-proxy
```

For use in another application:

```bash
npm install solr-proxy
```

Usage
-----

From the command-line:

```bash
solr-proxy
```

Options are:

```
  --port           Listen on this port                     [default: 8008]
  --backendPort    Solr backend port                       [default: 8080]
  --backendHost    Solr backend host                       [default: "localhost"]
  --validPaths     Allowed paths (comma separated)         [default: "/solr/select"]
  --invalidParams  Blocked parameters (comma separated)    [default: "qt,stream"]
  --validMethods   Allowed HTTP methods (comma separated)  [default: "GET"]
  --quiet, -q      Do not write messages to STDOUT
  --version, -v    Show version
  --help, -h       Show this message
```

To start the server from your application:

```js
var SolrProxy = require('solr-proxy');
SolrProxy.start();
```

You can pass a port number as the first argument to `start()`. You may pass a
falsy value (such as `null` or `undefined`) if you wish to use the port number
specified specified in the `listenPort` property in the options object (second
argument). If the port is not specified in either argument, the default value of
`8008` is used.

You can pass an options object as the second argument to `start()`.

```js
var defaultOptions = {
  validHttpMethods: ['GET'],        // all other HTTP methods will be disallowed
  validPaths: ['/solr/select'],     // all other paths will be denied
  invalidParams: ['qt', 'stream'],  // blocks requests with params qt or stream.* (all other params are allowed)
  backend: {                        // proxy to solr at this location
    host: 'localhost',
    port: 8080
  }
};
```

To enable verbose logging, set environment variable `DEBUG` to include `solr-proxy`.

Default Rules
-------------

solr-proxy has the following default rules:

* Reject any request methods other than GET
* Only allow the `/solr/select` path
* Block requests with `qt` and `stream.*` query parameters.


License
-------

MIT

Related Reading
---------------

* [Why use a Solr proxy?](https://github.com/dergachev/solr-security-proxy#user-content-how-it-works)
* [Solr Security Resources](https://github.com/dergachev/solr-security-proxy#user-content-solr-security-resources)
