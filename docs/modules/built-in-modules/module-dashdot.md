# 📟 Dash. Module

The Dash. module will integrate your existing Dash. instance into Homarr. The graphs will be integrated using [iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe).
Additionally, you can enable or disable certain graphs, or enable the Multi-Core view for the CPU.

You can test the Module using the public Dash. Demo: https://dash.mauz.io/

:::tip

If you are accessing Dash. trough a reverse proxy, iframe might be disabled by default and the graphs cannot be loaded. Please note that iframe access must be allowed for this module.

:::

## Activate the Module
Please read our documentation on [how to enable a module](./../index.md#activating-a-module).

## Configuration
| Configuration         | Description | Values | Default Value |
| --------------------- | ----------- | ------ | ------------- |
| CPU Multi-Core View | Shows the usage of each core instead of the total usage | yes / no | no |
| Storage Multi-Drive View | Shows the usage of each drive visible to Dash. instead of the total usage | yes / no | no |
| Use Compact View | Reduce the size of the individual graphs, which makes them use less space. Recommended for smaller screens | yes / no | no |
| Graphs | Selection of the Dash. graphs, which should be displayed | yes / no | CPU, RAM, Storage, Network |

![dash dot configuration](./img/module-dashdot-configuration.png)

## Screenshots

![dash dot module in light mode](./img/module-dashdot-light-mode.png)