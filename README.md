Zomato Clone — Full-Stack Food Delivery Platform

A full-stack food delivery platform inspired by Zomato, built with a microservices architecture to demonstrate scalable, distributed system design and real-time application development. Supports multiple user roles, secure payments, and live order management.

Features

- Microservices architecture with dedicated services for authentication, restaurants, riders, admin, payments, and real-time communication
- Real-time order tracking and live rider-location updates via Socket.IO
- Asynchronous inter-service messaging using RabbitMQ for decoupled, event-driven communication between services
- Secure payments via integrated Razorpay and Stripe gateways
- Role-based dashboards for four distinct user types: Customers, Restaurants, Delivery Partners, and Admins
- Secure authentication and authorization scoped per role

Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | TypeScript, React (`.tsx`) |
| Backend | TypeScript, Node.js, Express.js (`.ts`) |
| Database | MongoDB |
| Messaging | RabbitMQ, Socket.IO |
| Payments | Razorpay, Stripe |
| Infrastructure | Docker, AWS |

Architecture

The system is organized as independent microservices rather than a single monolith:

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Auth        │     │  Restaurant  │     │   Rider      │
│  Service     │     │  Service     │     │   Service    │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └─────────┬──────────┴──────────┬─────────┘
                  │                     │
           ┌──────▼──────┐      ┌───────▼───────┐
           │  RabbitMQ    │      │   Socket.IO    │
           │ (async msgs) │      │  (real-time)   │
           └──────┬──────┘      └───────┬───────┘
                  │                     │
           ┌──────▼─────────────────────▼───────┐
           │        Payments & Admin Service      │
           │       (Razorpay / Stripe / Auth)     │
           └───────────────────────────────────────┘
```

Each service owns its own responsibility boundary, communicating asynchronously through RabbitMQ for events (e.g., order placed, order status changed) and through Socket.IO for real-time client updates (e.g., live rider location, order status pushes).






