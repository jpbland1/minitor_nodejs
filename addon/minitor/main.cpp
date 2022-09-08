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
#include <napi.h>
#include <stdio.h>
#include <cstring>
#include "./h/minitor.h"
#include "./h/client.h"
#include "./h/service.h"

using namespace Napi;

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  exports.Set(Napi::String::New(env, "d_minitor_INIT"), Napi::Function::New(env, bind_d_minitor_INIT));

  // create
  exports.Set(Napi::String::New(env, "px_create_onion_client_sync"), Napi::Function::New(env, px_create_onion_client_sync));
  exports.Set(Napi::String::New(env, "px_create_onion_client"), Napi::Function::New(env, bind_px_create_onion_client));
  // connect
  exports.Set(Napi::String::New(env, "d_connect_onion_client_sync"), Napi::Function::New(env, d_connect_onion_client_sync));
  exports.Set(Napi::String::New(env, "d_connect_onion_client"), Napi::Function::New(env, bind_d_connect_onion_client));
  // write
  exports.Set(Napi::String::New(env, "d_write_onion_client_sync"), Napi::Function::New(env, d_write_onion_client_sync));
  exports.Set(Napi::String::New(env, "d_write_onion_client"), Napi::Function::New(env, bind_d_write_onion_client));
  // read
  exports.Set(Napi::String::New(env, "d_read_onion_client_sync"), Napi::Function::New(env, d_read_onion_client_sync));
  exports.Set(Napi::String::New(env, "d_read_onion_client"), Napi::Function::New(env, bind_d_read_onion_client));
  // close stream
  exports.Set(Napi::String::New(env, "d_close_onion_client_stream"), Napi::Function::New(env, bind_d_close_onion_client_stream));
  // close client
  exports.Set(Napi::String::New(env, "v_close_onion_client"), Napi::Function::New(env, bind_v_close_onion_client));

  exports.Set(Napi::String::New(env, "d_setup_onion_service"), Napi::Function::New(env, bind_d_setup_onion_service));

  return exports;
}

NODE_API_MODULE( addon, Init )
