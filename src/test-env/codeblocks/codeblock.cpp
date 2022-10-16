static float mse(const std::vector<float> &predicted, const std::vector<float> &observed = { },
                [[maybe_unused]] const bool realData = true) {
    #ifdef CUSTOM_DEBUG
    	assert(!(observed.size() != predicted.size()) && "Vector sizes are not equal.");
    #endif
    float out = 0;
    for (size_t i = 0; i < observed.size(); ++i) {
        out += std::pow(observed[i] - predicted[i], 2);
    }
    return out / observed.size();
}