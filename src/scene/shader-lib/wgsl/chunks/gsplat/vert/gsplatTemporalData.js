export default /* wgsl */`
#ifdef USE_TEMPORAL_GSPLAT
    var splatTemporal : texture_2d<f32>;
    var splatTemporalMotion : texture_2d<f32>;
    uniform gsplatTime: f32;

    struct TemporalData {
        ts: f32,
        t_scale: f32,
        motion: vec3f,
        marginal_t: f32
    };

    // read temporal parameters for a splat
    fn readTemporalData(source: SplatSource) -> TemporalData {
        let temporalParams = textureLoad(splatTemporal, source.uv, 0);
        let motionParams = textureLoad(splatTemporalMotion, source.uv, 0);

        var temporal: TemporalData;
        temporal.ts = temporalParams.x;
        temporal.t_scale = temporalParams.y;
        temporal.motion = motionParams.xyz;

        // Calculate marginal_t
        // cov_t = (exp(t_scale)) ** 2
        let cov_t_sqrt = exp(temporal.t_scale);
        let cov_t = cov_t_sqrt * cov_t_sqrt;

        // marginal_t = exp(-0.5 * (t - ts) ** 2 / cov_t)
        let t_diff = gsplatTime - temporal.ts;
        temporal.marginal_t = exp(-0.5 * t_diff * t_diff / cov_t);

        return temporal;
    }

    // Check if splat should be culled based on marginal_t
    fn shouldCullTemporal(temporal: TemporalData) -> bool {
        return temporal.marginal_t < 0.05;
    }

    // Apply temporal transformations to center position
    fn applyTemporalMotion(center: vec3f, temporal: TemporalData) -> vec3f {
        // positions = self.positions + self.motion * (t - self.ts)
        let t_diff = gsplatTime - temporal.ts;
        return center + temporal.motion * t_diff;
    }

    // Modify opacity by marginal_t
    fn applyTemporalOpacity(opacity: f32, temporal: TemporalData) -> f32 {
        // opacity = self.opacities * marginal_t
        return opacity * temporal.marginal_t;
    }
#endif
`;
