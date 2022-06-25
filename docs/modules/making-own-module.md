---
sidebar_label: 'Making your own Modules'
sidebar_position: 3
description: A guide on how to make your own Homarr Module
tags:
  - Modules
  - Development
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Making your own Modules

Homarr can be easily extended using Modules. We ship commononly used Modules by default to you. If you'd like to integrate other services into Homarr Modules, you can make your own Module.

:::warning

Making your own module is at your own risk. We can provide only limited help to the development of own modules. We highly apprechiate if you consider sharing your module with us, to further extend the collection of built-in modules of Homarr. Please read our [Contribution Guidelines](https://github.com/ajnart/homarr/blob/master/CONTRIBUTING.md) and [Code of Conduct](https://github.com/ajnart/homarr/blob/master/CODE_OF_CONDUCT.md).

:::

## Preparations

To create your own Module, you will have to modify the Homarr source code.
If you've never used NextJS before, we recommend you to have a look at the official [NextJS documentation](https://nextjs.org), since Homarr is built with NextJS.

Modifying the source code requires you to have a version of Homarr installed from source. Docker (Compose) and UNRAID will not work.

**Prepare your Workspace**
<Tabs>
  <TabItem value="orange" label="Yarn Package Manager" default>
    <ul>
      <li>Clone the Repository using <code>git clone https://github.com/ajnart/homarr.git</code></li>
      <li>Enter the created directory using <code>cd homarr</code></li>
      <li>Install all dependencies using <code>yarn install</code></li>
      <li>Build the source using <code>yarn build</code></li>
      <li>Start the NextJS web server using <code>yarn dev</code></li>
    </ul>
  </TabItem>
  <TabItem value="apple" label="NPM Package Manager">
    <ul>
      <li>Clone the Repository using <code>git clone https://github.com/ajnart/homarr.git</code></li>
      <li>Enter the created directory using <code>cd homarr</code></li>
      <li>Install all dependencies using <code>npm install</code></li>
      <li>Build the source using <code>npm build</code></li>
      <li>Start the NextJS web server using <code>npm dev</code></li>
    </ul>
  </TabItem>
</Tabs>

**Use a capable editor for development**
If you have not installed a development environment yet, your OS will probably open the source code files in the default notepad editor.
Usually, those are very basic and offer no help for development.

We'd recommend to install one of these editors for development:
- Visual Studio Code *(highly recommended)*
- Atom
- Sublime
- PHPStorm *(paid)*

Depending on your environment, you need to install additional extensions or plugins for development with NextJS.

:::info

This documentation will be expanded in the near future, explaining how to make a Module.

:::