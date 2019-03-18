# Lambit [![Build Status](https://travis-ci.org/jsonmaur/lambit.svg?branch=master)](https://travis-ci.org/jsonmaur/lambit)

A suite of modern hosting features for running static websites on AWS with Lambda@Edge functions. This library lets you mimic the functionality of static hosting services with things such as pushState routing and custom redirects, but with the power of CloudFront and Lambda running in your own AWS account. **Total control for a fraction of the cost.**

If you're not familiar with Lambda@Edge, read up on it [here](https://aws.amazon.com/lambda/edge/). You can also checkout my [getting started tutorial](https://read.acloud.guru/supercharging-a-static-site-with-lambda-edge-da5a1314238b) for utilizing Lambda@Edge with static sites.

## Install

```bash
$ npm install -S lambit
```

> *Note: You need to bundle the `lambit` dependency along with your Lambda function code before uploading to AWS. Check out [node-lambda](https://github.com/motdotla/node-lambda) for a quick way to bundle and deploy.*

## Getting Started

After you create your AWS Lambda function with a Node.js runtime, simply call `lambit` with your config object in place of the usual function code. It will handle everything related to the event for you.

```javascript
const lambit = require('lambit')

exports.handler = lambit({
  cleanUrls: true,
  rewrites: [
    { source: '/*', to: '/index.html' }
  ]
})
```

You will need to attach this function to three out of the four triggers on your CloudFront distribution:  
`viewer-request` `origin-request` `viewer-response`

If you want to write some custom code in your Lambda function to run alongside Lambit, just initialize it inside your function after you've done your thing:

```javascript
exports.handler = (event, context, callback) => {
    /* custom code goes here */

    lambit({
      cleanUrls: true,
      rewrites: [
        { source: '/*', to: '/index.html' }
      ]
    })(event, context, callback)
}
```

## API

#### lambit (config: Object)

- `cleanUrls`

    > *Type: `boolean/array`*  
    > *Default: `false`*
    >
    > If `true`, will redirect all URLs with an `.html` extension and append `.html` for origin requests on urls *without* an extension. It will also redirect any urls with an index file at the suffix (`/hi/index.html` => `/hi/`). If an array is used, it should be an array of [URL patterns](#pathmatching) to enable clean urls for.
    >
    > ```javascript
    > cleanUrls: true // or
    > cleanUrls: ['/blog*', '/team/*']
    > ```

- `rewrites`

    > *Type: `array`*  
    > *Default: none*
    >
    > A list of rewrites that will change the URL sent to the origin without responding with a redirect. Useful for pushState routing. Must define `source` and `to` for each rewrite.
    >
    > ```javascript
    > rewrites: [{
    >   source: '/*',
    >   to: '/index.html'
    > }]
    > ```

- `redirects`

    > *Type: `array`*  
    > *Default: none*
    >
    > A list of redirects that will return an early response sending client to a new URL. Must define `source`, `to` and an optional `code` that defaults to `301`.
    >
    > ```javascript
    > redirects: [{
    >   source: '/blog{name+}',
    >   to: 'https://medium.com/@jsonmaur{name}',
    >   code: 302
    > }]
    > ```

- `protect`

    > *Type: `object`*  
    > *Default: none*
    >
    > The authentication details for your site (only Basic Auth is supported at the moment.) You must define `username`, `password` and an optional `source` if you want to protect a subpath on your site.
    >
    > ```javascript
    > protect: {
    >   source: '/admin*',
    >   username: 'janedoe',
    >   password: 's3cr3t'
    > }
    > ```

- `headers`

    > *Type: `array`*  
    > *Default: none*
    >
    > A list of custom response headers sent to the client. Each header must define `name`, `value` and an optional `source` for only returning headers for specific paths.
    >
    > ```javascript
    > headers: [{
    >   name: 'Access-Control-Allow-Origin',
    >   value: '*',
    >   source: '/cors'
    > }]
    > ```

- `www`

    > *Type: `boolean`*  
    > *Default: none*
    >
    > If `true`, all paths will be redirected to a www version of the site. If `false`, all paths will be redirected to a non-www version of the site (the apex in most cases.) If undefined, no action will take place for either.
    >
    > ```javascript
    > www: true
    > ```

<a name="pathmatching"></a>
## Path Matching

For any config value that accepts a `source` key, you can specify a custom pattern to test against the URL. If a match is found, the operation will continue. If no matches are found, well... you get the picture. Path matching can be used for clean URLs, rewrites, redirects, headers and protect.

### Segments

```javascript
{
  source: '/hello/{name}',
  to: '/wazzup/{name}'
}
```

The above example will parse the URL and if it matches `source`, will extract `name` from the URL and construct a new URL in the destination.

You can make a segment optional by appending `?` or a named wildcard by appending `+`. You can have as many segments as you want in the URL, but you can't have two segments right next to each other as in `/{segment1}{segment2}`, two segments with the same name as in `/{segment}/{segment}`, or a segment next to a wildcard as in `/{segment}*`. The segment name must only contain letters, numbers and underscores.

##### Examples

- `/{greeting}`
    - Will match `/hello`, but not `/hello/jane`
- `/{greeting}/{name}`
    - Will match `/hello/jane`, but not `/hello/jane/doe` or `/hello`
- `/{greeting?}`
    - Will match `/` and `/hello`, but not `/hello/jane`
- `/{greeting+}`
    - Will match `/hello`, `/hello/jane` and `/hello/jane/doe`
- `/{greeting+}/doe`
    - Will match `/hello/doe` and `/hello/jane/doe`, but not `/hello`

### Wildcards

```javascript
{
  source: '/hello/*',
  to: '/wazzup'
}
```

The above example will match anything prepended with `/hello/` such as `/hello/jane` and `/hello/jane/doe/really/long/path`. Using `*` in your pattern is an "unnamed wildcard", meaning you can't extract the value and use it in your destination. If you want to use the extracted value in your destination, you can use a named wildcard as shown in the section above.

##### Examples

- `/hello*`
    - Will match `/hello`, `/hellooo` and `/hello/jane`
- `/hello/*`
    - Will match `/hello/jane` and `/hello/jane/doe`, but not `/hello`
- `/*/jane*`
    - Will match `/hello/jane` and `/hello/jane/doe`, but not `/hello/doe`

### Custom Regex

```javascript
{
  source: /hello/(.*)/,
  to: '/wazzup/{1}'
}
```

If you need to be really flexible with your pattern matching, you can define your own regular expression. Any capture groups will be extracted from the matching URL and made available in the destination as numbered segments such as `{1}` and `{2}`.

## License

[MIT](license) © [Jason Maurer](http://maur.co)
