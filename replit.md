# CivicConnect - Community Engagement Platform

## Overview

CivicConnect is a comprehensive civic engagement platform designed to strengthen democratic participation and community involvement. The platform serves as a centralized hub where citizens can engage in local discussions, attend civic events, sign petitions, stay informed with local news, and connect with their elected representatives.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom civic-themed color palette
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite with hot module replacement for development

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful endpoints with structured error handling

### Data Storage
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema generation
- **Connection**: Neon serverless with WebSocket constructor for compatibility

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC (OpenID Connect)
- **Session Storage**: PostgreSQL-backed sessions with 7-day TTL
- **User Management**: Automatic user creation/updates on authentication
- **Security**: HTTP-only cookies, secure flags, and CSRF protection

### Forum System
- **Structure**: Reddit-style threaded discussions
- **Organization**: Forums categorized by location and topic
- **Features**: Voting system, nested replies, sticky posts
- **Moderation**: Post status tracking and content management

### Event Management
- **Types**: Both virtual and in-person civic events
- **Features**: RSVP system, attendance tracking, meeting URLs
- **Categories**: Town halls, community meetings, civic workshops
- **Integration**: Calendar functionality with time zone handling

### News Aggregation
- **Sources**: Local news outlets and government announcements
- **Categorization**: Local, national, and topical news filtering
- **Curation**: Editorial oversight with relevance scoring
- **Display**: Card-based layout with summary and full article links

### Petition Platform
- **Creation**: User-generated petitions with target signatures
- **Tracking**: Progress monitoring and deadline management
- **Integration**: Potential external petition service APIs
- **Actions**: Digital signing with user verification

### Representative Directory
- **Levels**: Local, state, and federal representatives
- **Contact Information**: Email, phone, and office details
- **Profiles**: Bio, position, and recent activities
- **Engagement**: Direct communication tools and town hall scheduling

## Data Flow

### User Journey
1. **Authentication**: Users authenticate via Replit Auth OIDC flow
2. **Dashboard**: Personalized dashboard with location-based content
3. **Navigation**: Sidebar navigation to different platform sections
4. **Interaction**: Users can vote, comment, attend events, sign petitions
5. **Updates**: Real-time updates via React Query invalidation

### API Communication
- **Client**: TanStack Query manages API calls with automatic caching
- **Server**: Express routes handle business logic and database operations
- **Database**: Drizzle ORM provides type-safe database interactions
- **Authentication**: Middleware validates sessions on protected routes

### Content Management
- **Forums**: Hierarchical structure with parent-child relationships
- **Posts**: Threaded discussions with voting and reply systems
- **Events**: Time-based content with attendance tracking
- **News**: External content aggregation with local curation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web application framework
- **@tanstack/react-query**: Server state management
- **passport**: Authentication middleware

### UI Dependencies
- **@radix-ui/react-***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **date-fns**: Date manipulation and formatting

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Server**: tsx for hot reloading TypeScript execution
- **Client**: Vite development server with HMR
- **Database**: Neon development database with migrations
- **Authentication**: Replit Auth development configuration

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` command
- **Deployment**: Single Node.js process serving static files and API

### Environment Configuration
- **DATABASE_URL**: Neon PostgreSQL connection string
- **SESSION_SECRET**: Secure session encryption key
- **REPL_ID**: Replit environment identifier for auth
- **NODE_ENV**: Environment mode (development/production)

## Changelog

```
Changelog:
- June 28, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```