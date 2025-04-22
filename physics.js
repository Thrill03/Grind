class Physics {
    constructor() {
        this.gravity = 0.2;
        this.friction = 0.98;
        this.bounce = 0.5;
        this.maxSpeed = 8;
        this.baseSize = 0;
    }

    setBaseSize(baseSize) {
        this.baseSize = baseSize;
        // Scale physics parameters based on base size
        this.gravity = 0.2 * (baseSize / 600); // Scale gravity with base size
        this.maxSpeed = 8 * (baseSize / 600); // Scale max speed with base size
    }

    updateBall(ball) {
        // Apply gravity
        ball.vy += this.gravity;

        // Apply friction
        ball.vx *= this.friction;
        ball.vy *= this.friction;

        // Limit maximum speed
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        if (speed > this.maxSpeed) {
            const ratio = this.maxSpeed / speed;
            ball.vx *= ratio;
            ball.vy *= ratio;
        }

        // Update position
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Handle ground collision
        if (ball.y + ball.radius > ball.groundY) {
            ball.y = ball.groundY - ball.radius;
            ball.vy = -ball.vy * this.bounce;
        }

        // Handle ceiling collision
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.vy = -ball.vy * this.bounce;
        }

        // Handle wall collisions
        if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.vx = -ball.vx * this.bounce;
        } else if (ball.x + ball.radius > ball.maxX) {
            ball.x = ball.maxX - ball.radius;
            ball.vx = -ball.vx * this.bounce;
        }
    }

    applyForce(ball, forceX, forceY) {
        // Scale force application with base size
        const forceMultiplier = this.baseSize / 600;
        ball.vx += forceX * 3 * forceMultiplier;
        ball.vy += forceY * 3 * forceMultiplier;
    }
} 