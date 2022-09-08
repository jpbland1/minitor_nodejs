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
const { MinitorHttpClient, MinitorHttpClientSync } = require( '../interfaces/client.js' )

const onionAddress = 'pq353f2opvjfohqrery7ddastz3w6zdpryjobk6nhrxzzswuqccg63id.onion'
//const onionAddress = 'aqezki35vwnwboguqbeurrordfxx2pd2elsxzejplg3q3qmfibl6gwyd.onion'
//const onionAddress = 'fnwpszjadqlradan5ozpq55jlln53eqo3dguefji5loqb3tztsfov6qd.onion'

const client_tests =
{
  clientHttpSync: async function()
  {
    if ( minitor.d_minitor_INIT() != 0 )
    {
      console.log( 'FAIL clientHttpSync failed to d_minitor_INIT' )
    }

    let client = new MinitorHttpClientSync( onionAddress )

    client.init()

    let res = client.get( '/' )

    console.log( res )

    res = client.post( '/', { test: 'feff' } )

    console.log( res )

    res = client.put( '/', { test: 'feff' } )

    console.log( res )

    res = client.destroy( '/' )

    console.log( res )

    client.close()

    console.log( 'PASS clientHttpSync' )
  },

  clientHttp: async function()
  {
    if ( minitor.d_minitor_INIT() != 0 )
    {
      console.log( 'FAIL clientHttpSync failed to d_minitor_INIT' )
      return
    }

    let client = new MinitorHttpClient( onionAddress )

    await client.init()

    // make all of our requests simultaneously
    let results = await Promise.all([
      client.get( '/' ),
      client.post( '/', { test: 'feff' } ),
      client.put( '/', { test: 'feff' } ),
      client.destroy( '/' )
    ])

    console.log( results )

    client.close()

    console.log( 'PASS clientHttp' )
  }
}

module.exports = client_tests
