# Mealora

**Discover. Cook. Enjoy.**

Mealora is a modern ASP.NET Core MVC recipe discovery experience integrated with the Forkify API. It helps users explore recipes, search recipe data, inspect ingredients, save favorites, and interact with a cart/order workflow in a responsive interface.

## Overview

Mealora is built as a portfolio/demo application for recipe discovery. Users can browse curated recipe categories, search the Forkify recipe dataset, open recipe details, review ingredient information, and use authenticated cart/order functionality.

The application combines server-rendered ASP.NET Core MVC views with client-side JavaScript for Forkify API requests, loading states, favorites, recently viewed recipes, and recent search history.

## Features

- Recipe discovery homepage with curated entry points
- Forkify API integration for recipe search and details
- Recipe search by keyword or ingredient
- Ingredient/category filtering sidebar
- Recipe detail pages with publisher, image, price, ingredients, and order summary
- ASP.NET Core Identity authentication for register, login, and logout
- Cart and order workflow backed by Entity Framework Core and SQL Server
- Favorites stored in browser localStorage
- Recently viewed recipes stored in browser localStorage
- Recent searches with clear-history support
- Responsive Razor/Bootstrap interface
- Loading, error, and empty states for recipe and storage flows
- Accessible landmarks, labels, focus states, and reduced-motion support

## Screenshots

Add screenshots to a `docs/screenshots/` folder when preparing the GitHub repository.

| Area | Screenshot |
| --- | --- |
| Homepage | `docs/screenshots/homepage.png` |
| Recipe Explorer | `docs/screenshots/recipe-explorer.png` |
| Search Results | `docs/screenshots/search-results.png` |
| Recipe Details | `docs/screenshots/recipe-details.png` |
| Cart | `docs/screenshots/cart.png` |
| Login | `docs/screenshots/login.png` |
| Register | `docs/screenshots/register.png` |
| Favorites | `docs/screenshots/favorites.png` |
| Mobile View | `docs/screenshots/mobile-view.png` |

## Tech Stack

- ASP.NET Core MVC (`net7.0`)
- C#
- Razor Views
- ASP.NET Core Identity
- Entity Framework Core
- SQL Server
- Bootstrap 5.1
- JavaScript
- Forkify API

## Architecture

Mealora follows a straightforward ASP.NET Core MVC structure:

- **Controllers** handle routing, authentication actions, recipe views, cart actions, and favorites page rendering.
- **Views** use Razor to render pages and shared UI partials.
- **Models and ViewModels** represent recipes, orders, carts, authentication forms, and error data.
- **Shared partials** are used for reusable UI such as recipe cards, search, side menu filters, validation scripts, order details, and cart preview content.
- **Frontend JavaScript** fetches recipe data from the Forkify API, renders recipe cards via MVC partial endpoints, manages localStorage features, updates favorite states, and shows feedback toasts.
- **Identity and EF Core context** provide user authentication and persistence for orders and cart data.

## API Integration

Mealora integrates with the Forkify API for recipe search and recipe detail data.

The client-side JavaScript calls Forkify search and detail endpoints, then sends returned recipe data to MVC partial endpoints for rendering. API configuration should be reviewed before publishing so keys or tokens are not exposed unintentionally.

## Getting Started

### Prerequisites

- .NET SDK compatible with the project target framework
- SQL Server or SQL Server Express
- Visual Studio, Visual Studio Code, or another C# editor

### Restore Dependencies

```bash
dotnet restore FoodApplication.sln
```

### Configure the Database

Update the `ConnectionStrings:dbConnection` value in `FoodApplication/appsettings.json` or use local user secrets/environment configuration for your own SQL Server instance.

For public repositories, avoid committing real production credentials or private local connection strings.

### Apply Migrations

```bash
dotnet ef database update --project FoodApplication/FoodApplication.csproj
```

### Build

```bash
dotnet build FoodApplication.sln
```

### Run

```bash
dotnet run --project FoodApplication/FoodApplication.csproj
```

Then open the local URL printed by the .NET runtime.

## Project Structure

```text
FoodApplication/
|-- FoodApplication.sln
`-- FoodApplication/
    |-- ContextDBConfig/
    |   `-- FoodDBContext.cs
    |-- Controllers/
    |   |-- AccountController.cs
    |   |-- CartController.cs
    |   |-- FavoritesController.cs
    |   |-- HomeController.cs
    |   `-- RecipeController.cs
    |-- Migrations/
    |-- Models/
    |-- Repository/
    |-- Views/
    |   |-- Account/
    |   |-- Cart/
    |   |-- Favorites/
    |   |-- Home/
    |   |-- Recipe/
    |   `-- Shared/
    |-- wwwroot/
    |   |-- css/
    |   |-- Images/
    |   |-- js/
    |   `-- lib/
    |-- appsettings.json
    |-- FoodApplication.csproj
    `-- Program.cs
```

## Key Technical Highlights

- Server-rendered MVC architecture with Razor Views
- Third-party recipe API integration through Forkify
- Responsive redesign using Bootstrap and custom CSS
- Reusable Razor partials for recipe cards, search, cart preview, and order details
- ASP.NET Core Identity registration/login/logout flow
- EF Core-backed cart and order persistence
- localStorage enhancements for favorites, recently viewed recipes, and recent searches
- Polished UI states for loading, empty results, errors, toast feedback, focus, and reduced motion

## Future Improvements

- Move Forkify API interaction into a dedicated backend service
- Add stronger automated tests for controllers, views, and JavaScript behavior
- Persist favorites across devices for authenticated users
- Add nutrition or dietary metadata integrations
- Strengthen the order domain model and cart ownership rules
- Replace local development configuration with user secrets or environment variables
- Add CI build validation for pull requests

## GitHub Repository Metadata

**Description:**  
Modern ASP.NET Core MVC recipe discovery app with Forkify API search, Identity auth, favorites, cart, and responsive Razor UI.

**Suggested topics:**

```text
aspnet-core
aspnet-core-mvc
csharp
razor-pages
entity-framework-core
sql-server
identity
bootstrap
javascript
recipe-app
forkify-api
portfolio-project
responsive-design
```

**Suggested screenshot file names:**

```text
docs/screenshots/homepage.png
docs/screenshots/recipe-explorer.png
docs/screenshots/search-results.png
docs/screenshots/recipe-details.png
docs/screenshots/cart.png
docs/screenshots/login.png
docs/screenshots/register.png
docs/screenshots/favorites.png
docs/screenshots/mobile-view.png
```

## Disclaimer

Mealora is a portfolio/demo application. It is not a real food-delivery company or production ordering platform. Recipe data is provided by the Forkify API.
