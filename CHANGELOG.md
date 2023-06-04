## v1.0.0 (2023-06-04)

### BREAKING CHANGE

- The type of attributes was narrowed, so this would be a breaking change
- Since this changes dependency versions, there are likely to be breaking changes on dependent modules

### Feat

- **mod.ts**: add exports!
- **deps.ts**: update dependency versions

### Fix

- **TracerOptions**: remove traceroptions definition from SDK and use the API definition
- **NoOpTracer**: ensure nooptracer has valid trace and span ids
- **samplers**: update samples api and alwayoff implmentation

### Refactor

- **NonRecordingSpan**: update NonRecordingSpan to use interfaces instead of classes in its own interface

## v0.0.1 (2023-06-03)

### Feat

- 🎸 create initial alpha of Tracing SDK
