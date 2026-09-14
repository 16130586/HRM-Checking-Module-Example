# Third-Party Licenses

This file records the licenses of the project's direct dependencies. Transitive dependencies may have additional notices and licenses; regenerate a complete dependency report when publishing a release.

## Project License

The project license has not been declared. This file does not grant permission to use, modify, or redistribute the project source code. Add a root `LICENSE` file with the chosen project license before distributing the application.

## Frontend Dependencies

| Package | Version | License | Source |
| --- | ---: | --- | --- |
| `@mediapipe/camera_utils` | `0.3.1675466862` | Apache-2.0 | https://github.com/google/mediapipe |
| `@mediapipe/face_detection` | `0.4.1646425229` | Apache-2.0 | https://github.com/google/mediapipe |
| `@mediapipe/tasks-vision` | `1.0.1` | Apache-2.0 | https://github.com/google/mediapipe |
| `@tailwindcss/vite` | `4.3.3` | MIT | https://github.com/tailwindlabs/tailwindcss |
| `react` | `19.2.8` | MIT | https://github.com/facebook/react |
| `react-dom` | `19.2.8` | MIT | https://github.com/facebook/react |
| `react-router-dom` | `7.18.3` | MIT | https://github.com/remix-run/react-router |
| `@eslint/js` | `10.0.1` | MIT | https://github.com/eslint/eslint |
| `@types/react` | `19.2.18` | MIT | https://github.com/DefinitelyTyped/DefinitelyTyped |
| `@types/react-dom` | `19.2.7` | MIT | https://github.com/DefinitelyTyped/DefinitelyTyped |
| `@vitejs/plugin-react` | `6.1.1` | MIT | https://github.com/vitejs/vite-plugin-react |
| `autoprefixer` | `10.5.6` | MIT | https://github.com/postcss/autoprefixer |
| `eslint` | `^10.10.0` | MIT | https://github.com/eslint/eslint |
| `eslint-plugin-react-hooks` | `7.1.1` | MIT | https://github.com/facebook/react |
| `eslint-plugin-react-refresh` | `0.5.6` | MIT | https://github.com/ArnaudBarre/eslint-plugin-react-refresh |
| `globals` | `17.12.0` | MIT | https://github.com/sindresorhus/globals |
| `postcss` | `8.5.28` | MIT | https://github.com/postcss/postcss |
| `tailwindcss` | `4.3.3` | MIT | https://github.com/tailwindlabs/tailwindcss |
| `vite` | `8.3.0` | MIT | https://github.com/vitejs/vite |

## .NET Dependencies

| Package | Version | License | Source |
| --- | ---: | --- | --- |
| `Microsoft.EntityFrameworkCore` | `8.0.20` | MIT | https://github.com/dotnet/efcore |
| `Microsoft.EntityFrameworkCore.Design` | `8.0.20` | MIT | https://github.com/dotnet/efcore |
| `Npgsql.EntityFrameworkCore.PostgreSQL` | `8.0.8` | PostgreSQL License | https://github.com/npgsql/efcore.pg |
| `Pgvector.EntityFrameworkCore` | `0.2.2` | MIT | https://github.com/pgvector/pgvector-dotnet |
| `Microsoft.ML.OnnxRuntime` | `1.18.1` | MIT | https://github.com/microsoft/onnxruntime |
| `Microsoft.VisualStudio.Azure.Containers.Tools.Targets` | `1.22.1` | MIT | https://github.com/microsoft/DockerTools |
| `SixLabors.ImageSharp` | `2.1.7` | Six Labors Split License | https://github.com/SixLabors/ImageSharp |
| `Swashbuckle.AspNetCore` | `6.6.2` | MIT | https://github.com/domaindrivendev/Swashbuckle.AspNetCore |

## Other Components

- PostgreSQL and the `pgvector` extension are supplied by Docker/runtime configuration. Their licenses are not dependency package entries and should be tracked separately for a production distribution.
- The `w600k_r50.onnx` model is a separate model artifact. Its model-card and redistribution terms must be checked independently before redistribution.
- .NET, Node.js, npm, Docker, and browser APIs are platform/tooling components and are not repeated as application package dependencies here.

## Release Checklist

Before distributing a release:

1. Choose and add a project license in `LICENSE`.
2. Generate a transitive dependency license report from the lock files or package managers.
3. Include required MIT, Apache-2.0, PostgreSQL, and Six Labors notices in the distribution.
4. Verify the ONNX model, PostgreSQL/pgvector, and any Docker image license terms.
