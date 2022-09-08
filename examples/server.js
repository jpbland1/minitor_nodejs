const http = require( 'http' );
const minitor = require( '../build/Release/minitor' )

const PORT = 8080

let ret = minitor.d_minitor_INIT()

console.log( 'd_minitor_INIT', ret )

if ( ret == 0 )
  ret = minitor.d_setup_onion_service( PORT, 80, './local_data/onion_service' )

console.log( 'd_setup_onion_service', ret )

if ( ret == 0 )
{
  // simple http server that returns JSON with the method used
  const server = http.createServer( function( req, res ) {
    res.writeHead( 200, { 'content-type': 'application/json' } )

    console.log( req.headers )

    switch ( req.method )
    {
      case 'GET':
        res.end( JSON.stringify({ method: 'GET' }) )

        break;
      case 'POST':
        res.end( JSON.stringify({ method: 'POST' }) )

        break;
      case 'PUT':
        res.end( JSON.stringify({ method: 'PUT' }) )

        break;
      case 'DELETE':
        res.end( JSON.stringify({ method: 'DELETE' }) )

        break;
      default:
        res.end( JSON.stringify({ method: 'UNKNOWN' }) )

        break;
    }
  } ).listen( PORT )
}
