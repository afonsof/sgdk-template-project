cmake_minimum_required(VERSION 3.10)

project(sgdk-template-project)

set(HEADER_FILES
        ${CMAKE_CURRENT_SOURCE_DIR}/res
        ${CMAKE_CURRENT_SOURCE_DIR}/src
        ${CMAKE_CURRENT_SOURCE_DIR}/depends/sgdk
        ${CMAKE_CURRENT_SOURCE_DIR}/depends/sgdk/inc
        ${CMAKE_CURRENT_SOURCE_DIR}/depends/sgdk/res
)

set(SRC
    src/main.c
)

add_executable(release ${SRC})
target_include_directories(release PUBLIC ${HEADER_FILES})

add_executable(test ${SRC}
    src/tests/test.c
)
target_include_directories(test PUBLIC ${HEADER_FILES})
target_compile_definitions(test PUBLIC DEBUG=1)
