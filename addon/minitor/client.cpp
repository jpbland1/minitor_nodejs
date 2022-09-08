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
#include "./h/client.h"
#include <stdio.h>

Napi::Value px_create_onion_client_sync(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  std::string address = info[0].As<Napi::String>().Utf8Value();

  void* client = px_create_onion_client( address.c_str() );

  if ( client == NULL )
  {
    return env.Null();
  }
  else
  {
    Napi::External<void> client_ext = Napi::External<void>::New( env, client );

    return client_ext;
  }
}

class px_create_onion_clientAsyncWorker : public Napi::AsyncWorker
{
  public:
    px_create_onion_clientAsyncWorker( Napi::Function& callback, std::string address )
      : Napi::AsyncWorker( callback ), address( address )
    {
    }

    ~px_create_onion_clientAsyncWorker() {}

    void Execute() override
    {
      client = px_create_onion_client( address.c_str() );
    }

    void OnOK() override
    {
      Napi::HandleScope scope(Env());

      if ( client == NULL )
      {
        Callback().Call({Env().Undefined(), Env().Undefined()});
      }
      else
      {
        Callback().Call({Env().Undefined(), Napi::External<void>::New( Env(), client )});
      }
    }
  private:
    void* client;
    std::string address;
};

Napi::Value bind_px_create_onion_client(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  std::string address = info[0].As<Napi::String>().Utf8Value();
  Napi::Function callback = info[1].As<Napi::Function>();

  px_create_onion_clientAsyncWorker* worker = new px_create_onion_clientAsyncWorker( callback, address );
  worker->Queue();

  return env.Undefined();
}

Napi::Number d_connect_onion_client_sync(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  int ret;
  void* client = info[0].As<Napi::External<void>>().Data();
  uint16_t port = info[1].As<Napi::Number>().Int32Value();

  ret = d_connect_onion_client( client, port );

  return Napi::Number::New( env, ret );
}

class d_connect_onion_clientAsyncWorker : public Napi::AsyncWorker
{
  public:
    d_connect_onion_clientAsyncWorker( Napi::Function& callback, void* client, uint16_t port  )
      : Napi::AsyncWorker( callback ), client( client ), port( port )
    {
    }

    ~d_connect_onion_clientAsyncWorker() {}

    void Execute() override
    {
      ret = d_connect_onion_client( client, port );
    }

    void OnOK() override
    {
      Napi::HandleScope scope(Env());
      Callback().Call({Env().Undefined(), Napi::Number::New(Env(), ret)});
    }
  private:
    int ret;
    void* client;
    uint16_t port;
};

Napi::Value bind_d_connect_onion_client(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  void* client = info[0].As<Napi::External<void>>().Data();
  uint16_t port = info[1].As<Napi::Number>().Int32Value();
  Napi::Function callback = info[2].As<Napi::Function>();

  d_connect_onion_clientAsyncWorker* worker = new d_connect_onion_clientAsyncWorker( callback, client, port );
  worker->Queue();

  return env.Undefined();
}

Napi::Number d_write_onion_client_sync(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  int ret;
  void* client = info[0].As<Napi::External<void>>().Data();
  uint16_t stream_id = info[1].As<Napi::Number>().Int32Value();
  uint8_t* write_buf = info[2].As<Napi::Uint8Array>().Data();
  int write_len = info[3].As<Napi::Number>().Int32Value();

  ret = d_write_onion_client( client, stream_id, write_buf, write_len );

  return Napi::Number::New( env, ret );
}

class d_write_onion_client_clientAsyncWorker : public Napi::AsyncWorker
{
  public:
    d_write_onion_client_clientAsyncWorker( Napi::Function& callback, void* client, uint16_t stream_id, uint8_t* write_buf, int write_len )
      : Napi::AsyncWorker( callback ), client( client ), stream_id( stream_id ), write_buf( write_buf ), write_len( write_len )
    {
    }

    ~d_write_onion_client_clientAsyncWorker() {}

    void Execute() override
    {
      ret = d_write_onion_client( client, stream_id, write_buf, write_len );
    }

    void OnOK() override
    {
      Napi::HandleScope scope(Env());
      Callback().Call({Env().Undefined(), Napi::Number::New(Env(), ret)});
    }
  private:
    int ret;
    void* client;
    uint16_t stream_id;
    uint8_t* write_buf;
    int write_len;
};

Napi::Value bind_d_write_onion_client(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  void* client = info[0].As<Napi::External<void>>().Data();
  uint16_t stream_id = info[1].As<Napi::Number>().Int32Value();
  uint8_t* write_buf = info[2].As<Napi::Uint8Array>().Data();
  int write_len = info[3].As<Napi::Number>().Int32Value();
  Napi::Function callback = info[4].As<Napi::Function>();

  d_write_onion_client_clientAsyncWorker* worker = new d_write_onion_client_clientAsyncWorker( callback, client, stream_id, write_buf, write_len );
  worker->Queue();

  return env.Undefined();
}

Napi::Number d_read_onion_client_sync(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  int ret;
  void* client = info[0].As<Napi::External<void>>().Data();
  uint16_t stream_id = info[1].As<Napi::Number>().Int32Value();
  uint8_t* read_buf = info[2].As<Napi::Uint8Array>().Data();
  int read_len = info[3].As<Napi::Number>().Int32Value();

  ret = d_read_onion_client( client, stream_id, read_buf, read_len );

  return Napi::Number::New( env, ret );
}

class d_read_onion_clientAsyncWorker : public Napi::AsyncWorker
{
  public:
    d_read_onion_clientAsyncWorker( Napi::Function& callback, void* client, uint16_t stream_id, uint8_t* read_buf, int read_len )
      : Napi::AsyncWorker( callback ), client( client ), stream_id( stream_id ), read_buf( read_buf ), read_len( read_len )
    {
    }

    ~d_read_onion_clientAsyncWorker() {}

    void Execute() override
    {
      ret = d_read_onion_client( client, stream_id, read_buf, read_len );
    }

    void OnOK() override
    {
      Napi::HandleScope scope(Env());
      Callback().Call({Env().Undefined(), Napi::Number::New(Env(), ret)});
    }
  private:
    int ret;
    void* client;
    uint16_t stream_id;
    uint8_t* read_buf;
    int read_len;
};

Napi::Value bind_d_read_onion_client(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  void* client = info[0].As<Napi::External<void>>().Data();
  uint16_t stream_id = info[1].As<Napi::Number>().Int32Value();
  uint8_t* read_buf = info[2].As<Napi::Uint8Array>().Data();
  int read_len = info[3].As<Napi::Number>().Int32Value();
  Napi::Function callback = info[4].As<Napi::Function>();

  d_read_onion_clientAsyncWorker* worker = new d_read_onion_clientAsyncWorker( callback, client, stream_id, read_buf, read_len );
  worker->Queue();

  return env.Undefined();
}

Napi::Number bind_d_close_onion_client_stream(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  int ret;
  void* client = info[0].As<Napi::External<void>>().Data();
  uint16_t stream_id = info[1].As<Napi::Number>().Int32Value();

  ret = d_close_onion_client_stream( client, stream_id );

  return Napi::Number::New( env, ret );
}

void bind_v_close_onion_client(const Napi::CallbackInfo& info)
{
  void* client = info[0].As<Napi::External<void>>().Data();

  v_close_onion_client( client );

  free( client );
}
