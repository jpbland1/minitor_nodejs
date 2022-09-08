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
const fs = require( 'fs' )
const path = require( 'path' )
const basename = path.basename( __filename )
const actions = {};

fs.readdirSync( __dirname )
  .filter ( file => {
    return ( file.indexOf( '.' ) !== 0 ) && ( file !== basename ) && ( file.slice( -3 ) === '.js' )
  } )
  .forEach( file => {
    const tests = require( path.join( __dirname, file ) )

    for ( const key of Object.keys( tests ) )
    {
      actions[key] = tests[key]
    }
  } )

module.exports = actions
