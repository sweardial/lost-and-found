# Foundly - AI-Powered NYC Subway Lost & Found Platform

An intelligent lost and found management system for the NYC subway network that leverages AI to streamline the reporting and matching process of lost items.

## Core Features
- **AI-Powered Conversations**: Uses OpenAI's GPT-4 to provide natural, context-aware interactions for item reporting
- **Smart Location Validation**: Integrates with NYC subway system data to validate and normalize station locations and train lines
- **Semantic Search**: Employs vector database technology for intelligent matching of lost and found item descriptions
- **Progressive Authentication**: Email-based verification system with secure session management
- **Real-time Chat Interface**: Interactive conversation flow with step-by-step guidance

## Technical Stack
- **Frontend**: Next.js 15 with TypeScript for type-safe, server-side rendered UI
- **Backend**: 
  - Node.js with Prisma ORM for database operations
  - PostgreSQL for relational data storage
  - Vector database for semantic similarity searches
- **AI/ML**: 
  - OpenAI API integration
  - Custom AI assistants for natural language processing
  - Semantic similarity matching for item descriptions
- **Authentication**: 
  - JWT-based secure session management
  - Email verification system

## Architecture Highlights
- Server-side rendering with Next.js for optimal performance
- Stateful chat interface with real-time validation
- Vector embeddings for efficient similarity searches
- Type-safe database operations with Prisma
- Secure session management with HTTP-only cookies
