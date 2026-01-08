export default /* glsl */`
uniform float yOffset;

void modifyCenter(inout vec3 center) {
    // Modify the splat center position
    // Increment Y position by yOffset (updated each frame)
    center.y += yOffset;
}

void modifyCovariance(vec3 originalCenter, vec3 modifiedCenter, inout vec3 covA, inout vec3 covB) {
    // Modify the splat size/covariance
    // Example to scale all splats by 2x:
    // gsplatApplyUniformScale(covA, covB, 2.0);
    //
    // Example to clamp size to a range:
    // float size = gsplatExtractSize(covA, covB);
    // float newSize = clamp(size, 0.01, 0.5);
    // gsplatApplyUniformScale(covA, covB, newSize / size);
    //
    // Example to make splats round/spherical:
    // float size = gsplatExtractSize(covA, covB);
    // gsplatMakeRound(covA, covB, size * 0.5);
    //
    // To hide a splat:
    // gsplatMakeRound(covA, covB, 0.0);
}

void modifyColor(vec3 center, inout vec4 color) {
    // Modify the splat color
    // Example: color.rgb *= 0.5; // darken all splats
}
`;
