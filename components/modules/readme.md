**Each module has a set of rules:** 
- Exported Typed IModule element (Unique Name, description, component, ...) 
- Needs to be in a new folder
- Needs to be exported in the modules/newmodule/index.tsx of the new folder
- Needs to be imported in the modules/index.tsx file
- Needs to look good when wrapped with the modules/ModuleWrapper component
- Needs to be put somewhere fitting in the app (While waiting for the big AppStore overhall) 
- Any API Calls need to be safe and done on the widget itself (via useEffect or similar)
- You can't add a package (unless there is a very specific need for it. Contact [@Ajnart](ajnart@pm.me) or make a [Discussion](https://github.com/ajnart/homarr/discussions/new).
