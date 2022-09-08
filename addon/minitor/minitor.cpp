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
#include "./h/minitor.h"

Napi::Number bind_d_minitor_INIT(const Napi::CallbackInfo& info)
{
  int ret;
  Napi::Env env = info.Env();

  ret = d_minitor_INIT();

  return Napi::Number::New( env, ret );
}
