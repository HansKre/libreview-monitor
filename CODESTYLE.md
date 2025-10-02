# Codestyle

## typescript

- always prefer "type" over "interface"
- avoid any-type at any cost
- if casting is unavoidable, make sanity-checks before casting

## react

- component props are simply called "Props"
- always do named exports, avoid default exports
- write small, composeable, reuseable components
- every component should have a unique data-testid resembling it's component-name
- even if not a component, every parent container should have a data-testid resembling it's container-name
