# API Documentation

## Overview

This is a comprehensive REST API for the website built with Next.js 15 App Router and Supabase. All routes follow RESTful conventions and include proper authentication, authorization, and error handling.

## Base URL

```
http://localhost:3000/api
```

## Authentication

The API uses Supabase Auth with cookie-based sessions. Include the Supabase session cookie in all authenticated requests.

### Roles

- **Admin**: Full access to all operations, can invite officers, delete any resource
- **Officer**: Can create and edit content, cannot delete or manage users

## API Endpoints

### Contact Form

#### Submit Contact Form (Public)
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I have a question..."
}
```

#### Get All Contact Submissions (Admin/Officer)
```http
GET /api/contact?status=new&page=1&limit=20
```

#### Get Single Contact Submission (Admin/Officer)
```http
GET /api/contact/{id}
```

#### Update Contact Status (Admin/Officer)
```http
PATCH /api/contact/{id}
Content-Type: application/json

{
  "status": "in_progress" // new | in_progress | resolved | closed
}
```

#### Delete Contact Submission (Admin Only)
```http
DELETE /api/contact/{id}
```

---

### Profiles

#### Get All Profiles (Public)
```http
GET /api/profiles
```

#### Get Current User Profile (Authenticated)
```http
GET /api/profiles/me
```

#### Get Profile by ID (Public)
```http
GET /api/profiles/{id}
```

#### Create Profile (Admin Only - Invitation)
```http
POST /api/profiles
Content-Type: application/json

{
  "id": "uuid-from-auth-users",
  "email": "officer@example.com",
  "full_name": "Jane Officer",
  "role": "officer", // admin | officer
  "avatar_url": "https://..."
}
```

#### Update Profile (Own Profile or Admin)
```http
PATCH /api/profiles/{id}
Content-Type: application/json

{
  "full_name": "Jane Smith",
  "avatar_url": "https://...",
  "role": "admin" // Only admins can change roles
}
```

#### Delete Profile (Admin Only)
```http
DELETE /api/profiles/{id}
```

---

### Past Presidents

#### Get All Past Presidents (Public)
```http
GET /api/past-presidents?status=published&year=2023
```

#### Get Past President by ID (Public)
```http
GET /api/past-presidents/{id}
```

#### Create Past President (Admin/Officer)
```http
POST /api/past-presidents
Content-Type: application/json

{
  "name": "John President",
  "year": "2022-2023",
  "photo_url": "https://...",
  "status": "published" // draft | published | archived
}
```

#### Update Past President (Admin/Officer)
```http
PATCH /api/past-presidents/{id}
Content-Type: application/json

{
  "name": "John President",
  "status": "archived"
}
```

#### Delete Past President (Admin Only)
```http
DELETE /api/past-presidents/{id}
```

---

### Categories

#### Project Categories

##### Get All Project Categories (Public)
```http
GET /api/categories/projects
```

##### Create Project Category (Admin/Officer)
```http
POST /api/categories/projects
Content-Type: application/json

{
  "name": "Robotics",
  "slug": "robotics", // Optional, auto-generated from name
  "description": "Robotics projects"
}
```

##### Update Project Category (Admin/Officer)
```http
PATCH /api/categories/projects/{id}
Content-Type: application/json

{
  "name": "Advanced Robotics",
  "description": "Updated description"
}
```

##### Delete Project Category (Admin Only)
```http
DELETE /api/categories/projects/{id}
```

#### Article Categories

Same endpoints as project categories but under `/api/categories/articles`

---

### Projects

#### Get All Projects (Public)
```http
GET /api/projects?status=published&category={categoryId}&page=1&limit=20
```

#### Get Project by ID (Public)
```http
GET /api/projects/{id}
```

#### Create Project (Admin/Officer)
```http
POST /api/projects
Content-Type: application/json

{
  "title": "Solar Car Project",
  "slug": "solar-car-project", // Optional
  "hero_image": "https://...",
  "description": "A project about solar cars",
  "category_id": "uuid",
  "status": "draft" // draft | published | archived
}
```

#### Update Project (Admin/Officer)
```http
PATCH /api/projects/{id}
Content-Type: application/json

{
  "title": "Updated Solar Car Project",
  "status": "published"
}
```

#### Delete Project (Admin Only)
```http
DELETE /api/projects/{id}
```

---

### Project Components

#### Get All Components for a Project (Public)
```http
GET /api/projects/{projectId}/components
```

#### Create Project Component (Admin/Officer)
```http
POST /api/projects/{projectId}/components
Content-Type: application/json

{
  "project_id": "uuid",
  "component_order": 0,
  "title": "Introduction",
  "description": "Project introduction",
  "image_url": "https://...",
  "image_caption": "Solar car prototype",
  "content": { /* Tiptap JSON */ }
}
```

#### Update Project Component (Admin/Officer)
```http
PATCH /api/projects/{projectId}/components/{componentId}
Content-Type: application/json

{
  "title": "Updated Introduction",
  "component_order": 1
}
```

#### Delete Project Component (Admin/Officer)
```http
DELETE /api/projects/{projectId}/components/{componentId}
```

---

### Sub-Projects

#### Get All Sub-Projects (Public)
```http
GET /api/sub-projects?project_id={projectId}&status=published
```

#### Get Sub-Project by ID (Public)
```http
GET /api/sub-projects/{id}
```

#### Create Sub-Project (Admin/Officer)
```http
POST /api/sub-projects
Content-Type: application/json

{
  "project_id": "uuid",
  "title": "Battery System",
  "slug": "battery-system", // Optional
  "description": "Battery management system",
  "image_url": "https://...",
  "content": { /* Tiptap JSON */ },
  "status": "draft"
}
```

#### Update Sub-Project (Admin/Officer)
```http
PATCH /api/sub-projects/{id}
Content-Type: application/json

{
  "title": "Updated Battery System",
  "status": "published"
}
```

#### Delete Sub-Project (Admin Only)
```http
DELETE /api/sub-projects/{id}
```

---

### Technical Articles

#### Get All Articles (Public)
```http
GET /api/articles?status=published&category={categoryId}&page=1&limit=20
```

#### Get Article by ID (Public)
```http
GET /api/articles/{id}
```

#### Create Article (Admin/Officer)
```http
POST /api/articles
Content-Type: application/json

{
  "title": "Introduction to PCB Design",
  "slug": "intro-to-pcb-design", // Optional
  "image_url": "https://...",
  "description": "Learn PCB design basics",
  "content": { /* Tiptap JSON */ },
  "category_id": "uuid",
  "read_time": 5, // minutes
  "status": "draft"
}
```

#### Update Article (Admin/Officer)
```http
PATCH /api/articles/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "published",
  "read_time": 8
}
```

#### Delete Article (Admin Only)
```http
DELETE /api/articles/{id}
```

---

### Audit Logs

#### Get Audit Logs (Admin/Officer)
```http
GET /api/audit-logs?table=projects&record_id={uuid}&operation=UPDATE&changed_by={userId}&page=1&limit=50
```

Query Parameters:
- `table`: Filter by table name
- `record_id`: Filter by specific record
- `operation`: Filter by operation (INSERT, UPDATE, DELETE)
- `changed_by`: Filter by user who made the change
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* resource or array of resources */ },
  "pagination": { // For paginated endpoints
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

### Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Tiptap Content Format

All rich text fields use Tiptap JSON format:

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Hello world"
        }
      ]
    },
    {
      "type": "image",
      "attrs": {
        "src": "https://...",
        "alt": "Description"
      }
    }
  ]
}
```

---

## Security Features

1. **Row Level Security (RLS)**: All database operations respect RLS policies
2. **Role-based Access Control**: Admin and Officer roles with specific permissions
3. **Input Validation**: All inputs are validated and sanitized
4. **Error Handling**: Consistent error handling across all endpoints
5. **Audit Logging**: All data modifications are logged automatically
6. **CORS Protection**: Proper CORS headers for security
7. **Rate Limiting**: Implement rate limiting in production (recommended)

---

## Development

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Testing

Use tools like:
- Postman
- Thunder Client (VS Code)
- curl
- fetch/axios in your frontend

### Example Usage (Frontend)

```typescript
// Fetch articles
const response = await fetch('/api/articles?status=published');
const { data } = await response.json();

// Create project (authenticated)
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'New Project',
    description: 'Project description',
    status: 'draft'
  })
});

const { data } = await response.json();
```

---

## Notes

- All dates are in ISO 8601 format (UTC)
- Slugs are auto-generated from titles if not provided
- Published content gets `published_at` timestamp automatically
- Soft delete is not implemented - deletions are permanent
- File uploads should use Supabase Storage (separate API)
- Team and Events APIs are handled separately (excluded from this API)
