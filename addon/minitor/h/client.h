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
#include <minitor_client.h>

Napi::Value px_create_onion_client_sync(const Napi::CallbackInfo& info);
Napi::Value bind_px_create_onion_client(const Napi::CallbackInfo& info);
Napi::Number d_connect_onion_client_sync(const Napi::CallbackInfo& info);
Napi::Value bind_d_connect_onion_client(const Napi::CallbackInfo& info);
Napi::Number d_write_onion_client_sync(const Napi::CallbackInfo& info);
Napi::Value bind_d_write_onion_client(const Napi::CallbackInfo& info);
Napi::Number d_read_onion_client_sync(const Napi::CallbackInfo& info);
Napi::Value bind_d_read_onion_client(const Napi::CallbackInfo& info);
Napi::Number bind_d_close_onion_client_stream(const Napi::CallbackInfo& info);
void bind_v_close_onion_client(const Napi::CallbackInfo& info);
