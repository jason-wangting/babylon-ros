# This package provides a loader for URDF files in Babylon.js.

> **Note:** This project builds upon the work done in [babylon_ros](https://github.com/polyhobbyist/babylon_ros), with additional configurations and integration with the standard loader interface designed by Babylon.js.

# Installation
To install the package, use npm:

```bash
npm install babylon-urdf-loader
```

# Usage
To use the URDF loader, first, register it with the Babylon.js SceneLoader:

```javascript
import { URDFLoader } from "babylon-urdf-loader";
SceneLoader.RegisterPlugin(new URDFLoader());
```
Once registered, you can load URDF files using the standard file loading interface provided by Babylon.js. For more details on loading different file types, refer to the [Babylon.js documentation](https://doc.babylonjs.com/features/featuresDeepDive/importers/loadingFileTypes).

# Configuration
Additional configurations can be made to customize the loader. Please refer to the documentation or explore the available options within the URDFLoader class.