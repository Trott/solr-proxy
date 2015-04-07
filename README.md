solr-proxy
==========

Reverse proxy to make a Solr instance read-only, rejecting requests that have the potential to modify the Solr index.

This is a clone of https://github.com/dergachev/solr-security-proxy with some bug fixes and other changes. Much of the material in this README and many of the tests are taken from that project.

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
      --port            Listen on this port                         [default: 8008]
      --backendPort    Solr backend port                           [default: 8080]
      --backendHost    Solr backend host                           [default: "localhost"]
      --validPaths      Only allow these paths (comma separated)    [default: "/solr/select"]
      --invalidParams   Block these query params (comma separated)  [default: "qt,stream"]
      --validMethods    Allow only these HTTP methods (comma separated)  [default: "GET"]
      --help, -h        Show usage
```

To start the server from your application:

```js
var SolrProxy = require('solr-proxy');
SolrProxy.start();
```

You can pass an options object as the first parameter to `start()`.

```js
var defaultOptions = {
  validHttpMethods: ['GET','HEAD'], // all other HTTP methods will be disallowed
  validPaths: ['/solr/select'],     // all other paths will be denied
  invalidParams: ['qt', 'stream'],  // blocks requests with params qt or stream.* (all other params are allowed)
  backend: {                        // proxy to solr at this location
    host: 'localhost',
    port: 8080
  }
};
```

How it works
------------

Without this proxy, the following requests can cause trouble:

```bash
# access to /solr/admin
curl http://example.com:8080/solr/admin

# addition of a new document, via POST to /solr/update
curl http://example.com:8080/solr/update?comit=true
  -H "Content-Type: text/xml"
  --data-binary '<add><doc><field name="id">testdoc</field></doc></add>'

# deleting of all documents, via POST to /solr/update
curl http://example.com:8080/solr/update?comit=true
  -H "Content-Type: text/xml"
  --data-binary '<delete><query>*:*</query></delete>'

# deleting all the documents, via GET to /update?stream.body=<delete><query>*:*</query></delete>&commit=true
curl http://example.com:8080/solr/update?stream.body=%3Cdelete%3E%3Cquery%3E*%3A*%3C%2Fquery%3E%3C%2Fdelete%3E%0A
curl http://example.com:8080/solr/update?stream.body=%3Ccommit/%3E

# Triggering remote streaming via GET to /solr/selec
#   ?stream.url=http://example.com:8080/solr/update?commit=true
#   &stream.body=<delete><query>*:*</query></delete>
# See https://issues.apache.org/jira/browse/SOLR-2854
curl http://example.com:8080/solr/select?q=*:*&indent=on&wt=ruby&rows=2&stream.url=http%3A%2F%2Fexample.com%3A8080%2Fsolr%2Fupdate%3Fcommit%3Dtruetream.body%3D%3Cdelete%3E%3Cquery%3E*%3A*%3C%2Fquery%3E%3C%2Fdelete%3E

# deleting of all documents, via GET to
#   /solr/select?qt=/update&stream.body=<delete><query>*:*</query></delete>
# See https://issues.apache.org/jira/browse/SOLR-1233#comment-13169425
# See https://issues.apache.org/jira/browse/SOLR-3161
curl http://example.com:8080/solr/select?qt=/update&stream.body=%3Cd%3E%3Cdelete%3E%3Cquery%3E*%3A*%3C%2Fquery%3E%3C%2Fdelete%3E%3Ccommit%2F%3E%3C%2Fd%3E

```

solr-proxy has the following default rules:

* Reject any requests other than GET and HEAD
* Only allow the `/solr/select` path
* Block requests with `qt` and `stream.*` query parameters.


Caveats
-------

This proxy will not do anything unless you actually ensure that your
Solr container is only being served at 127.0.0.1. If you're using Tomcat with
the proxy on the same machine, then add the following to your solr instance's
server.xml:

```xml
<Valve className="org.apache.catalina.valves.RemoteAddrValve" allow="127\.0\.0\.1"/>
```

Even with the proxy, the entirety of your solr index is world accessible. If
you need to lock it down further, consider maintaining a second core with only
public data, or implementing additional Solr request handlers (via
solr-config.xml) that specify certain query invariants.

At the moment, the proxy blacklists the parameters `qt` and `stream.*`. It's
likely considerably safer instead whitelist only the parameters your
application uses, instead.

Furthermore, this proxy does not guard against simple D.O.S. attacks agains
solr, for example see [this post on Solr DOS by David
Smiley](https://groups.google.com/d/msg/ajax-solr/zhrG-CncrRE/HsyRwmR4mEsJ).

Solr Security Resources
-----------------------

* http://wiki.apache.org/solr/SolrSecurity
* http://wiki.apache.org/solr/UpdateXmlMessages
* https://issues.apache.org/jira/browse/SOLR-2854 (remote streaming bug)
* https://issues.apache.org/jira/browse/SOLR-1233#comment-13169425 (?qt=/update hole)
* https://issues.apache.org/jira/browse/SOLR-3161 (?qt=/update hole, part 2)
* http://wiki.apache.org/solr/SolrRequestHandler
* https://github.com/evolvingweb/ajax-solr/wiki/Solr-proxies
