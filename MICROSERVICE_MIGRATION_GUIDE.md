# TeamBoard: Microservice Migration Guide

This document outlines the step-by-step engineering plan to migrate the current TeamBoard modular monolith into a fully distributed microservice architecture.

## 1. Architectural End-State

The target architecture utilizes an API Gateway for ingress traffic, synchronous TCP for immediate reads, and RabbitMQ for resilient, asynchronous event handling.

```mermaid
graph TD
    classDef gateway fill:#2d3748,stroke:#4fd1c5,stroke-width:2px,color:#fff
    classDef service fill:#2b6cb0,stroke:#63b3ed,stroke-width:2px,color:#fff
    classDef database fill:#276749,stroke:#68d391,stroke-width:2px,color:#fff
    classDef broker fill:#805ad5,stroke:#b794f4,stroke-width:2px,color:#fff
    classDef queue fill:#d6bcfa,stroke:#805ad5,stroke-width:1px,color:#000

    Client["Frontend Client"] --> GW["API Gateway"]:::gateway
    GW --> AuthSvc["Auth Service"]:::service
    GW --> ProjSvc["Project Service"]:::service
    GW --> TaskSvc["Task Service"]:::service

    AuthSvc --> AuthDB[("Auth DB")]:::database
    ProjSvc --> ProjDB[("Project DB")]:::database
    TaskSvc --> TaskDB[("Task DB")]:::database

    ProjSvc -- "Project.Deleted" --> RMQ(("RabbitMQ Exchange")):::broker
    RMQ --> TaskQueue["Task Queue"]:::queue
    TaskQueue --> TaskSvc
    TaskQueue -. "Failed" .-> DLQ["Dead Letter Queue"]:::queue
```

---

## 2. Step-by-Step Migration Plan

Because our current codebase already uses isolated modules and `TasksClient`/`ProjectsClient` for cross-boundary communication, we do not need to rewrite the business logic. We only need to adjust the infrastructure layer.

### Phase 1: Establish the API Gateway
Currently, the HTTP routes (e.g., `POST /projects`, `GET /tasks`) are attached directly to the services.
1. **Action:** Create a new NestJS application named `GatewayService`.
2. **Action:** Move all standard HTTP Controllers (`ProjectsController`, `TasksController`, `AuthController`) from the backend into the `GatewayService`.
3. **Action:** Implement global middleware in the Gateway:
   - **Rate Limiter:** Add `@nestjs/throttler` backed by Redis to prevent API abuse.
   - **JWT Validation:** Move `JwtAuthGuard` to the Gateway. The Gateway will validate the token signature before forwarding requests to the microservices.

### Phase 2: Separate the Databases
Currently, all services share the `teamboard` MongoDB database.
1. **Action:** In the Docker Compose file, configure three separate logical databases.
2. **Action:** Update the Mongoose imports in the microservices so they connect to their respective databases:
   - Auth Service -> `mongodb://localhost:27017/teamboard_auth`
   - Project Service -> `mongodb://localhost:27017/teamboard_projects`
   - Task Service -> `mongodb://localhost:27017/teamboard_tasks`

### Phase 3: Introduce RabbitMQ (Event Broker)
Currently, `ProjectsService` directly calls `TasksClient.deleteByProject` over synchronous TCP when a project is deleted.
1. **Action:** Install `@nestjs/microservices` RabbitMQ transporter.
2. **Action:** Replace `InternalTcpClientFactory` with the RabbitMQ client.
3. **Refactor Flow:**
   - Instead of calling a deletion method, `ProjectService` emits an event: `this.client.emit('project.deleted', { projectId })`.
   - `TaskService` uses `@EventPattern('project.deleted')` to listen for the event and independently clear out orphaned tasks.
4. **Action:** Configure a **Dead Letter Exchange (DLX)** in RabbitMQ so that if `TaskService` crashes while deleting tasks, the message is saved for a replay.

---

## 3. Request Lifecycle Flows

### Token Validation & Sync Flow
This is how a standard API request will be routed through the new API Gateway.

```mermaid
sequenceDiagram
    participant C as Client
    participant GW as API Gateway
    participant Redis as Redis (Rate Limit)
    participant ProjSvc as Project Service

    C->>GW: GET /projects (Bearer Token)
    GW->>Redis: Check Rate Limit
    Redis-->>GW: OK
    
    Note over GW: Gateway validates JWT locally
    GW->>GW: Verify Token Signature
    
    GW->>ProjSvc: TCP Forward: Get Projects (userId: 123)
    ProjSvc-->>GW: Return Projects List
    GW-->>C: 200 OK
```

### Asynchronous Event & DLQ Flow
This illustrates how we handle resilient background jobs using RabbitMQ.

```mermaid
sequenceDiagram
    participant ProjSvc as Project Service
    participant RMQ as RabbitMQ
    participant TaskQ as Task Queue
    participant TaskSvc as Task Service
    participant DLQ as Dead Letter Queue

    Note over ProjSvc: Project deleted by user
    ProjSvc->>RMQ: Emit Event "project.deleted"
    RMQ->>TaskQ: Route to Queue
    TaskQ->>TaskSvc: Consume Event
    
    alt Task DB is down
        TaskSvc-->>TaskQ: NACK (Failed)
        TaskQ->>DLQ: Move to DLQ
        Note over DLQ: Event saved for manual/auto replay
    else Success
        TaskSvc->>TaskSvc: Delete associated tasks
        TaskSvc-->>TaskQ: ACK (Success)
    end
```

## 4. Deployment Strategy

Once split, the deployment pipeline will look like this:
1. **API Gateway:** Deployed on Render/Railway. Exposed to the public internet.
2. **Microservices (Auth, Project, Task):** Deployed on internal networks (Private Services on Render). Only accessible via the Gateway or RabbitMQ. Not exposed to the internet.
3. **RabbitMQ / Redis / MongoDB:** Hosted on managed services like CloudAMQP, Upstash, and MongoDB Atlas.
