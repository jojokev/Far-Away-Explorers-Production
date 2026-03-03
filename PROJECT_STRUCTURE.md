# Estructura del proyecto

Proyecto: `farawayexplorers`  
Fecha de referencia: `2026-03-02`

## Árbol de archivos

```text
farawayexplorers/
├─ astro.config.mjs
├─ package.json
├─ package-lock.json
├─ README.md
├─ skills-lock.json
├─ tsconfig.json
├─ public/
│  ├─ favicon.ico
│  ├─ favicon.svg
│  └─ fonts/
│     ├─ Montserrat-Bold.woff2
│     ├─ Montserrat-ExtraBold.woff2
│     ├─ Montserrat-Medium.woff2
│     ├─ Montserrat-Regular.woff2
│     └─ Montserrat-SemiBold.woff2
└─ src/
   ├─ assets/
   │  ├─ comment-avatar.png
   │  ├─ default.webp
   │  ├─ logo-far-away.webp
   │  └─ icons/
   │     ├─ border-01.png
   │     ├─ border-02.png
   │     ├─ esnna.webp
   │     ├─ image 7.png
   │     ├─ metodos-pago.webp
   │     ├─ reclamaciones.webp
   │     ├─ Score.png
   │     ├─ Tripadvisor.png
   │     ├─ Vector-1.png
   │     ├─ Vector-2.png
   │     ├─ Vector-3.png
   │     └─ Vector-4.png
   ├─ components/
   │  ├─ AboutHome.astro
   │  ├─ BannerHome.astro
   │  ├─ Blogs.astro
   │  ├─ Categories.astro
   │  ├─ Comments.astro
   │  ├─ Footer.astro
   │  ├─ GalleryTour.astro
   │  ├─ Header.astro
   │  ├─ Tours.astro
   │  └─ WhyHome.astro
   ├─ layouts/
   │  └─ Layout.astro
   ├─ pages/
   │  ├─ index.astro
   │  ├─ ica/
   │  │  ├─ [slug].astro
   │  │  └─ index.astro
   │  └─ lima/
   │     ├─ [slug].astro
   │     └─ index.astro
   └─ styles/
      ├─ global.scss
      ├─ abstract/
      │  ├─ _mixins.scss
      │  └─ _variables.scss
      └─ base/
         ├─ _reset.scss
         └─ _typography.scss
```

## Énfasis SCSS: `src/styles/abstract/_variables.scss`

```scss
$color-primary:       #AA5C00;
$color-white:         #ffffff;
$color-nav-bg:        #0c0a09;
$color-text-muted:    #71717a;
$color-text-base:     inherit;
$color-text-dark:     #000000;

$font-size-sm:        0.875rem;
$font-size-lg:        1.125rem;
$font-size-base:      1rem;
$font-weight-regular: 400;
$font-weight-medium:  500;
$font-weight-semibold:600;
$font-weight-bold:    700;

$spacing-1:           0.25rem;
$spacing-2:           0.5rem;
$spacing-4:           1rem;

$transition-base:     all 0.3s ease;
$transition-fast:     all 0.2s ease;

$bp-sm:               640px;
$bp-md:               768px;
$bp-lg:               1024px;

$font-family-base:    "Montserrat", sans-serif;
```

## Énfasis SCSS: `src/styles/abstract/_mixins.scss`

```scss
@use 'variables' as *;

@mixin sm {
  @media (min-width: #{$bp-sm}) { @content; }
}

@mixin md {
  @media (min-width: #{$bp-md}) { @content; }
}

@mixin lg {
  @media (min-width: #{$bp-lg}) { @content; }
}

@mixin flex-center {
  display: flex;
  align-items: center;
}

@mixin flex-center-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin interactive-link($hover-color: $color-primary) {
  transition: $transition-base;
  &:hover { color: $hover-color; }
}

@mixin btn-primary {
  @include flex-center;
  gap: $spacing-1;
  background-color: $color-primary;
  color: $color-white;
  padding: $spacing-2 $spacing-4;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  border-radius: 2px;
  transition: $transition-fast;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @include md {
    font-size: $font-size-base;
  }
}

@mixin eyebrow {
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  letter-spacing: 0.14em;
  color: $color-primary;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::after {
    content: '';
    display: inline-block;
    width: 2rem;
    height: 2px;
    background-color: $color-primary;
    border-radius: 2px;
  }
}
```

