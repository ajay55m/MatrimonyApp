if(NOT TARGET fbjni::fbjni)
add_library(fbjni::fbjni SHARED IMPORTED)
set_target_properties(fbjni::fbjni PROPERTIES
    IMPORTED_LOCATION "C:/Users/ajay2/.gradle/caches/9.0.0/transforms/49cde1acd35737fffc0a351edeac3186/transformed/jetified-fbjni-0.7.0/prefab/modules/fbjni/libs/android.armeabi-v7a/libfbjni.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/ajay2/.gradle/caches/9.0.0/transforms/49cde1acd35737fffc0a351edeac3186/transformed/jetified-fbjni-0.7.0/prefab/modules/fbjni/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

