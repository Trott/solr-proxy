# [9.0.0](https://github.com/Trott/solr-proxy/compare/v8.0.0...v9.0.0) (2022-04-18)


### Features

* add TypeScript types ([18b3c15](https://github.com/Trott/solr-proxy/commit/18b3c15ff59d035aa715d1edea46c1d7c9d0d4cf))


### BREAKING CHANGES

* This module is now ESM only.
* Drop support for Node.js 12.x

# [9.0.0](https://github.com/Trott/solr-proxy/compare/v8.0.0...v9.0.0) (2022-04-18)


### Features

* add TypeScript types ([18b3c15](https://github.com/Trott/solr-proxy/commit/18b3c15ff59d035aa715d1edea46c1d7c9d0d4cf))


### BREAKING CHANGES

* This module is now ESM only.
* Drop support for Node.js 12.x

# [8.0.0](https://github.com/Trott/solr-proxy/compare/v7.0.0...v8.0.0) (2022-02-13)


### chore

* use fastify proxy ([14af414](https://github.com/Trott/solr-proxy/commit/14af414dd94218e5634ecf8678b4569153adfeeb))


### BREAKING CHANGES

* Some options have changed.

# [7.0.0](https://github.com/Trott/solr-proxy/compare/v6.0.1...v7.0.0) (2022-02-11)


### chore

* remove debug dependency ([3774dc6](https://github.com/Trott/solr-proxy/commit/3774dc6af0402aea4a9548060cd76935a61ca50e))


### BREAKING CHANGES

* Use NODE_DEBUG=solr-proxy instead of DEBUG=solr-proxy
for verbose output.

## [6.0.1](https://github.com/Trott/solr-proxy/compare/v6.0.0...v6.0.1) (2022-01-14)


### Bug Fixes

* update dependencies ([2ea26a9](https://github.com/Trott/solr-proxy/commit/2ea26a9fd349039da39cfaec2ba546c5791aedc7))

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
