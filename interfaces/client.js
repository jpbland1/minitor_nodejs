/*
Copyright (C) 2022 Triple Layer Development Inc.

Minitor is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

Minitor is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/
const minitor = require( '../build/Release/minitor' )

const MINITOR_ERROR = -1
const MINITOR_CLIENT_ERROR = -2
const MINITOR_STREAM_ERROR = -3

const chunkSize = 1024;

function populateOptions( options, uri )
{
  if ( !options )
  {
    options = {}
  }

  if ( !options.headers )
  {
    options.headers = {}
  }

  options.uri = uri

  // set all headers to lowercase for consistency
  for ( const name in Object.keys( options.headers ) )
  {
    options.headers[name.toLowerCase()] = options.headers[name]
    options.headers[name] = undefined
  }

  // if option is not set, set default
  options.headers['host'] = '127.0.0.1'
  options.headers['connection'] = 'close'
  options.port ? null : options.port = 80
  options.headers['accept'] ? null : options.headers['accept'] = 'application/json'
  options.headers['user-agent'] = 'Mozilla/5.0 (X11; Linux x86_64; rv:104.0) Gecko/20100101 Firefox/104.0'

  return options
}

function applyContentType( options, payload )
{
  if ( !options.headers['content-type'] && !options.headers['Content-Type'] )
  {
    options.headers['content-type'] = 'application/json'
  }

  if ( options.headers['content-type'] == 'application/json' )
  {
    payload = JSON.stringify( payload )
  }

  return payload
}

function buildFrame( options )
{
  let frame

  frame = `${ options.method } ${ options.uri } HTTP/1.1\r\n`

  for ( const key in options.headers )
  {
    frame += `${ key }: ${ options.headers[key] }\r\n`
  }

  frame += '\r\n'

  return frame
}

function parseFrame( frameText, res )
{
  let key
  let val
  let colonIndex
  // split the frame into header and body
  let parts
  let headerLines
  let chunkLen
  let chunkBodyIndex
  let workingChunk

  // no res indicates we have a chunked or multi celled message
  if ( !res )
  {
    res = { headers: {}, chunks: [], lastChunk: false }

    parts = frameText.split( '\r\n\r\n' )
    headerLines = parts[0].split( '\r\n' )

    // check the response
    if ( headerLines[0].indexOf( 'HTTP/' ) != 0 )
    {
      throw { message: 'Invalid HTTP response', body: frameText }
    }

    // get the status
    res.status = parseInt( headerLines[0].split( ' ' )[1] )

    // pop the first header off
    headerLines.shift()

    for ( const line of headerLines )
    {
      colonIndex = line.indexOf( ':' )

      // default to lower case
      key = line.slice( 0, colonIndex ).toLowerCase()
      // + 2 will skip the : and space
      val = line.slice( colonIndex + 2 )

      res.headers[key] = val
    }

    res.rawHeaders = parts[0]
    res.body = parts[1]
    res.rawBody = parts[1]
  }
  else
  {
    res.body += frameText
    res.rawBody += frameText
  }

  // check if chunked
  if ( res.headers['transfer-encoding'] == 'chunked' )
  {
    workingChunk = res.body

    // get the length of chunk data
    chunkLen = parseInt( workingChunk, 16 )

    while ( chunkLen > 0 && workingChunk.length )
    {
      // skip past the chunk len and \r\n
      chunkBodyIndex = workingChunk.indexOf( '\r\n' ) + 2

      // put the chunk data into the array
      res.chunks.push( workingChunk.slice( chunkBodyIndex, chunkBodyIndex + chunkLen ) )

      // skip past the chunk body and \r\n
      workingChunk = workingChunk.slice( chunkBodyIndex + chunkLen + 2 )

      // get the length of chunk data
      chunkLen = parseInt( workingChunk, 16 )
    }

    if ( chunkLen == 0 )
    {
      res.lastChunk = true
      res.body = res.chunks.join( '' )
    }
  }
  else
  {
    // if we have at least content-length bytes set lastChunk true
    if ( res.headers['content-length'] <= res.rawBody.length )
    {
      res.lastChunk = true
    }
  }

  return res
}

class MinitorClientSync
{
  constructor( onionAddress )
  {
    this.onionAddress = onionAddress;
    this.client = null
  }

  init()
  {
    if ( this.client != null )
    {
      throw 'Cannot init, client already exists'
    }

    this.client = minitor.px_create_onion_client_sync( this.onionAddress )

    if ( !this.client )
    {
      throw 'Failed to px_create_onion_client'
    }
  }

  connect( port )
  {
    if ( this.client == null )
    {
      throw 'Invalid minitor client'
    }

    let stream = minitor.d_connect_onion_client_sync( this.client, port )

    if ( stream < 0 )
    {
      throw `Failed to d_connect_onion_client ${ stream }`
    }

    return stream
  }

  write( stream, data )
  {
    if ( this.client == null )
    {
      throw 'Invalid minitor client'
    }

    if ( typeof data == 'string' )
    {
      data = Buffer.from( data )
    }

    if ( !Buffer.isBuffer( data ) )
    {
      throw 'data must be string or Buffer'
    }

    let ret = minitor.d_write_onion_client_sync( this.client, stream, data, data.length )

    if ( ret < 0 )
    {
      throw { err: `Failed to d_write_onion_client ${ ret }`, code: ret }
    }
  }

  read( stream )
  {
    let ret
    let readBuf
    let chunks = []

    if ( this.client == null )
    {
      throw 'Invalid minitor client'
    }

    do
    {
      readBuf = Buffer.alloc( chunkSize )

      ret = minitor.d_read_onion_client_sync( this.client, stream, readBuf, readBuf.length )

      if ( ret < 0 )
      {
        throw { err: `Failed to d_read_onion_client ${ ret }`, code: ret }
      }

      if ( ret != readBuf.length )
      {
        readBuf = readBuf.subarray( 0, ret )
      }

      chunks.push( readBuf )
    } while ( ret == chunkSize )

    return Buffer.concat( chunks )
  }

  closeStream( stream )
  {
    if ( this.client == null )
    {
      throw 'Invalid minitor client'
    }

    let ret = minitor.d_close_onion_client_stream( this.client, stream )

    if ( ret != 0 )
    {
      throw `Failed to d_close_onion_client_stream ${ ret }`
    }
  }

  close()
  {
    if ( this.client == null )
    {
      throw 'Invalid minitor client'
    }

    minitor.v_close_onion_client( this.client )
    this.client = null
  }
}

exports.MinitorClientSync = MinitorClientSync

class MinitorClient
{
  constructor( onionAddress )
  {
    this.onionAddress = onionAddress
    this.client = null
  }

  async init()
  {
    if ( this.client != null )
    {
      throw 'Cannot init, client already exists'
    }

    this.client = await new Promise( ( res, rej ) =>
    {
      minitor.px_create_onion_client( this.onionAddress, ( err, client ) =>
      {
        if ( err )
        {
          return rej( err )
        }

        res( client )
      } )
    } )

    if ( !this.client )
    {
      throw 'Failed to px_create_onion_client'
    }
  }

  async connect( port )
  {
    let stream

    if ( this.client == null )
    {
      throw 'Invalid minitor client'
    }

    stream = await new Promise( ( res, rej ) =>
    {
      minitor.d_connect_onion_client( this.client, port, ( err, stream_id ) =>
      {
        if ( err )
        {
          return rej( err )
        }

        res( stream_id )
      } )
    } )

    if ( stream < 0 )
    {
      throw `Failed to d_connect_onion_client ${ stream }`
    }

    return stream
  }

  async write( stream, data )
  {
    let ret

    if ( this.client == null )
    {
      throw 'Invalid minitor client'
    }

    if ( typeof data == 'string' )
    {
      data = Buffer.from( data )
    }

    if ( !Buffer.isBuffer( data ) )
    {
      throw 'data must be string or Buffer'
    }

    ret = await new Promise( ( res, rej ) =>
    {
      minitor.d_write_onion_client( this.client, stream, data, data.length, ( err, ret_val ) =>
      {
        if ( err )
        {
          return rej( err )
        }

        res( ret_val )
      } )
    } )

    if ( ret != data.length )
    {
      throw { err: `Failed to d_write_onion_client ${ ret }`, code: ret }
    }
  }

  async read( stream )
  {
    let ret
    let readBuf
    let chunks = []

    if ( this.client == null )
    {
      throw 'Invalid minitor client'
    }

    do
    {
      readBuf = Buffer.alloc( chunkSize )

      ret = await new Promise( ( res, rej ) =>
      {
        minitor.d_read_onion_client( this.client, stream, readBuf, readBuf.length, ( err, ret_val ) =>
        {
          if ( err )
          {
            return rej( err )
          }

          res( ret_val )
        } )
      } )

      if ( ret < 0 )
      {
        throw { err: `Failed to d_read_onion_client ${ ret }`, code: ret }
      }

      if ( ret != readBuf.length )
      {
        readBuf = readBuf.subarray( 0, ret )
      }

      chunks.push( readBuf )
    } while ( ret == chunkSize )

    return Buffer.concat( chunks )
  }

  closeStream( stream )
  {
    if ( this.client == null )
    {
      throw 'Invalid minitor client'
    }

    let ret = minitor.d_close_onion_client_stream( this.client, stream )

    if ( ret != 0 )
    {
      throw `Failed to d_close_onion_client_stream ${ ret }`
    }
  }

  close()
  {
    if ( this.client == null )
    {
      throw 'Invalid minitor client'
    }

    minitor.v_close_onion_client( this.client )
    this.client = null
  }
}

exports.MinitorClient = MinitorClient

class MinitorHttpClientSync extends MinitorClientSync
{
  constructor( onionAddress )
  {
    super( onionAddress )
  }

  request( options, payload )
  {
    let res
    let requestFrame
    let streamPort
    let responseFrame
    let stream

    // build the frame from options
    requestFrame = buildFrame( options )

    if ( payload )
    {
      requestFrame += payload
      requestFrame += '\r\n\r\n'
    }

    stream = this.connect( options.port );

    this.write( stream, requestFrame )

    do
    {
      // read the response
      responseFrame = this.read( stream ).toString()

      // parse the http response
      res = parseFrame( responseFrame, res )
    } while ( !res || res.lastChunk == false )

    if ( res.headers['content-type'].indexOf( 'application/json' ) != -1 )
    {
      res.body = JSON.parse( res.body )
    }

    return res
  }

  get( uri, options )
  {
    options = populateOptions( options, uri )

    options.method = 'GET'

    return this.request( options )
  }

  post( uri, payload, options )
  {
    options = populateOptions( options, uri )

    options.method = 'POST'

    payload = applyContentType( options, payload )

    return this.request( options, payload )
  }

  put( uri, payload, options )
  {
    options = populateOptions( options, uri )

    options.method = 'PUT'

    payload = applyContentType( options, payload )

    return this.request( options, payload )
  }

  destroy( uri, options )
  {
    options = populateOptions( options, uri )

    options.method = 'DELETE'

    return this.request( options )
  }
}

exports.MinitorHttpClientSync = MinitorHttpClientSync

class MinitorHttpClient extends MinitorClient
{
  constructor( onionAddress )
  {
    super( onionAddress )
  }

  async request( options, payload )
  {
    let res
    let requestFrame
    let streamPort
    let responseFrame
    let stream

    // build the frame from options
    requestFrame = buildFrame( options )

    if ( payload )
    {
      requestFrame += payload
      requestFrame += '\r\n\r\n'
    }

    // create a stream on the circuit
    stream = await this.connect( options.port )

    // write the frame
    await this.write( stream, requestFrame )

    do
    {
      // read the response
      responseFrame = ( await this.read( stream ) ).toString()

      // parse the http response
      res = parseFrame( responseFrame, res )
    } while ( !res || res.lastChunk == false )

    if ( res.headers['content-type'].indexOf( 'application/json' ) != -1 )
    {
      res.body = JSON.parse( res.body )
    }

    return res
  }

  async get( uri, options )
  {
    options = populateOptions( options, uri )

    options.method = 'GET'

    return this.request( options )
  }

  async post( uri, payload, options )
  {
    options = populateOptions( options, uri )

    options.method = 'POST'

    payload = applyContentType( options, payload )

    return this.request( options, payload )
  }

  async put( uri, payload, options )
  {
    options = populateOptions( options, uri )

    options.method = 'PUT'

    payload = applyContentType( options, payload )

    return this.request( options, payload )
  }

  async destroy( uri, options )
  {
    options = populateOptions( options, uri )

    options.method = 'DELETE'

    return this.request( options )
  }
}

exports.MinitorHttpClient = MinitorHttpClient
