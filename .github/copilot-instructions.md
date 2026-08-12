# GitHub Copilot Instructions

## Project Overview

This is a React + TypeScript + Vite application.

## Code Style & Conventions

### Code Formatting

This project uses **Prettier** for consistent code formatting. All code suggestions should follow these conventions:

- **No semicolons** (`semi: false`)
- **Single quotes** for strings (`singleQuote: true`) - applies to JavaScript/TypeScript code
- **Double quotes** for JSX attributes (prettier default - `jsxSingleQuote: false`)
- **Trailing commas** where valid in ES5 (`trailingComma: "es5"`)
- **2 spaces** for indentation (`tabWidth: 2`)
- **100 character** line length (`printWidth: 100`)
- **Always use parentheses** around arrow function parameters (`arrowParens: "always"`)

Format code automatically with: `npm run format`

### General

- Use TypeScript for all new files
- Use functional components with hooks (no class components)
- Prefer named exports over default exports for components
- Use meaningful, descriptive variable and function names
- Keep functions small and focused on a single responsibility

### Language and Localization

- **Always use UK English** spelling and terminology in all code, comments, documentation, and user-facing text
- Examples of UK vs US English:
  - Use "colour" not "color"
  - Use "centre" not "center"
  - Use "analyse" not "analyse"
  - Use "organisation" not "organization"
  - Use "behaviour" not "behavior"
- This applies to variable names, function names, comments, UI text, error messages, and documentation
- Exception: Keep third-party library names and technical terms in their original spelling (e.g., `color` in CSS properties)

### Constants and Magic Strings

- **Never use magic strings** - always define constants for string literals used in comparisons or as identifiers
- Define constants in the appropriate config file (`src/config/`)
- Use `UPPER_SNAKE_CASE` for constant names
- Export constants as objects with `as const` for type safety
- Example:

  ```tsx
  // ❌ BAD - Magic strings
  if (disasterType === 'windSpeed') {
    // ...
  }

  // ✅ GOOD - Use constants
  import { DISASTER_TYPES } from '@/config/weather'

  if (disasterType === DISASTER_TYPES.WIND_SPEED) {
    // ...
  }
  ```

- For disaster types, use `DISASTER_TYPES` constants from `@/config/weather`
- For metadata (names, labels, units), use `DISASTER_METADATA` from `@/config/weather`
- For flood risk levels, use `FLOOD_RISK_LEVELS` constants from `@/config/weather`
- For theme values, use `THEMES` constants from `@/hooks/useTheme`
- For theme metadata (brand names, logos), use `THEME_METADATA` from `@/hooks/useTheme`
- This ensures values can be updated in one place and prevents typos

### React Best Practices

- Use React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`) appropriately
- Memoize expensive computations with `useMemo`
- Memoize callback functions with `useCallback` when passing to child components
- Avoid prop drilling - use context or state management when passing data through multiple levels
- Keep components pure and predictable
- Extract reusable logic into custom hooks
- Use React Compiler patterns (enabled in this project)

### TypeScript

- Always define proper types for props, state, and function parameters
- Avoid using `any` - use `unknown` if type is truly unknown
- Create interfaces for component props named `[ComponentName]Props`
- Use type inference where possible
- Define types for API responses and domain models

### Component Structure

- Place UI components in `src/components/`
- Place reusable UI primitives in `src/components/ui/`
- Place page-level components in `src/pages/`
- Co-locate related files (tests, styles, types) near components
- Component file structure:
  ```tsx
  // 1. Imports (group by external, internal, types)
  // 2. Type/Interface definitions
  // 3. Component definition
  // 4. Styled components or sub-components (if any)
  // 5. Export
  ```

### Styling

- Use Tailwind CSS utility classes for styling
- Use the `cn()` utility from `@/lib/utils` to merge class names conditionally
- Follow Tailwind's responsive design patterns (`sm:`, `md:`, `lg:`, etc.)
- Use Radix UI components from `src/components/ui/` as building blocks
- Maintain consistent spacing using Tailwind's spacing scale

### File Naming

- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities/Hooks: camelCase (e.g., `useAuth.ts`, `formatDate.ts`)
- Constants: UPPER_SNAKE_CASE in camelCase files (e.g., `apiConfig.ts`)

### Imports

- Use absolute imports with `@/` alias (configured in Vite)
- Group imports: external packages, internal modules, types, styles
- Example:

  ```tsx
  import { useState } from 'react'
  import { useNavigate } from 'react-router-dom'

  import { Button } from '@/components/ui/button'
  import { useAuth } from '@/hooks/useAuth'

  import type { User } from '@/types/user'
  ```

### State Management

- Use local state (`useState`) for component-specific data
- Use URL state (React Router) for sharable/bookmarkable UI state
- Consider Context API for shared app-wide state
- Avoid premature optimization - start with simple solutions

### API Integration

- Create typed API client functions
- Handle loading, error, and success states explicitly
- Use async/await for asynchronous operations
- Implement proper error handling and user feedback

### Error Handling

- Always handle promise rejections
- Display user-friendly error messages
- Log errors appropriately for debugging
- Use error boundaries for component-level error catching

### Performance

- Lazy load routes with `React.lazy()` and `Suspense`
- Avoid unnecessary re-renders with `memo`, `useMemo`, `useCallback`
- Be mindful of React Compiler optimizations (already enabled)
- Keep bundle size small - check imports and avoid importing entire libraries

### Accessibility

- Use semantic HTML elements
- Ensure proper ARIA labels for interactive elements
- Maintain keyboard navigation support
- Test with screen readers when possible
- Use Radix UI components which include accessibility features

### Testing

- Write unit tests for utility functions
- Write integration tests for user workflows
- Test error states and edge cases
- Mock external dependencies (API calls, auth)
- **Always run relevant tests after updating code** - use `npm test -- --run <path>` to verify changes don't break existing functionality
- Test files are co-located with source files (e.g., `Component.tsx` has `Component.test.tsx`)
- Run tests for the specific file/folder you modified to ensure no regressions

### Security

- Never commit sensitive data (API keys, credentials)
- Sanitize user inputs
- Use HTTPS for all API calls
- Validate data from external sources
- Follow Gallagher SSO authentication patterns

### Code Quality & SonarQube Standards

Follow these guidelines to maintain high code quality and pass SonarQube analysis:

**Global Objects:**

- Prefer `globalThis` over `window` for better cross-platform compatibility
- Example: `globalThis.location.href` instead of `window.location.href`

**Complexity Management:**

- Keep Cognitive Complexity below 15 (SonarQube threshold)
- Extract complex logic into separate functions with clear names
- Avoid deeply nested ternary operators - use if/else or extract to functions
- Break down large functions (>50 lines) into smaller, focused functions

**Conditional Expressions:**

- **Check for falsy/null conditions first** in ternary operators to avoid "Unexpected negated condition" warnings
- Examples:

  ```tsx
  // ❌ BAD - Negated condition (triggers SonarQube warning)
  value !== null ? value.toFixed(1) : 'N/A'
  count !== 1 ? 's' : ''

  // ✅ GOOD - Check for null/falsy first
  value === null ? 'N/A' : value.toFixed(1)
  count === 1 ? '' : 's'

  // ❌ BAD - Negated condition in JSX
  {
    data !== null ? <DataView data={data} /> : <EmptyState />
  }

  // ✅ GOOD - Check for null first
  {
    data === null ? <EmptyState /> : <DataView data={data} />
  }
  ```

- For compound conditions, check for the absence first:

  ```tsx
  // ❌ BAD
  value !== null && value > threshold ? 'High' : 'Low'

  // ✅ GOOD
  value === null || value <= threshold ? 'Low' : 'High'
  ```

**Code Duplication:**

- Don't duplicate code blocks - extract to reusable functions
- Use utility functions for repeated logic
- Consider custom hooks for repeated React patterns

**Type Safety:**

- Avoid `any` type - use `unknown` or proper types
- Don't use deprecated types (e.g., `FormEvent` - use `React.FormEvent`)
- Ensure proper type narrowing with type guards

**Security Best Practices:**

- Perform sanitization in correct order (remove script tags before HTML tags)
- Validate and sanitize all user inputs
- Use `sanitizeTextInput()` from `@/utils/input-validation`
- Validate redirect URLs to prevent open redirects

**Error Handling:**

- Always handle promise rejections
- Provide meaningful error messages
- Use try/catch for async operations
- Don't ignore errors silently

**Resource Management:**

- Always clean up event listeners in useEffect return
- Close resources (timeouts, intervals) properly
- Mark variables as `readonly` if they're never reassigned

## Common Patterns

### Custom Hook Example

```tsx
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchUser()
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { user, loading, error }
}
```

### Component with Props Example

```tsx
interface CardProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function Card({ title, description, children }: CardProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      {description && <p className="text-muted-foreground">{description}</p>}
      {children}
    </div>
  )
}
```

## Things to Avoid

- Don't use `var` - use `const` or `let`
- Don't mutate state directly - use setState functions
- Don't use inline functions in JSX for event handlers (creates new function each render)
- Don't use index as key in lists unless list is static
- Don't nest ternary operators deeply - extract to variables or functions
- Don't ignore TypeScript errors - fix them properly
- Don't bypass ESLint rules without good reason
- Don't use `window` - prefer `globalThis` for cross-platform compatibility
- Don't create functions with high cognitive complexity (>15)
- Don't duplicate code - extract to reusable functions
- Don't use `any` type - use proper types or `unknown`
- Don't ignore SonarQube warnings - address code quality issues
- **Don't use magic strings** - define constants in config files instead of hardcoded strings in comparisons
- **Don't use negated conditions first in ternary operators** - check for null/falsy first (e.g., `value === null ? 'N/A' : value.toFixed(1)` not `value !== null ? value.toFixed(1) : 'N/A'`)
