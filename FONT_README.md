# Epic Games Store Clone Font Usage

This project uses Roboto font family to match the official Epic Games website design. Here's how the font is implemented:

## Font Implementation

- **Font Family**: Roboto (weights: 300, 400, 500, 700)
- **Import Method**: Using Next.js Font optimization with Google Fonts
- **CSS Variable**: `--font-roboto`
- **Tailwind Class**: `font-roboto`

## Epic Games Theme Colors

The project uses the following custom colors from the Epic Games website:

```js
colors: {
  epic: {
    blue: '#0074e4',
    darkBlue: '#0060ba',
    darkGray: '#121212',
    gray: '#2a2a2a',
    lightGray: '#202020',
  },
}
```

## Usage in Components

To apply the Roboto font to any component, simply add the `font-roboto` class:

```jsx
<div className="font-roboto">This text will use Roboto font</div>
```

Or use it with other font styles:

```jsx
<h1 className="font-roboto text-2xl font-bold">Heading with Roboto</h1>
```

The font is also applied globally to the entire website through the root layout.

## Weight Reference

- 300: Light
- 400: Regular
- 500: Medium
- 700: Bold 