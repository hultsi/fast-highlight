#pragma once

#include <array>
#include <vector>

namespace tools {

template <typename T>
struct Image {
    std::vector<T> data;
    int width;
    int height;
};

template <typename T, int WIDTH, int HEIGHT>
Image<T> doAifOk(std::array<T, WIDTH*HEIGHT> image) {
    tools::Image img;
    return img;
}

}