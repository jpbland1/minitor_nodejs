{
    "targets": [{
        "target_name": "minitor",
        "cflags!": [ "-fno-exceptions"],
        "cflags_cc!": [ "-fno-exceptions"],
        "sources": [
            "addon/minitor/main.cpp",
            "addon/minitor/minitor.cpp",
            "addon/minitor/client.cpp",
            "addon/minitor/service.cpp"
        ],
        'include_dirs': [
            "<!@(node -p \"require('node-addon-api').include\")"
        ],
        'libraries': [
          "/usr/local/lib/libminitor.so",
          "/usr/local/lib/libwolfssl.so"
        ],
        'dependencies': [
            "<!(node -p \"require('node-addon-api').gyp\")"
        ]
    }],
    'defines': [ 'NAPI_DISABLE_C_EXCEPTIONS' ]
}
