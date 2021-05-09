# [6.0.0](https://github.com/Trott/solr-proxy/compare/v5.0.0...v6.0.0) (2021-05-09)


### chore

* drop support for 10.x ([7ba92b6](https://github.com/Trott/solr-proxy/commit/7ba92b67b526a2371a1f5ed703700eb8a594cf62))


### BREAKING CHANGES

* drop support for Node.js 10.x

# [5.0.0](https://github.com/Trott/solr-proxy/compare/v4.1.1...v5.0.0) (2021-01-04)


### config

* use canonical Solr default port for backend ([d581860](https://github.com/Trott/solr-proxy/commit/d5818609380394bd6eb944e340c052f15ab0ff43))


### BREAKING CHANGES

* If the "backend" (i.e., Solr server) port is not
specified, use the default Solr port of 8983 rather than our own default
of 8080.

Fixes: https://github.com/Trott/solr-proxy/issues/11

4.1.1
=====

* Fix alignment for default options in `--help` output.

4.1.0
=====

* Add new option `maxStart` that defaults to `1000`. (Thanks @tuolumne!)
* Drop testing for EOL Node.js 13.x.

4.0.0
=====

* Add new option `maxRows` that defaults to `200`.

3.0.0
=====

* Drop support for EOL Node.js 8.x.

2.1.2
=====

* Update dependencies includeing security fixes. Please update!

2.1.1
=====

* Fix CLI. Shipped without a required library. Whoops. Testing didn't catch it
  because the required library was in `node_modules` due to a testing
  dependency.  Ooooooffffff.

2.1.0
=====

* Add SSL capability to the proxy.

2.0.0
=====

* Node.js 8.x and 10.x support. Drop support for earlier versions.

1.2.0
=====

* Add quiet mode
* Add debug logging capabilities

1.1.2
=====

* improved line wrapping for usage message

1.1.1
=====

* fix misformatted usage message

1.1.0
=====

* --version flag

1.0.1
=====

* 100% test coverage on `index.js` and `lib/`
* documentation updates

1.0.0
=====

* Initial release
