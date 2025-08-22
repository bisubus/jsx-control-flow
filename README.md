# jsx-control-flow

<p align="center">
  <img src="./assets/logo.svg" width="500" alt="jsx-control-flow" />
</p>

A lightweight library providing React components for declarative control flow in JSX. The components are supposed to replace short-circuit operators, complex ternaries, `Array.map()`, and IIFEs.

Inspired by frameworks like Vue (`v-for`, `v-if`) and Angular (`@for`, `@if`, `@switch`, `@let`), this library brings similar declarative functionality to React.

## Description

When it comes to control flow in React, developers are obliged to rely on imperative constructs like ternary and short-circuit operators, or inline `map()` calls in JSX expressions. This quickly starts to affect the readability and maintainability of the code and makes it error-prone. 

### 💤 **Before**

```jsx
<>
  {res.data.user.role === 'admin' ? (
    <AdminDashboard />
  ) : res.data.user.role === 'user' ? (
    res.data.tasks?.length ? (
      res.data.tasks.map((task, index) => <TaskItem key={index} task={task} />)
    ) : (
      <div>No tasks assigned</div>
    )
  ) : (
    <GuestView />
  )}
</>
```

### ✨ **After**

```jsx
<Let value={res.data}>{({ user: { role }, tasks }) => (
  <If cond={role === 'admin'}>
    <Then><AdminDashboard /></Then>
    <ElseIf cond={role === 'user'}>
      <For of={tasks} empty={<div>No tasks assigned</div>}>
        {(task, index) => <TaskItem key={index} task={task} />}
      </For>
    </ElseIf>
    <Else><GuestView /></Else>
  </If>
)}</Let>
```

### Highlights

- **`<For>`**: Iterate over objects and arrays similarly to `for..in` and `for..of` with a fallback for empty collections.
- **`<If>`**: Conditional rendering with support for if-else if-else branches.
- **`<Switch>`**: Declarative switch-case-default logic based on a value.
- **`<Let>`**: A substitute for local variables to pass computed values to children.

### What Sets It Apart

- Thorough TypeScript support for type safety.
- Naming conventions that align with JavaScript conditional and loops statements.
- Objects and iterables are supported in loops.
- Lazy evaluation with render functions for elements and getters for values.
- Consistent use of fallbacks for empty collections and default cases.
- ~~Other libraries are [NIH](https://en.wikipedia.org/wiki/Not_invented_here).~~

## Installation

```sh
npm install jsx-control-flow
```

## Usage

### `<For>`: Iterate over Collections

Allows iterating over objects and iterables, similarly to `for..in` and `for..of` loops in JavaScript. It also provides a way to handle empty values, thus avoiding the need for additional checks.

#### Examples

**Iterating over an object:**

```jsx
<For in={users} empty={<div>No users found</div>}>
  {(user, key) => <UserCard key={key} user={user} />}
</For>
```

The element provided in `empty` prop is used as a fallback when a collection is empty.

**Iterating over an array or other iterable:**

```jsx
<For of={items} empty={() => <div>List is empty</div>}>
  {(item, index) => <Item key={index} data={item} />}
</For>
```

`empty` prop can also be render function for lazy evaluation.

**Using `<Empty>` for a fallback:**

```jsx
<For of={() => data.tasks}>
  {({ name }, index) => <Task key={index} name={name} />}
  <Empty>{() => <div>No tasks available</div>}</Empty>
</For>
```

Value getter function can be used to access a collection lazily if object path isn't available immediately.

#### Prior Work

- Angular [`*ngFor`](https://angular.io/api/common/NgFor)/[`@for`](https://angular.dev/api/core/@for)
- Vue.js [`v-for`](https://vuejs.org/guide/essentials/list#v-for)
- Svelte [`#each`](https://svelte.dev/docs/svelte/each) 
- SolidJS [`<For>`](https://docs.solidjs.com/reference/components/for)

---

### `<If>`: Conditional Rendering

Simplify conditional logic with `if`, `else if`, and `else` branches.

#### Examples

**Basic usage:**

```jsx
<If cond={isLoggedIn} else={<Login />}>
  {() => <Dashboard />}
</If>
```

**With `<Then>`, `<ElseIf>`, and `<Else>`:**

```jsx
<If cond={isAdmin}>
  <Then>
    <AdminPanel/>
  </Then>
  <ElseIf cond={isUser}>
    <UserDashboard />
  </ElseIf>
  <Else>
    <GuestView />
  </Else>
</If>
```

**With getter functions for lazy evaluation of expressions:**

```jsx
<If getCond={() => data.isReady}>
  {() => <ReadyState />}
  <ElseIf getCond={() => data.isLoading}>
    <LoadingState />
  </ElseIf>
</If>
```

#### Prior Work

- Angular [`*ngIf`](https://angular.io/api/common/NgIf)/[`@if`](https://angular.dev/api/core/@if)
- Vue.js [`v-if`](https://vuejs.org/guide/essentials/list#v-if)
- Svelte [`#if`](https://svelte.dev/docs/svelte/if)
- SolidJS [`<Show>`](https://docs.solidjs.com/reference/components/show)

---

### `<Switch>`: Declarative Switch-Case

Render based on a value with support for default cases.

#### Example

```jsx
<Switch value={status}>
  <Case value="loading">
    <Loading />
  </Case>
  <Case value="success">
    <Success />
  </Case>
  <Default>
    <Error />
  </Default>
</Switch>
```

`<Switch>` can also use `getValue` getter function for a value.

#### Prior Work

- Angular [`*ngIf`](https://angular.io/api/common/NgIf)/[`@if`](https://angular.dev/api/core/@if)
- Vue.js [`v-if`](https://vuejs.org/guide/essentials/list#v-if)
- Svelte [`#if`](https://svelte.dev/docs/svelte/if)
- SolidJS [`<Show>`](https://docs.solidjs.com/reference/components/show)

---

### `<Let>`: Pass Computed Values

Allows passing computed or derived values to child components. Works as a replacement for redundant child components, IIFEs in JSX expressions.

#### Example

```jsx
<Let value={user?.name}>
  {(name = '') => <WelcomeMessage name={name} />}
</Let>
```

#### Prior Work

- Angular [`@let`](https://angular.dev/api/core/@let)
- Svelte [`@const`](https://svelte.dev/docs/svelte/@const)

---

## API Reference

### `<For>`
- **Props**:
  - (required) `in`: Object to iterate over.
  - (required) `of`: Array to iterate over.
  - `empty`: Render function or element as a fallback for empty collection.
  - `children`: 
    - (required) Render function `(value, keyOrIndex) => ReactNode`.
    - `<Empty>` Render function or element as a fallback for empty collection.

### `<If>`
- **Props**:
  - (required)`cond`: Condition expression.
  - (required) `getCond`: Function returning a condition.
  - `else`: Fallback content.
  - `children`:
    - (required) Render function `() => ReactNode`.
    - (required) `<Then>`.
    - `<ElseIf>`.
    - `<Else>`.

### `<Switch>`
- **Props**:
  - (required) `value`: Value to match against.
  - (required) `getValue`: Function returning a value.
  - `children`:
    - `<Case>`
    - `<Default>`

### `<Let>`
- **Props**:
  - `value`: Computed value.
  - `children`: Render function `(value) => ReactNode`.

---

## Contributing

Contributions are welcome. Feel free to open issues or submit pull requests.

---

## License

MIT
