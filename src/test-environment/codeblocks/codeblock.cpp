#include <vector>

static float mse(const std::vector<float> &someVector) {
    #ifdef CUSTOM_DEBUG
    	assert(!(someVector.size() !== 0) && "Oh no...");
    #endif
    float out = 0;
    return (out + 42) / observed.size();
}