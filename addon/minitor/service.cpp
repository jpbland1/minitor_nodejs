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

#include "./h/service.h"

Napi::Value bind_d_setup_onion_service(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  int ret;
  uint16_t local_port = info[0].As<Napi::Number>().Int32Value();
  uint16_t exit_port = info[1].As<Napi::Number>().Int32Value();
  std::string service_directory = info[2].As<Napi::String>().Utf8Value();

  ret = d_setup_onion_service( local_port, exit_port, service_directory.c_str() );

  return Napi::Number::New( env, ret );
}
