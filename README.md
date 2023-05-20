<a name="readme-top"></a>
<h1 align="center">Doric Framework</h1>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
        <a href="#about-the-project">About the Project</a>
        <ol>
            <li><a href="#installation">Installation</a></li>
        </ol>
    </li>
    <li>
        <a href="#usage">Usage</a>
        <ol>
            <li><a href="#basic-usage">Basic Usage</a></li>
            <li><a href="#writing-widgets">Writing Widgets</a></li>
            <li><a href="#passing-widgets-to-doric">Passing Widgets to Doric</a></li>
        </ol>
    </li>
  </ol>
</details>

# About the Project

## Installation

```sh
npm install --save doric-framework
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- USAGE EXAMPLES -->
## Usage

### Basic Usage

```vue
<script setup lang="ts">
import { DoricFramework } from 'doric-framework'
import "doric-framework/dist/style.css"
import widgets from "@/components/doric-widgets/Widgets"
const workspace = [
  [{
    type: "passage-ref-widget",
  }, {
    type: "dictionary-widget",
  }],
  [{
    type: "text-display-widget",
  }]
]
</script>

<template>
  <DoricFramework :widgets="widgets" :workspace="workspace" />
</template>
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Writing Widgets

Doric displays instance of widgets, which are Vue components. A minimal widget is defined as follows:

<details>
<summary>Composition API</summary>

```vue
<script setup>
const props = defineProps({
  useDoricOutput: Function,
  useDoricInput: Function,
})
const setOsisRef = props.useDoricOutput("osisRef");
const osisRef = props.useDoricInput("osisRef");
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
export default {
    props: ['useDoricOutput', 'useDoricInput'],
    data() {
        return {
            osisRef: this.useDoricInput("osisRef");
        }
    },
    created() {
        // Define input methods
        this.setOsisRef = this.useDoricOutput("osisRef");
    },
}
</script>  
```

</details>

<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Passing Widgets to Doric

Doric expects a list of widgets to be passed to it. This list is a map of widget types to default labels and widget components. It is typical to import all the widgets in a single file and pass them to Doric.

```ts
// Widgets.ts
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
import { DoricFramework } from 'doric-framework'
import widgets from "@/components/doric-widgets/Widgets"
// Other code (e.g. workspace) omitted for brevity
</script>

<template>
  <DoricFramework :widgets="widgets" />
</template>
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
