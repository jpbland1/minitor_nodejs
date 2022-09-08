# Minitor Nodejs Bindings
Minitor is an embedded version of Tor designed to run on embedded hardware and inside user applications, removing the need for IaaS for most IOT applications. This package is a wrapper that allows minitor to be used within nodejs, which is convenient for inclusion in smartphone applications built using ionic.
## Installation
This package requires that wolfSSL with expanded key support and minitor both be installed, those libraries can be found here [wolfSSL](https://github.com/jpbland1/wolfssl-expanded-ed25519) [Minitor](https://github.com/jpbland1/minitor/tree/linux)  
To link wolfSSL and Minitor you need to run `export LD_LIBRARY_PATH=/usr/local/lib` or wherever you have your libraries installed.  
Once the libraries have been installed, this package can be installed using npm:
```
npm i minitor
```
## Usage
NOTE that these examples use the server.js script located in the examples directory. It starts a web server and onion service that will have a different onion address than the one found in these examples, to start the server run `node server.js` from the examples directory.  
### Promise Interfaces
For ease of use minitor includes an http interface class called MinitorHttpClient that makes RESTful api requests over Tor simple:
```
const { minitor, MinitorHttpClient } = require( 'minitor' )

// start minitor daemon
if ( minitor.d_minitor_INIT() != 0 )
{
  console.log( 'failed to d_minitor_INIT' )
  return
}

// NOTE your onion address will differ
let client = new MinitorHttpClient( 'fnwpszjadqlradan5ozpq55jlln53eqo3dguefji5loqb3tztsfov6qd.onion' )

// create a rendezvous connection to the service
await client.init()

// make all of our requests simultaneously
let results = await Promise.all([
  client.get( '/' ),
  client.post( '/', { test: 'feff' } ),
  client.put( '/', { test: 'feff' } ),
  client.destroy( '/' )
])

console.log( results )

// close the rendezvous connection and cleanup the service data
client.close()
```
If you are using a different protocol or need to send raw data over the connection the plain `MinitorClient` can be used to send and recieve data like a normal socket:
```
const { minitor, MinitorClient } = require( 'minitor' )

// this examples still uses http but any data can be used in write and read calls
const REQUEST = Buffer.from( 'GET / HTTP/1.0\r\nHost: 127.0.0.1\r\nUser-Agent: esp-idf/1.0 esp3266\r\nContent-Type: text/plain\r\n\r\n\r\n' )

// start minitor daemon
if ( minitor.d_minitor_INIT() != 0 )
{
  console.log( 'failed to d_minitor_INIT' )
  return
}

// NOTE your onion address will differ
let client = new MinitorClient( 'fnwpszjadqlradan5ozpq55jlln53eqo3dguefji5loqb3tztsfov6qd.onion' )

// create a rendezvous connection
await client.init()

// create a stream on port 80
let stream = await client.connect( 80 )

// write the http request
await client.write( stream, REQUEST )

// read the http response
let response = await client.read( stream )

console.log( response.toString() )

client.close()
```
### Sync Interfaces
If you cannot use promises in your application `MinitorHttpClientSync` and `MinitorClientSync` can be used with the same calls above
### C api
Minitor can also be accessed from the normal C api:
```
const { minitor } = require( 'minitor' )

const REQUEST = Buffer.from( 'GET / HTTP/1.0\r\nHost: 127.0.0.1\r\nUser-Agent: esp-idf/1.0 esp3266\r\nContent-Type: text/plain\r\n\r\n\r\n' )

let ret = minitor.d_minitor_INIT()

if ( ret < 0 )
{
  console.log( 'FAIL failed to d_minitor_INIT' )

  return
}

let client = minitor.px_create_onion_client( 'duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion' )

if ( client == null )
{
  console.log( 'FAIL failed to px_create_onion_client' )

  return
}

let stream = minitor.d_connect_onion_client( client, 80 )

if ( stream <= 0 )
{
  console.log( 'FAIL failed to d_connect_onion_client' )

  return
}

if ( minitor.d_write_onion_client( client, stream, REQUEST, REQUEST.length ) != REQUEST.length )
{
  console.log( 'FAIL failed to d_connect_onion_client' )

  return
}

let read_buf = Buffer.alloc( 512 )

do
{
  ret = minitor.d_read_onion_client( client, stream, read_buf, read_buf.length )

  if ( ret < 0 )
  {
    console.log( 'FAIL failed to d_connect_onion_client' )

    return
  }

  console.log( read_buf.toString() )
} while ( ret == read_buf.length )

console.log( 'PASS client_rend_write_read successful' )
```
## Test Output
```
{ headers:
   { 'content-type': 'application/json',
     date: 'Tue, 06 Sep 2022 18:20:35 GMT',
     connection: 'close',
     'transfer-encoding': 'chunked' },
  chunks: [ '{"method":"GET"}' ],
  lastChunk: true,
  status: 200,
  rawHeaders:
   'HTTP/1.1 200 OK\r\ncontent-type: application/json\r\nDate: Tue, 06 Sep 2022 18:20:35 GMT\r\nConnection: close\r\nTransfer-Encoding: chunked',
  body: { method: 'GET' },
  rawBody: '10\r\n{"method":"GET"}\r\n0' }
{ headers:
   { 'content-type': 'application/json',
     date: 'Tue, 06 Sep 2022 18:20:41 GMT',
     connection: 'close',
     'transfer-encoding': 'chunked' },
  chunks: [ '{"method":"POST"}' ],
  lastChunk: true,
  status: 200,
  rawHeaders:
   'HTTP/1.1 200 OK\r\ncontent-type: application/json\r\nDate: Tue, 06 Sep 2022 18:20:41 GMT\r\nConnection: close\r\nTransfer-Encoding: chunked',
  body: { method: 'POST' },
  rawBody: '11\r\n{"method":"POST"}\r\n0' }
{ headers:
   { 'content-type': 'application/json',
     date: 'Tue, 06 Sep 2022 18:20:44 GMT',
     connection: 'close',
     'transfer-encoding': 'chunked' },
  chunks: [ '{"method":"PUT"}' ],
  lastChunk: true,
  status: 200,
  rawHeaders:
   'HTTP/1.1 200 OK\r\ncontent-type: application/json\r\nDate: Tue, 06 Sep 2022 18:20:44 GMT\r\nConnection: close\r\nTransfer-Encoding: chunked',
  body: { method: 'PUT' },
  rawBody: '10\r\n{"method":"PUT"}\r\n0' }
{ headers:
   { 'content-type': 'application/json',
     date: 'Tue, 06 Sep 2022 18:20:47 GMT',
     connection: 'close',
     'transfer-encoding': 'chunked' },
  chunks: [ '{"method":"DELETE"}' ],
  lastChunk: true,
  status: 200,
  rawHeaders:
   'HTTP/1.1 200 OK\r\ncontent-type: application/json\r\nDate: Tue, 06 Sep 2022 18:20:47 GMT\r\nConnection: close\r\nTransfer-Encoding: chunked',
  body: { method: 'DELETE' },
  rawBody: '13\r\n{"method":"DELETE"}\r\n0' }
PASS clientHttpSync
[ { headers:
     { 'content-type': 'application/json',
       date: 'Tue, 06 Sep 2022 18:21:08 GMT',
       connection: 'close',
       'transfer-encoding': 'chunked' },
    chunks: [ '{"method":"GET"}' ],
    lastChunk: true,
    status: 200,
    rawHeaders:
     'HTTP/1.1 200 OK\r\ncontent-type: application/json\r\nDate: Tue, 06 Sep 2022 18:21:08 GMT\r\nConnection: close\r\nTransfer-Encoding: chunked',
    body: { method: 'GET' },
    rawBody: '10\r\n{"method":"GET"}\r\n0' },
  { headers:
     { 'content-type': 'application/json',
       date: 'Tue, 06 Sep 2022 18:21:08 GMT',
       connection: 'close',
       'transfer-encoding': 'chunked' },
    chunks: [ '{"method":"POST"}' ],
    lastChunk: true,
    status: 200,
    rawHeaders:
     'HTTP/1.1 200 OK\r\ncontent-type: application/json\r\nDate: Tue, 06 Sep 2022 18:21:08 GMT\r\nConnection: close\r\nTransfer-Encoding: chunked',
    body: { method: 'POST' },
    rawBody: '11\r\n{"method":"POST"}\r\n0' },
  { headers:
     { 'content-type': 'application/json',
       date: 'Tue, 06 Sep 2022 18:21:08 GMT',
       connection: 'close',
       'transfer-encoding': 'chunked' },
    chunks: [ '{"method":"PUT"}' ],
    lastChunk: true,
    status: 200,
    rawHeaders:
     'HTTP/1.1 200 OK\r\ncontent-type: application/json\r\nDate: Tue, 06 Sep 2022 18:21:08 GMT\r\nConnection: close\r\nTransfer-Encoding: chunked',
    body: { method: 'PUT' },
    rawBody: '10\r\n{"method":"PUT"}\r\n0' },
  { headers:
     { 'content-type': 'application/json',
       date: 'Tue, 06 Sep 2022 18:21:08 GMT',
       connection: 'close',
       'transfer-encoding': 'chunked' },
    chunks: [ '{"method":"DELETE"}' ],
    lastChunk: true,
    status: 200,
    rawHeaders:
     'HTTP/1.1 200 OK\r\ncontent-type: application/json\r\nDate: Tue, 06 Sep 2022 18:21:08 GMT\r\nConnection: close\r\nTransfer-Encoding: chunked',
    body: { method: 'DELETE' },
    rawBody: '13\r\n{"method":"DELETE"}\r\n0' } ]
PASS clientHttp
```
