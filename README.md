<a name="doric-framework-readme-top"></a>
<header><h1 align="center">Doric Framework</h1></header>

<!-- TABLE OF CONTENTS -->
# Table of Contents

- [About the Project](#about-the-project)
    - [Description](#description)
    - [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)
    - [Basic Usage](#basic-usage)
    - [Writing Widgets](#writing-widgets)
    - [Passing Widgets to Doric](#passing-widgets-to-doric)
    - [API Reference](#api-reference)
        - [Doric Framework Props](#doric-framework-props)
        - [Exporting the Current Workspace](#exporting-the-current-workspace)
- [License](#license)

# About the Project

## Description

Doric Framework is a column-based widget UI framework for Vue 3. It displays custom widgets in a `workspace`, allowing users to drag and drop widgets into columns and rearrange them.

<p align="right">(<a href="#doric-framework-readme-top">back to top</a>)</p>


## Dependencies

- [pinia](https://pinia.esm.dev/)
- [splitpanes](https://github.com/antoniandre/splitpanes)
- [vuedraggable](https://github.com/SortableJS/vue.draggable.next/)

Note that the `pinia` dependeny implies that you have mounted an app that uses `pinia` before using Doric. For example:

```ts
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const pinia = createPinia()
createApp(App).use(pinia).mount('#app')
```

<p align="right">(<a href="#doric-framework-readme-top">back to top</a>)</p>


# Installation

```sh
npm install --save doric-framework
```

<p align="right">(<a href="#doric-framework-readme-top">back to top</a>)</p>


<!-- USAGE EXAMPLES -->
# Usage

## Basic Usage

```vue
<script setup lang="ts">
// Required imports for Doric
import DoricFramework from 'doric-framework'
import "doric-framework/dist/style.css"

// Import a map of your widgets from index.ts at this path
import widgets from "@/components/doric-widgets/"

const workspace = [
  [{
    type: "passage-ref",
  }, {
    type: "dictionary",
  }],
  [{
    type: "text-display",
  }]
]
</script>

<template>
  <DoricFramework :widgets="widgets" :workspace="workspace" />
</template>
```

<p align="right">(<a href="#doric-framework-readme-top">back to top</a>)</p>


## Writing Widgets

Doric displays instance of widgets, which are Vue components. A minimal widget is defined as follows:

<details>
<summary>Composition API</summary>

```vue
<script setup>
import { useDoricOutput, useDoricInput } from 'doric-framework';

const setOsisRef = useDoricOutput("osisRef");
const osisRef = useDoricInput("osisRef");
</script>

<template>
  <div>
    <input type="text" v-model="osisRef.value" />
    <button @click="setOsisRef(osisRef)">Set osisRef</button>
  </div>
</template>
```

</details>

<details>
<summary>Options API</summary>

```vue
<template>
  <div>
    <input type="text" v-model="osisRef.value" />
    <button @click="setOsisRef(osisRef)">Set osisRef</button>
  </div>
</template>

<script>
import { useDoricOutput, useDoricInput } from 'doric-framework';

export default {
  data() {
    return {
      // Define input methods
      osisRef: useDoricInput("osisRef"),
    }
  },
  setup() {
    // Define output methods
    return {
      setOsisRef: useDoricOutput("osisRef"),
    }
  },
}
</script>  
```

</details>

<p align="right">(<a href="#doric-framework-readme-top">back to top</a>)</p>


## Passing Widgets to Doric

Doric expects a list of widgets to be passed to it. This list is a map of widget types to default labels and widget components. It is typical to import all the widgets in a single file and pass them to Doric.

```ts
// /src/components/doric-widgets/index.ts
import MyFirstWidget from "@/components/doric-widgets/MyFirstWidget.vue";
import MySecondWidget from "@/components/doric-widgets/MySecondWidget.vue";

export default {
  "my-first-widget": { 
    defaultLabel: "My First Widget",
    widget: MyFirstWidget,
  },
  "my-second-widget": { 
    defaultLabel: "My Second Widget",
    widget: MySecondWidget,
  },
};
```

These widgets can then be passed to Doric as follows:

```vue
<!-- App.vue -->
<script> 
import DoricFramework from 'doric-framework'

// If your Widget map is not in index.ts, you will need to specify it.
import widgets from "@/components/doric-widgets/"
...
</script>

<template>
  <DoricFramework :widgets="widgets" />
</template>
```

<p align="right">(<a href="#doric-framework-readme-top">back to top</a>)</p>


## API Reference

### Doric Framework Props

The DoricFramework component accepts the following props:

| Prop | Type | Description |
| --- | --- | --- |
| `widgets` | `WidgetComponentMap` | A map of widget types to default labels and widget components (see example above). |
| `workspace` | `Workspace` | A list of columns, each of which is a list of widgets. A minimal Widget is an object that includes a type, which is a key in the `WidgetComponentMap`. |
| `locked` | `boolean` | Whether the workspace is locked. |
| `@setSharedParams` | `Function` | A callback function that is emitted whenever a widget's input value changes and it is marked as `shared`. |
| `@onWorkspaceReady` | `Function` | A callback function that is emitted after the `workspace` property has been changed and the new workspace is ready. Useful for setting initial state. |

### Pushing State to the Workspace

Doric exports the `pushWorkspaceState` function for pushing state to the current workspace. The main use of `pushWorkspaceState` is to set initial values (e.g., from localstorage or a url), but state may also come from outside Doric in realtime applications. `pushWorkspaceState` expects a `WidgetInputState[]`. `WidgetInputState` is an object with three fields:

```ts
type WidgetInputState = {
  widgetId: string;
  key: string;
  value: any;
};
```

To set initial state, your application may look something like this:

```vue
<script setup>
import DoricFramework, { pushWorkspaceState } from "doric-framework";
import widgets from "@/components/doric-widgets/";

const workspace = [
  [{
    type: "passage-ref",
  }, {
    type: "dictionary",
  }],
  [{
    type: "text-display",
  }]
]

// Set initial state
const onWorkspaceReady = () => {
  pushWorkspaceState([
    {
      widgetId: "passage-ref",
      key: "osisRef",
      value: "Gen.1.1",
    },
    {
      widgetId: "dictionary",
      key: "selectedLemma",
      value: "λογός",
    },
  ]);
};
</script>

<template>
  <DoricFramework
    :widgets="widgets"
    :workspace="workspace"
    @onWorkspaceReady="onWorkspaceReady"
  />
</template>
```

### Exporting the Current Workspace

The `doric-framework` package provides an `exportWorkspace` function. This function serializes the current workspace into a minimal `Workspace`—i.e., a `Widget[][]` that includes the position of widgets in columns as well as their non-falsy input values, subscription, sharing states. Thus, the return type of `exportWorkspace` may be passed into `<DoricFramework />` as the `workspace` prop. This allows workspace state to be restored across sessions.

It may be imported alongside the `DoricFramework` component as follows:

```vue
// App.vue
<script setup>
import DoricFramework, { exportWorkspace } from 'doric-framework'
</script>
```

<p align="right">(<a href="#doric-framework-readme-top">back to top</a>)</p>


# License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#doric-framework-readme-top">back to top</a>)</p>
