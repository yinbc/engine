export default /* glsl */`
#ifdef USE_TEMPORAL_GSPLAT
    uniform highp sampler2D splatTemporal;
    uniform highp sampler2D splatTemporalMotion;
    uniform float gsplatTime;

    struct TemporalData {
        float ts;
        float t_scale;
        vec3 motion;
        float marginal_t;
    };

    // read temporal parameters for a splat
    bool readTemporalData(SplatSource source, out TemporalData temporal) {
        vec4 temporalParams = texelFetch(splatTemporal, source.uv, 0);
        vec4 motionParams = texelFetch(splatTemporalMotion, source.uv, 0);

        temporal.ts = temporalParams.x;
        temporal.t_scale = temporalParams.y;
        temporal.motion = motionParams.xyz;

        // Check if temporal data is essentially zero (no temporal effect)
        // This handles splats from PLY files without temporal parameters
        if (abs(temporal.t_scale) < 0.001) {
            temporal.marginal_t = 1.0;  // Full opacity, no culling
            return true;  // Render normally without temporal effects
        }

        // Calculate marginal_t
        // cov_t = (exp(t_scale)) ** 2
        float cov_t = exp(temporal.t_scale);
        cov_t = cov_t * cov_t;

        // marginal_t = exp(-0.5 * (t - ts) ** 2 / cov_t)
        float t_diff = gsplatTime - temporal.ts;
        temporal.marginal_t = exp(-0.5 * t_diff * t_diff / cov_t);

        // Cull if marginal_t < 0.05
        if (temporal.marginal_t < 0.05) {
            return false;
        }

        return true;
    }

    // Apply temporal transformations to center position
    vec3 applyTemporalMotion(vec3 center, TemporalData temporal) {
        // Skip motion for splats without temporal parameters
        if (abs(temporal.t_scale) < 0.001) {
            return center;
        }
        // positions = self.positions + self.motion * (t - self.ts)
        float t_diff = gsplatTime - temporal.ts;
        return center + temporal.motion * t_diff;
    }

    // Modify opacity by marginal_t
    float applyTemporalOpacity(float opacity, TemporalData temporal) {
        // opacity = self.opacities * marginal_t
        return opacity * temporal.marginal_t;
    }
#endif
`;
