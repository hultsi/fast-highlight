cmake_minimum_required(VERSION 3.21)

# set(CMAKE_BUILD_TYPE Debug)

# set the project name
project(JustTesting CXX)

# specify compilers
set(CMAKE_C_COMPILER gcc)
set(CMAKE_CXX_COMPILER g++)

# specify the C++ standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Bundle library
add_executable(${PROJECT_NAME}
    src/main.cpp
)

# Add .h files
target_include_directories(${PROJECT_NAME} PRIVATE ${CMAKE_CURRENT_LIST_DIR}/src)